"use client";

import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import { supabase } from "@/lib/supabase";
import { useAuth } from "@/hooks/useAuth";
import { SimpleChatHeader } from "@/components/chatroom/SimpleChatHeader";
import { ChatMessages } from "@/components/chatroom/ChatMessages";
import { ChatInput } from "@/components/chatroom/ChatInput";
import { OrderDetailsView } from "@/components/chatroom/OrderDetailsView";
import {
  NotificationBanner,
  OrderDeliveredBanner,
  TimeRunningOutBanner,
  OrderPlacedBanner,
} from "@/components/chatroom/NotificationBanner";
import { TimeExtensionModal } from "@/components/chatroom/TimeExtensionModal";
import LoadingBall from "@/components/ui/LoadingBall"; // Assuming the file is LoadingBall.tsx inside components/ui

interface Chatroom {
  id: string;
  pool_id: string;
  state: "waiting" | "active" | "ordered" | "resolved";
  admin_id: string;
  last_amount: number;
  created_at: string;
  updated_at: string;
  expire_at: string; // Added expire_at to match the query
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
  type: "text" | "image" | "audio";
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
  const [currentView, setCurrentView] = useState<"chat" | "orderDetails">(
    "chat"
  );
  const [orderPlaced, setOrderPlaced] = useState(false);
  const [orderDelivered, setOrderDelivered] = useState(false);
  const [timeRunningOut, setTimeRunningOut] = useState(false);
  const [newMemberJoined, setNewMemberJoined] = useState(false);
  const [adminAssigned, setAdminAssigned] = useState(false);

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
                created_at: new Date().toISOString(),
                updated_at: new Date().toISOString(),
                first_name: null,
                last_name: null,
                favorite_store: null,
                image: null,
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
  const refreshChatroom = async () => {
    console.log("Realtime: Refreshing full chatroom data...");
    const { data, error } = await supabase
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

    if (error) {
      console.error("Realtime: Error refreshing chatroom data:", error);
    } else {
      setChatroom(data);
      console.log("Realtime: Chatroom data refreshed.");
    }
  };

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
              type: payload.new.type || "text",
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
          const newStatus = payload.new?.state;

          if (newStatus === "ordered") {
            setOrderPlaced(true);
            setTimeout(() => setOrderPlaced(false), 5000);
          } else if (newStatus === "resolved") {
            setOrderDelivered(true);
            setTimeout(() => setOrderDelivered(false), 5000);
          }

          refreshChatroom();
        }
      )
      .subscribe();

    return () => {
      console.log("Realtime: Unsubscribing from real-time channels.");
      messagesSubscription.unsubscribe();
      chatroomSubscription.unsubscribe();
    };
  }, [chatroomId, authLoading]); // Dependency ensures it re-runs if chatroomId changes or auth state changes.

  // Function for uploading voice or image messages to private "chat-uploads" bucket
  const uploadFileToStorage = async (
    file: File,
    folder: "images" | "audio"
  ): Promise<string | null> => {
    if (!chatroomId) {
      console.error("uploadFileToStorage: chatroomId is missing.");
      return null;
    }
    const randomSuffix = Math.random().toString(36).substring(2, 10);
    const fileName = `${folder}/${chatroomId}_${Date.now()}_${randomSuffix}_${file.name}`;

    // Upload to private "chat-uploads" bucket
    const { error } = await supabase.storage
      .from("chat-uploads")
      .upload(fileName, file, {
        cacheControl: "3600",
        upsert: false,
      });

    if (error) {
      console.error("File upload failed:", error);
      return null;
    }

    // Return only the file path (not a signed URL)
    return fileName;
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
      messageContent = content.url; // Now this is the file path, not a signed URL
      messageType = content.type; // "audio" or "image"
    }

    console.log(`sendMessage: Sending ${messageType} message...`);

    try {
      const { error } = await supabase.from("message").insert({
        chatroom_id: chatroomId,
        user_id: currentUser.id,
        content: messageContent, // file path or plain text
        type: messageType, // "text", "image", or "audio"
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

  // Function to mark the order as placed
  // This function updates the chatroom state to "ordered" and notifies the user.
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
        await refreshChatroom(); // Immediately fetch fresh chatroom state
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
  // Function to mark the order as delivered
  // This function updates the chatroom state to "resolved" and notifies the user.
  // It should only be callable by the admin of the chatroom.
  // If the user is not an admin, it will log a warning and return early.
  // If the update is successful, it will set a notification message for the user.
  // If there is an error during the update, it will log the error to the console
  // and not set the notification.
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
        await refreshChatroom(); // Immediately fetch fresh chatroom state
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
    console.log(
      "leaveGroup: Attempting to leave group via backend function..."
    );

    try {
      // Call the new Supabase RPC function
      const { error } = await supabase.rpc("leave_chatroom", {
        chatroom_id_param: chatroomId, // Ensure parameter name matches your SQL function's parameter
      });

      if (error) {
        console.error("leaveGroup: Error calling backend function:", error);
        // Optionally display a user-friendly error message to the user
        setNotification(`Failed to leave group: ${error.message}`);
        setTimeout(() => setNotification(null), 3000);
      } else {
        router.push("/dashboard"); // Redirect on success
        console.log(
          "leaveGroup: Successfully left group, redirecting to dashboard."
        );
      }
    } catch (error) {
      console.error(
        "leaveGroup: Caught unexpected error during leave group RPC call:",
        error
      );
      setNotification(
        "An unexpected error occurred while processing your request."
      );
      setTimeout(() => setNotification(null), 3000);
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
        await refreshChatroom(); // Immediately fetch fresh chatroom state
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
        <div className="text-lg">
          <LoadingBall size="large" color="shelivery-primary-yellow" />
        </div>
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

  // Show Order Details View
  if (currentView === "orderDetails") {
    return (
      <>
        {/* Notification Banner */}
        {notification && (
          <NotificationBanner
            title="Success"
            message={notification}
            type="success"
            onDismiss={() => setNotification(null)}
          />
        )}

        {orderPlaced && (
          <OrderPlacedBanner onDismiss={() => setOrderPlaced(false)} />
        )}
        {orderDelivered && (
          <OrderDeliveredBanner onDismiss={() => setOrderDelivered(false)} />
        )}

        <OrderDetailsView
          chatroomName={`${chatroom.pool.shop.name} Basket Chatroom`}
          onBack={() => setCurrentView("chat")}
          state={chatroom.state}
          poolTotal={chatroom.last_amount}
          orderCount={members.length}
          timeLeft={chatroom.expire_at}
          isAdmin={isAdmin}
          onMarkOrdered={markAsOrdered}
          onMarkDelivered={markAsDelivered}
          members={members}
          currentUser={currentUser}
          adminId={chatroom.admin_id || ""}
          onMakeAdmin={makeAdmin}
          onRemoveMember={removeMember}
          onLeaveGroup={leaveGroup}
        />

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
      </>
    );
  }

  // Show Chat View (default)
  return (
    <div className="fixed inset-0 flex flex-col bg-white">
      {/* Header */}
      <div className="flex-shrink-0">
        <SimpleChatHeader
          chatroomName={`${chatroom.pool.shop.name} Basket Chatroom`}
          memberCount={members.length}
          timeLeft={chatroom.expire_at}
          onBack={() => router.push("/dashboard")}
          onMenuClick={() => setCurrentView("orderDetails")}
          showMenuButton={true}
        />
      </div>

      {/* Notification Banner */}
      {notification && (
        <div className="flex-shrink-0">
          <NotificationBanner
            title="Success"
            message={notification}
            type="success"
            onDismiss={() => setNotification(null)}
          />
        </div>
      )}
      {orderPlaced && (
        <OrderPlacedBanner onDismiss={() => setOrderPlaced(false)} />
      )}
      {orderDelivered && (
        <OrderDeliveredBanner onDismiss={() => setOrderDelivered(false)} />
      )}
      {timeRunningOut && (
        <TimeRunningOutBanner
          timeLeft="10 minutes"
          onExtend={() => {
            /* your extend logic */
          }}
          onDismiss={() => setTimeRunningOut(false)}
        />
      )}
      {newMemberJoined && (
        <NewMemberBanner
          memberName="Alice"
          onDismiss={() => setNewMemberJoined(false)}
        />
      )}
      {adminAssigned && (
        <AdminAssignedBanner
          adminName="Bob"
          onDismiss={() => setAdminAssigned(false)}
        />
      )}

      {/* Main Content */}
      <div className="flex-1 flex flex-col min-h-0 overflow-hidden">
        {/* Chat Messages */}
        <div className="flex-1 overflow-y-auto">
          <ChatMessages
            messages={messages}
            currentUserId={currentUser?.id || ""}
          />
        </div>

        {/* Message Input */}
        <div className="flex-shrink-0">
          <ChatInput
            onSendMessage={sendMessage}
            onUploadFile={uploadFileToStorage}
            disabled={chatroom.state === "resolved"}
          />
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
