"use client";

import { useState, useEffect } from "react";
import { useRouter, useParams } from "next/navigation";
import { SimpleChatHeader } from "@/components/chatroom/SimpleChatHeader";
import { ChatMessages } from "@/components/chatroom/ChatMessages";
import { ChatInput } from "@/components/chatroom/ChatInput";

const mockChatroom = {
  id: "test-chatroom-1",
  name: "Coop Basket Chatroom",
  members: [
    { id: "user-1", first_name: "Test User", image: "/avatars/default-avatar.png" },
    { id: "user-2", first_name: "John", image: "/avatars/Others Avatar 01.png" },
  ],
};

const mockMessages = [
  {
    id: 1,
    chatroom_id: "test-chatroom-1",
    user_id: "user-2",
    content: "Hey everyone! I'm heading to Coop now.",
    type: "text",
    sent_at: new Date(new Date().getTime() - 5 * 60000).toISOString(),
    user: { id: "user-2", first_name: "John", image: "/avatars/Others Avatar 01.png" },
  },
  {
    id: 2,
    chatroom_id: "test-chatroom-1",
    user_id: "user-1",
    content: "Great! Can you please get me some milk?",
    type: "text",
    sent_at: new Date(new Date().getTime() - 4 * 60000).toISOString(),
    user: { id: "user-1", first_name: "Test User", image: "/avatars/default-avatar.png" },
  },
];

export default function TestChatroomPage() {
  const router = useRouter();
  const params = useParams();
  const chatroomId = params.chatroomId as string;

  const [messages, setMessages] = useState(mockMessages);
  const [currentUser] = useState({ id: "user-1", first_name: "Test User", image: "/avatars/default-avatar.png" });

  const handleSendMessage = (content: string, type: "text" | "image" | "audio" = "text") => {
    const newMessage = {
      id: messages.length + 1,
      chatroom_id: chatroomId,
      user_id: currentUser.id,
      content,
      type,
      sent_at: new Date().toISOString(),
      user: currentUser,
    };
    setMessages([...messages, newMessage]);
  };

  return (
    <div className="fixed inset-0 flex flex-col bg-white">
      <div className="flex-shrink-0">
        <SimpleChatHeader
          chatroomName={mockChatroom.name}
          memberCount={mockChatroom.members.length}
          onBack={() => router.push("/test/chatrooms")}
          onMenuClick={() => {}}
          showMenuButton={false}
        />
      </div>
      <div className="flex-1 flex flex-col min-h-0 overflow-hidden">
        <div className="flex-1 overflow-y-auto">
          <ChatMessages messages={messages} currentUserId={currentUser.id} />
        </div>
        <div className="flex-shrink-0">
          <ChatInput
            onSendMessage={handleSendMessage}
            onUploadFile={() => {}}
            disabled={false}
            chatroomId={chatroomId}
          />
        </div>
      </div>
    </div>
  );
}
