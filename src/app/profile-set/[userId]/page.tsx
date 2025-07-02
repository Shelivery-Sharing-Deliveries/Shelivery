// pages/profile-set/[userId].tsx or app/profile-set/[userId]/page.tsx
"use client";

import { useEffect, useState } from "react";
import { useRouter, useParams } from "next/navigation";
import Image from "next/image";
import { supabase } from "@/lib/supabase";
import { useAuth } from "@/hooks/useAuth"; // Assuming useAuth hook is available
// import { Tables } from "@/lib/supabase"; // Not directly used in this component, assuming types are handled

// Assuming AuthLayout is in components/auth/AuthLayout.tsx
import AuthLayout from "@/components/auth/AuthLayout";

interface ProfileFormData {
  firstName: string;
  lastName: string;
  email: string;
  dormitoryId: string | null;
  // MODIFIED: favoriteStore now holds the name (string | null)
  favoriteStore: string | null;
}

interface Dormitory {
  id: string;
  name: string;
}

interface Shop {
  id: string;
  name: string;
}

export default function ProfileSetupPage() {
  const router = useRouter();
  const params = useParams();
  const { user, loading: authLoading } = useAuth();

  const [formData, setFormData] = useState<ProfileFormData>({
    firstName: "",
    lastName: "",
    email: "",
    dormitoryId: null,
    favoriteStore: null, // Initialized with null for name
  });

  const [profileImage, setProfileImage] = useState<string | null>(null);
  const [userId, setUserId] = useState<string | null>(null);

  const [dormitories, setDormitories] = useState<Dormitory[]>([]);
  const [shops, setShops] = useState<Shop[]>([]);

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [initialDataLoaded, setInitialDataLoaded] = useState(false);

  const currentUrlUserId = params?.userId as string;

  useEffect(() => {
    if (!authLoading && !user) {
      router.push("/login");
    } else if (!authLoading && user && currentUrlUserId && user.id !== currentUrlUserId) {
      router.push(`/profile-set/${user.id}`);
    } else if (!authLoading && user) {
      setUserId(user.id);
    }
  }, [user, authLoading, currentUrlUserId, router]);

  useEffect(() => {
    const fetchOptions = async () => {
      setError(null);
      try {
        const { data: dormData, error: dormError } = await supabase
          .from("dormitory")
          .select("id, name")
          .order("name", { ascending: true });

        if (dormError) {
          console.error("Error fetching dormitories:", dormError);
          setError("Failed to load dormitories.");
        } else if (dormData) {
          setDormitories(dormData);
        }

        const { data: shopData, error: shopError } = await supabase
          .from("shop")
          .select("id, name")
          .order("name", { ascending: true });

        if (shopError) {
          console.error("Error fetching shops:", shopError);
          setError((prev) => prev ? prev + " Failed to load shops." : "Failed to load shops.");
        } else if (shopData) {
          setShops(shopData);
        }
      } catch (err: any) {
        console.error("Unexpected error fetching options:", err);
        setError(err.message || "An unexpected error occurred while loading options.");
      }
    };

    fetchOptions();
  }, []);

  useEffect(() => {
    const loadProfile = async () => {
      if (user && user.id && !initialDataLoaded) {
        setLoading(true);
        setError(null);
        try {
          // MODIFIED: Select favorite_store directly (assuming it stores the name)
          const { data, error: fetchError } = await supabase
            .from("user")
            .select("first_name, last_name, email, favorite_store, dormitory_id, image")
            .eq("id", user.id)
            .single();

          if (fetchError && fetchError.code !== 'PGRST116') {
            console.error("Error fetching user profile:", fetchError);
            setError("Failed to load user profile data.");
            setFormData((prev) => ({
              ...prev,
              firstName: prev.firstName || "User",
              lastName: prev.lastName || "",
              email: user.email || "",
            }));
          } else if (data) {
            setFormData({
              firstName: data.first_name || "",
              lastName: data.last_name || "",
              email: data.email || user.email || "",
              dormitoryId: data.dormitory_id || null,
              favoriteStore: data.favorite_store || null, // MODIFIED: Set favoriteStore name
            });

            if (data.image) {
              setProfileImage(data.image);
            }
          } else {
            setFormData((prev) => ({
              ...prev,
              email: user.email || "",
            }));
          }
          setInitialDataLoaded(true);
        } catch (err: any) {
          console.error("Unexpected error during profile load:", err);
          setError(err.message || "An unexpected error occurred while loading profile.");
        } finally {
          setLoading(false);
        }
      }
    };
    
    loadProfile();
  }, [user, initialDataLoaded]);

  // MODIFIED: handleInputChange can now take 'favoriteStore' field
  const handleInputChange = (field: keyof ProfileFormData, value: string | null) => {
    setFormData((prev) => ({
      ...prev,
      [field]: value,
    }));
  };

  const handleImageUpload = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file && userId) {
      setLoading(true);
      setError(null);
      try {
        const fileExt = file.name.split(".").pop();
        const filePath = `avatars/${userId}.${fileExt}`;

        const { error: uploadError } = await supabase.storage
          .from("avatars")
          .upload(filePath, file, { upsert: true });

        if (uploadError) {
          throw uploadError;
        }

        const { data } = supabase.storage.from("avatars").getPublicUrl(filePath);
        if (data?.publicUrl) {
          setProfileImage(data.publicUrl);
          await supabase.from("user").update({ image: data.publicUrl }).eq("id", userId);
        }
      } catch (err: any) {
        console.error("Error uploading image:", err);
        setError(err.message || "Failed to upload image.");
      } finally {
        setLoading(false);
      }
    }
  };

  const handleSave = async () => {
    if (!userId) {
      setError("User not authenticated.");
      return;
    }
    if (!formData.firstName || !formData.lastName) {
      setError("First Name and Last Name are required.");
      return;
    }
    if (!formData.dormitoryId) {
      setError("Please select your Dormitory.");
      return;
    }
    // MODIFIED: Validation for favoriteStore (name)
    if (!formData.favoriteStore) {
      setError("Please select your Favorite Store.");
      return;
    }

    setLoading(true);
    setError(null);

    try {
      const { error: updateError } = await supabase
        .from("user")
        .upsert(
          {
            id: userId,
            first_name: formData.firstName,
            last_name: formData.lastName,
            dormitory_id: formData.dormitoryId,
            favorite_store: formData.favoriteStore, // MODIFIED: Save the name
            email: formData.email,
            image: profileImage,
          },
          { onConflict: 'id' }
        );

      if (updateError) {
        throw updateError;
      }

      router.push("/dashboard");
    } catch (err: any) {
      console.error("Error saving profile:", err);
      setError(err.message || "Failed to save profile. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  if (authLoading || loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-white">
        <div className="text-center">
          <div className="w-8 h-8 border-4 border-[#FFDB0D] border-t-transparent rounded-full animate-spin mx-auto mb-4" />
          <p className="text-[#A4A7AE]">Loading profile data...</p>
        </div>
      </div>
    );
  }

  if (!user) {
    return null;
  }

  return (
    <AuthLayout className="gap-8">
      <div className="w-full flex flex-col gap-6 flex-1">
        <div className="flex flex-col gap-6 w-full">
          <div className="flex flex-col w-full h-[107px]">
            <div className="flex flex-col gap-2.5 px-4 w-full shadow-sm bg-white">
              <div className="flex items-center gap-2 py-4">
                <h1 className="text-black font-inter text-base font-bold leading-8 tracking-[-0.017em]">
                  Edit Profile
                </h1>
              </div>
            </div>
          </div>
        </div>

        <div className="flex flex-col justify-between items-center flex-1 gap-8 px-4 pb-8">
          <div className="flex flex-col items-center gap-8 w-full">
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
                    : "url('/images/default-avatar.svg')",
                }}
              >
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

            <div className="flex flex-col gap-4 w-full">
              <div className="flex flex-col gap-1 w-full">
                <label htmlFor="firstName" className="text-[#111827] font-poppins text-sm font-medium leading-5">
                  First Name
                </label>
                <div className="flex items-center gap-2 px-4 py-3 border border-[#E5E8EB] rounded-[18px] w-full">
                  <input
                    type="text"
                    id="firstName"
                    value={formData.firstName}
                    onChange={(e) => handleInputChange("firstName", e.target.value)}
                    className="flex-1 text-[#111827] font-poppins text-sm leading-5 bg-transparent border-none outline-none"
                    required
                  />
                </div>
              </div>

              <div className="flex flex-col gap-1 w-full">
                <label htmlFor="lastName" className="text-[#111827] font-poppins text-sm font-medium leading-5">
                  Last Name
                </label>
                <div className="flex items-center gap-2 px-4 py-3 border border-[#E5E8EB] rounded-[18px] w-full">
                  <input
                    type="text"
                    id="lastName"
                    value={formData.lastName}
                    onChange={(e) => handleInputChange("lastName", e.target.value)}
                    className="flex-1 text-[#111827] font-poppins text-sm leading-5 bg-transparent border-none outline-none"
                    required
                  />
                </div>
              </div>

              <div className="flex flex-col gap-1 w-full">
                <label htmlFor="email" className="text-[#111827] font-poppins text-sm font-medium leading-5">
                  Email
                </label>
                <div className="flex items-center gap-2 px-4 py-3 border border-[#E5E8EB] rounded-[18px] bg-gray-100 w-full">
                  <input
                    type="text"
                    id="email"
                    value={formData.email}
                    readOnly
                    className="flex-1 text-[#6B7280] font-poppins text-sm leading-5 bg-transparent border-none outline-none"
                  />
                </div>
              </div>

              <div className="flex flex-col gap-1 w-full">
                <label htmlFor="dormitory" className="text-[#111827] font-poppins text-sm font-medium leading-5">
                  Select Your Dormitory
                </label>
                <select
                  id="dormitory"
                  value={formData.dormitoryId || ""}
                  onChange={(e) => handleInputChange("dormitoryId", e.target.value || null)}
                  className="px-4 py-3 border border-[#E5E8EB] rounded-[18px] w-full text-[#111827] font-poppins text-sm bg-white"
                >
                  <option value="">Select a dormitory</option>
                  {dormitories.map((dorm) => (
                    <option key={dorm.id} value={dorm.id}>
                      {dorm.name}
                    </option>
                  ))}
                </select>
              </div>

              <div className="flex flex-col gap-1 w-full">
                <label htmlFor="favoriteStore" className="text-[#111827] font-poppins text-sm font-medium leading-5">
                  Favorite Store
                </label>
                <select
                  id="favoriteStore"
                  value={formData.favoriteStore || ""} // MODIFIED: Use name for value
                  onChange={(e) => handleInputChange("favoriteStore", e.target.value || null)} // MODIFIED: Save name
                  className="px-4 py-3 border border-[#E5E8EB] rounded-[18px] w-full text-[#111827] font-poppins text-sm bg-white"
                >
                  <option value="">Select a store</option>
                  {shops.map((shop) => (
                    <option key={shop.id} value={shop.name}> {/* MODIFIED: Option value is shop.name */}
                      {shop.name}
                    </option>
                  ))}
                </select>
              </div>
            </div>
          </div>

          <button
            onClick={handleSave}
            className="flex items-center justify-center gap-2 py-3 px-0 w-full bg-[#FFE75B] rounded-[16px] disabled:opacity-50 disabled:cursor-not-allowed"
            disabled={loading}
          >
            <span className="text-black font-poppins text-lg font-semibold leading-[26px]">
              {loading ? "Saving..." : "Save"}
            </span>
          </button>
        </div>
      </div>
    </AuthLayout>
  );
}
