import React, { useState, useEffect } from 'react';

interface PhotoItem {
  id: string;
  file: File | null;
  preview: string;
  index: number;
}

export function usePhotoManagement() {
  const [photoFiles, setPhotoFiles] = useState<(File | null)[]>(Array(5).fill(null));
  const [photoPreviews, setPhotoPreviews] = useState<string[]>(Array(5).fill(""));
  const [photoItems, setPhotoItems] = useState<PhotoItem[]>(
    Array.from({ length: 5 }, (_, i) => ({
      id: `photo-${i}`,
      file: null,
      preview: "",
      index: i,
    }))
  );

  const compactPhotos = (files: (File | null)[], previews: string[]) => {
    const compactedFiles = Array(5).fill(null);
    const compactedPreviews = Array(5).fill("");
    let writeIndex = 0;

    for (let i = 0; i < files.length; i++) {
      if (files[i] !== null) {
        compactedFiles[writeIndex] = files[i];
        compactedPreviews[writeIndex] = previews[i];
        writeIndex++;
      }
    }

    return { compactedFiles, compactedPreviews };
  };

  const updatePhotoItems = (files: (File | null)[], previews: string[]) => {
    setPhotoItems(prev =>
      prev.map((item, index) => ({
        ...item,
        file: files[index],
        preview: previews[index],
      }))
    );
  };

  const onFiles = async (files: FileList | null, index: number) => {
    if (!files || files.length === 0) return;

    let file = files[0];

    if (file.size > 10 * 1024 * 1024) return;
    if (!file.type.startsWith("image/")) return;
    
    if (file.size > 1 * 1024 * 1024) {
      try {
        const { compressImageToTarget } = await import(
          "@/lib/image/browserImageProcessor"
        );
        file = await compressImageToTarget(file, 1 * 1024 * 1024);
      } catch {
        return;
      }
    }

    try {
      const previewUrl = URL.createObjectURL(file);
      const newPhotoFiles = [...photoFiles];
      const newPhotoPreviews = [...photoPreviews];

      newPhotoFiles[index] = file;
      newPhotoPreviews[index] = previewUrl;

      setPhotoFiles(newPhotoFiles);
      setPhotoPreviews(newPhotoPreviews);
      updatePhotoItems(newPhotoFiles, newPhotoPreviews);

      return newPhotoPreviews.filter((preview) => preview !== "");
    } catch {
      // Processing failed
    }
  };

  const removePhoto = async (idx: number) => {
    if (photoPreviews[idx] && photoPreviews[idx].startsWith('blob:')) {
      URL.revokeObjectURL(photoPreviews[idx]);
    }

    const newPhotoFiles = [...photoFiles];
    const newPhotoPreviews = [...photoPreviews];

    newPhotoFiles[idx] = null;
    newPhotoPreviews[idx] = "";

    setPhotoFiles(newPhotoFiles);
    setPhotoPreviews(newPhotoPreviews);
    updatePhotoItems(newPhotoFiles, newPhotoPreviews);

    return newPhotoPreviews.filter((preview) => preview !== "");
  };

  const handleReorder = (newOrder: PhotoItem[]) => {
    const newPhotoFiles = newOrder.map(item => item.file);
    const newPhotoPreviews = newOrder.map(item => item.preview);

    setPhotoFiles(newPhotoFiles);
    setPhotoPreviews(newPhotoPreviews);
    setPhotoItems(newOrder);

    return newPhotoPreviews.filter((preview) => preview !== "");
  };

  const loadExistingPhotos = React.useCallback((existingPhotos: string[]) => {
    const newPhotoPreviews = Array(5).fill("");
    const newPhotoFiles = Array(5).fill(null);
    
    existingPhotos.forEach((photoUrl: string, index: number) => {
      if (index < 5) {
        newPhotoPreviews[index] = photoUrl;
        newPhotoFiles[index] = null;
      }
    });

    setPhotoPreviews(newPhotoPreviews);
    setPhotoFiles(newPhotoFiles);
    updatePhotoItems(newPhotoFiles, newPhotoPreviews);
  }, []);

  useEffect(() => {
    const timer = setTimeout(() => {
      const hasEmptySlots = photoFiles.some((file, index) => {
        if (file === null) return false;
        for (let i = 0; i < index; i++) {
          if (photoFiles[i] === null) return true;
        }
        return false;
      });

      if (hasEmptySlots) {
        const { compactedFiles, compactedPreviews } = compactPhotos(photoFiles, photoPreviews);
        setPhotoFiles(compactedFiles);
        setPhotoPreviews(compactedPreviews);
        updatePhotoItems(compactedFiles, compactedPreviews);
      }
    }, 1500);

    return () => clearTimeout(timer);
  }, [photoFiles, photoPreviews]);

  return {
    photoFiles,
    photoPreviews,
    photoItems,
    onFiles,
    removePhoto,
    handleReorder,
    loadExistingPhotos
  };
}
