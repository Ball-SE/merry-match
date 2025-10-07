export function validatePhotos(photos: string[], opts?: { min?: number; max?: number; allowBlob?: boolean }) {
    const errors: Record<string, string> = {};
    const min = opts?.min ?? 2;
    const max = opts?.max ?? 5;
    const allowBlob = opts?.allowBlob ?? true;
  
    if (!photos || photos.length < min) errors.photos = `Please upload at least ${min} photos`;
    if (photos && photos.length > max) errors.photos = `Maximum ${max} photos allowed`;
  
    if (photos && photos.length > 0) {
      for (let i = 0; i < photos.length; i++) {
        const photo = photos[i];
        if (!photo) continue;
        const isValidUrl =
          (allowBlob && photo.startsWith('blob:')) ||
          photo.startsWith('http://') ||
          photo.startsWith('https://');
        if (!isValidUrl) {
          errors.photos = 'Invalid photo URL detected';
          break;
        }
      }
    }
  
    return { isValid: Object.keys(errors).length === 0, errors };
  }