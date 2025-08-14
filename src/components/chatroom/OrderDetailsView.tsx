// src/components/chatroom/OrderDetailsView.tsx
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
        is_delivered_by_user: boolean; // This remains, as it's per-user basket status
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
    // REMOVED: The onMarkDelivered prop for admin is no longer part of this component's interface.
    onMarkMyBasketDelivered?: () => void; // For individual users to mark their basket delivered
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
    // REMOVED: onMarkDelivered is no longer destructured here, as it's removed from props.
    onMarkMyBasketDelivered,
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

    // Find the current user's basket delivery status
    const currentUserBasket = members.find(member => member.id === currentUser?.id)?.basket;
    const isCurrentUserBasketDelivered = currentUserBasket?.is_delivered_by_user === true;

    // Determine if the "Mark My Basket as Delivered" button should be shown
    const showMarkMyBasketDeliveredButton =
        state === "ordered" && // Only show when the order is placed
        currentUserBasket !== null && // Ensure current user has a basket
        !isCurrentUserBasketDelivered && // Only show if their basket isn't already marked delivered
        onMarkMyBasketDelivered; // Ensure the prop is provided

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
                // IMPORTANT: onMarkDelivered is removed here, as it's no longer a relevant prop for admin actions.
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

                {/* Action Buttons Section */}
                <div className="flex flex-col gap-2 pb-6">
                    {/* Admin Actions Block (conditionally rendered for admin) */}
                    {isAdmin && (
                        <div className="bg-white rounded-lg p-4 shadow-sm border border-gray-200 space-y-3">
                            <h2 className="text-lg font-bold text-gray-800">Admin Actions</h2>
                            {/* Mark as Ordered Button - Only visible for admin and not yet ordered/resolved */}
                            {(state === "waiting" || state === "active") && onMarkOrdered && (
                                <Button
                                    id={tutorialStepIds?.markOrderedButton}
                                    onClick={onMarkOrdered}
                                    disabled={isOrderPlaced}
                                    className="w-full bg-shelivery-primary-blue hover:bg-shelivery-primary-blue-dark text-white"
                                >
                                    Mark as Ordered
                                </Button>
                            )}

                            {/* IMPORTANT: The admin's 'Mark Entire Order as Delivered' button is removed based on new logic. */}

                            {/* Extend Time Button - Always visible if isAdmin */}
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

                    {/* Mark My Basket as Delivered Button (for individual users) */}
                    {showMarkMyBasketDeliveredButton && (
                        <Button
                            onClick={onMarkMyBasketDelivered}
                            className="w-full bg-shelivery-primary-blue hover:bg-shelivery-primary-blue-dark text-white"
                        >
                            Mark My Basket as Delivered
                        </Button>
                    )}

                    {/* Leave Group Button */}
                    <Button
                        id={tutorialStepIds?.leaveGroupButton}
                        variant="error"
                        size="md"
                        onClick={onLeaveGroup}
                        className="w-full"
                        disabled={state === "ordered"}
                    >
                        {state === "resolved" ? "Leave Group" : "Leave Order"}
                    </Button>
                </div>
            </div>
        </div>
    );
}
