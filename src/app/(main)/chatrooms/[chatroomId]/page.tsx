"use client";

import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import { supabase } from "@/lib/supabase";
import { useAuth } from "@/hooks/useAuth";
import { SimpleChatHeader } from "@/components/chatroom/SimpleChatHeader";
import { ChatMessages } from "@/components/chatroom/ChatMessages";
import { ChatInput } from "@/components/chatroom/ChatInput";
import { SimpleOrderStatusCard } from "@/components/chatroom/SimpleOrderStatusCard";
import { ChatMembersList } from "@/components/chatroom/ChatMembersList";
import { NotificationBanner } from "@/components/chatroom/NotificationBanner";
import { TimeExtensionModal } from "@/components/chatroom/TimeExtensionModal";
import { Button } from "@/components/ui/Button";

interface Chatroom {
  id: string;
  pool_id: string;
  state: "waiting" | "active" | "ordered" | "resolved";
  admin_id: string | null;
  last_amount: number;
  created_at: string;
  updated_at: string;
  pool: {
    id: string;
    shop_id: number;
    dormitory_id: number;
    current_amount: number;
    min_amount: number;
    created_at: string;
    shop: {
      id: number;
      name: string;
      min_amount: number;
      created_at: string;
    };
    dormitory: {
      id: number;
      name: string;
    };
  };
}

interface User {
  id: string;
  email: string;
  dormitory_id: number | null;
  profile: any;
  created_at: string | null;
  updated_at: string | null;
  first_name: string | null;
  last_name: string | null;
  favorite_store: string | null;
  image: string | null;
}

interface ChatMember extends User {
  basket: {
    id: string;
    user_id: string;
    shop_id: number;
    link: string | null;
    amount: number;
    status: "resolved" | "in_pool" | "in_chat";
    is_ready: boolean;
    pool_id: string | null;
    chatroom_id: string | null;
    created_at: string;
    updated_at: string;
  } | null;
}

interface MessageType {
  id: number;
  chatroom_id: string;
  user_id: string;
  content: string;
  sent_at: string;
  read_at: string | null;
  user: User;
}

export default function ChatroomPage() {
  const params = useParams();
  const router = useRouter();
  const { user, loading: authLoading } = useAuth();
  const chatroomId = params.chatroomId as string;

  console.log("ChatroomPage: Component Rendered");
  console.log("ChatroomPage: chatroomId from params:", chatroomId);

  const [chatroom, setChatroom] = useState<Chatroom | null>(null);
  const [members, setMembers] = useState<ChatMember[]>([]);
  const [messages, setMessages] = useState<MessageType[]>([]);
  const [currentUser, setCurrentUser] = useState<User | null>(null);
  const [isAdmin, setIsAdmin] = useState(false);
  const [loading, setLoading] = useState(true);
  const [showTimeExtension, setShowTimeExtension] = useState(false);
  const [notification, setNotification] = useState<string | null>(null);

  // Get current user profile from database
  useEffect(() => {
    const getCurrentUser = async () => {
      if (authLoading || !user) {
        console.log("getCurrentUser: Waiting for auth or no user found");
        return;
      }

      console.log("getCurrentUser: Auth user found:", user.id);
      const { data: profile, error: profileError } = await supabase
        .from("user")
        .select("*")
        .eq("id", user.id)
        .single();

      if (profileError) {
        console.error(
          "getCurrentUser: Error fetching user profile:",
          profileError
        );
        setLoading(false);
        return;
      }

      console.log("getCurrentUser: User profile set:", profile?.id);
      setCurrentUser(profile);
    };

    getCurrentUser();
  }, [user, authLoading]);

  // Load chatroom data
  useEffect(() => {
    // This effect depends on currentUser, so it won't run until currentUser is set.
    if (!currentUser || authLoading) {
      console.log("loadChatroomData: Waiting for currentUser...");
      return;
    }
    if (!chatroomId) {
      console.error("loadChatroomData: chatroomId is not available.");
      setLoading(false); // Cannot load if no chatroomId
      return;
    }

    const loadChatroomData = async () => {
      console.log(
        "loadChatroomData: Starting data fetch for chatroom:",
        chatroomId
      );
      console.log("loadChatroomData: Current User ID:", currentUser?.id);

      try {
        // Get chatroom with pool and shop info
        console.log("loadChatroomData: Fetching chatroom data...");
        const { data: chatroomData, error: chatroomError } = await supabase
          .from("chatroom")
          .select(
            `
            *,
            pool:pool(
              id,
              shop_id,
              dormitory_id,
              current_amount,
              min_amount,
              created_at,
              shop:shop(id, name, min_amount, created_at),
              dormitory:dormitory(id, name)
            )
          `
          )
          .eq("id", chatroomId)
          .single();

        if (chatroomError) {
          console.error(
            "loadChatroomData: Error fetching chatroom:",
            chatroomError
          );
          throw chatroomError; // Re-throw to catch block
        }
        if (!chatroomData) {
          console.warn(
            "loadChatroomData: No chatroom data found for ID:",
            chatroomId
          );
          // If chatroom doesn't exist, we should still stop loading.
          setLoading(false);
          return; // Exit early
        }
        console.log("loadChatroomData: Chatroom data fetched:", chatroomData);
        setChatroom(chatroomData);
        setIsAdmin(chatroomData.admin_id === currentUser.id);
        console.log(
          "loadChatroomData: Is Admin:",
          chatroomData.admin_id === currentUser.id
        );

        // Get members - simplified query
        console.log("loadChatroomData: Fetching chat memberships...");
        const { data: membershipsData, error: membershipsError } =
          await supabase
            .from("chat_membership")
            .select("user_id")
            .eq("chatroom_id", chatroomId)
            .is("left_at", null);

        if (membershipsError) {
          console.error(
            "loadChatroomData: Error fetching memberships:",
            membershipsError
          );
          throw membershipsError;
        }
        console.log("loadChatroomData: Memberships fetched:", membershipsData);

        // Get user details for members
        if (membershipsData && membershipsData.length > 0) {
          const userIds = membershipsData.map((m) => m.user_id);
          console.log(
            "loadChatroomData: Fetching member user profiles for IDs:",
            userIds
          );
          const { data: usersData, error: usersError } = await supabase
            .from("user")
            .select("*")
            .in("id", userIds);

          if (usersError) {
            console.error(
              "loadChatroomData: Error fetching member users:",
              usersError
            );
            throw usersError;
          }
          console.log(
            "loadChatroomData: Member user profiles fetched:",
            usersData
          );

          // Get baskets for these users
          console.log("loadChatroomData: Fetching baskets for members...");
          const { data: basketsData, error: basketsError } = await supabase
            .from("basket")
            .select("*")
            .in("user_id", userIds)
            .eq("status", "in_chat");

          if (basketsError) {
            console.error(
              "loadChatroomData: Error fetching baskets:",
              basketsError
            );
            throw basketsError;
          }
          console.log("loadChatroomData: Baskets fetched:", basketsData);

          // Combine user and basket data
          const processedMembers: ChatMember[] =
            usersData?.map((user) => ({
              ...user,
              basket:
                basketsData?.find((basket) => basket.user_id === user.id) ||
                null,
            })) || [];

          setMembers(processedMembers);
          console.log("loadChatroomData: Members state updated.");
        } else {
          console.log(
            "loadChatroomData: No members found for this chatroom or memberships data is empty."
          );
          setMembers([]); // Ensure members is an empty array if none found
        }

        // Get messages - simplified query
        console.log("loadChatroomData: Fetching messages...");
        const { data: messagesData, error: messagesError } = await supabase
          .from("message")
          .select("*")
          .eq("chatroom_id", chatroomId)
          .order("sent_at", { ascending: true });

        if (messagesError) {
          console.error(
            "loadChatroomData: Error fetching messages:",
            messagesError
          );
          throw messagesError;
        }
        console.log("loadChatroomData: Messages fetched:", messagesData);

        // Get user data for messages
        if (messagesData && messagesData.length > 0) {
          const uniqueUserIds = messagesData.map((m) => m.user_id);
          const messageUserIds = Array.from(new Set(uniqueUserIds));

          console.log(
            "loadChatroomData: Fetching message user profiles for IDs:",
            messageUserIds
          );
          const { data: messageUsersData, error: messageUsersError } =
            await supabase.from("user").select("*").in("id", messageUserIds);

          if (messageUsersError) {
            console.error(
              "loadChatroomData: Error fetching message users:",
              messageUsersError
            );
            throw messageUsersError;
          }
          console.log(
            "loadChatroomData: Message user profiles fetched:",
            messageUsersData
          );

          const processedMessages: MessageType[] = messagesData.map(
            (message) => ({
              ...message,
              user: messageUsersData?.find(
                (user) => user.id === message.user_id
              ) || {
                // Fallback user object
                id: message.user_id,
                email: "Unknown",
                dormitory_id: null,
                profile: {},
                created_at: "",
                updated_at: "",
              },
            })
          );
          setMessages(processedMessages);
          console.log("loadChatroomData: Messages state updated.");
        } else {
          console.log("loadChatroomData: No messages found for this chatroom.");
          setMessages([]); // Ensure messages is an empty array if none found
        }

        console.log(
          "loadChatroomData: All data fetches completed successfully."
        );
      } catch (error) {
        console.error(
          "loadChatroomData: Caught an error during chatroom data loading:",
          error
        );
        // This catch block ensures that if any error occurs in the try block,
        // we still attempt to set loading to false.
      } finally {
        console.log("loadChatroomData: Setting loading to FALSE.");
        setLoading(false); // This is the crucial line we want to ensure is always hit
      }
    };

    loadChatroomData();
  }, [currentUser, chatroomId, authLoading]); // Dependencies are correct here.

  // Real-time subscriptions
  useEffect(() => {
    if (!chatroomId || authLoading) {
      console.log(
        "Realtime: chatroomId not available for subscriptions or auth loading."
      );
      return;
    }
    console.log(
      "Realtime: Setting up Supabase real-time subscriptions for chatroom:",
      chatroomId
    );

    // Subscribe to new messages
    const messagesSubscription = supabase
      .channel(`messages:${chatroomId}`)
      .on(
        "postgres_changes",
        {
          event: "INSERT",
          schema: "public",
          table: "message",
          filter: `chatroom_id=eq.${chatroomId}`,
        },
        async (payload) => {
          console.log("Realtime: New message received:", payload.new);
          // Get user data for the new message
          const { data: userData, error: userDataError } = await supabase
            .from("user")
            .select("*")
            .eq("id", payload.new.user_id)
            .single();

          if (userDataError) {
            console.error(
              "Realtime: Error fetching user data for new message:",
              userDataError
            );
            return;
          }

          if (userData) {
            const newMessage: MessageType = {
              id: payload.new.id,
              chatroom_id: payload.new.chatroom_id,
              user_id: payload.new.user_id,
              content: payload.new.content,
              sent_at: payload.new.sent_at,
              read_at: payload.new.read_at,
              user: userData,
            };
            setMessages((prev) => [...prev, newMessage]);
            console.log("Realtime: Messages updated with new message.");
          }
        }
      )
      .subscribe();

    // Subscribe to chatroom updates
    const chatroomSubscription = supabase
      .channel(`chatroom:${chatroomId}`)
      .on(
        "postgres_changes",
        {
          event: "UPDATE",
          schema: "public",
          table: "chatroom",
          filter: `id=eq.${chatroomId}`,
        },
        (payload) => {
          console.log("Realtime: Chatroom update received:", payload.new);
          setChatroom((prev) => (prev ? { ...prev, ...payload.new } : null));
          console.log("Realtime: Chatroom state updated.");
        }
      )
      .subscribe();

    return () => {
      console.log("Realtime: Unsubscribing from real-time channels.");
      messagesSubscription.unsubscribe();
      chatroomSubscription.unsubscribe();
    };
  }, [chatroomId, authLoading]); // Dependency ensures it re-runs if chatroomId changes or auth state changes.

  // Function for uploading voice or image messages
  const uploadFileToStorage = async (
  file: File,
  folder: "images" | "audio"
): Promise<string | null> => {
  const randomSuffix = Math.random().toString(36).substring(2, 10);
  const fileName = `${Date.now()}_${randomSuffix}_${file.name}`;

  const { data, error } = await supabase.storage
    .from(folder)
    .upload(fileName, file, {
      cacheControl: "3600",
      upsert: false,
    });

  if (error) {
    console.error("File upload failed:", error);
    return null;
  }
  const { data } = supabase.storage
    .from(folder)
    .getPublicUrl(fileName);

  return data?.publicUrl ?? null;
  return publicUrl?.publicUrl ?? null;
};

  // Function to send messages and different content types as image or voice messages
  const sendMessage = async (
  content: string | { type: "audio" | "image"; url: string }
) => {
  if (!currentUser || !content) {
    console.log("sendMessage: Cannot send message, user or content missing.");
    return;
  }

  let messageContent = "";
  let messageType = "text"; // Default message type

  if (typeof content === "string") {
    if (!content.trim()) {
      console.log("sendMessage: Empty text message. Not sending.");
      return;
    }
    messageContent = content.trim();
  } else {
    messageContent = content.url; // Store URL (base64 for images, blob URL for audio)
    messageType = content.type;   // "audio" or "image"
  }

  console.log(`sendMessage: Sending ${messageType} message...`);

  try {
    const { error } = await supabase.from("message").insert({
      chatroom_id: chatroomId,
      user_id: currentUser.id,
      content: messageContent,  // image/audio URL or plain text
      type: messageType,        // New field to distinguish message type
    });

    if (error) {
      console.error("sendMessage: Error inserting message:", error);
    } else {
      console.log("sendMessage: Message inserted successfully.");
    }
  } catch (error) {
    console.error("sendMessage: Caught error during message send:", error);
  }
};




  const markAsOrdered = async () => {
    if (!isAdmin) {
      console.warn("markAsOrdered: User is not admin, cannot mark as ordered.");
      return;
    }
    console.log("markAsOrdered: Attempting to mark as ordered...");
    try {
      const { error } = await supabase
        .from("chatroom")
        .update({ state: "ordered" })
        .eq("id", chatroomId);

      if (error) {
        console.error(
          "markAsOrdered: Error updating chatroom state to ordered:",
          error
        );
      } else {
        setNotification("Order has been marked as placed!");
        setTimeout(() => setNotification(null), 3000);
        console.log("markAsOrdered: Chatroom state updated to 'ordered'.");
      }
    } catch (error) {
      console.error(
        "markAsOrdered: Caught error during mark as ordered:",
        error
      );
    }
  };

  const markAsDelivered = async () => {
    if (!isAdmin) {
      console.warn(
        "markAsDelivered: User is not admin, cannot mark as delivered."
      );
      return;
    }
    console.log("markAsDelivered: Attempting to mark as delivered...");
    try {
      const { error } = await supabase
        .from("chatroom")
        .update({ state: "resolved" })
        .eq("id", chatroomId);

      if (error) {
        console.error(
          "markAsDelivered: Error updating chatroom state to resolved:",
          error
        );
      } else {
        setNotification("Order has been marked as delivered!");
        setTimeout(() => setNotification(null), 3000);
        console.log("markAsDelivered: Chatroom state updated to 'resolved'.");
      }
    } catch (error) {
      console.error(
        "markAsDelivered: Caught error during mark as delivered:",
        error
      );
    }
  };

  const leaveGroup = async () => {
    if (!currentUser) {
      console.warn("leaveGroup: No current user to leave group.");
      return;
    }
    console.log("leaveGroup: Attempting to leave group...");
    try {
      const { error } = await supabase
        .from("chat_membership")
        .update({ left_at: new Date().toISOString() })
        .eq("chatroom_id", chatroomId)
        .eq("user_id", currentUser.id);

      if (error) {
        console.error(
          "leaveGroup: Error updating chat membership to left:",
          error
        );
      } else {
        router.push("/dashboard");
        console.log(
          "leaveGroup: Successfully left group, redirecting to dashboard."
        );
      }
    } catch (error) {
      console.error("leaveGroup: Caught error during leave group:", error);
    }
  };

  const makeAdmin = async (userId: string) => {
    if (!isAdmin) {
      console.warn(
        "makeAdmin: Current user is not admin, cannot make another user admin."
      );
      return;
    }
    console.log("makeAdmin: Attempting to make user", userId, "admin.");
    try {
      const { error } = await supabase
        .from("chatroom")
        .update({ admin_id: userId })
        .eq("id", chatroomId);

      if (error) {
        console.error("makeAdmin: Error updating chatroom admin_id:", error);
      } else {
        setNotification("Admin role transferred successfully!");
        setTimeout(() => setNotification(null), 3000);
        console.log("makeAdmin: Admin role transferred.");
      }
    } catch (error) {
      console.error("makeAdmin: Caught error during make admin:", error);
    }
  };

  const removeMember = async (userId: string) => {
    if (!isAdmin || userId === currentUser?.id) {
      console.warn(
        "removeMember: Cannot remove member. Either not admin or trying to remove self."
      );
      return;
    }
    console.log("removeMember: Attempting to remove member:", userId);
    try {
      const { error } = await supabase
        .from("chat_membership")
        .update({ left_at: new Date().toISOString() })
        .eq("chatroom_id", chatroomId)
        .eq("user_id", userId);

      if (error) {
        console.error(
          "removeMember: Error removing member from chat_memberships:",
          error
        );
      } else {
        setMembers((prev) => prev.filter((member) => member.id !== userId));
        setNotification("Member removed from group");
        setTimeout(() => setNotification(null), 3000);
        console.log("removeMember: Member removed successfully.");
      }
    } catch (error) {
      console.error("removeMember: Caught error during remove member:", error);
    }
  };

  // This is the point where the UI decides what to render based on the 'loading' state
  if (authLoading || loading) {
    console.log("Render: Displaying Loading state...");
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-lg">Loading chatroom...</div>
      </div>
    );
  }

  // This will only be reached if loading is false
  if (!chatroom) {
    console.log(
      "Render: Loading is false, but chatroom is null. Displaying 'not found' state."
    );
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-lg">Chatroom not found</div>
      </div>
    );
  }

  console.log("Render: Displaying Chatroom content.");
  return (
    <div className="flex flex-col h-screen bg-white">
      {/* Header */}
      <SimpleChatHeader
        chatroomName={`${chatroom.pool.shop.name} Basket Chatroom`}
        memberCount={members.length}
        timeLeft="24h Left" // TODO: Make this value dynamic based on chatroom or pool timing
        onBack={() => router.push("/dashboard")}
      />

      {/* Notification Banner */}
      {notification && (
        <NotificationBanner
          title="Success"
          message={notification}
          type="success"
          onDismiss={() => setNotification(null)}
        />
      )}

      {/* Main Content */}
      <div className="flex-1 flex flex-col overflow-hidden">
        {/* Chat Messages */}
        <div className="flex-1 overflow-y-auto">
          <ChatMessages
            messages={messages}
            currentUserId={currentUser?.id || ""}
          />
        </div>

        {/* Message Input */}
        <div className="border-t border-gray-200">
          <ChatInput
            onSendMessage={sendMessage}
            onUploadFile={uploadFileToStorage}
            disabled={chatroom.state === "resolved"}
          />
        </div>
      </div>

      {/* Order Status and Members */}
      <div className="border-t border-gray-200 p-4 space-y-6">
        {/* Order Status Card */}
        <SimpleOrderStatusCard
          state={chatroom.state}
          poolTotal={chatroom.last_amount}
          orderCount={members.length}
          timeLeft="22h 20m" // TODO: Make this value dynamic based on actual time left
          isAdmin={isAdmin}
          onMarkOrdered={markAsOrdered}
          onMarkDelivered={markAsDelivered}
        />

        {/* Members List */}
        <ChatMembersList
          members={members}
          currentUser={currentUser}
          adminId={chatroom.admin_id || ""}
          isCurrentUserAdmin={isAdmin}
          onMakeAdmin={makeAdmin}
          onRemoveMember={removeMember}
        />

        {/* Action Buttons */}
        <div className="flex flex-col gap-2">
          <Button
            variant="error"
            size="md"
            onClick={leaveGroup}
            className="w-full"
          >
            {chatroom.state === "resolved" ? "Leave Group" : "Leave Order"}
          </Button>
        </div>
      </div>

      {/* Time Extension Modal */}
      {showTimeExtension && (
        <TimeExtensionModal
          isOpen={showTimeExtension}
          timeLeft={{ hours: 2, minutes: 30 }}
          onClose={() => setShowTimeExtension(false)}
          onExtend={() => {
            setShowTimeExtension(false);
            setNotification("Time extended successfully!");
            setTimeout(() => setNotification(null), 3000);
          }}
        />
      )}
    </div>
  );
}
