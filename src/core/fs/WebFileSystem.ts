import { IFileSystem } from './IFileSystem';

export class WebFileSystem implements IFileSystem {
    async readFile(path: string): Promise<Uint8Array> {
        console.warn("WebFileSystem: readFile is limited in browser environment without File System Access API handle.", path);
        throw new Error(`Method not implemented for direct path access in Web: ${path}`);
    }

    async writeFile(path: string, content: Uint8Array | string): Promise<void> {
        console.warn("WebFileSystem: writeFile not fully supported without handle.", path, content);
    }

    async readDir(path: string): Promise<string[]> {
        console.warn("WebFileSystem: readDir not implemented", path);
        return [];
    }

    async exists(path: string): Promise<boolean> {
        console.warn("WebFileSystem: exists not implemented", path);
        return false;
    }

    async pickFile(options?: { accept?: string[], multiple?: boolean }): Promise<File[]> {
        return new Promise((resolve) => {
            const input = document.createElement('input');
            input.type = 'file';
            input.multiple = options?.multiple || false;
            input.accept = options?.accept?.join(',') || '*/*';

            input.onchange = () => {
                if (input.files) {
                    resolve(Array.from(input.files));
                } else {
                    resolve([]);
                }
            };
            input.click();
        });
    }

    async saveFile(content: Uint8Array | string, filename: string): Promise<void> {
        const blob = new Blob([content]);
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = filename;
        a.click();
        URL.revokeObjectURL(url);
    }
}
