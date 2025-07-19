// app/chatrooms/page.tsx
"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "@/hooks/useAuth";
import { supabase } from "@/lib/supabase";
import { Button } from "@/components/ui/Button";
import { Navigation } from "@/components/ui/Navigation";
import Image from "next/image"; // Import Image component

// Refined Chatroom interface to include shop and dormitory details
interface ChatroomDisplayData {
  id: string;
  pool_id: string; // The pool this chatroom belongs to
  admin_id: string; // The admin of this chatroom
  created_at: string;
  last_message_at: string | null;
  shop_name: string;
  shop_logo_url: string | null;
  dormitory_name: string;
}

export default function ChatroomsPage() {
  const [chatrooms, setChatrooms] = useState<ChatroomDisplayData[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const { user, loading: authLoading } = useAuth();
  const router = useRouter();

  // Redirect if not authenticated
  useEffect(() => {
    if (!authLoading && !user) {
      router.push("/auth");
    }
  }, [user, authLoading, router]);

  // Fetch chatrooms and related data
  useEffect(() => {
    const fetchChatroomsData = async () => {
      if (!user) {
        setLoading(false);
        return;
      }

      setLoading(true);
      setError(null);

      try {
        // --- IMPORTANT CHANGE 1: Query the 'user' table for profile info ---
        // 1. Get the user's dormitory name directly from the 'user' table via join
        const { data: userData, error: userError } = await supabase
          .from("user") // <-- CHANGED from "profile" to "user"
          .select("dormitory(name)") // Select the dormitory name directly
          .eq("id", user.id)
          .single();

        if (userError || !userData?.dormitory?.[0]?.name) {
          // If there's an error or dormitory name is not found
          console.error("Error fetching user's dormitory:", userError);
          throw new Error(
            "Could not retrieve user's dormitory information. Please ensure your profile is complete."
          );
        }
        const dormitoryName = (userData.dormitory?.[0] as { name: string })
          .name;

        // 2. Find all baskets associated with the current user
        const { data: userBaskets, error: basketsError } = await supabase
          .from("basket")
          .select("id, chatroom_id, shop_id")
          .eq("user_id", user.id);

        if (basketsError) {
          throw basketsError;
        }

        // Extract unique chatroom_ids and shop_ids
        const uniqueChatroomIds = [
          Array.from(
            new Set(userBaskets.map((b) => b.chatroom_id).filter(Boolean))
          ) as string[],
        ];
        const uniqueShopIds = [
          Array.from(
            new Set(userBaskets.map((b) => b.shop_id).filter(Boolean))
          ) as string[],
        ];

        if (uniqueChatroomIds.length === 0) {
          setChatrooms([]);
          setLoading(false);
          return;
        }

        // 3. Fetch chatroom details for these unique IDs
        const { data: fetchedChatrooms, error: chatroomsError } = await supabase
          .from("chatroom")
          .select("id, pool_id, admin_id, created_at")
          .in("id", uniqueChatroomIds);

        if (chatroomsError) {
          throw chatroomsError;
        }

        // 4. Fetch shop details for all unique shop IDs
        const { data: fetchedShops, error: shopsError } = await supabase
          .from("shop")
          .select("id, name, logo_url")
          .in("id", uniqueShopIds);

        if (shopsError) {
          throw shopsError;
        }
        const shopMap = new Map(fetchedShops?.map((s) => [s.id, s]));

        // 5. Combine all data and find the latest message for each chatroom
        const chatroomsWithCombinedData = await Promise.all(
          fetchedChatrooms.map(async (chatroom) => {
            // Find a basket that links this chatroom to a shop
            const relatedBasket = userBaskets.find(
              (b) => b.chatroom_id === chatroom.id
            );
            const shopId = relatedBasket?.shop_id;
            const shop = shopId ? shopMap.get(shopId) : null;

            // Fetch the latest message for last_message_at
            const { data: latestMessage, error: messageError } = await supabase
              .from("message")
              .select("sent_at")
              .eq("chatroom_id", chatroom.id)
              .order("sent_at", { ascending: false })
              .limit(1)
              .single();

            if (messageError && messageError.code !== "PGRST116") {
              // PGRST116 means no rows found (no messages)
              console.error(
                `Error fetching latest message for chatroom ${chatroom.id}:`,
                messageError
              );
            }

            return {
              ...chatroom,
              shop_name: shop?.name || "Unknown Shop",
              shop_logo_url: shop?.logo_url || null,
              dormitory_name: dormitoryName, // Now correctly fetched from the 'user' table
              last_message_at: latestMessage ? latestMessage.sent_at : null,
            };
          })
        );

        // Sort chatrooms by last message time, most recent first
        chatroomsWithCombinedData.sort((a, b) => {
          if (!a.last_message_at && !b.last_message_at) return 0;
          if (!a.last_message_at) return 1; // Nulls (no messages) go to the end
          if (!b.last_message_at) return -1; // Nulls (no messages) go to the end
          return (
            new Date(b.last_message_at).getTime() -
            new Date(a.last_message_at).getTime()
          );
        });

        setChatrooms(chatroomsWithCombinedData);
      } catch (err: any) {
        console.error("Error fetching chatrooms data:", err);
        setError(err.message || "Failed to load chatrooms");
      } finally {
        setLoading(false);
      }
    };

    fetchChatroomsData();
  }, [user]);

  const handleChatroomSelect = (chatroomId: string) => {
    router.push(`/chatrooms/${chatroomId}`);
  };

  // --- Loading State ---
  if (authLoading || loading) {
    return (
      <div className="min-h-screen bg-shelivery-background-gray">
        <div className="flex items-center justify-center pt-20">
          <div className="text-center">
            <div className="w-8 h-8 border-4 border-shelivery-primary-yellow border-t-transparent rounded-full animate-spin mx-auto mb-4" />
            <p className="text-shelivery-text-secondary">
              Loading chatrooms...
            </p>
          </div>
        </div>
      </div>
    );
  }

  // --- No User State (should redirect via useEffect, but good fallback) ---
  if (!user) {
    return null;
  }

  // --- Error State ---
  if (error) {
    return (
      <div className="min-h-screen bg-[#245B7B] relative flex justify-center">
        <div className="w-[calc(100vw-25px)] md:w-[375px] bg-white rounded-t-[30px] min-h-screen px-3 py-[18px] pb-[90px] md:mx-[10px]">
          <div className="text-center max-w-md">
            <div className="w-16 h-16 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <svg
                className="w-8 h-8 text-red-600"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
                />
              </svg>
            </div>
            <h2 className="text-xl font-semibold text-shelivery-text-primary mb-2">
              Failed to Load Chatrooms
            </h2>
            <p className="text-shelivery-text-secondary mb-6">{error}</p>
            <Button onClick={() => window.location.reload()}>Try Again</Button>
          </div>
        </div>
        <Navigation />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#245B7B] relative flex justify-center">
      <div className="w-[calc(100vw-25px)] md:w-[375px] bg-white rounded-t-[30px] min-h-screen px-3 py-[18px] pb-[90px] md:mx-[10px]">
        {/* Header */}
        <div className="text-center mb-8">
          <h1 className="text-3xl font-bold text-shelivery-text-primary mb-2">
            Your Chatrooms
          </h1>
          <p className="text-shelivery-text-secondary">
            Access your active conversations
          </p>
        </div>

        {/* Chatrooms List */}
        {chatrooms.length === 0 ? (
          <div className="text-center py-12">
            <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <svg
                className="w-8 h-8 text-gray-400"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z"
                />
              </svg>
            </div>
            <h3 className="text-lg font-medium text-shelivery-text-primary mb-2">
              No Active Chatrooms
            </h3>
            <p className="text-shelivery-text-secondary">
              You don't have any active chatrooms at the moment.
            </p>
          </div>
        ) : (
          <div className="space-y-4">
            {chatrooms.map((chatroom) => (
              <div
                key={chatroom.id}
                className="bg-white rounded-shelivery-lg p-4 border border-gray-200 hover:border-shelivery-primary-blue transition-colors cursor-pointer"
                onClick={() => handleChatroomSelect(chatroom.id)}
              >
                <div className="flex items-start gap-4">
                  {/* Shop Logo */}
                  <div className="w-16 h-16 bg-gray-100 rounded-shelivery-md flex items-center justify-center flex-shrink-0 overflow-hidden">
                    {chatroom.shop_logo_url ? (
                      <Image
                        src={chatroom.shop_logo_url}
                        alt={chatroom.shop_name}
                        width={64} // Set appropriate width
                        height={64} // Set appropriate height
                        className="w-full h-full object-cover"
                      />
                    ) : (
                      <svg
                        className="w-8 h-8 text-gray-400"
                        fill="none"
                        stroke="currentColor"
                        viewBox="0 0 24 24"
                      >
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth={2}
                          d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z"
                        />
                      </svg>
                    )}
                  </div>

                  {/* Chatroom Info */}
                  <div className="flex-1 min-w-0">
                    <div className="flex items-start justify-between mb-2">
                      <div>
                        <h3 className="text-lg font-semibold text-shelivery-text-primary">
                          {chatroom.dormitory_name} {chatroom.shop_name} Group
                        </h3>
                      </div>
                      <svg
                        className="w-5 h-5 text-shelivery-text-tertiary"
                        fill="none"
                        stroke="currentColor"
                        viewBox="0 0 24 24"
                      >
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth={2}
                          d="M9 5l7 7-7 7"
                        />
                      </svg>
                    </div>

                    {chatroom.last_message_at && (
                      <p className="text-sm text-shelivery-text-secondary mt-1">
                        Last activity:{" "}
                        {new Date(chatroom.last_message_at).toLocaleString()}
                      </p>
                    )}
                    {!chatroom.last_message_at && (
                      <p className="text-sm text-shelivery-text-secondary mt-1 italic">
                        No messages yet
                      </p>
                    )}
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
      <div className="fixed bottom-0 left-0 right-0">
        <Navigation />
      </div>
    </div>
  );
}
