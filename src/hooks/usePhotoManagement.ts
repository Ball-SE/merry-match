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

      // ใส่รูปในตำแหน่งที่เลือกโดยตรง
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
    console.log('🗑️ Removing photo at index:', idx);
    
    // ตรวจสอบว่า index ถูกต้อง
    if (idx < 0 || idx >= photoFiles.length) {
      console.error('Invalid index for removePhoto:', idx);
      return;
    }

    // ลบ blob URL เพื่อป้องกัน memory leak
    if (photoPreviews[idx] && photoPreviews[idx].startsWith('blob:')) {
      URL.revokeObjectURL(photoPreviews[idx]);
    }

    // สร้าง array ใหม่โดยไม่รวมรูปที่ถูกลบ
    const filteredFiles = photoFiles.filter((_, i) => i !== idx);
    const filteredPreviews = photoPreviews.filter((_, i) => i !== idx);

    // สร้าง array ใหม่ที่มีขนาด 5 โดยเติม null/"" ในช่องว่างที่เหลือ
    const newPhotoFiles = Array(5).fill(null);
    const newPhotoPreviews = Array(5).fill("");

    // นำรูปภาพที่เหลือมาใส่ในตำแหน่งแรกๆ โดยไม่มีช่องว่าง
    filteredFiles.forEach((file, i) => {
      newPhotoFiles[i] = file;
    });
    filteredPreviews.forEach((preview, i) => {
      newPhotoPreviews[i] = preview;
    });

    setPhotoFiles(newPhotoFiles);
    setPhotoPreviews(newPhotoPreviews);
    updatePhotoItems(newPhotoFiles, newPhotoPreviews);

    return newPhotoPreviews.filter((preview) => preview !== "");
  };

  const handleReorder = (newOrder: PhotoItem[]) => {
    console.log('🔄 Reordering photos:', newOrder.map(item => ({ id: item.id, index: item.index })));
    
    // อัปเดต index ของ PhotoItem ตามลำดับใหม่
    const updatedOrder = newOrder.map((item, index) => ({
      ...item,
      index: index
    }));

    const newPhotoFiles = updatedOrder.map(item => item.file);
    const newPhotoPreviews = updatedOrder.map(item => item.preview);

    setPhotoFiles(newPhotoFiles);
    setPhotoPreviews(newPhotoPreviews);
    setPhotoItems(updatedOrder);

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
