"use client";

import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import { createClientComponentClient } from "@supabase/auth-helpers-nextjs";
import { SimpleChatHeader } from "@/components/chatroom/SimpleChatHeader";
import { ChatMessages } from "@/components/chatroom/ChatMessages";
import { MessageInput } from "@/components/chatroom/MessageInput";
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
  created_at: string;
  updated_at: string;
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
  const supabase = createClientComponentClient();
  const chatroomId = params.chatroomId as string;

  const [chatroom, setChatroom] = useState<Chatroom | null>(null);
  const [members, setMembers] = useState<ChatMember[]>([]);
  const [messages, setMessages] = useState<MessageType[]>([]);
  const [currentUser, setCurrentUser] = useState<User | null>(null);
  const [isAdmin, setIsAdmin] = useState(false);
  const [loading, setLoading] = useState(true);
  const [showTimeExtension, setShowTimeExtension] = useState(false);
  const [notification, setNotification] = useState<string | null>(null);

  // Get current user
  useEffect(() => {
    const getCurrentUser = async () => {
      const {
        data: { user },
      } = await supabase.auth.getUser();
      if (user) {
        const { data: profile } = await supabase
          .from("users")
          .select("*")
          .eq("id", user.id)
          .single();
        setCurrentUser(profile);
      }
    };
    getCurrentUser();
  }, [supabase]);

  // Load chatroom data
  useEffect(() => {
    const loadChatroomData = async () => {
      if (!currentUser) return;

      try {
        // Get chatroom with pool and shop info
        const { data: chatroomData, error: chatroomError } = await supabase
          .from("chatrooms")
          .select(
            `
            *,
            pool:pools(
              id,
              shop_id,
              dormitory_id,
              current_amount,
              min_amount,
              created_at,
              shop:shops(id, name, min_amount, created_at),
              dormitory:dormitories(id, name)
            )
          `
          )
          .eq("id", chatroomId)
          .single();

        if (chatroomError) throw chatroomError;
        setChatroom(chatroomData);
        setIsAdmin(chatroomData.admin_id === currentUser.id);

        // Get members - simplified query
        const { data: membershipsData, error: membershipsError } =
          await supabase
            .from("chat_memberships")
            .select("user_id")
            .eq("chatroom_id", chatroomId)
            .is("left_at", null);

        if (membershipsError) throw membershipsError;

        // Get user details for members
        if (membershipsData && membershipsData.length > 0) {
          const userIds = membershipsData.map((m) => m.user_id);
          const { data: usersData, error: usersError } = await supabase
            .from("users")
            .select("*")
            .in("id", userIds);

          if (usersError) throw usersError;

          // Get baskets for these users
          const { data: basketsData, error: basketsError } = await supabase
            .from("baskets")
            .select("*")
            .in("user_id", userIds)
            .eq("status", "in_chat");

          if (basketsError) throw basketsError;

          // Combine user and basket data
          const processedMembers: ChatMember[] =
            usersData?.map((user) => ({
              ...user,
              basket:
                basketsData?.find((basket) => basket.user_id === user.id) ||
                null,
            })) || [];

          setMembers(processedMembers);
        }

        // Get messages - simplified query
        const { data: messagesData, error: messagesError } = await supabase
          .from("messages")
          .select("*")
          .eq("chatroom_id", chatroomId)
          .order("sent_at", { ascending: true });

        if (messagesError) throw messagesError;

        // Get user data for messages
        if (messagesData && messagesData.length > 0) {
          const uniqueUserIds = messagesData.map((m) => m.user_id);
          const messageUserIds = Array.from(new Set(uniqueUserIds));

          const { data: messageUsersData, error: messageUsersError } =
            await supabase.from("users").select("*").in("id", messageUserIds);

          if (messageUsersError) throw messageUsersError;

          const processedMessages: MessageType[] = messagesData.map(
            (message) => ({
              ...message,
              user: messageUsersData?.find(
                (user) => user.id === message.user_id
              ) || {
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
        }
      } catch (error) {
        console.error("Error loading chatroom:", error);
      } finally {
        setLoading(false);
      }
    };

    loadChatroomData();
  }, [currentUser, chatroomId, supabase]);

  // Real-time subscriptions
  useEffect(() => {
    if (!chatroomId) return;

    // Subscribe to new messages
    const messagesSubscription = supabase
      .channel(`messages:${chatroomId}`)
      .on(
        "postgres_changes",
        {
          event: "INSERT",
          schema: "public",
          table: "messages",
          filter: `chatroom_id=eq.${chatroomId}`,
        },
        async (payload) => {
          // Get user data for the new message
          const { data: userData } = await supabase
            .from("users")
            .select("*")
            .eq("id", payload.new.user_id)
            .single();

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
          table: "chatrooms",
          filter: `id=eq.${chatroomId}`,
        },
        (payload) => {
          setChatroom((prev) => (prev ? { ...prev, ...payload.new } : null));
        }
      )
      .subscribe();

    return () => {
      messagesSubscription.unsubscribe();
      chatroomSubscription.unsubscribe();
    };
  }, [chatroomId, supabase]);

  const sendMessage = async (content: string) => {
    if (!currentUser || !content.trim()) return;

    try {
      await supabase.from("messages").insert({
        chatroom_id: chatroomId,
        user_id: currentUser.id,
        content: content.trim(),
      });
    } catch (error) {
      console.error("Error sending message:", error);
    }
  };

  const markAsOrdered = async () => {
    if (!isAdmin) return;

    try {
      await supabase
        .from("chatrooms")
        .update({ state: "ordered" })
        .eq("id", chatroomId);

      setNotification("Order has been marked as placed!");
      setTimeout(() => setNotification(null), 3000);
    } catch (error) {
      console.error("Error marking as ordered:", error);
    }
  };

  const markAsDelivered = async () => {
    if (!isAdmin) return;

    try {
      await supabase
        .from("chatrooms")
        .update({ state: "resolved" })
        .eq("id", chatroomId);

      setNotification("Order has been marked as delivered!");
      setTimeout(() => setNotification(null), 3000);
    } catch (error) {
      console.error("Error marking as delivered:", error);
    }
  };

  const leaveGroup = async () => {
    if (!currentUser) return;

    try {
      await supabase
        .from("chat_memberships")
        .update({ left_at: new Date().toISOString() })
        .eq("chatroom_id", chatroomId)
        .eq("user_id", currentUser.id);

      router.push("/dashboard");
    } catch (error) {
      console.error("Error leaving group:", error);
    }
  };

  const makeAdmin = async (userId: string) => {
    if (!isAdmin) return;

    try {
      await supabase
        .from("chatrooms")
        .update({ admin_id: userId })
        .eq("id", chatroomId);

      setNotification("Admin role transferred successfully!");
      setTimeout(() => setNotification(null), 3000);
    } catch (error) {
      console.error("Error making admin:", error);
    }
  };

  const removeMember = async (userId: string) => {
    if (!isAdmin || userId === currentUser?.id) return;

    try {
      await supabase
        .from("chat_memberships")
        .update({ left_at: new Date().toISOString() })
        .eq("chatroom_id", chatroomId)
        .eq("user_id", userId);

      setMembers((prev) => prev.filter((member) => member.id !== userId));
      setNotification("Member removed from group");
      setTimeout(() => setNotification(null), 3000);
    } catch (error) {
      console.error("Error removing member:", error);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-lg">Loading chatroom...</div>
      </div>
    );
  }

  if (!chatroom) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-lg">Chatroom not found</div>
      </div>
    );
  }

  return (
    <div className="flex flex-col h-screen bg-white">
      {/* Header */}
      <SimpleChatHeader
        chatroomName={`${chatroom.pool.shop.name} Basket Chatroom`}
        memberCount={members.length}
        timeLeft="24h Left"
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
          <MessageInput onSendMessage={sendMessage} />
        </div>
      </div>

      {/* Order Status and Members */}
      <div className="border-t border-gray-200 p-4 space-y-6">
        {/* Order Status Card */}
        <SimpleOrderStatusCard
          state={chatroom.state}
          poolTotal={chatroom.pool.current_amount}
          orderCount={members.length}
          timeLeft="22h 20m"
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
