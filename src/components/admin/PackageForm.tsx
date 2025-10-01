"use client";

import React, { useState, useRef } from 'react';
import { X, GripVertical, Upload } from 'lucide-react';
import { PackageFormProps, PackageType } from '../../types/admin';

interface ValidationErrors {
  packageName?: string;
  dailySwipeLimit?: string;
  icon?: string;
  details?: string;
  price?: string;
}

const PackageForm: React.FC<PackageFormProps> = ({ isEdit, editingPackage, onSubmit, onDelete }) => {
  const [details, setDetails] = useState<string[]>(
    isEdit && editingPackage ? editingPackage.details : ['']
  );
  const [packageName, setPackageName] = useState<string>(
    isEdit && editingPackage ? editingPackage.name : ''
  );
  const [dailySwipeLimit, setDailySwipeLimit] = useState<string>(
    isEdit && editingPackage ? String(editingPackage.dailySwipeLimit) : ''
  );
  const [icon, setIcon] = useState<string>(
    isEdit && editingPackage ? editingPackage.icon : ''
  );
  const [iconFile, setIconFile] = useState<File | null>(null);
  const [isDragging, setIsDragging] = useState<boolean>(false);
  
  // Changed to store in baht (full number), convert to cents when submitting
  const [priceBaht, setPriceBaht] = useState<string>(
    isEdit && editingPackage ? String(editingPackage.price_cents / 100) : ''
  );
  
  const [validationErrors, setValidationErrors] = useState<ValidationErrors>({});
  const [showValidation, setShowValidation] = useState<boolean>(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const validateForm = (): boolean => {
    const errors: ValidationErrors = {};

    if (!packageName.trim()) {
      errors.packageName = 'Package name is required';
    }

    if (!dailySwipeLimit.trim()) {
      errors.dailySwipeLimit = 'Daily swipe limit is required';
    } else if (isNaN(Number(dailySwipeLimit)) || Number(dailySwipeLimit) <= 0) {
      errors.dailySwipeLimit = 'Daily swipe limit must be a valid positive number';
    }

    if (!icon && !iconFile) {
      errors.icon = 'Icon is required';
    }

    if (!details[0] || !details[0].trim()) {
      errors.details = 'At least one detail is required';
    }

    if (!priceBaht.trim()) {
      errors.price = 'Price is required';
    } else if (isNaN(Number(priceBaht)) || Number(priceBaht) < 0) {
      errors.price = 'Price must be a valid number';
    }

    setValidationErrors(errors);
    return Object.keys(errors).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setShowValidation(true);
    
    if (validateForm()) {
      // Convert baht to cents for storage
      const priceCents = Math.round(Number(priceBaht) * 100);
      
      await onSubmit({
        name: packageName,
        dailySwipeLimit: Number(dailySwipeLimit),
        icon: icon,
        iconFile: iconFile,
        details: details.filter(d => d.trim()),
        price_cents: priceCents
      });
    }
  };

  const addDetail = () => {
    setDetails([...details, '']);
  };

  const removeDetail = (index: number) => {
    if (details.length > 1) {
      const newDetails = details.filter((_, i) => i !== index);
      setDetails(newDetails);
      
      if (index === 0 && showValidation) {
        setTimeout(() => validateForm(), 0);
      }
    }
  };

  const updateDetail = (index: number, value: string) => {
    const newDetails = [...details];
    newDetails[index] = value;
    setDetails(newDetails);
    
    if (index === 0 && showValidation) {
      setTimeout(() => validateForm(), 0);
    }
  };

  const handleFileSelect = (file: File) => {
    if (file && file.type.startsWith('image/')) {
      setIconFile(file);
      const reader = new FileReader();
      reader.onload = (e) => {
        setIcon(e.target?.result as string);
      };
      reader.readAsDataURL(file);
      
      if (showValidation) {
        setTimeout(() => validateForm(), 0);
      }
    }
  };

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(true);
  };

  const handleDragLeave = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
    
    const file = e.dataTransfer.files[0];
    if (file) {
      handleFileSelect(file);
    }
  };

  const handleFileInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      handleFileSelect(file);
    }
  };

  const removeIcon = () => {
    setIcon('');
    setIconFile(null);
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  const formatPrice = (baht: string): string => {
    if (!baht) return '฿0.00';
    const amount = Number(baht);
    return `฿${amount.toFixed(2)}`;
  };

  return (
    <form onSubmit={handleSubmit} id="package-form" className="w-full">
      <div className="bg-white rounded-lg shadow p-8 space-y-8 w-full">
        <div className="grid grid-cols-2 gap-8">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Package name <span className="text-red-500">*</span>
            </label>
            <input
              type="text"
              value={packageName}
              onChange={(e) => {
                setPackageName(e.target.value);
                if (showValidation) setTimeout(() => validateForm(), 0);
              }}
              placeholder="Enter package name"
              className={`w-full px-4 py-3 border rounded-md focus:ring-pink-500 focus:border-pink-500 text-sm ${
                showValidation && validationErrors.packageName
                  ? 'border-red-500 bg-red-50'
                  : 'border-gray-300'
              }`}
            />
            {showValidation && validationErrors.packageName && (
              <p className="mt-1 text-sm text-red-600">{validationErrors.packageName}</p>
            )}
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Daily swipe limit <span className="text-red-500">*</span>
            </label>
            <input
              type="number"
              value={dailySwipeLimit}
              onChange={(e) => {
                setDailySwipeLimit(e.target.value);
                if (showValidation) setTimeout(() => validateForm(), 0);
              }}
              placeholder="Enter daily swipe limit"
              className={`w-full px-4 py-3 border rounded-md focus:ring-pink-500 focus:border-pink-500 text-sm ${
                showValidation && validationErrors.dailySwipeLimit
                  ? 'border-red-500 bg-red-50'
                  : 'border-gray-300'
              }`}
            />
            {showValidation && validationErrors.dailySwipeLimit && (
              <p className="mt-1 text-sm text-red-600">{validationErrors.dailySwipeLimit}</p>
            )}
          </div>
        </div>

        <div className="grid grid-cols-2 gap-8">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Price (฿) <span className="text-red-500">*</span>
            </label>
            <input
              type="number"
              step="0.01"
              value={priceBaht}
              onChange={(e) => {
                setPriceBaht(e.target.value);
                if (showValidation) setTimeout(() => validateForm(), 0);
              }}
              placeholder="Enter price in baht (e.g., 159.00)"
              className={`w-full px-4 py-3 border rounded-md focus:ring-pink-500 focus:border-pink-500 text-sm ${
                showValidation && validationErrors.price
                  ? 'border-red-500 bg-red-50'
                  : 'border-gray-300'
              }`}
            />
            {priceBaht && (
              <p className="mt-1 text-sm text-gray-600">Display: {formatPrice(priceBaht)}</p>
            )}
            {showValidation && validationErrors.price && (
              <p className="mt-1 text-sm text-red-600">{validationErrors.price}</p>
            )}
          </div>
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-4">
            Icon <span className="text-red-500">*</span>
          </label>
          {icon ? (
            <div className="relative inline-block">
              <div className="w-32 h-32 bg-pink-50 rounded-lg flex items-center justify-center border border-pink-200 overflow-hidden">
                <img src={icon} alt="Package icon" className="w-full h-full object-contain" />
              </div>
              <button 
                type="button"
                onClick={removeIcon}
                className="absolute -top-2 -right-2 w-6 h-6 bg-red-500 rounded-full flex items-center justify-center text-white hover:bg-red-600"
              >
                <X className="w-3 h-3" />
              </button>
            </div>
          ) : (
            <div
              onDragOver={handleDragOver}
              onDragLeave={handleDragLeave}
              onDrop={handleDrop}
              onClick={() => fileInputRef.current?.click()}
              className={`flex flex-col items-center justify-center w-32 h-32 border-2 border-dashed rounded-lg cursor-pointer transition-colors ${
                isDragging
                  ? 'border-pink-500 bg-pink-50'
                  : showValidation && validationErrors.icon
                  ? 'border-red-500 bg-red-50'
                  : 'border-gray-300 bg-gray-50 hover:bg-gray-100'
              }`}
            >
              <Upload className={`w-8 h-8 mb-2 ${isDragging ? 'text-pink-500' : 'text-pink-400'}`} />
              <p className="text-xs font-medium text-pink-600">
                Upload icon
              </p>
              <input
                ref={fileInputRef}
                type="file"
                accept="image/*"
                onChange={handleFileInputChange}
                className="hidden"
              />
            </div>
          )}
          {showValidation && validationErrors.icon && (
            <p className="mt-2 text-sm text-red-600">{validationErrors.icon}</p>
          )}
        </div>

        <hr className="my-8 border-gray-200" />

        <div>
          <h3 className="text-lg font-medium text-gray-700 mb-4">Package Detail</h3>
          <div className="space-y-4">
            {details.map((detail, index) => (
              <div key={index}>
                <div className="flex items-start justify-between mb-2">
                  <label className="block text-sm font-medium text-gray-900">
                    Detail {index + 1} {index === 0 && <span className="text-red-500">*</span>}
                  </label>
                </div>
                <div className="flex items-center space-x-3">
                  <div className="text-gray-400 cursor-grab active:cursor-grabbing">
                    <GripVertical className="w-4 h-4" />
                  </div>
                  <input
                    type="text"
                    value={detail}
                    onChange={(e) => updateDetail(index, e.target.value)}
                    className={`flex-1 h-10 px-4 border rounded-md focus:ring-pink-500 focus:border-pink-500 text-sm ${
                      showValidation && index === 0 && validationErrors.details
                        ? 'border-red-500 bg-red-50'
                        : 'border-gray-300'
                    }`}
                    placeholder={`Enter detail ${index + 1}`}
                  />
                  {details.length > 1 && (
                    <button
                      type="button"
                      onClick={() => removeDetail(index)}
                      className="ml-2 px-2 py-1 text-xs text-gray-500 bg-gray-100 rounded hover:bg-gray-200"
                      style={{ minWidth: 48 }}
                    >
                      Delete
                    </button>
                  )}
                </div>
                {showValidation && index === 0 && validationErrors.details && (
                  <p className="mt-1 text-sm text-red-600">{validationErrors.details}</p>
                )}
              </div>
            ))}
            
            <button 
              type="button"
              onClick={addDetail}
              style={{
                borderRadius: '99px',
                fontFamily: 'Nunito, sans-serif',
                color: '#C70039',
                backgroundColor: '#FFE1EA',
                fontWeight: 700,
                fontSize: '16px',
                padding: '12px 24px',
                transition: 'background 0.2s',
                border: 'none',
                cursor: 'pointer',
                display: 'inline-flex',
                alignItems: 'center',
                gap: '8px',
              }}
            >
              + Add detail
            </button>
          </div>
        </div>

        {isEdit && (
          <div className="pt-6 border-t border-gray-200 flex justify-end">
            <button 
              type="button"
              onClick={onDelete}
              className="text-red-500 hover:text-red-700 text-sm font-medium"
            >
              Delete Package
            </button>
          </div>
        )}
      </div>
    </form>
  );
};

export default PackageForm;