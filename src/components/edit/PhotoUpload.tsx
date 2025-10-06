import React from 'react';
import { motion, AnimatePresence, Reorder } from 'framer-motion';

interface PhotoItem {
  id: string;
  file: File | null;
  preview: string;
  index: number;
}

interface PhotoUploadProps {
  photoItems: PhotoItem[];
  photoPreviews: string[];
  onFiles: (files: FileList | null, index: number) => void;
  removePhoto: (idx: number) => void;
  handleReorder: (newOrder: PhotoItem[]) => void;
  validationErrors: Record<string, string>;
  fieldErrors: Record<string, string>;
}

export default function PhotoUpload({
  photoItems,
  photoPreviews,
  onFiles,
  removePhoto,
  handleReorder,
  validationErrors,
  fieldErrors
}: PhotoUploadProps) {
  return (
    <div className="mb-8 md:mb-10">
      <h2 className="text-xl md:text-2xl font-bold text-gray-900 mb-3 md:mb-4">Profile pictures</h2>
      <p className="text-sm md:text-base text-gray-600 mb-4 md:mb-6">
        Upload at least 2 photos. Drag to reorder. Main photo will be the first one.
      </p>
      
      {(validationErrors.photos || fieldErrors.photos) && (
        <p className="text-sm text-red-600 mb-4">{validationErrors.photos || fieldErrors.photos}</p>
      )}
      
      <Reorder.Group
        axis="x"
        values={photoItems}
        onReorder={handleReorder}
        className="grid grid-cols-2 gap-4 md:grid-cols-3 lg:grid-cols-5"
      >
        <AnimatePresence>
          {photoItems.map((item, i) => {
            const hasFile = item.file !== null;
            const isMainPhoto = i === 0 && hasFile;

            return (
              <Reorder.Item
                key={item.id}
                value={item}
                as="div"
                className="relative"
                dragListener={hasFile}
                whileDrag={{
                  scale: 1.05,
                  rotate: 2,
                  zIndex: 1000,
                  boxShadow: "0 10px 25px rgba(0,0,0,0.3)",
                }}
                whileHover={hasFile ? { scale: 1.02 } : {}}
                transition={{
                  type: "spring",
                  damping: 25,
                  stiffness: 300,
                }}
              >
                <motion.div
                  className={`flex aspect-square items-center justify-center rounded-xl bg-gray-100 transition-all duration-200 ${
                    photoPreviews.filter((preview) => preview !== "").length < 2 && i < 2
                      ? "border-red-300"
                      : "border-gray-300"
                  }`}
                  initial={{ opacity: 0, scale: 0.8 }}
                  animate={{ opacity: 1, scale: 1 }}
                  exit={{ opacity: 0, scale: 0.8 }}
                  transition={{ duration: 0.2 }}
                  layout
                >
                  {item.preview ? (
                    <motion.div
                      className="relative h-full w-full"
                      initial={{ opacity: 0 }}
                      animate={{ opacity: 1 }}
                      transition={{ delay: 0.1 }}
                      layout
                    >
                      {/* eslint-disable-next-line @next/next/no-img-element */}
                      <img
                        src={item.preview}
                        alt={`photo-${i}`}
                        className="h-full w-full rounded-xl object-cover cursor-grab active:cursor-grabbing"
                        draggable={false}
                      />

                      {isMainPhoto && (
                        <motion.div
                          className="absolute top-2 left-2 bg-[#A62D82] text-white text-xs px-2 py-1 rounded"
                          initial={{ scale: 0 }}
                          animate={{ scale: 1 }}
                          transition={{ delay: 0.2, type: "spring" }}
                        >
                          Main
                        </motion.div>
                      )}

                      <motion.button
                        onClick={() => removePhoto(i)}
                        className="absolute -right-2 -top-2 flex h-6 w-6 items-center justify-center rounded-full bg-[#C70039] text-white hover:bg-[#950028]"
                        whileHover={{ scale: 1.1 }}
                        whileTap={{ scale: 0.9 }}
                        initial={{ scale: 0 }}
                        animate={{ scale: 1 }}
                        transition={{ delay: 0.3, type: "spring" }}
                      >
                        ×
                      </motion.button>
                    </motion.div>
                  ) : (
                    <motion.div
                      className="text-center flex flex-col"
                      initial={{ opacity: 0 }}
                      animate={{ opacity: 1 }}
                      whileHover={{ scale: 1.05 }}
                      layout
                    >
                      <div className="mx-auto mb-2 flex h-8 w-8 items-center text-4xl justify-center rounded-full text-[#A62D82]">
                        +
                      </div>
                      <span className="text-sm font-medium text-[#A62D82]">
                        {i === 0 ? "Main photo" : "Upload photo"}
                      </span>
                    </motion.div>
                  )}
                </motion.div>

                {!hasFile && (
                  <input
                    type="file"
                    accept="image/*"
                    className="absolute inset-0 h-full w-full cursor-pointer opacity-0"
                    onChange={(e) => onFiles(e.target.files, i)}
                  />
                )}
              </Reorder.Item>
            );
          })}
        </AnimatePresence>
      </Reorder.Group>

      <div className="mt-4 text-sm text-gray-500">
        {photoPreviews.filter((preview) => preview !== "").length}/5 photos ready
      </div>
    </div>
  );
}
