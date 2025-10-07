// import React from 'react';
// import DatePicker from 'react-datepicker';
// import 'react-datepicker/dist/react-datepicker.css';
// import { cn } from '@/lib/utils';

// interface CustomDatePickerProps {
//   selected?: Date | null;
//   onChange: (date: Date | null) => void;
//   onBlur?: () => void;
//   placeholder?: string;
//   className?: string;
//   dateFormat?: string;
//   minDate?: Date;
//   maxDate?: Date;
//   showYearDropdown?: boolean;
//   showMonthDropdown?: boolean;
//   dropdownMode?: 'scroll' | 'select';
//   yearDropdownItemNumber?: number;
//   disabled?: boolean;
//   name?: string;
//   id?: string;
//   autoComplete?: string;
//   error?: string;
//   touched?: boolean;
// }

// export function CustomDatePicker({
//   selected,
//   onChange,
//   onBlur,
//   placeholder = "Place Holder",
//   className,
//   dateFormat = "dd/MM/yyyy",
//   minDate,
//   maxDate,
//   showYearDropdown = true,
//   showMonthDropdown = true,
//   dropdownMode = 'select',
//   yearDropdownItemNumber = 100,
//   disabled = false,
//   name,
//   id,
//   autoComplete = 'off',
//   error,
//   touched,
//   ...props
// }: CustomDatePickerProps) {
//   return (
//     <div className="w-full">
//       <DatePicker
//         selected={selected}
//         onChange={onChange}
//         onBlur={onBlur}
//         placeholderText={placeholder}
//         className={cn(
//           "w-full rounded-lg border border-gray-300 px-3 py-3 pr-10 text-sm transition-colors focus:border-[#A62D82] focus:outline-none focus:ring-2 focus:ring-purple-500/20",
//           disabled && "cursor-not-allowed bg-gray-50 text-gray-500",
//           error && touched && "border-[#C70039] focus:border-[#C70039] focus:ring-red-500/20",
//           className
//         )}
//         dateFormat={dateFormat}
//         minDate={minDate}
//         maxDate={maxDate}
//         showYearDropdown={showYearDropdown}
//         showMonthDropdown={showMonthDropdown}
//         dropdownMode={dropdownMode}
//         yearDropdownItemNumber={yearDropdownItemNumber}
//         disabled={disabled}
//         name={name}
//         id={id}
//         autoComplete={autoComplete}
//         popperClassName="react-datepicker-popper"
//         calendarClassName="custom-datepicker"
//         showPopperArrow={false}
//         fixedHeight
//         inline={false}
//         withPortal={false}
//         shouldCloseOnSelect={true}
//         {...props}
//       />
//       {error && touched && (
//         <p className="mt-1 text-sm text-red-500">{error}</p>
//       )}
//     </div>
//   );
// }

import React, { useState, useEffect } from "react";
import { DateCalendar } from "@mui/x-date-pickers/DateCalendar";
import { LocalizationProvider } from "@mui/x-date-pickers/LocalizationProvider";
import { AdapterDayjs } from "@mui/x-date-pickers/AdapterDayjs";
import { Popover, Paper, TextField, Box } from "@mui/material";
import dayjs, { Dayjs } from "dayjs";
import { cn } from "@/lib/utils";

interface CustomDatePickerProps {
  selected?: Date | null;
  onChange: (date: Date | null) => void;
  onBlur?: () => void;
  placeholder?: string;
  className?: string;
  dateFormat?: string;
  minDate?: Date;
  maxDate?: Date;
  disabled?: boolean;
  name?: string;
  id?: string;
  error?: string;
  touched?: boolean;
}

export function CustomDatePicker({
  selected,
  onChange,
  onBlur,
  placeholder = "Select date",
  className,
  minDate,
  maxDate,
  disabled = false,
  name,
  id,
  error,
  touched,
  ...props
}: CustomDatePickerProps) {
  const [anchorEl, setAnchorEl] = useState<HTMLDivElement | null>(null);
  const [selectedDate, setSelectedDate] = useState<Dayjs | null>(
    selected ? dayjs(selected) : null
  );
  const [tempDate, setTempDate] = useState<Dayjs | null>(
    selected ? dayjs(selected) : null
  );

  // อัปเดต tempDate เมื่อ selected เปลี่ยน
  useEffect(() => {
    setTempDate(selected ? dayjs(selected) : null);
  }, [selected]);

  const handleClick = (event: React.MouseEvent<HTMLDivElement>) => {
    if (!disabled) {
      setAnchorEl(event.currentTarget);
    }
  };

  const handleClose = () => {
    setAnchorEl(null);
    onBlur?.();
  };

  const handleConfirmDate = () => {
    setSelectedDate(tempDate);
    const date = tempDate ? tempDate.toDate() : null;
    onChange(date);
    handleClose();
  };

  const handleCancelDate = () => {
    setTempDate(selectedDate); // รีเซ็ตกลับเป็นค่าเดิม
    handleClose();
  };

  const handleTempDateChange = (newValue: Dayjs | null) => {
    setTempDate(newValue);
  };

  const formatDisplayDate = (date: Date | null) => {
    if (!date) return "";
    return dayjs(date).format("DD/MM/YYYY");
  };

  const open = Boolean(anchorEl);

  return (
    <div className="w-full relative">
      <div
        onClick={handleClick}
        className={cn(
          "w-full rounded-lg border border-gray-300 px-3 py-3 pr-10 text-sm transition-colors focus:border-[#A62D82] focus:outline-none focus:ring-2 focus:ring-purple-500/20 cursor-pointer",
          disabled && "cursor-not-allowed bg-gray-50 text-gray-500",
          error &&
            touched &&
            "border-[#C70039] focus:border-[#C70039] focus:ring-red-500/20",
          !selectedDate && "text-gray-400",
          className
        )}
        id={id}
      >
        {selectedDate ? formatDisplayDate(selectedDate.toDate()) : placeholder}
      </div>

      {/* Date Icon */}
      <div className="absolute right-4 top-1/2 transform -translate-y-1/2 pointer-events-none">
        <img
          src="/assets/Date.svg"
          alt="Date"
          width="25"
          height="25"
          className="opacity-100"
        />
      </div>

      <Popover
        open={open}
        anchorEl={anchorEl}
        onClose={handleCancelDate} // เปลี่ยนเป็น handleCancelDate แทน
        anchorOrigin={{
          vertical: "bottom",
          horizontal: "right",
        }}
        transformOrigin={{
          vertical: "top",
          horizontal: "right",
        }}
        PaperProps={{
          sx: {
            borderRadius: "12px",
            boxShadow: "0 10px 25px rgba(0,0,0,0.1)",
            border: "1px solid #e5e7eb",
          },
        }}
      >
        <LocalizationProvider dateAdapter={AdapterDayjs}>
          <div className="p-2">
            <DateCalendar
              value={tempDate} // ใช้ tempDate แทน selectedDate
              onChange={handleTempDateChange} // ใช้ handleTempDateChange แทน
              minDate={minDate ? dayjs(minDate) : undefined}
              maxDate={maxDate ? dayjs(maxDate) : undefined}
              views={["year", "month", "day"]}
              sx={{
                "& .MuiPickersCalendarHeader-root": {
                  paddingLeft: "32px",
                  paddingRight: "16px",
                },
                // Style สำหรับ เดือน/ปี ด้านบน
                "& .MuiPickersCalendarHeader-label": {
                  fontSize: "18px",
                  fontWeight: "600",
                  fontFamily: "var(--font-nunito)",
                  color: "#2A0B21",
                },
                // Style สำหรับ Day of Week (จ. อ. พ. ฯลฯ)
                "& .MuiDayCalendar-weekDayLabel": {
                  fontSize: "16px",
                  fontWeight: "600",
                  fontFamily: "var(--font-nunito)",
                  color: "#933d6b",
                },
                "& .MuiDayCalendar-weekContainer": {
                  margin: "0",
                },
                "& .MuiPickersDay-root": {
                  fontSize: "18px",
                  fontWeight: "600",
                  fontFamily: "var(--font-nunito)",
                  borderRadius: "50%",
                  margin: "1.9px",
                  "&:hover": {
                    border:"1px solid #933d6b",
                    backgroundColor: "#F4EBF2",
                  },
                  "&.Mui-selected": {
                    backgroundColor: "#933d6b",
                    "&:hover": {
                      backgroundColor: "#933d6b",
                    },
                  },
                },
              }}
            />
            
            {/* ปุ่ม Confirm และ Cancel */}
            <div className="flex justify-end gap-2 mt-0 px-4 pb-2 font-nunito">
              <button
                onClick={handleCancelDate}
                className="px-4 py-2 text-sm font-medium text-gray-600 hover:text-gray-800 transition-colors"
              >
                Cancel
              </button>
              <button
                onClick={handleConfirmDate}
                className="px-4 py-2 text-sm font-medium bg-[#A62D82] text-white rounded-lg hover:bg-[#933d6b] transition-colors"
              >
                OK
              </button>
            </div>
          </div>
        </LocalizationProvider>
      </Popover>

      {error && touched && (
        <div className="absolute top-full left-0 mt-1">
          <p className="text-sm text-red-500">{error}</p>
        </div>
      )}
    </div>
  );
}
