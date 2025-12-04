import React, { useRef, useState } from 'react';
import { useProjectStore, type Clip } from '../../../store/useProjectStore';
import { Play, Pause, SkipBack, SkipForward, ZoomIn, ZoomOut, Plus, Scissors, Magnet, Trash2 } from 'lucide-react';

const Timeline: React.FC = () => {
    const {
        tracks, addTrack, addClip, updateClip, currentTime, duration,
        setPlayhead, zoomLevel, setZoomLevel, isPlaying, setIsPlaying,
        selectedClipId, setSelectedClipId, splitClip, deleteClip,
        isMagnetic, toggleMagnetic, deleteTrack
    } = useProjectStore();

    const timelineRef = useRef<HTMLDivElement>(null);
    const [draggingClip, setDraggingClip] = useState<{ id: string, startX: number, originalStart: number } | null>(null);
    const [resizingClip, setResizingClip] = useState<{ id: string, edge: 'left' | 'right', startX: number, originalStart: number, originalDuration: number, originalOffset: number } | null>(null);

    const PIXELS_PER_SECOND = 20; // Increased base resolution

    // Keyboard Navigation & Shortcuts
    React.useEffect(() => {
        const handleKeyDown = (e: KeyboardEvent) => {
            if (e.key === 'Delete' && selectedClipId) {
                deleteClip(selectedClipId);
            }

            // Frame Stepping
            if (e.key === 'ArrowLeft') {
                e.preventDefault();
                setPlayhead(Math.max(0, currentTime - 1)); // 1s increment
            }
            if (e.key === 'ArrowRight') {
                e.preventDefault();
                setPlayhead(Math.min(duration, currentTime + 1));
            }
        };
        window.addEventListener('keydown', handleKeyDown);
        return () => window.removeEventListener('keydown', handleKeyDown);
    }, [selectedClipId, deleteClip, currentTime, duration, setPlayhead]);

    // Smooth Scrubbing
    const handleTimelineMouseDown = (e: React.MouseEvent) => {
        if (draggingClip || resizingClip) return;

        const updatePlayhead = (clientX: number) => {
            const rect = timelineRef.current?.getBoundingClientRect();
            if (!rect) return;

            // Adjust for scroll
            const scrollLeft = timelineRef.current?.scrollLeft || 0;
            // The track area starts after the header (48px = 3rem)
            // But our click is on the ruler or track content which is inside the scrollable area
            // We need to calculate offset relative to the scrollable container content

            // Let's use the event target to find the relative position
            // Actually, simpler: 
            // The container is `timelineRef`. The content width is calculated.
            // Mouse X relative to viewport - Timeline Left + Scroll Left - Header Width (48px)

            // Wait, the click event is on the container or ruler.
            // Let's use the logic from handleTimelineClick but make it continuous

            const offsetX = clientX - rect.left + scrollLeft - 48; // 48 is header width
            const time = Math.max(0, offsetX / (PIXELS_PER_SECOND * zoomLevel));
            setPlayhead(time);
        };

        updatePlayhead(e.clientX);

        const handleMouseMove = (moveEvent: MouseEvent) => {
            updatePlayhead(moveEvent.clientX);
        };

        const handleMouseUp = () => {
            window.removeEventListener('mousemove', handleMouseMove);
            window.removeEventListener('mouseup', handleMouseUp);
        };

        window.addEventListener('mousemove', handleMouseMove);
        window.addEventListener('mouseup', handleMouseUp);
    };

    // ... (keep existing handlers)
    const handleDragOver = (e: React.DragEvent) => {
        e.preventDefault();
        e.dataTransfer.dropEffect = 'copy';
    };

    const handleDrop = (e: React.DragEvent, trackId: string) => {
        e.preventDefault();
        const data = e.dataTransfer.getData('application/json');
        if (!data) return;

        const media = JSON.parse(data);
        const rect = (e.currentTarget as HTMLElement).getBoundingClientRect();
        const offsetX = e.clientX - rect.left + (timelineRef.current?.scrollLeft || 0);
        let startTime = Math.max(0, offsetX / (PIXELS_PER_SECOND * zoomLevel));

        // Snap to 0 if close
        if (startTime < 0.5) startTime = 0;

        const newClip: Clip = {
            id: crypto.randomUUID(),
            trackId,
            name: media.file.name,
            sourcePath: media.objectUrl,
            start: startTime,
            duration: media.duration,
            offset: 0,
            type: media.type
        };

        addClip(trackId, newClip);
    };

    const handleClipDragStart = (e: React.MouseEvent, clip: Clip) => {
        e.stopPropagation();
        setDraggingClip({
            id: clip.id,
            startX: e.clientX,
            originalStart: clip.start
        });
        setSelectedClipId(clip.id);
    };

    const handleResizeStart = (e: React.MouseEvent, clip: Clip, edge: 'left' | 'right') => {
        e.stopPropagation();
        setResizingClip({
            id: clip.id,
            edge,
            startX: e.clientX,
            originalStart: clip.start,
            originalDuration: clip.duration,
            originalOffset: clip.offset
        });
        setSelectedClipId(clip.id);
    };

    const handleMouseMove = (e: React.MouseEvent) => {
        if (draggingClip) {
            const deltaX = e.clientX - draggingClip.startX;
            const deltaSeconds = deltaX / (PIXELS_PER_SECOND * zoomLevel);
            let newStart = Math.max(0, draggingClip.originalStart + deltaSeconds);

            // Magnetic Snap
            if (isMagnetic) {
                const SNAP_THRESHOLD = 0.5; // seconds
                // Find all snap points (start and end of other clips)
                const snapPoints: number[] = [0]; // Always snap to 0
                tracks.forEach(t => {
                    t.clips.forEach(c => {
                        if (c.id !== draggingClip.id) {
                            snapPoints.push(c.start);
                            snapPoints.push(c.start + c.duration);
                        }
                    });
                });

                // Find closest snap point
                let closestPoint = -1;
                let minDistance = Infinity;

                snapPoints.forEach(point => {
                    const dist = Math.abs(newStart - point);
                    if (dist < minDistance && dist < SNAP_THRESHOLD) {
                        minDistance = dist;
                        closestPoint = point;
                    }
                });

                if (closestPoint !== -1) {
                    newStart = closestPoint;
                }
            }

            // Snap to 0 if close (always active)
            if (newStart < 0.1) newStart = 0;

            updateClip(draggingClip.id, { start: newStart });
        } else if (resizingClip) {
            const deltaX = e.clientX - resizingClip.startX;
            const deltaSeconds = deltaX / (PIXELS_PER_SECOND * zoomLevel);

            if (resizingClip.edge === 'right') {
                const newDuration = Math.max(0.1, resizingClip.originalDuration + deltaSeconds);
                updateClip(resizingClip.id, { duration: newDuration });
            } else {
                // Left resize: change start, duration, and offset
                // Ensure we don't drag past the end or before 0
                const maxDelta = resizingClip.originalDuration - 0.1;
                const effectiveDelta = Math.min(Math.max(deltaSeconds, -resizingClip.originalStart), maxDelta);

                const newStart = resizingClip.originalStart + effectiveDelta;
                const newDuration = resizingClip.originalDuration - effectiveDelta;
                const newOffset = resizingClip.originalOffset + effectiveDelta;

                updateClip(resizingClip.id, {
                    start: newStart,
                    duration: newDuration,
                    offset: newOffset
                });
            }
        }
    };

    const handleMouseUp = () => {
        setDraggingClip(null);
        setResizingClip(null);
    };

    const formatTime = (seconds: number) => {
        const date = new Date(seconds * 1000);
        const hh = date.getUTCHours().toString().padStart(2, '0');
        const mm = date.getUTCMinutes().toString().padStart(2, '0');
        const ss = date.getUTCSeconds().toString().padStart(2, '0');
        const ms = Math.floor(date.getUTCMilliseconds() / 10).toString().padStart(2, '0');
        return `${hh}:${mm}:${ss}:${ms}`;
    };

    return (
        <div
            className="flex flex-col h-full bg-[#1a1a1a] select-none"
            onMouseMove={handleMouseMove}
            onMouseUp={handleMouseUp}
            onMouseLeave={handleMouseUp}
        >
            {/* Controls Bar */}
            <div className="flex h-12 items-center justify-between border-y border-white/5 px-4 bg-[#1a1a1a] shrink-0 z-40">
                <div className="flex items-center gap-6">
                    {/* Playback Controls */}
                    <div className="flex items-center gap-1 bg-black/20 rounded-lg p-1">
                        <button
                            className="p-1.5 hover:bg-white/10 rounded text-gray-400 hover:text-white transition-colors"
                            onClick={() => setPlayhead(0)}
                        >
                            <SkipBack size={16} />
                        </button>
                        <button
                            className="p-1.5 hover:bg-white/10 rounded text-white transition-colors"
                            onClick={() => setIsPlaying(!isPlaying)}
                        >
                            {isPlaying ? <Pause size={18} fill="currentColor" /> : <Play size={18} fill="currentColor" />}
                        </button>
                        <button
                            className="p-1.5 hover:bg-white/10 rounded text-gray-400 hover:text-white transition-colors"
                            onClick={() => setPlayhead(duration)}
                        >
                            <SkipForward size={16} />
                        </button>
                    </div>

                    {/* Time Display */}
                    <span className="text-sm font-mono text-purple-400 font-medium bg-purple-500/10 px-3 py-1 rounded border border-purple-500/20">
                        {formatTime(currentTime)} <span className="text-gray-500">/ {formatTime(duration || 0)}</span>
                    </span>

                    {/* Editing Tools */}
                    <div className="flex items-center gap-1 bg-black/20 rounded-lg p-1">
                        <button
                            className="p-1.5 hover:bg-white/10 rounded text-gray-400 hover:text-white transition-colors"
                            onClick={splitClip}
                            title="Böl (Split)"
                        >
                            <Scissors size={16} />
                        </button>
                        <button
                            className={`p-1.5 rounded transition-colors ${isMagnetic ? 'bg-purple-500/20 text-purple-400' : 'hover:bg-white/10 text-gray-400 hover:text-white'}`}
                            onClick={toggleMagnetic}
                            title="Mıknatıs (Snap)"
                        >
                            <Magnet size={16} />
                        </button>
                        <button
                            className="p-1.5 hover:bg-white/10 rounded text-gray-400 hover:text-red-400 transition-colors"
                            onClick={() => selectedClipId && deleteClip(selectedClipId)}
                            title="Sil (Delete)"
                        >
                            <Trash2 size={16} />
                        </button>
                    </div>

                    {/* Add Track Buttons */}
                    <div className="flex items-center gap-2">
                        <button
                            onClick={() => addTrack('video')}
                            className="flex items-center gap-1 px-3 py-1.5 bg-blue-500/10 border border-blue-500/20 rounded-lg text-xs font-medium text-blue-400 hover:bg-blue-500/20 transition-all"
                        >
                            <Plus size={14} /> Video
                        </button>
                        <button
                            onClick={() => addTrack('audio')}
                            className="flex items-center gap-1 px-3 py-1.5 bg-emerald-500/10 border border-emerald-500/20 rounded-lg text-xs font-medium text-emerald-400 hover:bg-emerald-500/20 transition-all"
                        >
                            <Plus size={14} /> Ses
                        </button>
                    </div>
                </div>

                {/* Zoom Controls */}
                <div className="flex items-center gap-3">
                    <div className="flex items-center gap-2 bg-black/20 rounded-lg px-3 py-1.5">
                        <ZoomOut size={14} className="text-gray-400" />
                        <input
                            type="range"
                            min="0.5"
                            max="5"
                            step="0.1"
                            value={zoomLevel}
                            onChange={(e) => setZoomLevel(parseFloat(e.target.value))}
                            className="w-24 accent-purple-600 h-1 bg-gray-700 rounded-lg appearance-none cursor-pointer"
                        />
                        <ZoomIn size={14} className="text-gray-400" />
                    </div>
                </div>
            </div>

            {/* Tracks Area */}
            <div className="flex-1 overflow-y-auto overflow-x-auto relative custom-scrollbar bg-[#121212]" ref={timelineRef}>
                <div
                    className="min-w-full inline-block relative pb-20"
                    style={{ width: `${Math.max(window.innerWidth - 300, (duration || 60) * PIXELS_PER_SECOND * zoomLevel + 500)}px` }}
                >
                    {/* Ruler */}
                    <div
                        className="h-8 border-b border-white/5 bg-[#1a1a1a] sticky top-0 z-20 w-full cursor-pointer flex items-end pb-1 ml-12"
                        onMouseDown={handleTimelineMouseDown}
                    >
                        {Array.from({ length: Math.ceil((duration || 60) / 5) }).map((_, i) => (
                            <div
                                key={i}
                                className="absolute border-l border-white/20 h-3 text-[10px] text-gray-500 pl-1"
                                style={{ left: `${i * 5 * PIXELS_PER_SECOND * zoomLevel}px` }}
                            >
                                {formatTime(i * 5).slice(3, 8)}
                            </div>
                        ))}
                    </div>

                    {/* Playhead */}
                    <div
                        className="absolute top-0 bottom-0 w-px bg-red-500 z-50 pointer-events-none ml-12"
                        style={{ left: `${currentTime * PIXELS_PER_SECOND * zoomLevel}px` }}
                    >
                        <div className="absolute -top-0 -left-1.5 w-3 h-3 bg-red-500 rotate-45 transform origin-center" />
                        <div className="absolute top-0 left-0 w-px h-full bg-red-500/50" />
                    </div>

                    <div className="space-y-1 mt-2">
                        {tracks.map(track => (
                            <div key={track.id} className="flex h-24 bg-[#151515] border-y border-white/5 overflow-hidden group/track hover:bg-[#1a1a1a] transition-colors relative">
                                {/* Track Header */}
                                <div className="w-12 flex flex-col justify-center items-center border-r border-white/5 bg-[#1a1a1a] shrink-0 z-20 relative group/header">
                                    <div className={`w-1 h-6 rounded-full ${track.type === 'video' ? 'bg-blue-500' : 'bg-emerald-500'}`} />
                                    <span className="text-[8px] text-gray-500 mt-1 uppercase tracking-wider">{track.type === 'video' ? 'VID' : 'AUD'}</span>

                                    {/* Delete Track Button (Hover) */}
                                    <button
                                        className="absolute inset-0 bg-red-500/90 flex items-center justify-center opacity-0 group-hover/header:opacity-100 transition-opacity"
                                        onClick={() => deleteTrack(track.id)}
                                        title="İzi Sil"
                                    >
                                        <Trash2 size={14} className="text-white" />
                                    </button>
                                </div>

                                {/* Track Content */}
                                <div
                                    className="flex-1 relative min-w-[1000px] z-10"
                                    onDragOver={handleDragOver}
                                    onDrop={(e) => handleDrop(e, track.id)}
                                    onMouseDown={handleTimelineMouseDown}
                                >
                                    {/* Grid Lines */}
                                    <div className="absolute inset-0 bg-[linear-gradient(90deg,rgba(255,255,255,0.02)_1px,transparent_1px)] bg-[size:100px_100px]" />

                                    {track.clips.map(clip => (
                                        <div
                                            key={clip.id}
                                            onMouseDown={(e) => handleClipDragStart(e, clip)}
                                            onClick={(e) => {
                                                e.stopPropagation();
                                                setSelectedClipId(clip.id);
                                            }}
                                            className={`absolute h-[calc(100%-4px)] top-0.5 rounded-md border overflow-hidden cursor-move group/clip shadow-sm transition-all ${clip.type === 'video'
                                                ? 'bg-blue-900/30 border-blue-500/30'
                                                : clip.type === 'image'
                                                    ? 'bg-purple-900/30 border-purple-500/30'
                                                    : 'bg-emerald-900/30 border-emerald-500/30'
                                                } ${selectedClipId === clip.id ? 'ring-2 ring-white z-10 border-transparent' : 'hover:border-white/30'}`}
                                            style={{
                                                left: `${clip.start * PIXELS_PER_SECOND * zoomLevel}px`,
                                                width: `${clip.duration * PIXELS_PER_SECOND * zoomLevel}px`
                                            }}
                                        >
                                            {/* Clip Content */}
                                            <div className="relative w-full h-full overflow-hidden">
                                                {/* Image Thumbnail Background */}
                                                {(clip.type === 'video' || clip.type === 'image') && (
                                                    <div className="absolute inset-0 opacity-50 transition-all">
                                                        {clip.type === 'image' ? (
                                                            <img src={clip.sourcePath} className="w-full h-full object-cover" alt="" />
                                                        ) : (
                                                            <div className="flex w-full h-full overflow-hidden bg-black">
                                                                {/* Render multiple video elements to simulate a filmstrip */}
                                                                {(() => {
                                                                    // Calculate number of thumbnails based on width
                                                                    // We want a thumbnail roughly every 80px
                                                                    const width = clip.duration * PIXELS_PER_SECOND * zoomLevel;
                                                                    const thumbCount = Math.max(1, Math.floor(width / 80));

                                                                    return Array.from({ length: thumbCount }).map((_, i) => (
                                                                        <div key={i} className="flex-1 h-full relative overflow-hidden border-r border-white/10 last:border-0">
                                                                            <video
                                                                                src={clip.sourcePath}
                                                                                className="w-full h-full object-cover pointer-events-none"
                                                                                preload="auto"
                                                                                muted
                                                                                onLoadedMetadata={(e) => {
                                                                                    const video = e.currentTarget;
                                                                                    // Set time to the corresponding segment of the clip
                                                                                    // Start of clip + (segment index / total segments) * duration
                                                                                    video.currentTime = (i / thumbCount) * clip.duration;
                                                                                }}
                                                                            />
                                                                        </div>
                                                                    ));
                                                                })()}
                                                            </div>
                                                        )}
                                                    </div>
                                                )}

                                                {/* Clip Info */}
                                                <div className="absolute inset-0 p-1 flex flex-col justify-between pointer-events-none">
                                                    <div className="text-[10px] font-medium truncate text-white/90 drop-shadow-md">
                                                        {clip.name}
                                                    </div>
                                                </div>

                                                {/* Resize Handles */}
                                                {selectedClipId === clip.id && (
                                                    <>
                                                        <div
                                                            className="absolute left-0 top-0 bottom-0 w-3 cursor-w-resize hover:bg-white/20 z-20 flex items-center justify-center"
                                                            onMouseDown={(e) => handleResizeStart(e, clip, 'left')}
                                                        >
                                                            <div className="w-1 h-4 bg-white/50 rounded-full" />
                                                        </div>
                                                        <div
                                                            className="absolute right-0 top-0 bottom-0 w-3 cursor-e-resize hover:bg-white/20 z-20 flex items-center justify-center"
                                                            onMouseDown={(e) => handleResizeStart(e, clip, 'right')}
                                                        >
                                                            <div className="w-1 h-4 bg-white/50 rounded-full" />
                                                        </div>
                                                    </>
                                                )}
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            </div>
                        ))}

                        {/* Drop Zone for New Track */}
                        <div
                            className="h-24 mx-12 border-2 border-dashed border-white/5 rounded-xl flex items-center justify-center text-gray-600 hover:border-white/20 hover:text-gray-400 transition-colors cursor-pointer bg-white/5"
                            onDragOver={handleDragOver}
                            onDrop={(e) => {
                                e.preventDefault();
                                const id = addTrack('video'); // Auto create video track
                                handleDrop(e, id); // Drop the clip onto it
                            }}
                        >
                            <span className="text-sm font-medium flex items-center gap-2">
                                <Plus size={16} />
                                Yeni iz oluşturmak için medyayı buraya sürükleyin
                            </span>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default Timeline;
