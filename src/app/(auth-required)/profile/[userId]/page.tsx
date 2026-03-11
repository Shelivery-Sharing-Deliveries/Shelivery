"use client";

import { PageLayout } from '@/components/ui/PageLayout';
import { usePushNotifications } from '@/hooks/usePushNotifications';
import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import Image from "next/image";
import { supabase } from "@/lib/supabase";
import { GeneralTab, PreferencesTab, NotificationsTab, TabNavigation } from './components';

interface ProfileFormData {
    firstName: string;
    lastName: string;
    email: string;
    dormitory: string;
    favoriteStore: string;
    address: string;
    lat: number | null;
    lng: number | null;
    preferedKm: number;
}

type TabType = 'general' | 'preferences' | 'notifications';

export default function ProfileEditPage() {
    const router = useRouter();
    const { unsubscribe } = usePushNotifications();
    const [activeTab, setActiveTab] = useState<TabType>('general');
    const [formData, setFormData] = useState<ProfileFormData>({
        firstName: "",
        lastName: "",
        email: "",
        dormitory: "",
        favoriteStore: "",
        address: "",
        lat: null,
        lng: null,
        preferedKm: 5,
    });

    // State for profile image URL and user ID
    const [profileImage, setProfileImage] = useState<string | null>(null);
    const [userId, setUserId] = useState<string | null>(null);
    const [dormitories, setDormitories] = useState<string[]>([]);
    const [shops, setShops] = useState<string[]>([]);

    // Fetch options for dormitories and shops
    useEffect(() => {
        const fetchOptions = async () => {
            // Fetch dormitories
            const { data: dormData, error: dormError } = await supabase
                .from("dormitory")
                .select("name");

            if (!dormError && dormData) {
                setDormitories(dormData.map((d) => d.name));
            } else if (dormError) {
                console.error("Error fetching dormitories:", dormError);
            }

            // Fetch shops
            const { data: shopData, error: shopError } = await supabase
                .from("shop")
                .select("name");

            if (!shopError && shopData) {
                setShops(shopData.map((s) => s.name));
            } else if (shopError) {
                console.error("Error fetching shops:", shopError);
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

            if (!user) {
                // Unauthenticated - AuthGuard will handle redirect to /auth
                return;
            }

            setUserId(user.id);

            const { data, error } = await supabase
                .from("user")
                .select("first_name, last_name, email, favorite_store, dormitory(name), image, address, lat, lng, prefered_km")
                .eq("id", user.id)
                .single();

            if (error) {
                console.error("Error fetching user profile:", error);
                // Fallback to default values if fetching fails or user record doesn't exist
                setFormData({
                    firstName: "",
                    lastName: "",
                    favoriteStore: "",
                    dormitory: "",
                    email: user.email || "", // Use authenticated user's email as fallback
                    address: "",
                    lat: null,
                    lng: null,
                    preferedKm: 5,
                });
            } else if (data) {
                setFormData({
                    firstName: data.first_name || "",
                    lastName: data.last_name || "",
                    favoriteStore: data.favorite_store || "",
                    dormitory: Array.isArray(data.dormitory)
                        ? data.dormitory[0]?.name || ""
                        : (data.dormitory as { name: string } | null)?.name || "",
                    email: data.email || user.email || "", // Prefer DB email, fallback to auth email
                    address: data.address || "",
                    lat: data.lat || null,
                    lng: data.lng || null,
                    preferedKm: data.prefered_km || 5,
                });

                if (data.image) {
                    setProfileImage(data.image);
                }
            }
        };
        loadProfile();
    }, [router]); // Added router to dependency array as it's used inside

    // Update form field values
    const handleInputChange = (field: keyof ProfileFormData, value: string | number) => {
        setFormData((prev) => ({
            ...prev,
            [field]: value,
        }));
    };

    // Handle location selection from MapboxLocationPicker
    const handleLocationSelect = (locationData: { longitude: number; latitude: number; address?: string }) => {
        setFormData((prev) => ({
            ...prev,
            address: locationData.address || "",
            lat: locationData.latitude,
            lng: locationData.longitude,
        }));
    };

    // Handle image upload
    const handleImageUpload = async (event: React.ChangeEvent<HTMLInputElement>) => {
        const file = event.target.files?.[0];
        if (!file || !userId) return;

        try {
            // Upload to R2 via API
            const formData = new FormData();
            formData.append('file', file);
            formData.append('userId', userId);
            // Add timestamp (e.g. milliseconds since epoch)
            const timestamp = Date.now().toString();
            formData.append('timestamp', timestamp);

            const response = await fetch('/api/upload/avatar', {
                method: 'POST',
                body: formData,
            });

            const result = await response.json();

            if (!response.ok || result.error) {
                console.error('Upload failed:', result.error || 'Unknown error');
                return;
            }

            if (!result.url) {
                console.error('Upload failed: No URL returned');
                return;
            }

            // Update database with new avatar URL (client-side with RLS)
            const { error: updateError } = await supabase
                .from('user')
                .update({ image: result.url })
                .eq('id', userId);

            if (updateError) {
                console.error('Failed to update user profile in database:', updateError);
                return;
            }

            // Update UI
            setProfileImage(result.url);
            console.log("Profile image updated successfully!");
        } catch (error) {
            console.error('Upload error:', error);
        }
    };

    // Handle avatar upload completion
    const handleAvatarUploadComplete = (url: string) => {
        setProfileImage(url);
        console.log("Profile image updated successfully!");
    };


    // Save updated profile data to Supabase
    const handleSave = async () => {
        if (!userId) {
            console.error("User ID not available. Please log in again.");
            return;
        }
        const { error } = await supabase
            .from("user")
            .update({
                first_name: formData.firstName,
                last_name: formData.lastName,
                favorite_store: formData.favoriteStore,
                address: formData.address,
                lat: formData.lat,
                lng: formData.lng,
                prefered_km: formData.preferedKm,
                // Dormitory is read-only in this form, so not included in update
            })
            .eq("id", userId);
        if (error) {
            console.error("Error saving profile:", error);
        } else {
            console.log("Profile saved successfully!");
            router.back();
        }
    };

    // Navigate back to previous page
    const handleBack = () => {
        router.back();
    };

    // --- LOGOUT FUNCTION ---
    const handleLogout = async () => {

        const unsubscribeSuccess = await unsubscribe(); 
        if (unsubscribeSuccess) {
            console.log("Successfully unsubscribed from push notifications on logout.");
        } else {
            console.warn("Failed to unsubscribe from push notifications on logout, but proceeding with logout.");
        }
        const { error } = await supabase.auth.signOut();
        if (error) {
            console.error("Error logging out:", error);
            // alert("Failed to log out. Please try again."); // Inform user - Removed alert
        } else {
            // Clear any local state if necessary (though a full page redirect often handles this)
            setFormData({
                firstName: "",
                lastName: "",
                email: "",
                dormitory: "",
                favoriteStore: "",
                address: "",
                lat: null,
                lng: null,
                preferedKm: 5,
            });
            setProfileImage(null);
            setUserId(null);

            // Redirect to the first page after successful logout
            router.push("/"); // CHANGED: Redirect to the first page
        }
    };

    // Extract the header content to pass as a prop to PageLayout
    const profileEditHeader = (
        <div className="flex items-center gap-2 px-4 py-2">
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
    );

    return (
        <PageLayout header={profileEditHeader} showNavigation={false}>
            <div className="flex flex-col flex-1 pb-8">
                <TabNavigation activeTab={activeTab} onTabChange={setActiveTab} />

                {/* Tab Content */}
                <div className="flex-1 px-4">
                    {activeTab === 'general' && (
                        <GeneralTab
                            formData={{
                                firstName: formData.firstName,
                                lastName: formData.lastName,
                                email: formData.email,
                            }}
                            profileImage={profileImage}
                            onInputChange={handleInputChange}
                            onImageUpload={handleImageUpload}
                            onSave={handleSave}
                        />
                    )}

                    {activeTab === 'preferences' && (
                        <PreferencesTab
                            formData={{
                                favoriteStore: formData.favoriteStore,
                                dormitory: formData.dormitory,
                                address: formData.address,
                                lat: formData.lat,
                                lng: formData.lng,
                                preferedKm: formData.preferedKm,
                            }}
                            shops={shops}
                            onInputChange={handleInputChange}
                            onLocationSelect={handleLocationSelect}
                            onSave={handleSave}
                        />
                    )}

                    {activeTab === 'notifications' && <NotificationsTab />}
                </div>

                {/* LOGOUT BUTTON - Always visible at bottom */}
                <div className="px-4 mt-8">
                    <button
                        onClick={handleLogout}
                        className="flex items-center justify-center gap-2 py-3 px-0 w-full bg-red-500 text-white rounded-[16px]"
                    >
                        <span className="font-poppins text-lg font-semibold leading-[26px]">
                            Logout
                        </span>
                    </button>
                </div>
            </div>
        </PageLayout>
    );
}
