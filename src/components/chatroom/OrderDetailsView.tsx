"use client";

import { ArrowLeft } from "lucide-react";
import { SimpleOrderStatusCard } from "@/components/chatroom/SimpleOrderStatusCard";
import { ChatMembersList } from "@/components/chatroom/ChatMembersList";
import { Button } from "@/components/ui/Button";
import {
  OrderPlacedBanner,
  OrderDeliveredBanner,
  TimeRunningOutBanner,
  NewMemberBanner,
  AdminAssignedBanner,
} from "./NotificationBanner";

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

interface OrderDetailsViewProps {
  chatroomName: string;
  onBack: () => void;
  // Order Status Card props
  state: "waiting" | "active" | "ordered" | "resolved";
  poolTotal: number;
  orderCount: number;
  timeLeft: string;
  isAdmin: boolean;
  onMarkOrdered?: () => void;
  onMarkDelivered?: () => void;
  // Members List props
  members: ChatMember[];
  currentUser: User | null;
  adminId: string;
  onMakeAdmin: (userId: string) => void;
  onRemoveMember: (userId: string) => void;
  // Actions
  onLeaveGroup: () => void;
  // Notification props
  orderPlaced: boolean;
  orderDelivered: boolean;
  timeRunningOut: boolean;
  newMemberJoined: boolean;
  adminAssigned: boolean;
  onDismissOrderPlaced: () => void;
  onDismissOrderDelivered: () => void;
  onDismissTimeRunningOut: () => void;
  onDismissNewMember: () => void;
  onDismissAdminAssigned: () => void;
  onExtendTime: () => void;
}

export function OrderDetailsView({
  chatroomName,
  onBack,
  state,
  poolTotal,
  orderCount,
  timeLeft,
  isAdmin,
  onMarkOrdered,
  onMarkDelivered,
  members,
  currentUser,
  adminId,
  onMakeAdmin,
  onRemoveMember,
  onLeaveGroup,
  orderPlaced,
  orderDelivered,
  timeRunningOut,
  newMemberJoined,
  adminAssigned,
  onDismissOrderPlaced,
  onDismissOrderDelivered,
  onDismissTimeRunningOut,
  onDismissNewMember,
  onDismissAdminAssigned,
  onExtendTime,
}: OrderDetailsViewProps) {
  return (
    <div className="fixed inset-0 flex flex-col bg-white">
      {/* Header */}
      <div className="bg-white border-b border-gray-200 px-4 py-4">
        <div className="flex items-center gap-4">
          <button
            onClick={onBack}
            className="p-1 hover:bg-gray-100 rounded-full transition-colors"
          >
            <ArrowLeft className="h-6 w-6 text-gray-700" />
          </button>
          <div className="flex-1">
            <h1 className="font-bold text-lg text-gray-900">{chatroomName}</h1>
            <span className="font-normal">
              {members.length} Member{members.length !== 1 ? "s" : ""}
            </span>
          </div>
        </div>
      </div>

      {/* Notification Banners */}
      {orderPlaced && <OrderPlacedBanner onDismiss={onDismissOrderPlaced} />}
      {orderDelivered && (
        <OrderDeliveredBanner onDismiss={onDismissOrderDelivered} />
      )}
      {timeRunningOut && (
        <TimeRunningOutBanner
          timeLeft="10 minutes"
          onExtend={onExtendTime}
          onDismiss={onDismissTimeRunningOut}
        />
      )}
      {newMemberJoined && (
        <NewMemberBanner memberName="Alice" onDismiss={onDismissNewMember} />
      )}
      {adminAssigned && (
        <AdminAssignedBanner
          adminName="Bob"
          onDismiss={onDismissAdminAssigned}
        />
      )}

      {/* Content */}
      <div className="flex-1 flex flex-col min-h-0 overflow-hidden px-4 py-4 gap-y-4">
        <SimpleOrderStatusCard
          state={state}
          poolTotal={poolTotal}
          orderCount={orderCount}
          timeLeft={timeLeft}
          isAdmin={isAdmin}
          onMarkOrdered={onMarkOrdered || (() => {})}
          onMarkDelivered={onMarkDelivered || (() => {})}
        />

        <ChatMembersList
          members={members}
          currentUser={currentUser}
          adminId={adminId}
          isCurrentUserAdmin={isAdmin}
          onMakeAdmin={onMakeAdmin}
          onRemoveMember={onRemoveMember}
        />

        <div className="flex flex-col gap-2 pb-6">
          <Button
            variant="error"
            size="md"
            onClick={onLeaveGroup}
            className="w-full"
          >
            {state === "resolved" ? "Leave Group" : "Leave Order"}
          </Button>
        </div>
      </div>
    </div>
  );
}
