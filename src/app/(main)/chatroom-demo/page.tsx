"use client";

import { useState } from "react";
import { SimpleChatHeader } from "@/components/chatroom/SimpleChatHeader";
import { ChatMessages } from "@/components/chatroom/ChatMessages";
import { MessageInput } from "@/components/chatroom/MessageInput";
import { ChatMembersList } from "@/components/chatroom/ChatMembersList";
import { SimpleOrderStatusCard } from "@/components/chatroom/SimpleOrderStatusCard";
import { TimeExtensionModal } from "@/components/chatroom/TimeExtensionModal";
import { NotificationBanner } from "@/components/chatroom/NotificationBanner";
import { Button } from "@/components/ui/Button";

// Mock data matching the new interfaces
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

// Mock current user
const mockCurrentUser: User = {
  id: "user-1",
  email: "alice@example.com",
  dormitory_id: 1,
  profile: {
    display_name: "Alice Johnson",
    avatar_url: "/avatars/User Avatar.png",
  },
  created_at: new Date().toISOString(),
  updated_at: new Date().toISOString(),
};

// Mock members
const mockMembers: ChatMember[] = [
  {
    id: "user-1",
    email: "alice@example.com",
    dormitory_id: 1,
    profile: {
      display_name: "Alice Johnson",
      avatar_url: "/avatars/User Avatar.png",
    },
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString(),
    basket: {
      id: "basket-1",
      user_id: "user-1",
      shop_id: 1,
      link: "https://migros.ch/cart/abc123",
      amount: 45,
      status: "in_chat",
      is_ready: true,
      pool_id: "demo-pool-456",
      chatroom_id: "demo-room-123",
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
    },
  },
  {
    id: "user-2",
    email: "bob@example.com",
    dormitory_id: 1,
    profile: {
      display_name: "Bob Smith",
      avatar_url: "/avatars/Others Avatar 01.png",
    },
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString(),
    basket: {
      id: "basket-2",
      user_id: "user-2",
      shop_id: 1,
      link: "https://migros.ch/cart/def456",
      amount: 40,
      status: "in_chat",
      is_ready: true,
      pool_id: "demo-pool-456",
      chatroom_id: "demo-room-123",
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
    },
  },
  {
    id: "user-3",
    email: "carol@example.com",
    dormitory_id: 1,
    profile: {
      display_name: "Carol Davis",
      avatar_url: "/avatars/Others Avatar 02.png",
    },
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString(),
    basket: null,
  },
];

// Mock messages
const initialMockMessages: MessageType[] = [
  {
    id: 1,
    chatroom_id: "demo-room-123",
    user_id: "user-1",
    content:
      "Hey everyone! I've got some groceries ready. Anyone else joining?",
    sent_at: new Date(Date.now() - 30 * 60 * 1000).toISOString(),
    read_at: null,
    user: {
      id: "user-1",
      email: "alice@example.com",
      dormitory_id: 1,
      profile: {
        display_name: "Alice Johnson",
        avatar_url: "/avatars/User Avatar.png",
      },
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
    },
  },
  {
    id: 2,
    chatroom_id: "demo-room-123",
    user_id: "user-2",
    content:
      "Yes! I'm in. Got $40 worth of items. We're almost at the minimum!",
    sent_at: new Date(Date.now() - 25 * 60 * 1000).toISOString(),
    read_at: null,
    user: {
      id: "user-2",
      email: "bob@example.com",
      dormitory_id: 1,
      profile: {
        display_name: "Bob Smith",
        avatar_url: "/avatars/Others Avatar 01.png",
      },
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
    },
  },
  {
    id: 3,
    chatroom_id: "demo-room-123",
    user_id: "user-1",
    content:
      "Perfect! Just need $15 more to get free delivery. Carol, are you planning to add anything?",
    sent_at: new Date(Date.now() - 20 * 60 * 1000).toISOString(),
    read_at: null,
    user: {
      id: "user-1",
      email: "alice@example.com",
      dormitory_id: 1,
      profile: {
        display_name: "Alice Johnson",
        avatar_url: "/avatars/User Avatar.png",
      },
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
    },
  },
  {
    id: 4,
    chatroom_id: "demo-room-123",
    user_id: "user-2",
    content:
      "I can add a few more items if needed. We have about 22 hours left.",
    sent_at: new Date(Date.now() - 5 * 60 * 1000).toISOString(),
    read_at: null,
    user: {
      id: "user-2",
      email: "bob@example.com",
      dormitory_id: 1,
      profile: {
        display_name: "Bob Smith",
        avatar_url: "/avatars/Others Avatar 01.png",
      },
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
    },
  },
];

export default function ChatroomDemo() {
  const [messages, setMessages] = useState<MessageType[]>(initialMockMessages);
  const [members, setMembers] = useState<ChatMember[]>(mockMembers);
  const [chatroomState, setChatroomState] = useState<
    "waiting" | "active" | "ordered" | "resolved"
  >("active");
  const [isAdmin, setIsAdmin] = useState(true);
  const [showTimeExtension, setShowTimeExtension] = useState(false);
  const [notification, setNotification] = useState<string | null>(null);

  const sendMessage = (content: string) => {
    const newMessage: MessageType = {
      id: messages.length + 1,
      chatroom_id: "demo-room-123",
      user_id: mockCurrentUser.id,
      content,
      sent_at: new Date().toISOString(),
      read_at: null,
      user: mockCurrentUser,
    };
    setMessages([...messages, newMessage]);
  };

  const markAsOrdered = () => {
    setChatroomState("ordered");
    setNotification("Order has been marked as placed!");
    setTimeout(() => setNotification(null), 3000);
  };

  const markAsDelivered = () => {
    setChatroomState("resolved");
    setNotification("Order has been marked as delivered!");
    setTimeout(() => setNotification(null), 3000);
  };

  const makeAdmin = (userId: string) => {
    setNotification(
      `${members.find((m) => m.id === userId)?.profile?.display_name || "User"} is now admin!`
    );
    setTimeout(() => setNotification(null), 3000);
  };

  const removeMember = (userId: string) => {
    const memberName =
      members.find((m) => m.id === userId)?.profile?.display_name || "User";
    setMembers((prev) => prev.filter((member) => member.id !== userId));
    setNotification(`${memberName} has been removed from the chat`);
    setTimeout(() => setNotification(null), 3000);
  };

  const leaveGroup = () => {
    setNotification("You have left the chatroom");
    setTimeout(() => setNotification(null), 3000);
  };

  return (
    <div className="min-h-screen bg-gray-100">
      {/* Demo Header */}
      <div className="bg-blue-600 text-white p-4 text-center">
        <h1 className="text-xl font-semibold">Shelivery Chatroom Demo</h1>
        <p className="text-blue-100 text-sm">
          Interactive preview with new components and functionality
        </p>
      </div>

      <div className="flex min-h-screen bg-white">
        {/* Main Chat Area */}
        <div className="flex-1 flex flex-col h-screen">
          {/* Chat Header */}
          <SimpleChatHeader
            chatroomName="Migros Basket Chatroom"
            memberCount={members.length}
            timeLeft="22h 15m Left"
            onBack={() => setNotification("Back button clicked")}
          />

          {/* Notification Banner */}
          {notification && (
            <NotificationBanner
              title="Demo Notification"
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
                currentUserId={mockCurrentUser.id}
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
              state={chatroomState}
              poolTotal={85}
              orderCount={members.length}
              timeLeft="22h 15m"
              isAdmin={isAdmin}
              onMarkOrdered={markAsOrdered}
              onMarkDelivered={markAsDelivered}
            />

            {/* Members List */}
            <ChatMembersList
              members={members}
              currentUser={mockCurrentUser}
              adminId="user-1"
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
                {chatroomState === "resolved" ? "Leave Group" : "Leave Order"}
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
      </div>

      {/* Demo Controls */}
      <div className="fixed bottom-4 right-4 bg-white rounded-lg shadow-lg p-4 border">
        <h3 className="font-semibold text-gray-900 mb-3">Demo Controls</h3>
        <div className="space-y-2">
          <button
            onClick={() => setShowTimeExtension(true)}
            className="w-full text-left px-3 py-2 text-sm bg-blue-50 hover:bg-blue-100 rounded transition-colors"
          >
            Show Time Extension Modal
          </button>
          <button
            onClick={() => setNotification("This is a test notification!")}
            className="w-full text-left px-3 py-2 text-sm bg-green-50 hover:bg-green-100 rounded transition-colors"
          >
            Test Notification
          </button>
          <button
            onClick={() => {
              const states: ("waiting" | "active" | "ordered" | "resolved")[] =
                ["waiting", "active", "ordered", "resolved"];
              const currentIndex = states.indexOf(chatroomState);
              const nextState =
                states[(currentIndex + 1) % states.length] || "waiting";
              setChatroomState(nextState);
              setNotification(`State changed to: ${nextState}`);
              setTimeout(() => setNotification(null), 2000);
            }}
            className="w-full text-left px-3 py-2 text-sm bg-purple-50 hover:bg-purple-100 rounded transition-colors"
          >
            Cycle State: {chatroomState}
          </button>
          <button
            onClick={() => setIsAdmin(!isAdmin)}
            className="w-full text-left px-3 py-2 text-sm bg-orange-50 hover:bg-orange-100 rounded transition-colors"
          >
            Toggle Admin: {isAdmin ? "Yes" : "No"}
          </button>
        </div>
      </div>
    </div>
  );
}
