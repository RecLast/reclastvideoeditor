import React, { useRef } from 'react';
import { Upload, Music, Plus } from 'lucide-react';
import { useProjectStore } from '../../../store/useProjectStore';
import { useMediaImport } from '../../../hooks/useMediaImport';

const MediaPanel: React.FC = () => {
    const { mediaPool } = useProjectStore();
    const { importFiles } = useMediaImport();
    const fileInputRef = useRef<HTMLInputElement>(null);

    const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
        if (e.target.files) {
            importFiles(Array.from(e.target.files));
        }
    };

    const formatDuration = (seconds: number) => {
        const m = Math.floor(seconds / 60);
        const s = Math.floor(seconds % 60);
        return `${m}:${s.toString().padStart(2, '0')}`;
    };

    return (
        <div className="flex h-full flex-col">
            <div className="mb-4 flex items-center justify-between">
                <h3 className="font-semibold text-white">Proje Medyası</h3>
                <button
                    onClick={() => fileInputRef.current?.click()}
                    className="rounded-full bg-purple-600 p-1.5 hover:bg-purple-500"
                >
                    <Plus size={16} />
                </button>
                <input
                    type="file"
                    ref={fileInputRef}
                    className="hidden"
                    multiple
                    accept="video/*,audio/*,image/*"
                    onChange={handleFileSelect}
                />
            </div>

            <div className="flex-1 overflow-y-auto">
                {mediaPool.length === 0 ? (
                    <div className="flex h-full flex-col items-center justify-center text-center text-gray-500">
                        <Upload className="mb-2 h-8 w-8 opacity-50" />
                        <p className="text-sm">Medya dosyalarını içe aktarmak için tıklayın veya sürükleyin.</p>
                    </div>
                ) : (
                    <div className="grid grid-cols-2 gap-2">
                        {mediaPool.map((media) => (
                            <div
                                key={media.id}
                                className="group relative aspect-video cursor-pointer overflow-hidden rounded-lg bg-black/40 ring-1 ring-white/10 hover:ring-purple-500"
                                draggable
                                onDragStart={(e) => {
                                    e.dataTransfer.setData('application/json', JSON.stringify(media));
                                }}
                            >
                                {media.type === 'video' ? (
                                    <video src={media.objectUrl} className="h-full w-full object-cover" />
                                ) : media.type === 'image' ? (
                                    <img src={media.objectUrl} alt={media.file.name} className="h-full w-full object-cover" />
                                ) : (
                                    <div className="flex h-full w-full items-center justify-center bg-gray-800">
                                        <Music className="h-8 w-8 text-gray-400" />
                                    </div>
                                )}
                                <div className="absolute bottom-0 left-0 w-full bg-gradient-to-t from-black/80 to-transparent p-2">
                                    <p className="truncate text-xs font-medium text-white">{media.file.name}</p>
                                    <p className="text-[10px] text-gray-300">{formatDuration(media.duration)}</p>
                                </div>
                                <div className="absolute right-1 top-1 rounded bg-black/60 px-1 py-0.5 text-[10px] uppercase text-white">
                                    {media.type}
                                </div>
                            </div>
                        ))}
                    </div>
                )}
            </div>
        </div>
    );
};

export default MediaPanel;
