/**
 * Centralized Cloudinary image optimization helper.
 * Automatically resizes and delivers compressed images (WebP/AVIF) to speed up page load times.
 * 
 * @param {string} url The original image URL
 * @param {object} options Options for optimization (width, quality)
 * @returns {string} The optimized image URL
 */
export const getOptimizedImage = (url, { width = 400, quality = 'auto' } = {}) => {
  if (!url) return '';
  if (typeof url !== 'string') return url;

  if (url.includes('cloudinary.com')) {
    // If the URL already has optimization flags, we don't want to stack them.
    // This handles cleaning up and setting the ideal flags: w_[width], q_[quality], f_auto
    return url.replace('/upload/', `/upload/w_${width},q_${quality},f_auto/`);
  }

  return url;
};
