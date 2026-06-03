export interface StorageProvider {
  upload(file: Buffer, fileName: string, mimeType: string): Promise<string>;
}
