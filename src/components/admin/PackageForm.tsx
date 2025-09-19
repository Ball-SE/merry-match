"use client";

import React, { useState } from 'react';
import { Plus, X, GripVertical, ChevronDown } from 'lucide-react';
import { PackageFormProps } from '../../types/admin';

interface ValidationErrors {
  packageName?: string;
  merryLimit?: string;
  icon?: string;
  details?: string;
}

const PackageForm: React.FC<PackageFormProps> = ({ isEdit, editingPackage, onSubmit, onDelete }) => {
  const [details, setDetails] = useState<string[]>(
    isEdit ? editingPackage?.details || [''] : ['']
  );
  const [packageName, setPackageName] = useState<string>(
    isEdit ? editingPackage?.name || '' : ''
  );
  const [merryLimit, setMerryLimit] = useState<string>(
    isEdit ? editingPackage?.merryLimit.replace(' Merry', '') || '' : ''
  );
  const [icon, setIcon] = useState<string>(
    isEdit ? editingPackage?.icon || '' : ''
  );
  const [validationErrors, setValidationErrors] = useState<ValidationErrors>({});
  const [showValidation, setShowValidation] = useState<boolean>(false);

  // Dropdown options
  const packageNameOptions = ['Basic', 'Platinum', 'Premium'];
  const merryLimitOptions = ['25', '45', '70'];

  // Icon mapping for package names
  const iconMapping: { [key: string]: string } = {
    'Basic': '❤️',
    'Platinum': '⭐',
    'Premium': '✨'
  };

  const validateForm = (): boolean => {
    const errors: ValidationErrors = {};

    // Validate package name
    if (!packageName.trim()) {
      errors.packageName = 'Package name is required';
    }

    // Validate merry limit
    if (!merryLimit.trim()) {
      errors.merryLimit = 'Merry limit is required';
    } else if (isNaN(Number(merryLimit)) || Number(merryLimit) <= 0) {
      errors.merryLimit = 'Merry limit must be a valid positive number';
    }

    // Validate icon (automatically set based on package name)
    if (!icon) {
      errors.icon = 'Icon is required';
    }

    // Validate first detail
    if (!details[0] || !details[0].trim()) {
      errors.details = 'At least one detail is required';
    }

    setValidationErrors(errors);
    return Object.keys(errors).length === 0;
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setShowValidation(true);
    
    if (validateForm()) {
      // Form is valid, call the onSubmit prop
      onSubmit({
        name: packageName,
        merryLimit: merryLimit,
        icon: icon,
        details: details.filter(d => d.trim())
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
      
      // Re-validate if first detail is being removed
      if (index === 0 && showValidation) {
        setTimeout(() => validateForm(), 0);
      }
    }
  };

  const updateDetail = (index: number, value: string) => {
    const newDetails = [...details];
    newDetails[index] = value;
    setDetails(newDetails);
    
    // Re-validate first detail if it's being updated
    if (index === 0 && showValidation) {
      setTimeout(() => validateForm(), 0);
    }
  };

  const handlePackageNameChange = (value: string) => {
    setPackageName(value);
    // Auto-set icon based on package name
    setIcon(iconMapping[value] || '');
    if (showValidation) {
      setTimeout(() => validateForm(), 0);
    }
  };

  const handleMerryLimitChange = (value: string) => {
    setMerryLimit(value);
    if (showValidation) {
      setTimeout(() => validateForm(), 0);
    }
  };

  return (
    <form onSubmit={handleSubmit} id="package-form" className="w-full">
      <div className="bg-white rounded-lg shadow p-8 space-y-8 w-full">
        <div className="grid grid-cols-2 gap-8">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Package name <span className="text-red-500">*</span>
            </label>
            <div className="relative">
              <select
                value={packageName}
                onChange={(e) => handlePackageNameChange(e.target.value)}
                className={`w-full px-4 py-3 border rounded-md focus:ring-pink-500 focus:border-pink-500 text-sm appearance-none ${
                  showValidation && validationErrors.packageName
                    ? 'border-red-500 bg-red-50'
                    : 'border-gray-300'
                }`}
              >
                <option value="">Select package name</option>
                {packageNameOptions.map((option) => (
                  <option key={option} value={option}>
                    {option}
                  </option>
                ))}
              </select>
              <ChevronDown className="w-4 h-4 absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 pointer-events-none" />
            </div>
            {showValidation && validationErrors.packageName && (
              <p className="mt-1 text-sm text-red-600">{validationErrors.packageName}</p>
            )}
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Merry limit <span className="text-red-500">*</span>
            </label>
            <div className="relative">
              <select
                value={merryLimit}
                onChange={(e) => handleMerryLimitChange(e.target.value)}
                className={`w-full px-4 py-3 border rounded-md focus:ring-pink-500 focus:border-pink-500 text-sm appearance-none ${
                  showValidation && validationErrors.merryLimit
                    ? 'border-red-500 bg-red-50'
                    : 'border-gray-300'
                }`}
              >
                <option value="">Select merry limit</option>
                {merryLimitOptions.map((option) => (
                  <option key={option} value={option}>
                    {option}
                  </option>
                ))}
              </select>
              <ChevronDown className="w-4 h-4 absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 pointer-events-none" />
            </div>
            {showValidation && validationErrors.merryLimit && (
              <p className="mt-1 text-sm text-red-600">{validationErrors.merryLimit}</p>
            )}
          </div>
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-4">
            Icon <span className="text-red-500">*</span>
          </label>
          {icon ? (
            <div className="relative inline-block">
              <div className="w-20 h-20 bg-pink-50 rounded-lg flex items-center justify-center border border-pink-200">
                <span className="text-3xl">
                  {icon}
                </span>
              </div>
              <button 
                type="button"
                onClick={() => setIcon('')}
                className="absolute -top-2 -right-2 w-6 h-6 bg-red-500 rounded-full flex items-center justify-center text-white hover:bg-red-600"
              >
                <X className="w-3 h-3" />
              </button>
            </div>
          ) : (
            <div className={`flex items-center justify-center w-28 h-28 border-2 border-dashed rounded-lg bg-gray-50 ${
              showValidation && validationErrors.icon
                ? 'border-red-500 bg-red-50'
                : 'border-gray-300'
            }`}>
              <div className="text-center">
                <Plus className="w-8 h-8 text-gray-400 mx-auto mb-2" />
                <p className="text-sm text-gray-400 font-medium">Auto-generated</p>
                <p className="text-xs text-gray-400">Select package name</p>
              </div>
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