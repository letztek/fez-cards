/**
 * Asset path utility for handling development and production paths in Electron
 */

declare global {
  interface Window {
    electronAPI?: {
      isElectron: boolean;
      isDev: boolean;
      platform?: string;
    };
  }
}

/**
 * Get the correct asset path for both development and production environments
 * @param path Asset path relative to public directory
 * @returns Corrected asset path
 */
export function getAssetPath(path: string): string {
  // Remove leading slash if present
  const cleanPath = path.startsWith('/') ? path.slice(1) : path;
  
  // Check if we're in Electron production mode
  const isElectron = window.electronAPI?.isElectron ?? false;
  const isDev = window.electronAPI?.isDev ?? !isElectron;
  const platform = window.electronAPI?.platform ?? 'unknown';
  
  if (isElectron && !isDev) {
    // Production Electron build - resources are in different location
    // For Windows portable apps, use different path structure
    if (platform === 'win32') {
      return `./${cleanPath}`;
    } else {
      return `./${cleanPath}`;
    }
  } else {
    // Development mode or web browser
    return `/${cleanPath}`;
  }
}

/**
 * Preload audio files for better performance
 */
export function preloadAudio(src: string): Promise<HTMLAudioElement> {
  return new Promise((resolve, reject) => {
    const audio = new Audio();
    audio.oncanplaythrough = () => resolve(audio);
    audio.onerror = () => reject(new Error(`Failed to load audio: ${src}`));
    audio.src = getAssetPath(src);
    audio.load();
  });
}

/**
 * Check if an asset exists
 */
export async function assetExists(path: string): Promise<boolean> {
  try {
    const response = await fetch(getAssetPath(path), { method: 'HEAD' });
    return response.ok;
  } catch {
    return false;
  }
}