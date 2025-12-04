import React from 'react';
import { X, Download } from 'lucide-react';

interface ExportModalProps {
    isOpen: boolean;
    onClose: () => void;
}

const ExportModal: React.FC<ExportModalProps> = ({ isOpen, onClose }) => {
    if (!isOpen) return null;

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-sm">
            <div className="w-full max-w-md rounded-xl bg-[#1a1a1a] p-6 shadow-2xl ring-1 ring-white/10">
                <div className="mb-6 flex items-center justify-between">
                    <h2 className="text-xl font-bold text-white">Videoyu Dışa Aktar</h2>
                    <button onClick={onClose} className="rounded-full p-1 text-gray-400 hover:bg-white/10 hover:text-white">
                        <X size={20} />
                    </button>
                </div>

                <div className="space-y-4">
                    <div>
                        <label className="mb-2 block text-sm font-medium text-gray-300">Dosya Adı</label>
                        <input
                            type="text"
                            defaultValue="Proje_Video_01"
                            className="w-full rounded-lg border border-white/10 bg-black/20 px-3 py-2 text-white focus:border-purple-500 focus:outline-none"
                        />
                    </div>

                    <div>
                        <label className="mb-2 block text-sm font-medium text-gray-300">Çözünürlük</label>
                        <select className="w-full rounded-lg border border-white/10 bg-black/20 px-3 py-2 text-white focus:border-purple-500 focus:outline-none">
                            <option value="1080p">1080p (Full HD)</option>
                            <option value="720p">720p (HD)</option>
                            <option value="4k">4K (Ultra HD)</option>
                        </select>
                    </div>

                    <div>
                        <label className="mb-2 block text-sm font-medium text-gray-300">Format</label>
                        <select className="w-full rounded-lg border border-white/10 bg-black/20 px-3 py-2 text-white focus:border-purple-500 focus:outline-none">
                            <option value="mp4">MP4 (H.264)</option>
                            <option value="webm">WebM</option>
                            <option value="gif">GIF</option>
                        </select>
                    </div>
                </div>

                <div className="mt-8 flex justify-end gap-3">
                    <button
                        onClick={onClose}
                        className="rounded-lg px-4 py-2 text-sm font-medium text-gray-300 hover:bg-white/5 hover:text-white"
                    >
                        İptal
                    </button>
                    <button
                        className="flex items-center gap-2 rounded-lg bg-purple-600 px-4 py-2 text-sm font-medium text-white hover:bg-purple-500"
                        onClick={() => {
                            alert("Dışa aktarma işlemi başlatıldı! (Simülasyon)");
                            onClose();
                        }}
                    >
                        <Download size={16} />
                        Dışa Aktar
                    </button>
                </div>
            </div>
        </div>
    );
};

export default ExportModal;
