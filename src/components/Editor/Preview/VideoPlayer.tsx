import React, { useEffect, useRef } from 'react';
import { useProjectStore } from '../../../store/useProjectStore';

const VideoPlayer: React.FC = () => {
    const canvasRef = useRef<HTMLCanvasElement>(null);
    const videoRefs = useRef<Map<string, HTMLVideoElement>>(new Map());
    const imageCache = useRef<Map<string, HTMLImageElement>>(new Map());

    useEffect(() => {
        let animationFrameId: number;
        let lastTime = performance.now();
        let lastUiUpdate = 0;

        const render = () => {
            const state = useProjectStore.getState();
            const { tracks, isPlaying, currentTime, width, height } = state;

            let timeToRender = currentTime;
            const now = performance.now();

            if (isPlaying) {
                const deltaTime = (now - lastTime) / 1000;
                timeToRender += deltaTime;
                lastTime = now;

                // Throttle UI updates to ~30fps to prevent React render storm
                if (now - lastUiUpdate > 33) {
                    useProjectStore.setState({ currentTime: timeToRender });
                    lastUiUpdate = now;
                }
            } else {
                lastTime = now;
            }

            const canvas = canvasRef.current;
            if (!canvas) return;

            // Update canvas dimensions if changed
            if (canvas.width !== (width || 1920) || canvas.height !== (height || 1080)) {
                canvas.width = width || 1920;
                canvas.height = height || 1080;
            }

            const ctx = canvas.getContext('2d');
            if (!ctx) return;

            // Clear canvas
            ctx.fillStyle = '#000';
            ctx.fillRect(0, 0, canvas.width, canvas.height);

            // Render Tracks
            [...tracks].reverse().forEach(track => {
                if (track.isMuted || (track.type !== 'video' && track.type !== 'image')) return;

                const clip = track.clips.find(c =>
                    timeToRender >= c.start && timeToRender < c.start + c.duration
                );

                if (clip) {
                    const scale = clip.scale ?? 1;
                    const position = clip.position ?? { x: 0, y: 0 };

                    // Draw function helper
                    const drawContent = (element: HTMLVideoElement | HTMLImageElement, originalWidth: number, originalHeight: number) => {
                        ctx.save();
                        ctx.globalAlpha = clip.opacity ?? 1;

                        // Calculate aspect ratios
                        const canvasRatio = canvas.width / canvas.height;
                        const contentRatio = originalWidth / originalHeight;

                        let drawWidth, drawHeight, offsetX, offsetY;

                        // Fit logic (contain) - Default behavior
                        if (contentRatio > canvasRatio) {
                            drawWidth = canvas.width;
                            drawHeight = canvas.width / contentRatio;
                            offsetX = 0;
                            offsetY = (canvas.height - drawHeight) / 2;
                        } else {
                            drawHeight = canvas.height;
                            drawWidth = canvas.height * contentRatio;
                            offsetY = 0;
                            offsetX = (canvas.width - drawWidth) / 2;
                        }

                        // Apply Transformations
                        const centerX = offsetX + drawWidth / 2 + position.x;
                        const centerY = offsetY + drawHeight / 2 + position.y;

                        ctx.translate(centerX, centerY);
                        ctx.scale(scale, scale);
                        ctx.translate(-centerX, -centerY);

                        ctx.drawImage(element, offsetX + position.x, offsetY + position.y, drawWidth, drawHeight);
                        ctx.restore();
                    };

                    if (clip.type === 'image') {
                        let img = imageCache.current.get(clip.sourcePath);
                        if (!img) {
                            img = new Image();
                            img.src = clip.sourcePath;
                            imageCache.current.set(clip.sourcePath, img);
                        }

                        if (img.complete && img.naturalWidth > 0) {
                            drawContent(img, img.naturalWidth, img.naturalHeight);
                        }
                        return;
                    }

                    // Video Logic
                    let video = videoRefs.current.get(clip.id);
                    if (!video) {
                        video = document.createElement('video');
                        video.src = clip.sourcePath;
                        video.muted = true;
                        video.preload = 'auto';
                        video.playsInline = true;
                        video.crossOrigin = "anonymous"; // Handle CORS if needed
                        videoRefs.current.set(clip.id, video);
                        video.load();
                    }

                    const speed = clip.speed ?? 1;
                    const clipTime = (timeToRender - clip.start) * speed + clip.offset;

                    // Ensure video is ready
                    if (video.readyState === 0) {
                        video.load();
                    }

                    if (isPlaying) {
                        if (video.paused) {
                            video.play().catch(e => console.warn("Video play failed", e));
                        }

                        // Sync check
                        if (Math.abs(video.currentTime - clipTime) > 0.3) {
                            video.currentTime = clipTime;
                        }
                    } else {
                        if (!video.paused) video.pause();
                        // Always seek when paused to match scrub
                        if (Math.abs(video.currentTime - clipTime) > 0.05) {
                            video.currentTime = clipTime;
                        }
                    }

                    if (video.playbackRate !== speed) video.playbackRate = speed;
                    video.volume = clip.volume ?? 1;

                    // Draw if we have data
                    if (video.readyState >= 2) { // HAVE_CURRENT_DATA
                        drawContent(video, video.videoWidth, video.videoHeight);
                    }
                }
            });

            // Cleanup/Pause logic
            const visibleClipIds = new Set<string>();
            [...tracks].forEach(track => {
                if (track.isMuted || track.type !== 'video') return;
                const clip = track.clips.find(c =>
                    timeToRender >= c.start && timeToRender < c.start + c.duration
                );
                if (clip) visibleClipIds.add(clip.id);
            });

            videoRefs.current.forEach((video, id) => {
                if (!visibleClipIds.has(id)) {
                    if (!video.paused) video.pause();
                }
            });

            // Optional: Garbage collect video elements for deleted clips
            const allClipIds = new Set<string>();
            tracks.forEach(t => t.clips.forEach(c => allClipIds.add(c.id)));

            videoRefs.current.forEach((video, id) => {
                if (!allClipIds.has(id)) {
                    video.pause();
                    video.src = "";
                    video.load();
                    videoRefs.current.delete(id);
                }
            });

            animationFrameId = requestAnimationFrame(render);
        };

        animationFrameId = requestAnimationFrame(render);

        return () => {
            cancelAnimationFrame(animationFrameId);
        };
    }, []);

    return (
        <div className="relative h-full w-full flex items-center justify-center bg-black">
            <canvas
                ref={canvasRef}
                className="h-full w-full object-contain"
            />
        </div>
    );
};

export default VideoPlayer;
