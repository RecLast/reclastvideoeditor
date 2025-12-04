import React, { useState, useRef } from 'react';
import { Plus, Video, LayoutTemplate, Settings, FolderOpen, Clock, Star, Music, Youtube, Instagram } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { useProjectStore } from '../../store/useProjectStore';
import { TEMPLATES } from '../../constants/templates';

interface RecentProject {
    path: string;
    name: string;
    lastModified: number;
}

interface TemplateCardProps {
    title: string;
    ratio: string;
    icon: React.ReactNode;
    color: string;
    border: string;
    width: number;
    height: number;
}

const StartupScreen: React.FC = () => {
    const navigate = useNavigate();
    const { resetProject, loadProject } = useProjectStore();
    const [activeTab, setActiveTab] = useState<'new' | 'templates' | 'projects' | 'settings'>('new');
    const fileInputRef = useRef<HTMLInputElement>(null);

    const handleNewProject = () => {
        resetProject();
        navigate('/editor');
    };

    const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (file) {
            loadProject(file);
            navigate('/editor');
        }
    };

    return (
        <div className="flex h-screen w-full bg-[#0f0f0f] text-white font-sans selection:bg-purple-500/30">
            {/* Sidebar */}
            <aside className="w-64 flex-shrink-0 border-r border-white/5 bg-[#121212] p-4 flex flex-col">
                <div className="mb-8 flex items-center gap-3 px-2 py-2">
                    <img src="/assets/logo.png" alt="RecLast Logo" className="h-12 w-12 rounded-xl shadow-lg shadow-purple-900/20 object-cover" />
                    <div className="flex flex-col justify-center">
                        <span className="text-xl font-bold tracking-tight leading-none text-white">Video</span>
                        <span className="text-xl font-bold tracking-tight leading-none text-purple-500">Editör</span>
                    </div>
                </div>

                <nav className="space-y-1 flex-1">
                    <NavItem
                        icon={<Plus />}
                        label="Yeni Video Oluştur"
                        active={activeTab === 'new'}
                        onClick={() => setActiveTab('new')}
                    />
                    <NavItem
                        icon={<LayoutTemplate />}
                        label="Şablonlar"
                        active={activeTab === 'templates'}
                        onClick={() => setActiveTab('templates')}
                    />
                    <NavItem
                        icon={<FolderOpen />}
                        label="Projelerim"
                        active={activeTab === 'projects'}
                        onClick={() => setActiveTab('projects')}
                    />
                    <div className="my-4 h-px bg-white/5 mx-2" />
                    <NavItem
                        icon={<Settings />}
                        label="Ayarlar"
                        active={activeTab === 'settings'}
                        onClick={() => setActiveTab('settings')}
                    />
                </nav>

                <div className="px-2 text-xs text-gray-600 text-center py-4">
                    v0.1.0 Beta
                </div>
            </aside>

            {/* Main Content */}
            <main className="flex-1 overflow-y-auto p-10 bg-[#0f0f0f]">
                {activeTab === 'new' && (
                    <div className="animate-in fade-in slide-in-from-bottom-4 duration-500">
                        <header className="mb-10">
                            <h1 className="text-4xl font-bold bg-gradient-to-r from-white to-gray-400 bg-clip-text text-transparent mb-2">Hoş Geldiniz</h1>
                            <p className="text-gray-400 text-lg">Yeni bir şeyler oluşturmaya başlayın.</p>
                        </header>

                        {/* Quick Actions */}
                        <section className="mb-12 grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-3">
                            <ActionCard
                                title="Yeni Video Oluştur"
                                description="Boş bir proje ile sıfırdan başlayın."
                                icon={<Plus className="h-7 w-7" />}
                                onClick={handleNewProject}
                                primary
                            />
                            <ActionCard
                                title="Projeyi Aç"
                                description="Bilgisayarınızdan bir proje dosyası (.json) seçin."
                                icon={<FolderOpen className="h-7 w-7" />}
                                onClick={() => fileInputRef.current?.click()}
                            />
                            <ActionCard
                                title="Yapay Zeka ile Oluştur"
                                description="Otomatik video oluşturma sihirbazı."
                                icon={<Star className="h-7 w-7" />}
                                onClick={() => { }}
                                badge="Yakında"
                                disabled
                            />
                            <input
                                type="file"
                                ref={fileInputRef}
                                onChange={handleFileChange}
                                className="hidden"
                                accept=".json"
                            />
                        </section>

                        {/* Templates Preview */}
                        <section className="mb-12">
                            <div className="mb-6 flex items-center justify-between">
                                <h2 className="text-xl font-semibold flex items-center gap-2">
                                    <LayoutTemplate className="h-5 w-5 text-purple-400" />
                                    Hazır Şablonlar
                                </h2>
                                <button
                                    onClick={() => setActiveTab('templates')}
                                    className="text-sm text-purple-400 hover:text-purple-300 transition-colors"
                                >
                                    Tümünü Gör
                                </button>
                            </div>
                            <div className="grid grid-cols-2 gap-5 md:grid-cols-4 lg:grid-cols-5">
                                {TEMPLATES.map((template) => (
                                    <TemplateCard
                                        key={template.id}
                                        title={template.title}
                                        ratio={template.ratio}
                                        width={template.width}
                                        height={template.height}
                                        icon={<template.icon className={`h-8 w-8 ${template.id.includes('youtube') ? 'text-red-500' : template.id.includes('tiktok') ? 'text-cyan-400' : 'text-pink-500'}`} />}
                                        color={template.color}
                                        border={`group-hover:border-${template.id.includes('youtube') ? 'red' : template.id.includes('tiktok') ? 'cyan' : 'pink'}-500/50`}
                                    />
                                ))}
                            </div>
                        </section>

                        {/* Recent Projects Preview */}
                        <section>
                            <div className="mb-6 flex items-center justify-between">
                                <h2 className="text-xl font-semibold flex items-center gap-2">
                                    <Clock className="h-5 w-5 text-blue-400" />
                                    Son Projeler
                                </h2>
                            </div>
                            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                                {(() => {
                                    const recent = JSON.parse(localStorage.getItem('recentProjects') || '[]');
                                    if (recent.length === 0) {
                                        return (
                                            <div className="rounded-xl border border-white/5 bg-[#121212] p-8 text-center text-gray-500 flex flex-col items-center justify-center gap-3 col-span-full">
                                                <FolderOpen className="h-12 w-12 text-gray-700" />
                                                <p>Henüz bir proje yok.</p>
                                                <button onClick={handleNewProject} className="text-sm text-purple-400 hover:text-purple-300">
                                                    İlk projeni oluştur
                                                </button>
                                            </div>
                                        );
                                    }
                                    return recent.map((project: RecentProject, i: number) => (
                                        <button
                                            key={i}
                                            onClick={() => {
                                                // Since we can't auto-load by path in web without user interaction or IPC,
                                                // we might need to prompt user or use IPC if available.
                                                // For now, let's just show the info.
                                                // Ideally: window.electron.openFile(project.path)
                                                alert("Lütfen 'Projeyi Aç' butonunu kullanarak dosyayı seçin: " + project.path);
                                            }}
                                            className="group relative flex flex-col items-start gap-3 rounded-xl border border-white/5 bg-[#121212] p-4 text-left transition-all hover:border-purple-500/30 hover:bg-[#1a1a1a]"
                                        >
                                            <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-purple-500/10 text-purple-400 group-hover:bg-purple-500/20 group-hover:text-purple-300">
                                                <Video size={20} />
                                            </div>
                                            <div>
                                                <h3 className="font-medium text-white group-hover:text-purple-400 transition-colors">{project.name}</h3>
                                                <p className="text-xs text-gray-500">{new Date(project.lastModified).toLocaleDateString()}</p>
                                            </div>
                                        </button>
                                    ));
                                })()}
                            </div>
                        </section>
                    </div>
                )}

                {activeTab === 'templates' && (
                    <div className="animate-in fade-in slide-in-from-bottom-4 duration-500">
                        <h2 className="text-3xl font-bold mb-8">Şablonlar</h2>
                        <div className="grid grid-cols-2 gap-6 md:grid-cols-3 lg:grid-cols-4">
                            <TemplateCard title="YouTube Video" ratio="16:9" width={1920} height={1080} icon={<Youtube className="h-8 w-8 text-red-500" />} color="from-red-500/20 to-orange-500/20" border="group-hover:border-red-500/50" />
                            <TemplateCard title="TikTok / Reels" ratio="9:16" width={1080} height={1920} icon={<Music className="h-8 w-8 text-cyan-400" />} color="from-cyan-500/20 to-blue-500/20" border="group-hover:border-cyan-500/50" />
                            <TemplateCard title="Instagram Post" ratio="1:1" width={1080} height={1080} icon={<Instagram className="h-8 w-8 text-pink-500" />} color="from-purple-500/20 to-pink-500/20" border="group-hover:border-pink-500/50" />
                            <TemplateCard title="Sunum" ratio="16:9" width={1920} height={1080} icon={<LayoutTemplate className="h-8 w-8 text-emerald-500" />} color="from-emerald-500/20 to-teal-500/20" border="group-hover:border-emerald-500/50" />
                            <TemplateCard title="Oyun Videosu" ratio="16:9" width={1920} height={1080} icon={<Video className="h-8 w-8 text-violet-500" />} color="from-violet-500/20 to-purple-500/20" border="group-hover:border-violet-500/50" />
                        </div>
                    </div>
                )}

                {activeTab === 'projects' && (
                    <div className="animate-in fade-in slide-in-from-bottom-4 duration-500">
                        <h2 className="text-3xl font-bold mb-8">Projelerim</h2>
                        <div className="rounded-xl border border-white/5 bg-[#121212] overflow-hidden">
                            <div className="p-12 text-center text-gray-500 flex flex-col items-center justify-center gap-4">
                                <FolderOpen className="h-16 w-16 text-gray-700" />
                                <p className="text-lg">Kayıtlı proje bulunamadı.</p>
                            </div>
                        </div>
                    </div>
                )}

                {activeTab === 'settings' && (
                    <div className="animate-in fade-in slide-in-from-bottom-4 duration-500">
                        <h2 className="text-3xl font-bold mb-8">Ayarlar</h2>
                        <div className="max-w-2xl space-y-6">
                            <div className="rounded-xl border border-white/5 bg-[#121212] p-6">
                                <h3 className="text-lg font-semibold mb-4">Genel Ayarlar</h3>
                                <div className="space-y-4">
                                    <div className="flex items-center justify-between">
                                        <span className="text-gray-300">Dil</span>
                                        <select className="bg-black/20 border border-white/10 rounded px-3 py-1 text-sm text-gray-300 outline-none focus:border-purple-500">
                                            <option>Türkçe</option>
                                            <option>English</option>
                                        </select>
                                    </div>
                                    <div className="flex items-center justify-between">
                                        <span className="text-gray-300">Tema</span>
                                        <select className="bg-black/20 border border-white/10 rounded px-3 py-1 text-sm text-gray-300 outline-none focus:border-purple-500">
                                            <option>Koyu (Varsayılan)</option>
                                            <option>Açık</option>
                                        </select>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                )}
            </main>
        </div>
    );
};

const NavItem = ({ icon, label, active, onClick }: { icon: React.ReactNode, label: string, active?: boolean, onClick?: () => void }) => (
    <button
        onClick={onClick}
        className={`flex w-full items-center gap-3 rounded-xl px-4 py-3 text-sm font-medium transition-all duration-200 ${active
            ? 'bg-purple-600 text-white shadow-lg shadow-purple-900/20'
            : 'text-gray-400 hover:bg-white/5 hover:text-white'
            }`}
    >
        {React.isValidElement(icon) && React.cloneElement(icon, { size: 20 } as React.Attributes)}
        {label}
    </button>
);

const ActionCard = ({ title, description, icon, onClick, primary, badge, disabled }: { title: string, description: string, icon: React.ReactNode, onClick: () => void, primary?: boolean, badge?: string, disabled?: boolean }) => (
    <button
        onClick={onClick}
        disabled={disabled}
        className={`group relative flex flex-col items-start gap-4 rounded-2xl p-6 text-left transition-all duration-300 hover:scale-[1.02] ${primary
            ? 'bg-gradient-to-br from-purple-600 to-blue-600 text-white shadow-xl shadow-purple-900/30'
            : 'bg-[#121212] border border-white/5 text-white hover:border-purple-500/30 hover:bg-[#1a1a1a]'
            } ${disabled ? 'opacity-60 cursor-not-allowed hover:scale-100' : ''}`}
    >
        {badge && (
            <span className="absolute top-4 right-4 rounded-full bg-white/10 px-2 py-1 text-[10px] font-bold uppercase tracking-wider text-white backdrop-blur-sm">
                {badge}
            </span>
        )}
        <div className={`rounded-xl p-3 ${primary ? 'bg-white/20' : 'bg-white/5 group-hover:bg-purple-500/10 group-hover:text-purple-400'}`}>
            {icon}
        </div>
        <div>
            <h3 className="font-bold text-lg">{title}</h3>
            <p className={`mt-2 text-sm leading-relaxed ${primary ? 'text-white/80' : 'text-gray-400'}`}>{description}</p>
        </div>
    </button>
);

const TemplateCard = ({ title, ratio, icon, color, border, width, height }: TemplateCardProps) => {
    const navigate = useNavigate();
    const { setDimensions, resetProject } = useProjectStore();

    const handleSelect = () => {
        resetProject();
        setDimensions(width, height);
        navigate('/editor');
    };

    return (
        <button
            onClick={handleSelect}
            className={`group relative flex flex-col items-center justify-center gap-4 rounded-2xl border border-white/5 bg-[#121212] p-6 transition-all hover:-translate-y-1 hover:bg-[#1a1a1a] ${border}`}
        >
            <div className={`flex h-16 w-16 items-center justify-center rounded-2xl bg-gradient-to-br ${color} transition-transform group-hover:scale-110 shadow-lg`}>
                {icon}
            </div>
            <div className="text-center">
                <h3 className="font-medium text-white group-hover:text-purple-400 transition-colors">{title}</h3>
                <span className="mt-1 block text-xs font-medium text-gray-500 bg-white/5 px-2 py-0.5 rounded-full">{ratio}</span>
            </div>
        </button>
    );
};

export default StartupScreen;
