import React from 'react';
import { Youtube, Music, Instagram, Monitor } from 'lucide-react';

export interface Template {
    id: string;
    title: string;
    ratio: string;
    width: number;
    height: number;
    fps: number;
    icon: React.ElementType;
    color: string;
    description?: string;
}

export const TEMPLATES: Template[] = [
    {
        id: 'youtube-hd',
        title: 'YouTube HD',
        ratio: '16:9',
        width: 1280,
        height: 720,
        fps: 30,
        icon: Youtube,
        color: 'from-red-500/20 to-orange-500/20',
        description: 'Standard HD video for YouTube'
    },
    {
        id: 'youtube-fhd',
        title: 'YouTube FHD',
        ratio: '16:9',
        width: 1920,
        height: 1080,
        fps: 60,
        icon: Youtube,
        color: 'from-red-600/20 to-red-900/20',
        description: 'Full HD video for YouTube'
    },
    {
        id: 'youtube-4k',
        title: 'YouTube 4K',
        ratio: '16:9',
        width: 3840,
        height: 2160,
        fps: 60,
        icon: Monitor,
        color: 'from-red-700/20 to-purple-900/20',
        description: 'Ultra HD 4K video'
    },
    {
        id: 'tiktok',
        title: 'TikTok',
        ratio: '9:16',
        width: 1080,
        height: 1920,
        fps: 60,
        icon: Music,
        color: 'from-cyan-500/20 to-blue-500/20',
        description: 'Vertical video for TikTok'
    },
    {
        id: 'instagram-reel',
        title: 'Instagram Reel',
        ratio: '9:16',
        width: 1080,
        height: 1920,
        fps: 60,
        icon: Instagram,
        color: 'from-purple-500/20 to-pink-500/20',
        description: 'Vertical video for Reels'
    },
    {
        id: 'instagram-post',
        title: 'Instagram Post',
        ratio: '1:1',
        width: 1080,
        height: 1080,
        fps: 30,
        icon: Instagram,
        color: 'from-pink-500/20 to-purple-500/20',
        description: 'Square video for Posts'
    }
];
