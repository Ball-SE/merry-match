import React from 'react';
import DatePicker from 'react-datepicker';
import 'react-datepicker/dist/react-datepicker.css';
import { cn } from '@/lib/utils';

interface CustomDatePickerProps {
  selected?: Date | null;
  onChange: (date: Date | null) => void;
  onBlur?: () => void;
  placeholder?: string;
  className?: string;
  dateFormat?: string;
  minDate?: Date;
  maxDate?: Date;
  showYearDropdown?: boolean;
  showMonthDropdown?: boolean;
  dropdownMode?: 'scroll' | 'select';
  yearDropdownItemNumber?: number;
  disabled?: boolean;
  name?: string;
  id?: string;
  autoComplete?: string;
  error?: string;
  touched?: boolean;
}

export function CustomDatePicker({
  selected,
  onChange,
  onBlur,
  placeholder = "Place Holder",
  className,
  dateFormat = "dd/MM/yyyy",
  minDate,
  maxDate,
  showYearDropdown = true,
  showMonthDropdown = true,
  dropdownMode = 'select',
  yearDropdownItemNumber = 100,
  disabled = false,
  name,
  id,
  autoComplete = 'off',
  error,
  touched,
  ...props
}: CustomDatePickerProps) {
  return (
    <div className="w-full">
      <DatePicker
        selected={selected}
        onChange={onChange}
        onBlur={onBlur}
        placeholderText={placeholder}
        className={cn(
          "w-full rounded-lg border border-gray-300 px-3 py-3 pr-10 text-sm transition-colors focus:border-[#A62D82] focus:outline-none focus:ring-2 focus:ring-purple-500/20",
          disabled && "cursor-not-allowed bg-gray-50 text-gray-500",
          error && touched && "border-[#C70039] focus:border-[#C70039] focus:ring-red-500/20",
          className
        )}
        dateFormat={dateFormat}
        minDate={minDate}
        maxDate={maxDate}
        showYearDropdown={showYearDropdown}
        showMonthDropdown={showMonthDropdown}
        dropdownMode={dropdownMode}
        yearDropdownItemNumber={yearDropdownItemNumber}
        disabled={disabled}
        name={name}
        id={id}
        autoComplete={autoComplete}
        popperClassName="react-datepicker-popper"
        calendarClassName="custom-datepicker"
        showPopperArrow={false}
        fixedHeight
        inline={false}
        withPortal={false}
        shouldCloseOnSelect={true}
        {...props}
      />
      {error && touched && (
        <p className="mt-1 text-sm text-red-500">{error}</p>
      )}
    </div>
  );
}