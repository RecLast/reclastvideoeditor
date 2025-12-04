export interface IFileSystem {
    readFile(path: string): Promise<Uint8Array>;
    writeFile(path: string, content: Uint8Array | string): Promise<void>;
    readDir(path: string): Promise<string[]>;
    exists(path: string): Promise<boolean>;
    pickFile(options?: { accept?: string[], multiple?: boolean }): Promise<File[] | string[]>;
    saveFile(content: Uint8Array | string, filename: string): Promise<void>;
}
