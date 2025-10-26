export class ExternalBlob {
  private bytes: Uint8Array;
  private mimeType: string;
  private objectUrl?: string;

  private constructor(bytes: Uint8Array, mimeType: string) {
    this.bytes = new Uint8Array(bytes);
    this.mimeType = mimeType;
  }

  static fromBytes(bytes: Uint8Array, mimeType = 'image/png') {
    return new ExternalBlob(bytes, mimeType);
  }

  static fromDataUrl(dataUrl: string) {
    const [header, data] = dataUrl.split(',');
    const match = header.match(/data:(.*);base64/);
    const mimeType = match ? match[1] : 'image/png';
    const bytes =
      typeof window === 'undefined'
        ? typeof Buffer !== 'undefined'
          ? new Uint8Array(Buffer.from(data, 'base64'))
          : new Uint8Array()
        : Uint8Array.from(atob(data), (char) => char.charCodeAt(0));
    return new ExternalBlob(bytes, mimeType);
  }

  async getBytes(): Promise<Uint8Array> {
    return new Uint8Array(this.bytes);
  }

  getDirectURL(): string {
    if (this.objectUrl) {
      return this.objectUrl;
    }

    if (typeof window !== 'undefined') {
      const byteCopy = this.bytes.slice();
      const blob = new Blob([byteCopy.buffer], { type: this.mimeType });
      this.objectUrl = URL.createObjectURL(blob);
      return this.objectUrl;
    }

    const base64 =
      typeof Buffer !== 'undefined'
        ? Buffer.from(this.bytes).toString('base64')
        : typeof btoa !== 'undefined'
          ? btoa(String.fromCharCode(...Array.from(this.bytes)))
          : '';
    return `data:${this.mimeType};base64,${base64}`;
  }
}
