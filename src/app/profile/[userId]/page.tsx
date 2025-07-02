"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import Image from "next/image";
import { supabase } from "@/lib/supabase";
import { Tables } from "@/lib/supabase"; 

interface ProfileFormData {
  firstName: string;
  lastName: string;
  email: string;
  dormitory: string;
  favoriteStore: string;
}

export default function ProfileEditPage() {
  const router = useRouter();

const [formData, setFormData] = useState<ProfileFormData>({
  firstName: "",
  lastName: "",
  email: "",
  dormitory: "",
  favoriteStore: "",
});

  // State for profile image URL and user ID
  const [profileImage, setProfileImage] = useState<string | null>(null);
  const [userId, setUserId] = useState<string | null>(null);
  const [dormitories, setDormitories] = useState<string[]>([]);
  const [shops, setShops] = useState<string[]>([]);





useEffect(() => {
  const fetchOptions = async () => {
    // Fetch dormitories
    const { data: dormData, error: dormError } = await supabase
      .from("dormitory")
      .select("name");

    if (!dormError && dormData) {
      setDormitories(dormData.map((d) => d.name));
    }

    // Fetch shops
    const { data: shopData, error: shopError } = await supabase
      .from("shop")
      .select("name");

    if (!shopError && shopData) {
      setShops(shopData.map((s) => s.name));
    }
  };

  fetchOptions();
}, []);
  // Load user profile data when component mounts
  useEffect(() => {
  const loadProfile = async () => {
  const {
    data: { user },
  } = await supabase.auth.getUser();

  const currentUser = user ?? {
    id: "default-user-id",
    email: "default@example.com",
  };

setUserId(currentUser.id);
const { data, error } = await supabase
  .from("user")
  .select("first_name, last_name, email, favorite_store, dormitory(name), image")
  .eq("id", currentUser.id)
  .single();

if (error) {
  setFormData({
    firstName: "User_Firstname",
    lastName: "User_Lastname",
    favoriteStore: "defaultStore",
    dormitory: "TEST", // updated key
    email: "default@example.com",
  });
} else if (data) {
  setFormData({
    firstName: data.first_name || "User",
    lastName: data.last_name || "",
    favoriteStore: data.favorite_store || "defaultStore",
    dormitory: data.dormitory?.name  || "TEST", // updated key
    email: data.email || "default@example.com",
  });

  if (data.image) {
    setProfileImage(data.image);
  }
}

};
  loadProfile();
}, []);

  // Update form field values
  const handleInputChange = (field: keyof ProfileFormData, value: string) => {
    setFormData((prev) => ({
      ...prev,
      [field]: value,
    }));
  };

  const handleImageUpload = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file || !userId) return;
  
    const fileExt = file.name.split(".").pop();
    const filePath = `${userId}.${fileExt}`;
  
    // ✅ Step 1: Delete existing file if it exists
    await supabase.storage.from("avatars").remove([filePath]);
  
    // ✅ Step 2: Upload new file
    const { error: uploadError } = await supabase.storage
      .from("avatars")
      .upload(filePath, file);
  
    if (uploadError) {
      console.error("Upload Error:", uploadError);
      return;
    }
  
    // ✅ Step 3: Get public URL
    const { data: urlData } = supabase.storage.from("avatars").getPublicUrl(filePath);
    const publicUrl = urlData?.publicUrl;
  
    setProfileImage(publicUrl);
  
    // ✅ Step 4: Save URL to user table
    const { error: updateError } = await supabase
      .from("user")
      .update({ image: publicUrl })
      .eq("id", userId);
  
    if (updateError) {
      console.error("Failed to update image in user table:", updateError);
    }
  };
  
  

  // Save updated profile data to Supabase
  const handleSave = async () => {
  if (!userId) return;
  const { error } = await supabase
  .from("user")
  .update({
    first_name: formData.firstName,
    last_name: formData.lastName,
    favorite_store: formData.favoriteStore,
  })
  .eq("id", userId);
  if (!error) router.back();
};

  // Navigate back to previous page
  const handleBack = () => {
    router.back();
  };

  return (
    <div className="min-h-screen bg-white w-full max-w-[375px] mx-auto">
  <div className="w-[375px] h-[800px] bg-white rounded-t-[30px] flex flex-col">
    <div className="flex flex-col gap-6 w-[375px] flex-1">
      {/* Header */}
      <div className="flex flex-col gap-6 w-full">
        <div className="flex flex-col w-full h-[107px]">
          <div className="flex flex-col gap-2.5 px-4 w-full shadow-sm bg-white">
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

      {/* Main Content */}
      <div className="flex flex-col justify-between items-center flex-1 gap-8 px-4 pb-8">
        <div className="flex flex-col items-center gap-8 w-full">
          {/* Profile Picture Upload */}
            <button
            className="relative w-[126px] h-[126px] rounded-[16px] bg-cover bg-center"
            style={{
              backgroundImage: profileImage
              ? `url(${profileImage})`
              : "url('/images/default-avatar.svg')",
            }}
            onClick={() => document.getElementById("profile-upload")?.click()}
            >
            <input
              type="file"
              id="profile-upload"
              className="hidden"
              accept="image/*"
              onChange={handleImageUpload}
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
            <div className="flex flex-col gap-1 w-[343px]">
              <label className="text-[#111827] font-poppins text-sm font-medium leading-5">
                First Name
              </label>
              <div className="flex items-center gap-2 px-4 py-3 border border-[#E5E8EB] rounded-[18px] w-full">
                <input
                  type="text"
                  value={formData.firstName}
                  onChange={(e) => handleInputChange("firstName", e.target.value)}
                  className="flex-1 text-[#111827] font-poppins text-sm leading-5 bg-transparent border-none outline-none"
                />
              </div>
            </div>

            {/* Last Name */}
            <div className="flex flex-col gap-1 w-[343px]">
              <label className="text-[#111827] font-poppins text-sm font-medium leading-5">
                Last Name
              </label>
              <div className="flex items-center gap-2 px-4 py-3 border border-[#E5E8EB] rounded-[18px] w-full">
                <input
                  type="text"
                  value={formData.lastName}
                  onChange={(e) => handleInputChange("lastName", e.target.value)}
                  className="flex-1 text-[#111827] font-poppins text-sm leading-5 bg-transparent border-none outline-none"
                />
              </div>
            </div>
            {/* Email (read-only) */}
            <div className="flex flex-col gap-1 w-[343px]">
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
            {/* Dormitory (read-only) */}
            <div className="flex flex-col gap-1 w-[343px]">
              <label className="text-[#111827] font-poppins text-sm font-medium leading-5">
                Location
              </label>
              <div className="flex items-center gap-2 px-4 py-3 border border-[#E5E8EB] bg-gray-100 rounded-[18px] w-full">
                <input
                  type="text"
                  value={formData.dormitory}
                  readOnly
                  className="flex-1 text-[#6B7280] font-poppins text-sm leading-5 bg-transparent border-none outline-none"
                />
              </div>
            </div>

            {/* Favorite Store Dropdown */}
            <div className="flex flex-col gap-1 w-[343px]">
              <label className="text-[#111827] font-poppins text-sm font-medium leading-5">
                Favorite Store
              </label>
              <select
                value={formData.favoriteStore}
                onChange={(e) => handleInputChange("favoriteStore", e.target.value)}
                className="px-4 py-3 border border-[#E5E8EB] rounded-[18px] w-full text-[#111827] font-poppins text-sm"
              >
                <option value="" disabled>
                  Select a store
                </option>
                {shops.map((shopName) => (
                  <option key={shopName} value={shopName}>
                    {shopName}
                  </option>
                ))}
              </select>
            </div>
          </div>
        </div>

        {/* Save Button */}
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