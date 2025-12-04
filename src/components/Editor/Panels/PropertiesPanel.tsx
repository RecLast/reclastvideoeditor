import React from 'react';
import { useProjectStore } from '../../../store/useProjectStore';
import { Volume2, Video, Type, Image as ImageIcon, Trash2, Clock, RotateCcw, Zap } from 'lucide-react';
import { TEMPLATES } from '../../../constants/templates';

const PropertiesPanel: React.FC = () => {
    const { tracks, selectedClipId, updateClip, deleteClip, width, height, setDimensions } = useProjectStore();

    // Find the selected clip
    const selectedClip = React.useMemo(() => {
        if (!selectedClipId) return null;
        for (const track of tracks) {
            const clip = track.clips.find(c => c.id === selectedClipId);
            if (clip) return clip;
        }
        return null;
    }, [tracks, selectedClipId]);

    const handleReset = () => {
        if (!selectedClip) return;
        updateClip(selectedClip.id, {
            volume: 1,
            speed: 1,
            // We don't reset start/duration as that destroys the edit
        });
    };

    if (!selectedClip) {
        return (
            <div className="flex flex-col h-full bg-[#151515] border-l border-white/5">
                <div className="h-14 border-b border-white/5 flex items-center px-4">
                    <h2 className="text-sm font-semibold text-gray-300">Proje Ayarları</h2>
                </div>
                <div className="flex-1 overflow-y-auto p-4">
                    <h3 className="text-xs font-semibold text-gray-500 uppercase tracking-wider mb-4">Şablonlar</h3>
                    <div className="grid grid-cols-2 gap-3">
                        {TEMPLATES.map(template => (
                            <button
                                key={template.id}
                                onClick={() => setDimensions(template.width, template.height)}
                                className={`flex flex-col items-center gap-2 rounded-lg border border-white/5 bg-black/20 p-3 transition-all hover:bg-white/5 ${width === template.width && height === template.height ? 'border-purple-500 bg-purple-500/10' : ''
                                    }`}
                            >
                                <div className={`p-2 rounded-lg bg-gradient-to-br ${template.color}`}>
                                    <template.icon size={20} className="text-white" />
                                </div>
                                <div className="text-center">
                                    <span className="block text-xs font-medium text-white">{template.title}</span>
                                    <span className="text-[10px] text-gray-500">{template.ratio}</span>
                                </div>
                            </button>
                        ))}
                    </div>

                    <div className="mt-6 space-y-4">
                        <h3 className="text-xs font-semibold text-gray-500 uppercase tracking-wider">Çözünürlük</h3>
                        <div className="grid grid-cols-2 gap-3">
                            <div className="bg-black/20 rounded p-2">
                                <label className="text-[10px] text-gray-500 block mb-1">Genişlik</label>
                                <input
                                    type="number"
                                    value={width}
                                    onChange={(e) => setDimensions(parseInt(e.target.value) || 0, height)}
                                    className="w-full bg-transparent text-sm font-mono text-white outline-none"
                                />
                            </div>
                            <div className="bg-black/20 rounded p-2">
                                <label className="text-[10px] text-gray-500 block mb-1">Yükseklik</label>
                                <input
                                    type="number"
                                    value={height}
                                    onChange={(e) => setDimensions(width, parseInt(e.target.value) || 0)}
                                    className="w-full bg-transparent text-sm font-mono text-white outline-none"
                                />
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        );
    }

    return (
        <div className="flex flex-col h-full bg-[#151515] border-l border-white/5 overflow-y-auto">
            <div className="h-14 border-b border-white/5 flex items-center px-4 justify-between shrink-0">
                <h2 className="text-sm font-semibold text-gray-300">Özellikler</h2>
                <div className="flex items-center gap-2">
                    <button
                        onClick={handleReset}
                        className="p-1.5 hover:bg-white/10 rounded text-gray-400 hover:text-white transition-colors"
                        title="Ayarları Sıfırla"
                    >
                        <RotateCcw size={14} />
                    </button>
                    <button
                        onClick={() => deleteClip(selectedClip.id)}
                        className="p-1.5 hover:bg-white/10 rounded text-gray-400 hover:text-red-400 transition-colors"
                        title="Sil"
                    >
                        <Trash2 size={14} />
                    </button>
                </div>
            </div>

            <div className="p-4 space-y-6">
                {/* Info Section */}
                <div className="space-y-4">
                    <div className="flex items-start gap-3">
                        <div className="w-12 h-12 rounded bg-white/5 flex items-center justify-center shrink-0">
                            {selectedClip.type === 'video' && <Video className="text-blue-400" />}
                            {selectedClip.type === 'audio' && <Volume2 className="text-emerald-400" />}
                            {selectedClip.type === 'text' && <Type className="text-purple-400" />}
                            {selectedClip.type === 'image' && <ImageIcon className="text-orange-400" />}
                        </div>
                        <div className="flex-1 min-w-0">
                            <h3 className="text-sm font-medium text-white truncate">{selectedClip.name}</h3>
                            <p className="text-xs text-gray-500 mt-1 capitalize">{selectedClip.type} Clip</p>
                        </div>
                    </div>
                </div>

                {/* Timing Section */}
                <div className="space-y-3">
                    <h4 className="text-xs font-semibold text-gray-500 uppercase tracking-wider flex items-center gap-2">
                        <Clock size={12} /> Zamanlama
                    </h4>

                    <div className="grid grid-cols-2 gap-3">
                        <div className="bg-black/20 rounded p-2">
                            <label className="text-[10px] text-gray-500 block mb-1">Başlangıç</label>
                            <input
                                type="number"
                                value={selectedClip.start.toFixed(2)}
                                onChange={(e) => updateClip(selectedClip.id, { start: parseFloat(e.target.value) })}
                                className="w-full bg-transparent text-sm font-mono text-white outline-none"
                                step="0.1"
                            />
                        </div>
                        <div className="bg-black/20 rounded p-2">
                            <label className="text-[10px] text-gray-500 block mb-1">Süre</label>
                            <input
                                type="number"
                                value={selectedClip.duration.toFixed(2)}
                                onChange={(e) => {
                                    const newDuration = parseFloat(e.target.value);
                                    if (newDuration > 0) {
                                        // Requirement 10: Changing duration scales speed (Time Stretch)
                                        // Content Duration = Current Duration * Current Speed
                                        const contentDuration = selectedClip.duration * (selectedClip.speed ?? 1);
                                        const newSpeed = contentDuration / newDuration;
                                        updateClip(selectedClip.id, { duration: newDuration, speed: newSpeed });
                                    }
                                }}
                                className="w-full bg-transparent text-sm font-mono text-white outline-none"
                                step="0.1"
                            />
                        </div>
                    </div>
                </div>

                {/* Audio/Video Settings */}
                {(selectedClip.type === 'video' || selectedClip.type === 'audio') && (
                    <div className="space-y-3">
                        <h4 className="text-xs font-semibold text-gray-500 uppercase tracking-wider flex items-center gap-2">
                            <Volume2 size={12} /> Ses & Hız
                        </h4>

                        <div className="space-y-4">
                            <div>
                                <div className="flex items-center justify-between mb-2">
                                    <span className="text-xs text-gray-400">Ses Seviyesi</span>
                                    <span className="text-xs text-gray-400">{Math.round((selectedClip.volume ?? 1) * 100)}%</span>
                                </div>
                                <input
                                    type="range"
                                    min="0"
                                    max="2"
                                    step="0.1"
                                    value={selectedClip.volume ?? 1}
                                    onChange={(e) => updateClip(selectedClip.id, { volume: parseFloat(e.target.value) })}
                                    className="w-full accent-emerald-500 h-1 bg-gray-700 rounded-lg appearance-none cursor-pointer"
                                />
                            </div>

                            <div>
                                <div className="flex items-center justify-between mb-2">
                                    <span className="text-xs text-gray-400">Hız</span>
                                    <span className="text-xs text-gray-400">{selectedClip.speed ?? 1}x</span>
                                </div>
                                <input
                                    type="range"
                                    min="0.25"
                                    max="4"
                                    step="0.25"
                                    value={selectedClip.speed ?? 1}
                                    onChange={(e) => updateClip(selectedClip.id, { speed: parseFloat(e.target.value) })}
                                    className="w-full accent-blue-500 h-1 bg-gray-700 rounded-lg appearance-none cursor-pointer"
                                />
                            </div>
                        </div>
                    </div>
                )}

                {/* Transform Section (Placeholder) */}
                {(selectedClip.type === 'video' || selectedClip.type === 'image') && (
                    <div className="space-y-3">
                        <h4 className="text-xs font-semibold text-gray-500 uppercase tracking-wider flex items-center gap-2">
                            <Zap size={12} /> Efektler
                        </h4>

                        <div className="space-y-2">
                            <div className="flex items-center justify-between">
                                <span className="text-xs text-gray-400">Opaklık</span>
                                <span className="text-xs text-gray-400">{Math.round((selectedClip.opacity ?? 1) * 100)}%</span>
                            </div>
                            <input
                                type="range"
                                min="0"
                                max="1"
                                step="0.01"
                                value={selectedClip.opacity ?? 1}
                                onChange={(e) => updateClip(selectedClip.id, { opacity: parseFloat(e.target.value) })}
                                className="w-full accent-purple-600 h-1 bg-gray-700 rounded-lg appearance-none cursor-pointer"
                            />
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
};

export default PropertiesPanel;
