export function validatePhotos(photos: string[], opts?: { min?: number; max?: number; allowBlob?: boolean }) {
    const errors: Record<string, string> = {};
    const min = opts?.min ?? 2;
    const max = opts?.max ?? 5;
    const allowBlob = opts?.allowBlob ?? true;
  
    if (!photos || photos.length < min) errors.photos = `Please upload at least ${min} photos`;
    if (photos && photos.length > max) errors.photos = `Maximum ${max} photos allowed`;
  
  
    return { isValid: Object.keys(errors).length === 0, errors };
  }