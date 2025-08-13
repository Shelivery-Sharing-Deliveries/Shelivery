"use client";

import React from "react";
import Image from "next/image";
import { Button } from "@/components/ui/Button";
import { formatDistanceToNowStrict, parseISO } from "date-fns";
import { ArrowLeft } from "lucide-react";
import { SimpleOrderStatusCard } from "@/components/chatroom/SimpleOrderStatusCard";
import { ChatMembersList } from "@/components/chatroom/ChatMembersList";
import {
    NotificationBanner,
    OrderDeliveredBanner,
    TimeRunningOutBanner,
    NewMemberBanner,
    AdminAssignedBanner,
    OrderPlacedBanner,
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
        note: string | null;
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
    state: "waiting" | "active" | "ordered" | "resolved";
    poolTotal: number;
    orderCount: number;
    timeLeft: string;
    isAdmin: boolean;
    onMarkOrdered?: () => void;
    onMarkDelivered?: () => void;
    members: ChatMember[];
    currentUser: User | null;
    adminId: string;
    onMakeAdmin: (userId: string) => void;
    onRemoveMember: (userId: string) => void;
    onLeaveGroup: () => void;
    onExtendTime: () => void;
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
    showTutorial: boolean;
    tutorialStepIds: { [key: string]: string };
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
    showTutorial,
    tutorialStepIds,
}: OrderDetailsViewProps) {
    const isOrderPlaced = state === "ordered" || state === "resolved";
    const isOrderDelivered = state === "resolved";
    // const allMembersReady = members.every(member => member.basket?.is_ready); // Kept for reference but not used for Mark as Ordered button disabled state

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
                    id={tutorialStepIds?.["order-details-ready-status"] || ""}
                    state={state}
                    poolTotal={poolTotal}
                    orderCount={orderCount}
                    timeLeft={timeLeft}
                    isAdmin={isAdmin}
                    onMarkOrdered={onMarkOrdered || (() => { })}
                    onMarkDelivered={onMarkDelivered || (() => { })}
                />

                {/* ChatMembersList */}
                <div id={tutorialStepIds?.membersList} className="bg-white rounded-lg p-4 shadow-sm border border-gray-200">
                    <h2 className="text-lg font-bold text-gray-800 mb-3">Group Members</h2>
                    <ChatMembersList
                        members={members}
                        currentUser={currentUser}
                        adminId={adminId}
                        isCurrentUserAdmin={isAdmin}
                        onMakeAdmin={onMakeAdmin}
                        onRemoveMember={onRemoveMember}
                    />
                </div>

                {/* Admin Actions and Leave Group Buttons */}
                <div className="flex flex-col gap-2 pb-6">
                    {isAdmin && ( // Only requires isAdmin to show admin actions block
                        <div className="bg-white rounded-lg p-4 shadow-sm border border-gray-200 space-y-3">
                            <h2 className="text-lg font-bold text-gray-800">Actions</h2>
                            {/* Mark as Ordered Button */}
                            {/* MODIFIED: Disabled only if already ordered or resolved */}
                            {(state === "waiting" || state === "active") && onMarkOrdered && (
                                <Button
                                    id={tutorialStepIds?.markOrderedButton}
                                    onClick={onMarkOrdered}
                                    disabled={isOrderPlaced} // Disabled only if state is 'ordered' or 'resolved'
                                    className="w-full bg-shelivery-primary-blue hover:bg-shelivery-primary-blue-dark text-white" // Reverted to original color, added specific hover
                                >
                                    Mark as Ordered
                                </Button>
                            )}

                            {/* Mark as Delivered Button */}
                            {state === "ordered" && onMarkDelivered && (
                                <Button
                                    id={tutorialStepIds?.markDeliveredButton}
                                    onClick={onMarkDelivered}
                                    // Modified className to match Mark as Ordered button
                                    className="w-full bg-shelivery-primary-blue hover:bg-shelivery-primary-blue-dark text-white"
                                >
                                    Mark as Delivered
                                </Button>
                            )}

                            {/* Extend Time Button - Always visible if isAdmin, regardless of order state */}
                            <Button
                                id={tutorialStepIds?.["extend-time-button"]} 
                                onClick={onExtendTime}
                                className="w-full bg-yellow-400 hover:bg-yellow-600 text-white"
                                variant="primary"
                            >
                                Extend Time
                            </Button>
                        </div>
                    )}

                    {/* Leave Group Button */}
                    <Button
                        id={tutorialStepIds?.leaveGroupButton}
                        variant="error"
                        size="md"
                        onClick={onLeaveGroup}
                        className="w-full"
                        disabled={state === "ordered"} // Still disabled when state is 'ordered'
                    >
                        {state === "resolved" ? "Leave Group" : "Leave Order"}
                    </Button>
                </div>
            </div>
        </div>
    );
}
