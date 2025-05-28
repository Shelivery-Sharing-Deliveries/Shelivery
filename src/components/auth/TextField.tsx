"use client";

import { forwardRef } from "react";

interface TextFieldProps {
  label: string;
  placeholder: string;
  value: string;
  onChange: (value: string) => void;
  type?: "text" | "email" | "password";
  required?: boolean;
  className?: string;
}

const TextField = forwardRef<HTMLInputElement, TextFieldProps>(
  (
    {
      label,
      placeholder,
      value,
      onChange,
      type = "text",
      required = false,
      className = "",
    },
    ref
  ) => {
    return (
      <div className={`flex flex-col gap-1 ${className}`}>
        <label className="text-[#252B37] font-inter text-[12px] font-medium leading-[18px]">
          {label}
        </label>
        <div className="flex items-center px-4 py-3 border border-[#E9EAEB] rounded-[8px] gap-2">
          <input
            ref={ref}
            type={type}
            value={value}
            onChange={(e) => onChange(e.target.value)}
            placeholder={placeholder}
            required={required}
            className="flex-1 text-[#A4A7AE] font-inter text-[14px] font-normal leading-[20px] bg-transparent border-none outline-none placeholder:text-[#A4A7AE]"
          />
        </div>
      </div>
    );
  }
);

TextField.displayName = "TextField";

export default TextField;
