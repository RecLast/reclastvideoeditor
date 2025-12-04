import { useCallback } from 'react';
import { useProjectStore } from '../store/useProjectStore';

export const useMediaImport = () => {
    const { addMedia } = useProjectStore();

    const importFiles = useCallback(async (files: File[]) => {
        files.forEach((file) => {
            const objectUrl = URL.createObjectURL(file);
            const type = file.type.startsWith('video') ? 'video' : file.type.startsWith('audio') ? 'audio' : 'image';

            if (type === 'video' || type === 'audio') {
                const media = document.createElement(type);
                media.preload = 'metadata';
                media.onloadedmetadata = () => {
                    addMedia({
                        id: crypto.randomUUID(),
                        file,
                        objectUrl,
                        duration: media.duration,
                        type: type as 'video' | 'audio'
                    });
                };
                media.src = objectUrl;
            } else {
                // Image
                addMedia({
                    id: crypto.randomUUID(),
                    file,
                    objectUrl,
                    duration: 5, // Default image duration
                    type: 'image'
                });
            }
        });
    }, [addMedia]);

    return { importFiles };
};
