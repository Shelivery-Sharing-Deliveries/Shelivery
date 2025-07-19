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
    dormitoryId: string | null; // Changed to ID for saving
    favoriteStore: string | null; // Changed to name for saving
}

interface Dormitory {
    id: string;
    name: string;
}

interface Shop {
    id: string;
    name: string;
}

export default function ProfileSetupPage() { // Renamed to ProfileSetupPage
    const router = useRouter();
    const params = useParams();
    const { user, loading: authLoading } = useAuth(); // Use useAuth hook for user data

    const [formData, setFormData] = useState<ProfileFormData>({
        firstName: "",
        lastName: "",
        email: "",
        dormitoryId: null,
        favoriteStore: null,
    });

    const [profileImage, setProfileImage] = useState<string | null>(null);
    const [userId, setUserId] = useState<string | null>(null);

    const [dormitories, setDormitories] = useState<Dormitory[]>([]);
    const [shops, setShops] = useState<Shop[]>([]);

    const [loading, setLoading] = useState(false); // For form submission and initial data fetch
    const [error, setError] = useState<string | null>(null);
    const [initialDataLoaded, setInitialDataLoaded] = useState(false);

    const currentUrlUserId = params?.userId as string;

    // Effect to redirect if not authenticated or if user ID doesn't match
    useEffect(() => {
        if (!authLoading && !user) {
            router.push('/auth'); // Redirect to auth if not authenticated
        } else if (!authLoading && user && currentUrlUserId && user.id !== currentUrlUserId) {
            // If authenticated user ID doesn't match URL ID, redirect to their own profile-set
            router.push(`/profile-set/${user.id}`);
        } else if (!authLoading && user) {
            setUserId(user.id); // Set userId once authenticated user is available
        }
    }, [user, authLoading, currentUrlUserId, router]);

    // Effect to fetch dropdown options (dormitories and shops)
    useEffect(() => {
        const fetchOptions = async () => {
            setError(null);
            try {
                // Fetch dormitories (id and name)
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

                // Fetch shops (id and name)
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
    }, []); // Run once on mount

    // Effect to load user profile data when component mounts and user is available
    useEffect(() => {
        const loadProfile = async () => {
            if (user && user.id && !initialDataLoaded) {
                setLoading(true); // Start loading for profile data
                setError(null);
                try {
                    // Fetch dormitory_id and favorite_store (name)
                    const { data, error: fetchError } = await supabase
                        .from("user")
                        .select("first_name, last_name, email, favorite_store, dormitory_id, image")
                        .eq("id", user.id)
                        .single();

                    if (fetchError && fetchError.code !== 'PGRST116') { // PGRST116 is "No rows found"
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
                            dormitoryId: data.dormitory_id || null, // Set ID
                            favoriteStore: data.favorite_store || null, // Set Name
                        });

                        if (data.image) {
                            setProfileImage(data.image);
                        }
                    } else {
                        // If no data found (PGRST116), set initial email from auth user
                        setFormData((prev) => ({
                            ...prev,
                            email: user.email || "",
                        }));
                    }
                    setInitialDataLoaded(true); // Mark initial data as loaded
                } catch (err: any) {
                    console.error("Unexpected error during profile load:", err);
                    setError(err.message || "An unexpected error occurred while loading profile.");
                } finally {
                    setLoading(false); // End loading for profile data
                }
            }
        };

        loadProfile();
    }, [user, initialDataLoaded]);

    // Update form field values
    const handleInputChange = (field: keyof ProfileFormData, value: string | null) => {
        setFormData((prev) => ({
            ...prev,
            [field]: value,
        }));
    };

    // MODIFIED: handleImageUpload with friend's logic and improved error handling/loading
    const handleImageUpload = async (event: React.ChangeEvent<HTMLInputElement>) => {
        const file = event.target.files?.[0];
        if (!file || !userId) return;

        setLoading(true); // Start loading for image upload
        setError(null);

        try {
            const fileExt = file.name.split(".").pop();
            const filePath = `avatars/${userId}.${fileExt}`;

            // Step 1: Delete existing file if it exists
            // Supabase storage.remove doesn't throw if file doesn't exist, so this is safe.
            const { error: removeError } = await supabase.storage.from("avatars").remove([filePath]);
            if (removeError) {
                console.error("Error removing old avatar:", removeError);
                // Decide if you want to stop here or proceed with upload despite remove error
                // For now, we'll proceed as upload with upsert might handle it anyway.
            }

            // Step 2: Upload new file
            const { error: uploadError } = await supabase.storage
                .from("avatars")
                .upload(filePath, file);

            if (uploadError) {
                throw uploadError; // Throw to be caught by the outer try-catch
            }

            // Step 3: Get public URL
            const { data: urlData } = supabase.storage.from("avatars").getPublicUrl(filePath);
            const publicUrl = urlData?.publicUrl;

            if (!publicUrl) {
                throw new Error("Failed to get public URL for uploaded image.");
            }
            setProfileImage(publicUrl);

            // Step 4: Save URL to user table
            const { error: updateError } = await supabase
                .from("user")
                .update({ image: publicUrl })
                .eq("id", userId);

            if (updateError) {
                throw updateError; // Throw to be caught by the outer try-catch
            }
        } catch (err: any) {
            console.error("Error during image upload or update:", err);
            setError(err.message || "Failed to upload profile image.");
        } finally {
            setLoading(false); // End loading for image upload
        }
    };
    // END MODIFIED

    // Save updated profile data to Supabase
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
        if (!formData.favoriteStore) { // Validation for favoriteStore (name)
            setError("Please select your Favorite Store.");
            return;
        }

        setLoading(true); // Start loading for save operation
        setError(null);

        try {
            const { error: updateError } = await supabase
                .from("user")
                .upsert(
                    {
                        id: userId,
                        first_name: formData.firstName,
                        last_name: formData.lastName,
                        dormitory_id: formData.dormitoryId, // Save ID
                        favorite_store: formData.favoriteStore, // Save Name
                        email: formData.email,
                        image: profileImage,
                    },
                    { onConflict: 'id' }
                );

            if (updateError) {
                throw updateError;
            }

            router.push("/dashboard"); // Redirect to dashboard after successful save
        } catch (err: any) {
            console.error("Error saving profile:", err);
            setError(err.message || "Failed to save profile. Please try again.");
        } finally {
            setLoading(false); // End loading for save operation
        }
    };

    // REMOVED: handleBack function

    // Display loading spinner while auth is loading or data is being fetched/saved
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

    // If user is null after authLoading, means not authenticated, redirect handled by useEffect
    if (!user) {
        return null;
    }

    return (
        <AuthLayout className="gap-8"> {/* Using AuthLayout for consistent styling */}
            <div className="w-full flex flex-col gap-6 flex-1">
                {/* Header */}
                <div className="flex flex-col gap-6 w-full">
                    <div className="flex flex-col w-full h-[107px]">
                        <div className="flex flex-col gap-2.5 px-4 w-full shadow-sm bg-white">
                            <div className="flex items-center gap-2 py-4">
                                {/* REMOVED: Back button */}
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

                            {/* Last Name */}
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

                            {/* Email (read-only) */}
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

                            {/* Dormitory Dropdown */}
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

                            {/* Favorite Store Dropdown */}
                            <div className="flex flex-col gap-1 w-full">
                                <label htmlFor="favoriteStore" className="text-[#111827] font-poppins text-sm font-medium leading-5">
                                    Favorite Store
                                </label>
                                <select
                                    id="favoriteStore"
                                    value={formData.favoriteStore || ""} // Value is the name
                                    onChange={(e) => handleInputChange("favoriteStore", e.target.value || null)} // Save the name
                                    className="px-4 py-3 border border-[#E5E8EB] rounded-[18px] w-full text-[#111827] font-poppins text-sm bg-white"
                                >
                                    <option value="">Select a store</option>
                                    {shops.map((shop) => (
                                        <option key={shop.id} value={shop.name}> {/* Option value is shop.name */}
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
