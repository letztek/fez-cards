export class ImagePreloader {
  private cache = new Map<string, HTMLImageElement>();
  private loadingPromises = new Map<string, Promise<HTMLImageElement>>();

  async preloadImage(src: string): Promise<HTMLImageElement> {
    // 如果已經在快取中，直接返回
    if (this.cache.has(src)) {
      return this.cache.get(src)!;
    }

    // 如果正在載入中，返回現有的 Promise
    if (this.loadingPromises.has(src)) {
      return this.loadingPromises.get(src)!;
    }

    // 創建新的載入 Promise
    const loadingPromise = new Promise<HTMLImageElement>((resolve, reject) => {
      const img = new Image();
      
      img.onload = () => {
        this.cache.set(src, img);
        this.loadingPromises.delete(src);
        resolve(img);
      };
      
      img.onerror = () => {
        this.loadingPromises.delete(src);
        reject(new Error(`Failed to load image: ${src}`));
      };
      
      img.src = src;
    });

    this.loadingPromises.set(src, loadingPromise);
    return loadingPromise;
  }

  async preloadImages(sources: string[]): Promise<HTMLImageElement[]> {
    const promises = sources.map(src => this.preloadImage(src));
    return Promise.all(promises);
  }

  // 批量預載入，允許部分失敗
  async preloadImagesBatch(
    sources: string[], 
    onProgress?: (loaded: number, total: number) => void
  ): Promise<{ successful: HTMLImageElement[], failed: string[] }> {
    let loaded = 0;
    const successful: HTMLImageElement[] = [];
    const failed: string[] = [];

    const results = await Promise.allSettled(
      sources.map(async (src) => {
        try {
          const img = await this.preloadImage(src);
          loaded++;
          onProgress?.(loaded, sources.length);
          return { success: true, img, src };
        } catch (error) {
          loaded++;
          onProgress?.(loaded, sources.length);
          return { success: false, src, error };
        }
      })
    );

    results.forEach((result) => {
      if (result.status === 'fulfilled') {
        const { success, img, src } = result.value;
        if (success) {
          successful.push(img as HTMLImageElement);
        } else {
          failed.push(src);
        }
      } else {
        // Promise 本身被拒絕的情況（不太可能發生）
//         console.error('Unexpected promise rejection:', result.reason);
      }
    });

    return { successful, failed };
  }

  getFromCache(src: string): HTMLImageElement | undefined {
    return this.cache.get(src);
  }

  clearCache(): void {
    this.cache.clear();
    this.loadingPromises.clear();
  }

  getCacheSize(): number {
    return this.cache.size;
  }

  // 獲取記憶體使用估算（粗略）
  getMemoryUsageEstimate(): number {
    let totalBytes = 0;
    this.cache.forEach((img) => {
      // 估算：寬度 × 高度 × 4 bytes (RGBA)
      totalBytes += img.naturalWidth * img.naturalHeight * 4;
    });
    return totalBytes;
  }
}

// 全域實例
export const imagePreloader = new ImagePreloader();