"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Image from "next/image";

interface ProfileFormData {
  fullName: string;
  favoriteStore: string;
  location: string;
}

export default function ProfileEditPage() {
  const router = useRouter();
  const [formData, setFormData] = useState<ProfileFormData>({
    fullName: "Muhammad Khajouei",
    favoriteStore: "Migros",
    location: "Woko - Zurich",
  });
  const [profileImage, setProfileImage] = useState<string | null>(null);

  const handleInputChange = (field: keyof ProfileFormData, value: string) => {
    setFormData((prev) => ({
      ...prev,
      [field]: value,
    }));
  };

  const handleImageUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = () => {
        setProfileImage(reader.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleSave = () => {
    // TODO: Implement save functionality
    console.log("Saving profile data:", formData);
    router.back();
  };

  const handleBack = () => {
    router.back();
  };

  return (
    <div className="min-h-screen bg-white w-full max-w-[375px] mx-auto">
      {/* Frame 299 - Main Container */}
      <div className="w-[375px] h-[800px] bg-white rounded-t-[30px] flex flex-col">
        {/* Frame 320 - Content Container */}
        <div className="flex flex-col gap-6 w-[375px] flex-1">
          {/* Frame 120 - Header Section */}
          <div className="flex flex-col gap-6 w-full">
            {/* Frame 102 - Header Container */}
            <div className="flex flex-col w-full h-[107px]">
              {/* Frame 32 - Header with shadow */}
              <div className="flex flex-col gap-2.5 px-4 w-full shadow-sm bg-white">
                {/* Frame 28 - Header Content */}
                <div className="flex items-center gap-2 py-4">
                  <button
                    onClick={handleBack}
                    className="w-6 h-6 flex items-center justify-center"
                  >
                    <Image
                      src="/icons/back-arrow.svg"
                      alt="Back"
                      width={24}
                      height={24}
                    />
                  </button>
                  <h1 className="text-black font-inter text-base font-bold leading-8 tracking-[-0.017em]">
                    Edit Profile
                  </h1>
                </div>
              </div>
            </div>
          </div>

          {/* Frame 319 - Main Content with exact Figma spacing */}
          <div className="flex flex-col justify-between items-center flex-1 gap-8 px-4 pb-8">
            {/* Frame 321 - Upload and Form Section */}
            <div className="flex flex-col items-center gap-8 w-full">
              {/* Frame 318 - Profile Picture Upload */}
              <div className="relative">
                <input
                  type="file"
                  id="profile-upload"
                  className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
                  accept="image/*"
                  onChange={handleImageUpload}
                />
                <div
                  className="w-[126px] h-[126px] rounded-[16px] bg-cover bg-center relative"
                  style={{
                    backgroundImage: profileImage
                      ? `url(${profileImage})`
                      : "url('data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iMTI2IiBoZWlnaHQ9IjEyNiIgdmlld0JveD0iMCAwIDEyNiAxMjYiIGZpbGw9Im5vbmUiIHhtbG5zPSJodHRwOi8vd3d3LnczLm9yZy8yMDAwL3N2ZyI+CjxyZWN0IHdpZHRoPSIxMjYiIGhlaWdodD0iMTI2IiByeD0iMTYiIGZpbGw9InVybCgjcGFpbnQwX2xpbmVhcl8xXzY3MjYpIi8+CjxkZWZzPgo8bGluZWFyR3JhZGllbnQgaWQ9InBhaW50MF9saW5lYXJfMV82NzI2IiB4MT0iNjMiIHkxPSIwIiB4Mj0iNjMiIHkyPSIxMjYiIGdyYWRpZW50VW5pdHM9InVzZXJTcGFjZU9uVXNlIj4KPHN0b3Agc3RvcC1jb2xvcj0iI0Y1RjVGNSIvPgo8c3RvcCBvZmZzZXQ9IjEiIHN0b3AtY29sb3I9IiNFMEUwRTAiLz4KPC9saW5lYXJHcmFkaWVudD4KPC9kZWZzPgo8L3N2Zz4K')",
                  }}
                >
                  {/* Frame 314 - Upload Overlay */}
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
                </div>
              </div>

              {/* Frame 315 - Form Fields with exact width */}
              <div className="flex flex-col gap-4 w-full">
                {/* Text Field 1 - Full Name */}
                <div className="flex flex-col gap-1 w-[343px]">
                  <label className="text-[#111827] font-poppins text-sm font-medium leading-5">
                    Full Name
                  </label>
                  <div className="flex items-center gap-2 px-4 py-3 border border-[#E5E8EB] rounded-[18px] w-full">
                    <input
                      type="text"
                      value={formData.fullName}
                      onChange={(e) =>
                        handleInputChange("fullName", e.target.value)
                      }
                      className="flex-1 text-[#111827] font-poppins text-sm font-normal leading-5 bg-transparent border-none outline-none"
                    />
                  </div>
                </div>

                {/* Text Field 2 - Favorite Store */}
                <div className="flex flex-col gap-1 w-[343px]">
                  <label className="text-[#111827] font-poppins text-sm font-medium leading-5">
                    Favorite Store
                  </label>
                  <div className="flex items-center gap-2 px-4 py-3 border border-[#E5E8EB] rounded-[18px] w-full">
                    <input
                      type="text"
                      value={formData.favoriteStore}
                      onChange={(e) =>
                        handleInputChange("favoriteStore", e.target.value)
                      }
                      className="flex-1 text-[#111827] font-poppins text-sm font-normal leading-5 bg-transparent border-none outline-none"
                    />
                  </div>
                </div>

                {/* Text Field 3 - Location */}
                <div className="flex flex-col gap-1 w-[343px]">
                  <label className="text-[#111827] font-poppins text-sm font-medium leading-5">
                    Location
                  </label>
                  <div className="flex items-center gap-2 px-4 py-3 border border-[#E5E8EB] rounded-[18px] w-full">
                    <input
                      type="text"
                      value={formData.location}
                      onChange={(e) =>
                        handleInputChange("location", e.target.value)
                      }
                      className="flex-1 text-[#111827] font-poppins text-sm font-normal leading-5 bg-transparent border-none outline-none"
                    />
                  </div>
                </div>
              </div>
            </div>

            {/* Save Button - exact Figma measurements */}
            <button
              onClick={handleSave}
              className="flex items-center justify-center gap-2 py-3 px-0 w-full bg-[#FFE75B] rounded-[16px]"
            >
              <span className="text-black font-poppins text-lg font-semibold leading-[26px]">
                Save
              </span>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
