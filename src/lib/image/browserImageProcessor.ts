export async function compressImageToTarget(
    file: File, 
    targetBytes = 1 * 1024 * 1024
  ): Promise<File> {
    return new Promise((resolve, reject) => {
      const img = new Image();
      img.onload = async () => {
        const canvas = document.createElement('canvas');
        const ctx = canvas.getContext('2d');
        if (!ctx) {
          reject(new Error('Canvas not supported'));
          return;
        }
  
        // คำนวณอัตราส่วนเดิม
        const originalRatio = img.width / img.height;
        
        // ลองหลายขนาดและคุณภาพ
        const maxSizes = [1200, 1000, 800, 600, 400];
        const qualities = [0.9, 0.8, 0.7, 0.6, 0.5];
  
        for (const maxSize of maxSizes) {
          for (const quality of qualities) {
            // คำนวณขนาดใหม่โดยรักษาอัตราส่วน
            let newWidth, newHeight;
            
            if (originalRatio > 1) {
              // รูปแนวนอน (กว้าง > สูง)
              newWidth = maxSize;
              newHeight = maxSize / originalRatio;
            } else {
              // รูปแนวตั้ง (สูง > กว้าง) หรือสี่เหลี่ยมจัตุรัส
              newHeight = maxSize;
              newWidth = maxSize * originalRatio;
            }
  
            canvas.width = newWidth;
            canvas.height = newHeight;
            
            ctx.drawImage(img, 0, 0, newWidth, newHeight);
            
            const blob = await new Promise<Blob>((resolve) => {
              canvas.toBlob((b) => resolve(b as Blob), 'image/jpeg', quality);
            });
  
            if (blob.size <= targetBytes) {
              const compressedFile = new File([blob], file.name.replace(/\.[^/.]+$/, '.jpg'), {
                type: 'image/jpeg'
              });
              resolve(compressedFile);
              return;
            }
          }
        }
  
        // ถ้ายังไม่ได้ ให้ส่งเวอร์ชันที่เล็กที่สุด
        let finalWidth, finalHeight;
        if (originalRatio > 1) {
          finalWidth = 400;
          finalHeight = 400 / originalRatio;
        } else {
          finalHeight = 400;
          finalWidth = 400 * originalRatio;
        }
  
        canvas.width = finalWidth;
        canvas.height = finalHeight;
        ctx.drawImage(img, 0, 0, finalWidth, finalHeight);
        
        canvas.toBlob((blob) => {
          if (blob) {
            const compressedFile = new File([blob], file.name.replace(/\.[^/.]+$/, '.jpg'), {
              type: 'image/jpeg'
            });
            resolve(compressedFile);
          } else {
            reject(new Error('Compression failed'));
          }
        }, 'image/jpeg', 0.5);
      };
  
      img.onerror = () => reject(new Error('Image load failed'));
      img.src = URL.createObjectURL(file);
    });
  }