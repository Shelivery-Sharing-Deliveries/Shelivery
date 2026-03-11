import React from 'react';
import Image from 'next/image';

interface ProfileFormData {
  firstName: string;
  lastName: string;
  email: string;
}

interface GeneralTabProps {
  formData: ProfileFormData;
  profileImage: string | null;
  onInputChange: (field: keyof ProfileFormData, value: string) => void;
  onImageUpload: (event: React.ChangeEvent<HTMLInputElement>) => void;
  onSave: () => void;
}

export const GeneralTab: React.FC<GeneralTabProps> = ({
  formData,
  profileImage,
  onInputChange,
  onImageUpload,
  onSave,
}) => {
  return (
    <div className="flex flex-col items-center gap-8 w-full">
      {/* Profile Picture Upload */}
      <button
        className="relative w-[126px] h-[126px] rounded-[16px] bg-cover bg-center"
        style={{
          backgroundImage: profileImage
            ? `url(${profileImage})`
            : "url('/avatars/default-avatar.png')",
        }}
        onClick={() => document.getElementById("profile-upload")?.click()}
      >
        <input
          type="file"
          id="profile-upload"
          className="hidden"
          accept="image/*"
          onChange={onImageUpload}
        />
        <div className="absolute bottom-0 left-0 w-[126px] h-[31px] bg-[#FFE65B] rounded-b-[16px] flex items-center justify-center gap-1 px-4 py-2">
          <Image
            src="/icons/upload-icon.svg"
            alt="Upload"
            width={16}
            height={16}
          />
          <span className="text-black font-inter text-sm font-medium leading-5">
            Upload
          </span>
        </div>
      </button>

      {/* Form Fields */}
      <div className="flex flex-col gap-4 w-full">
        {/* First Name */}
        <div className="flex flex-col gap-1 w-full">
          <label className="text-[#111827] font-poppins text-sm font-medium leading-5">
            First Name
          </label>
          <div className="flex items-center gap-2 px-4 py-3 border border-[#E5E8EB] rounded-[18px] w-full">
            <input
              type="text"
              value={formData.firstName}
              onChange={(e) => onInputChange("firstName", e.target.value)}
              className="flex-1 text-[#111827] font-poppins text-sm leading-5 bg-transparent border-none outline-none"
            />
          </div>
        </div>

        {/* Last Name */}
        <div className="flex flex-col gap-1 w-full">
          <label className="text-[#111827] font-poppins text-sm font-medium leading-5">
            Last Name
          </label>
          <div className="flex items-center gap-2 px-4 py-3 border border-[#E5E8EB] rounded-[18px] w-full">
            <input
              type="text"
              value={formData.lastName}
              onChange={(e) => onInputChange("lastName", e.target.value)}
              className="flex-1 text-[#111827] font-poppins text-sm leading-5 bg-transparent border-none outline-none"
            />
          </div>
        </div>

        {/* Email (read-only) */}
        <div className="flex flex-col gap-1 w-full">
          <label className="text-[#111827] font-poppins text-sm font-medium leading-5">
            Email
          </label>
          <div className="flex items-center gap-2 px-4 py-3 border border-[#E5E8EB] rounded-[18px] bg-gray-100 w-full">
            <input
              type="text"
              value={formData.email}
              readOnly
              className="flex-1 text-[#6B7280] font-poppins text-sm leading-5 bg-transparent border-none outline-none"
            />
          </div>
        </div>
      </div>

      {/* Save Button */}
      <button
        onClick={onSave}
        className="flex items-center justify-center gap-2 py-3 px-0 w-full bg-[#FFE75B] rounded-[16px]"
      >
        <span className="text-black font-poppins text-lg font-semibold leading-[26px]">
          Save Changes
        </span>
      </button>
    </div>
  );
};