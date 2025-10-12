/**
 * Image Preloader Utility
 * Preloads images to ensure they're cached by the browser
 */

const imageCache = new Map<string, HTMLImageElement>();
const preloadQueue = new Set<string>();

/**
 * Preload a single image and cache it
 */
export const preloadImage = (url: string): Promise<HTMLImageElement> => {
  // Check if already cached
  if (imageCache.has(url)) {
    return Promise.resolve(imageCache.get(url)!);
  }

  // Check if already in queue
  if (preloadQueue.has(url)) {
    return new Promise((resolve, reject) => {
      const checkCache = setInterval(() => {
        if (imageCache.has(url)) {
          clearInterval(checkCache);
          resolve(imageCache.get(url)!);
        }
      }, 50);

      // Timeout after 10 seconds
      setTimeout(() => {
        clearInterval(checkCache);
        reject(new Error(`Image preload timeout: ${url}`));
      }, 10000);
    });
  }

  preloadQueue.add(url);

  return new Promise((resolve, reject) => {
    const img = new Image();

    img.onload = () => {
      imageCache.set(url, img);
      preloadQueue.delete(url);
      resolve(img);
    };

    img.onerror = () => {
      preloadQueue.delete(url);
      reject(new Error(`Failed to load image: ${url}`));
    };

    // Don't set crossOrigin - we're just displaying images, not manipulating them
    // This allows images to load without CORS restrictions
    img.src = url;
  });
};

/**
 * Preload multiple images in parallel
 */
export const preloadImages = (urls: string[]): Promise<HTMLImageElement[]> => {
  return Promise.all(urls.map(preloadImage));
};

/**
 * Preload images with priority (one at a time in order)
 */
export const preloadImagesSequential = async (
  urls: string[]
): Promise<HTMLImageElement[]> => {
  const results: HTMLImageElement[] = [];

  for (const url of urls) {
    try {
      const img = await preloadImage(url);
      results.push(img);
    } catch (error) {
      console.warn(`Failed to preload image: ${url}`, error);
    }
  }

  return results;
};

/**
 * Check if an image is already cached
 */
export const isImageCached = (url: string): boolean => {
  return imageCache.has(url);
};

/**
 * Clear the image cache
 */
export const clearImageCache = (): void => {
  imageCache.clear();
};

/**
 * Get cache size
 */
export const getImageCacheSize = (): number => {
  return imageCache.size;
};

/**
 * Preload images from GameCard objects
 */
export const preloadCardImages = (
  cards: Array<{ imageUrl?: string }>
): Promise<void> => {
  const urls = cards
    .map((card) => card.imageUrl)
    .filter((url): url is string => !!url);

  return preloadImages(urls)
    .then(() => {
      // Only log in development mode to reduce console noise
      if (import.meta.env.DEV) {
        console.log(`Preloaded ${urls.length} card images`);
      }
    })
    .catch((error) => {
      console.warn("Error preloading card images:", error);
    });
};

/**
 * React Hook for preloading images
 */
export const useImagePreloader = () => {
  return {
    preloadImage,
    preloadImages,
    preloadImagesSequential,
    isImageCached,
    clearImageCache,
    getImageCacheSize,
    preloadCardImages,
  };
};
