"use client";

import { useEffect, useState, useRef } from "react";
import { useRouter, useParams } from "next/navigation";
import { useAuth } from "@/hooks/useAuth";
import { supabase } from "@/lib/supabase";
import { Button } from "@/components/ui/Button";
import { Navigation } from "@/components/ui/Navigation";
import { Avatar } from "@/components/ui/Avatar";

interface ChatRoom {
  id: string;
  pool_id: string;
  admin_user_id: string;
  status: string;
  created_at: string;
  pool: {
    shop: {
      name: string;
      logo_url: string | null;
    };
    dormitory: {
      name: string;
    };
    threshold_amount: number;
    current_amount: number;
  };
}

interface Message {
  id: string;
  chat_room_id: string;
  user_id: string;
  content: string;
  message_type: string;
  created_at: string;
  user: {
    full_name: string;
    avatar_url: string | null;
  };
}

interface ChatMember {
  id: string;
  user: {
    id: string;
    full_name: string;
    avatar_url: string | null;
  };
  joined_at: string;
}

export default function ChatRoomPage() {
  const [chatRoom, setChatRoom] = useState<ChatRoom | null>(null);
  const [messages, setMessages] = useState<Message[]>([]);
  const [members, setMembers] = useState<ChatMember[]>([]);
  const [newMessage, setNewMessage] = useState("");
  const [loading, setLoading] = useState(true);
  const [sending, setSending] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [isAdmin, setIsAdmin] = useState(false);

  const { user, loading: authLoading } = useAuth();
  const router = useRouter();
  const params = useParams();
  const poolId = params?.poolId as string;
  const messagesEndRef = useRef<HTMLDivElement>(null);

  // Scroll to bottom when new messages arrive
  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  // Redirect if not authenticated
  useEffect(() => {
    if (!authLoading && !user) {
      router.push("/auth");
    }
  }, [user, authLoading, router]);

  // Fetch chat room data
  useEffect(() => {
    const fetchChatRoom = async () => {
      if (!poolId || !user) return;

      try {
        setLoading(true);

        // Get chat room for this pool
        const { data: chatRoomData, error: chatError } = await supabase
          .from("chat_rooms")
          .select(
            `
            id,
            pool_id,
            admin_user_id,
            status,
            created_at,
            pools!inner (
              shops!inner (
                name,
                logo_url
              ),
              dormitories!inner (
                name
              ),
              threshold_amount,
              current_amount
            )
          `
          )
          .eq("pool_id", poolId)
          .single();

        if (chatError) {
          throw new Error("Chat room not found or not accessible");
        }

        // Transform the data to match our interface
        const pool = chatRoomData.pools as any;
        const shop = Array.isArray(pool.shops) ? pool.shops[0] : pool.shops;
        const dormitory = Array.isArray(pool.dormitories)
          ? pool.dormitories[0]
          : pool.dormitories;

        const transformedChatRoom: ChatRoom = {
          id: chatRoomData.id,
          pool_id: chatRoomData.pool_id,
          admin_user_id: chatRoomData.admin_user_id,
          status: chatRoomData.status,
          created_at: chatRoomData.created_at,
          pool: {
            shop: shop,
            dormitory: dormitory,
            threshold_amount: pool.threshold_amount,
            current_amount: pool.current_amount,
          },
        };

        setChatRoom(transformedChatRoom);
        setIsAdmin(chatRoomData.admin_user_id === user.id);

        // Get chat messages
        const { data: messagesData, error: messagesError } = await supabase
          .from("messages")
          .select(
            `
            id,
            chat_room_id,
            user_id,
            content,
            message_type,
            created_at,
            users!messages_user_id_fkey (
              full_name,
              avatar_url
            )
          `
          )
          .eq("chat_room_id", chatRoomData.id)
          .order("created_at", { ascending: true });

        if (messagesError) {
          throw messagesError;
        }

        // Transform messages data with proper null checks
        const transformedMessages: Message[] = (messagesData || [])
          .map((msg: any) => {
            const userData = Array.isArray(msg.users)
              ? msg.users[0]
              : msg.users;

            // Skip messages without valid user data
            if (!userData) return null;

            return {
              id: msg.id,
              chat_room_id: msg.chat_room_id,
              user_id: msg.user_id,
              content: msg.content,
              message_type: msg.message_type,
              created_at: msg.created_at,
              user: userData,
            };
          })
          .filter((msg): msg is Message => msg !== null);

        setMessages(transformedMessages);

        // Get chat members
        const { data: membersData, error: membersError } = await supabase
          .from("chat_memberships")
          .select(
            `
            id,
            joined_at,
            users!chat_memberships_user_id_fkey (
              id,
              full_name,
              avatar_url
            )
          `
          )
          .eq("chat_room_id", chatRoomData.id)
          .order("joined_at");

        if (membersError) {
          throw membersError;
        }

        // Transform members data with proper null checks
        const transformedMembers: ChatMember[] = (membersData || [])
          .map((member: any) => {
            const userData = Array.isArray(member.users)
              ? member.users[0]
              : member.users;

            // Skip members without valid user data
            if (!userData) return null;

            return {
              id: member.id,
              user: userData,
              joined_at: member.joined_at,
            };
          })
          .filter((member): member is ChatMember => member !== null);

        setMembers(transformedMembers);
      } catch (err: any) {
        console.error("Error fetching chat room:", err);
        setError(err.message || "Failed to load chat room");
      } finally {
        setLoading(false);
      }
    };

    fetchChatRoom();
  }, [poolId, user]);

  // Set up real-time subscriptions
  useEffect(() => {
    if (!chatRoom || !user) return;

    // Subscribe to new messages
    const messageChannel = supabase
      .channel(`messages:${chatRoom.id}`)
      .on(
        "postgres_changes",
        {
          event: "INSERT",
          schema: "public",
          table: "messages",
          filter: `chat_room_id=eq.${chatRoom.id}`,
        },
        async (payload) => {
          console.log("New message:", payload);

          // Fetch the complete message with user data
          const { data: newMessageData } = await supabase
            .from("messages")
            .select(
              `
              id,
              chat_room_id,
              user_id,
              content,
              message_type,
              created_at,
              users!messages_user_id_fkey (
                full_name,
                avatar_url
              )
            `
            )
            .eq("id", payload.new.id)
            .single();

          if (newMessageData) {
            const userData = Array.isArray(newMessageData.users)
              ? newMessageData.users[0]
              : newMessageData.users;

            // Only add message if user data is valid
            if (userData) {
              const transformedMessage: Message = {
                id: newMessageData.id,
                chat_room_id: newMessageData.chat_room_id,
                user_id: newMessageData.user_id,
                content: newMessageData.content,
                message_type: newMessageData.message_type,
                created_at: newMessageData.created_at,
                user: userData,
              };
              setMessages((prev) => [...prev, transformedMessage]);
            }
          }
        }
      )
      .subscribe();

    // Subscribe to chat room status changes
    const roomChannel = supabase
      .channel(`chat_room:${chatRoom.id}`)
      .on(
        "postgres_changes",
        {
          event: "UPDATE",
          schema: "public",
          table: "chat_rooms",
          filter: `id=eq.${chatRoom.id}`,
        },
        (payload) => {
          console.log("Chat room updated:", payload);
          if (payload.new.status === "resolved") {
            // Room has been resolved, redirect to dashboard
            router.push("/dashboard");
          }
        }
      )
      .subscribe();

    return () => {
      messageChannel.unsubscribe();
      roomChannel.unsubscribe();
    };
  }, [chatRoom, user, poolId, router]);

  const handleSendMessage = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newMessage.trim() || !chatRoom || !user || sending) return;

    setSending(true);
    setError(null);

    try {
      const { error } = await supabase.from("messages").insert([
        {
          chat_room_id: chatRoom.id,
          user_id: user.id,
          content: newMessage.trim(),
          message_type: "user_message",
        },
      ]);

      if (error) {
        throw error;
      }

      // Track message sent event
      await supabase.rpc("track_event", {
        event_type_param: "message_sent",
        metadata_param: {
          user_id: user.id,
          chat_room_id: chatRoom.id,
          pool_id: poolId,
        },
      });

      setNewMessage("");
    } catch (err: any) {
      console.error("Error sending message:", err);
      setError(err.message || "Failed to send message");
    } finally {
      setSending(false);
    }
  };

  const handleResolveRoom = async () => {
    if (!chatRoom || !isAdmin || !user) return;

    try {
      const { error } = await supabase.rpc("resolve_chatroom", {
        chat_room_id_param: chatRoom.id,
      });

      if (error) {
        throw error;
      }

      // Track room resolution
      await supabase.rpc("track_event", {
        event_type_param: "chat_room_resolved",
        metadata_param: {
          user_id: user.id,
          chat_room_id: chatRoom.id,
          pool_id: poolId,
        },
      });
    } catch (err: any) {
      console.error("Error resolving chat room:", err);
      setError(err.message || "Failed to resolve chat room");
    }
  };

  if (authLoading || loading) {
    return (
      <div className="min-h-screen bg-shelivery-background-gray">
        <Navigation />
        <div className="flex items-center justify-center pt-20">
          <div className="text-center">
            <div className="w-8 h-8 border-4 border-shelivery-primary-yellow border-t-transparent rounded-full animate-spin mx-auto mb-4" />
            <p className="text-shelivery-text-secondary">Loading chat...</p>
          </div>
        </div>
      </div>
    );
  }

  if (!user) {
    return null; // Will redirect
  }

  if (error && !chatRoom) {
    return (
      <div className="min-h-screen bg-shelivery-background-gray">
        <Navigation />
        <div className="flex items-center justify-center pt-20 p-4">
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
              Chat Room Not Available
            </h2>
            <p className="text-shelivery-text-secondary mb-6">{error}</p>
            <Button onClick={() => router.push(`/pool/${poolId}`)}>
              Back to Pool
            </Button>
          </div>
        </div>
      </div>
    );
  }

  if (!chatRoom) return null;

  const formatTime = (timestamp: string) => {
    return new Date(timestamp).toLocaleTimeString([], {
      hour: "2-digit",
      minute: "2-digit",
    });
  };

  const formatDate = (timestamp: string) => {
    const date = new Date(timestamp);
    const today = new Date();
    const yesterday = new Date(today);
    yesterday.setDate(yesterday.getDate() - 1);

    if (date.toDateString() === today.toDateString()) {
      return "Today";
    } else if (date.toDateString() === yesterday.toDateString()) {
      return "Yesterday";
    } else {
      return date.toLocaleDateString();
    }
  };

  // Group messages by date
  const groupedMessages = messages.reduce(
    (groups: { [key: string]: Message[] }, message) => {
      const date = formatDate(message.created_at);
      if (!groups[date]) {
        groups[date] = [];
      }
      groups[date].push(message);
      return groups;
    },
    {}
  );

  return (
    <div className="min-h-screen bg-shelivery-background-gray flex flex-col">
      <Navigation />

      {/* Chat Header */}
      <div className="pt-20 bg-white border-b border-gray-200 flex-shrink-0">
        <div className="px-4 py-4 max-w-2xl mx-auto">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <button
                onClick={() => router.push(`/pool/${poolId}`)}
                className="flex items-center gap-2 text-shelivery-text-secondary hover:text-shelivery-text-primary"
              >
                <svg
                  className="w-5 h-5"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M15 19l-7-7 7-7"
                  />
                </svg>
              </button>

              <div className="flex items-center gap-3">
                <div className="w-10 h-10 bg-gray-100 rounded-shelivery-md flex items-center justify-center">
                  {chatRoom.pool.shop.logo_url ? (
                    <img
                      src={chatRoom.pool.shop.logo_url}
                      alt={chatRoom.pool.shop.name}
                      className="w-full h-full object-cover rounded-shelivery-md"
                    />
                  ) : (
                    <svg
                      className="w-5 h-5 text-gray-400"
                      fill="none"
                      stroke="currentColor"
                      viewBox="0 0 24 24"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10"
                      />
                    </svg>
                  )}
                </div>
                <div>
                  <h1 className="text-lg font-semibold text-shelivery-text-primary">
                    {chatRoom.pool.shop.name}
                  </h1>
                  <p className="text-sm text-shelivery-text-secondary">
                    {chatRoom.pool.dormitory.name} • {members.length} members
                  </p>
                </div>
              </div>
            </div>

            {isAdmin && (
              <Button onClick={handleResolveRoom} variant="secondary" size="sm">
                Mark Complete
              </Button>
            )}
          </div>
        </div>
      </div>

      {/* Messages Area */}
      <div className="flex-1 overflow-y-auto px-4 py-4 max-w-2xl mx-auto w-full">
        {Object.entries(groupedMessages).map(([date, dateMessages]) => (
          <div key={date}>
            {/* Date Separator */}
            <div className="flex items-center justify-center my-4">
              <div className="bg-gray-100 text-shelivery-text-secondary text-sm px-3 py-1 rounded-full">
                {date}
              </div>
            </div>

            {/* Messages for this date */}
            {dateMessages.map((message, index) => {
              const isOwnMessage = message.user_id === user?.id;
              const showAvatar =
                index === 0 ||
                (index > 0 &&
                  dateMessages[index - 1]?.user_id !== message.user_id);

              return (
                <div
                  key={message.id}
                  className={`flex gap-3 mb-4 ${isOwnMessage ? "flex-row-reverse" : ""}`}
                >
                  <div className="flex-shrink-0">
                    {showAvatar ? (
                      <Avatar
                        src={message.user.avatar_url}
                        name={message.user.full_name}
                        size="sm"
                      />
                    ) : (
                      <div className="w-8 h-8" />
                    )}
                  </div>

                  <div
                    className={`flex-1 max-w-xs ${isOwnMessage ? "items-end" : "items-start"} flex flex-col`}
                  >
                    {showAvatar && (
                      <div
                        className={`flex items-center gap-2 mb-1 ${isOwnMessage ? "flex-row-reverse" : ""}`}
                      >
                        <span className="text-sm font-medium text-shelivery-text-primary">
                          {isOwnMessage ? "You" : message.user.full_name}
                        </span>
                        <span className="text-xs text-shelivery-text-tertiary">
                          {formatTime(message.created_at)}
                        </span>
                      </div>
                    )}

                    <div
                      className={`rounded-shelivery-lg px-3 py-2 break-words ${
                        isOwnMessage
                          ? "bg-shelivery-primary-yellow text-shelivery-text-primary"
                          : "bg-white border border-gray-200 text-shelivery-text-primary"
                      }`}
                    >
                      {message.content}
                    </div>

                    {!showAvatar && (
                      <span className="text-xs text-shelivery-text-tertiary mt-1">
                        {formatTime(message.created_at)}
                      </span>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        ))}

        {messages.length === 0 && (
          <div className="text-center py-8">
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
            <h3 className="text-lg font-semibold text-shelivery-text-primary mb-2">
              Welcome to your delivery chat!
            </h3>
            <p className="text-shelivery-text-secondary">
              Coordinate with your group to manage the delivery.
            </p>
          </div>
        )}

        <div ref={messagesEndRef} />
      </div>

      {/* Message Input */}
      <div className="bg-white border-t border-gray-200 p-4 flex-shrink-0">
        <div className="max-w-2xl mx-auto">
          {error && (
            <div className="mb-3 bg-red-50 border border-red-200 text-red-700 px-3 py-2 rounded-shelivery-sm text-sm">
              {error}
            </div>
          )}

          <form onSubmit={handleSendMessage} className="flex gap-3">
            <input
              type="text"
              value={newMessage}
              onChange={(e) => setNewMessage(e.target.value)}
              placeholder="Type a message..."
              className="flex-1 px-4 py-2 border border-gray-300 rounded-shelivery-lg focus:outline-none focus:ring-2 focus:ring-shelivery-primary-yellow focus:border-transparent"
              disabled={sending}
            />
            <Button
              type="submit"
              loading={sending}
              disabled={!newMessage.trim() || sending}
              size="sm"
            >
              Send
            </Button>
          </form>
        </div>
      </div>
    </div>
  );
}
