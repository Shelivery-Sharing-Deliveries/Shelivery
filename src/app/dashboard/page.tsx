"use client";

import { Navigation, Button } from "@/components/ui";
import ProfileCard from "@/components/dashboard/ProfileCard";
import AddBasket from "@/components/dashboard/AddBasket";
import Baskets from "@/components/dashboard/Baskets";
import Banner from "@/components/dashboard/Banner";
import { useRouter, useSearchParams } from "next/navigation";
import { supabase } from "@/lib/supabase"; // adjust path as needed
import { useEffect, useState } from "react";

// Mock data for demonstration
const mockUser = {
  userName: "Elly",
  userAvatar: "/avatars/User Avatar.png",
};

const mockBaskets: any[] = [
  {
    id: "1",
    shopName: "Migros",
    shopLogo: "/shop-logos/Migros Logo.png",
    total: "15",
    status: "ordering" as const,
  },
  {
    id: "2",
    shopName: "Coop",
    shopLogo: "/shop-logos/Coop Logo.png",
    total: "23",
    status: "on_the_way" as const,
  },
  {
    id: "3",
    shopName: "Denner",
    shopLogo: "/shop-logos/Denner Logo.png",
    total: "18",
    status: "waiting" as const,
  },
  {
    id: "4",
    shopName: "Aldi",
    shopLogo: "/shop-logos/Aldi Logo.png",
    total: "31",
    status: "delivered" as const,
  },
  {
    id: "5",
    shopName: "Lidl",
    shopLogo: "/shop-logos/Lidl Logo.png",
    total: "12",
    status: "draft" as const,
  },
];

export default function DashboardPage() {
    const [user, setUser] = useState<{ userName: string; userAvatar: string } | null>(null);
    const router = useRouter();
    useEffect(() => {
    async function fetchUser() {
    const {
      data: { user: currentUser },
      error,
    } = await supabase.auth.getUser();

    if (error || !currentUser) {// Handle error or no user logged in
    return;
    } 

    if (error || !currentUser) {
      console.error("No user or auth error:", error);
      return;
    }
      //console.log(currentUser);

      const { data: userData, error: userError } = await supabase
        .from("user")
        .select("first_name, image")
        .eq("id", currentUser.id)
        .single();


      if (userError) {
        console.error("Error fetching user:", userError);
        // Optionally set default/fallback user here
        setUser({ userName: "User", userAvatar: "/avatars/default-avatar.png" });
      } else if (userData) {
        setUser({
          userName: userData.first_name || "User",
          userAvatar: userData.image || "/avatars/default-avatar.png",
        });
      }
    }

    fetchUser();
  }, []);
 
    const handleAddBasket = () => {
        router.push("/shops");
    //console.log("Add basket clicked");
  };
  const handleInviteFriend = () => {
        router.push("/invite-friend");
    //console.log("Add basket clicked");
  };

  const handleBasketClick = (basketId: string) => {
    console.log("Basket clicked:", basketId);
  };

  return (
    <div className="min-h-screen bg-[#245B7B] relative flex justify-center">
      {/* Main Content Container - 375px width */}
      <div className="w-[375px] bg-white rounded-t-[30px] min-h-screen px-3 py-[18px] pb-[90px] mx-[10px]">
        {/* Header */}
        <div className="flex justify-between mb-[19px]">
          <h1 className="text-[16px] font-bold leading-8 text-black">
            Dashboard
          </h1>
          <Button onClick={handleInviteFriend} className="bg-[#245B7B] text-white px-4 py-2 rounded-lg text-[12px] font-semibold">
            Invite Friends
          </Button>
        </div>

        {/* Dashboard Components */}
        <div className="px-0">
          <ProfileCard
            userName={user ? user.userName : "username not loaded"}
            userAvatar={user ? user.userAvatar : "/avatars/default-avatar.png"}
          />
          <AddBasket onClick={handleAddBasket} />
          <Baskets baskets={mockBaskets} onBasketClick={handleBasketClick} />
          <Banner />
        </div>
      </div>

      {/* Navigation - Fixed to bottom */}
      <div className="fixed bottom-0 left-0 right-0">
        <Navigation />
      </div>
    </div>
  );
}
