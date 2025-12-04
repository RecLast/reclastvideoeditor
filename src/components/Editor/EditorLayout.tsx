import React, { useState, useRef, useEffect } from 'react';
import { Video, Wand2, Type, Pencil, ChevronLeft, Edit2, Download, Save, FolderOpen } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { useUIStore } from '../../store/useUIStore';
import { useProjectStore } from '../../store/useProjectStore';
import MediaPanel from './Panels/MediaPanel';
import Timeline from './Timeline/Timeline';
import VideoPlayer from './Preview/VideoPlayer';
import ExportModal from './Export/ExportModal';
import PropertiesPanel from './Panels/PropertiesPanel';

const EditorLayout: React.FC = () => {
    const navigate = useNavigate();
    const { activePanel, setActivePanel } = useUIStore();
    const { saveProject, loadProject } = useProjectStore();
    const [isExportOpen, setIsExportOpen] = useState(false);
    const [projectName, setProjectName] = useState("Adsız Proje");
    const [isEditingName, setIsEditingName] = useState(false);
    const nameInputRef = useRef<HTMLInputElement>(null);
    const fileInputRef = useRef<HTMLInputElement>(null);

    useEffect(() => {
        if (isEditingName && nameInputRef.current) {
            nameInputRef.current.focus();
        }
    }, [isEditingName]);

    const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (file) {
            loadProject(file);
        }
    };

    return (
        <div className="flex h-screen w-full flex-col bg-[#0f0f0f] text-white font-sans">
            <ExportModal isOpen={isExportOpen} onClose={() => setIsExportOpen(false)} />

            {/* Top Bar */}
            <header className="flex h-14 items-center justify-between border-b border-white/5 bg-[#121212] px-4 shadow-sm shrink-0 z-50">
                <div className="flex items-center gap-4">
                    <button onClick={() => navigate('/')} className="rounded-lg p-2 hover:bg-white/5 text-gray-400 hover:text-white transition-colors">
                        <ChevronLeft size={20} />
                    </button>

                    <div className="h-6 w-px bg-white/10 mx-2" />

                    <div className="flex items-center gap-3">
                        <img src="/assets/logo.png" alt="RecLast Logo" className="h-8 w-8 object-contain" />
                        <div className="hidden md:flex flex-col justify-center">
                            <span className="text-sm font-bold tracking-tight leading-none text-white">Video</span>
                            <span className="text-[10px] font-bold tracking-tight leading-none text-purple-500 uppercase">Editör</span>
                        </div>
                    </div>

                    <div className="h-6 w-px bg-white/10 mx-2" />

                    <div className="flex items-center gap-2 group">
                        {isEditingName ? (
                            <input
                                ref={nameInputRef}
                                type="text"
                                value={projectName}
                                onChange={(e) => setProjectName(e.target.value)}
                                onBlur={() => setIsEditingName(false)}
                                onKeyDown={(e) => e.key === 'Enter' && setIsEditingName(false)}
                                className="bg-black/20 border border-purple-500/50 rounded px-2 py-1 text-sm font-medium outline-none text-white w-48"
                            />
                        ) : (
                            <button
                                onClick={() => setIsEditingName(true)}
                                className="flex items-center gap-2 rounded px-2 py-1 hover:bg-white/5 transition-colors"
                            >
                                <span className="text-sm font-medium">{projectName}</span>
                                <Edit2 size={12} className="text-gray-500 opacity-0 group-hover:opacity-100 transition-opacity" />
                            </button>
                        )}
                    </div>
                </div>

                <div className="flex items-center gap-3">
                    <input
                        type="file"
                        ref={fileInputRef}
                        onChange={handleFileChange}
                        className="hidden"
                        accept=".json"
                    />
                    <button
                        onClick={() => fileInputRef.current?.click()}
                        className="flex items-center gap-2 px-3 py-1.5 text-sm font-medium text-gray-300 hover:text-white hover:bg-white/5 rounded-lg transition-colors"
                    >
                        <FolderOpen size={16} />
                        <span className="hidden sm:inline">Aç</span>
                    </button>
                    <button
                        onClick={saveProject}
                        className="flex items-center gap-2 px-3 py-1.5 text-sm font-medium text-gray-300 hover:text-white hover:bg-white/5 rounded-lg transition-colors"
                    >
                        <Save size={16} />
                        <span className="hidden sm:inline">Kaydet</span>
                    </button>

                    <div className="h-6 w-px bg-white/10 mx-2" />

                    <button
                        onClick={() => setIsExportOpen(true)}
                        className="flex items-center gap-2 rounded-lg bg-gradient-to-r from-purple-600 to-blue-600 px-4 py-1.5 text-xs font-bold hover:shadow-lg hover:shadow-purple-500/20 transition-all active:scale-95"
                    >
                        <Download size={16} />
                        <span>Dışa Aktar</span>
                    </button>
                </div>
            </header>

            <div className="flex flex-1 overflow-hidden">
                {/* Left Sidebar - Tools */}
                <aside className="flex w-18 flex-col items-center border-r border-white/5 bg-[#121212] py-6 gap-2 shrink-0">
                    <ToolButton icon={<Video />} label="Medya" active={activePanel === 'media'} onClick={() => setActivePanel('media')} />
                    <ToolButton icon={<Wand2 />} label="Efektler" active={activePanel === 'effects'} onClick={() => setActivePanel('effects')} />
                    <ToolButton icon={<Type />} label="Metin" active={activePanel === 'text'} onClick={() => setActivePanel('text')} />
                    <ToolButton icon={<Pencil />} label="Çizim" active={activePanel === 'draw'} onClick={() => setActivePanel('draw')} />
                </aside>

                {/* Secondary Sidebar - Panel Content */}
                <aside className="w-80 border-r border-white/5 bg-[#151515] flex flex-col transition-all duration-300 shrink-0">
                    {activePanel === 'media' && <MediaPanel />}
                    {activePanel !== 'media' && (
                        <div className="p-6">
                            <h2 className="mb-6 text-xl font-bold capitalize flex items-center gap-2">
                                {activePanel === 'effects' && <Wand2 className="h-5 w-5 text-purple-400" />}
                                {activePanel === 'text' && <Type className="h-5 w-5 text-blue-400" />}
                                {activePanel === 'draw' && <Pencil className="h-5 w-5 text-emerald-400" />}
                                {activePanel}
                            </h2>
                            <div className="text-sm text-gray-400 leading-relaxed">
                                {activePanel === 'effects' && "Video efektleri ve geçişler yakında eklenecek."}
                                {activePanel === 'text' && "Başlık ve alt yazı araçları yakında eklenecek."}
                                {activePanel === 'draw' && "Şekiller ve çizim araçları yakında eklenecek."}
                            </div>
                        </div>
                    )}
                </aside>

                {/* Main Content Area */}
                <main className="flex flex-1 flex-col min-w-0">
                    {/* Preview Area */}
                    <div className="flex flex-1 items-center justify-center bg-[#0f0f0f] p-8 relative overflow-hidden">
                        <div className="absolute inset-0 bg-[radial-gradient(circle_at_center,_var(--tw-gradient-stops))] from-purple-900/5 via-transparent to-transparent pointer-events-none" />
                        <div className="aspect-video w-full max-w-4xl bg-black shadow-2xl ring-1 ring-white/10 rounded-lg overflow-hidden z-10">
                            <VideoPlayer />
                        </div>
                    </div>

                    {/* Timeline Area */}
                    <div className="h-80 border-t border-white/5 bg-[#121212] shrink-0">
                        <Timeline />
                    </div>
                </main>

                {/* Right Sidebar - Properties */}
                <aside className="w-72 border-l border-white/5 bg-[#151515] p-0 flex flex-col shrink-0">
                    <PropertiesPanel />
                </aside>
            </div>
        </div>
    );
};

const ToolButton = ({ icon, label, active, onClick }: { icon: React.ReactNode, label: string, active?: boolean, onClick: () => void }) => (
    <button
        onClick={onClick}
        className={`group relative flex h-16 w-12 flex-col items-center justify-center gap-1.5 rounded-xl transition-all duration-200 ${active
            ? 'bg-purple-600 text-white shadow-lg shadow-purple-900/20'
            : 'text-gray-400 hover:bg-white/5 hover:text-white'
            }`}
    >
        {React.isValidElement(icon) && React.cloneElement(icon, { size: 22, strokeWidth: active ? 2.5 : 2 } as React.Attributes)}
        <span className="text-[10px] font-medium">{label}</span>
        {active && <div className="absolute -right-3 top-1/2 h-8 w-1 -translate-y-1/2 rounded-l-full bg-purple-400" />}
    </button>
);

export default EditorLayout;
