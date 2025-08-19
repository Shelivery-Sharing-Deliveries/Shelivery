"use client";
import { useNotify } from "@/components/ui/NotificationsContext";
import { useEffect, useState, useCallback } from "react";
import { useParams, useRouter } from "next/navigation";
import { supabase } from "@/lib/supabase";
import { useAuth } from "@/hooks/useAuth";
import { useChatroomActions } from "@/hooks/useChatroomActions";
import { SimpleChatHeader } from "@/components/chatroom/SimpleChatHeader";
import { ChatMessages } from "@/components/chatroom/ChatMessages";
import { ChatInput } from "@/components/chatroom/ChatInput";
import { OrderDetailsView } from "@/components/chatroom/OrderDetailsView";
import {
    NotificationBanner,
    OrderDeliveredBanner,
    TimeRunningOutBanner,
    OrderPlacedBanner,
    NewMemberBanner,
    AdminAssignedBanner,
} from "@/components/chatroom/NotificationBanner";
import { TimeExtensionModal } from "@/components/chatroom/TimeExtensionModal";
import LoadingBall from "@/components/ui/LoadingBall";
import ChatroomPageTutorial from "@/components/chatroom/ChatroomPageTutorial";

// Interface definitions...
interface Chatroom {
    id: string;
    pool_id: string;
    state: "waiting" | "active" | "ordered" | "delivered" | "resolved" | "canceled";
    admin_id: string;
    last_amount: number;
    created_at: string;
    updated_at: string;
    expire_at: string;
    extended_once_before_ordered: boolean;
    total_extension_days_ordered_state: number;
    // CRUCIAL ADDITION: This property is needed for tracking extensions in the 'delivered' state.
    total_extension_days_delivered_state: number;
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
        note: string | null;
        amount: number;
        status: "resolved" | "in_pool" | "in_chat";
        is_ready: boolean;
        pool_id: string | null;
        chatroom_id: string | null;
        created_at: string;
        updated_at: string;
        is_delivered_by_user: boolean | null;
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
    const [showTutorial, setShowTutorial] = useState(false);

    const notify = useNotify();

    const refreshChatroom = useCallback(async () => {
        console.log("Realtime: Refreshing full chatroom data...");
        const { data, error } = await supabase
            .from("chatroom")
            .select( // REQUIRED: Fetch total_extension_days_delivered_state for delivered state extension
                `
                *,
                extended_once_before_ordered,
                total_extension_days_ordered_state,
                total_extension_days_delivered_state,
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
            setIsAdmin(data.admin_id === user?.id);
            console.log("Realtime: Chatroom data refreshed. New state:", data.state, "Admin ID:", data.admin_id);
            const { data: membershipsData, error: membershipsError } = await supabase
                .from("chat_membership")
                .select("user_id")
                .eq("chatroom_id", chatroomId)
                .is("left_at", null);

            if (membershipsError) {
                console.error("Realtime: Error fetching memberships for refresh:", membershipsError);
                return;
            }

            if (membershipsData && membershipsData.length > 0) {
                const userIds = membershipsData.map((m) => m.user_id);
                const { data: usersData, error: usersError } = await supabase
                    .from("user")
                    .select("*")
                    .in("id", userIds);
                if (usersError) {
                    console.error("Realtime: Error fetching users for refresh:", usersError);
                    return;
                }

                const { data: basketsData, error: basketsError } = await supabase
                    .from("basket")
                    .select("*")
                    .in("user_id", userIds)
                    .eq("chatroom_id", chatroomId);
                if (basketsError) {
                    console.error("Realtime: Error fetching baskets for refresh:", basketsError);
                    return;
                }

                const processedMembers: ChatMember[] =
                    usersData?.map((user) => ({
                        ...user,
                        basket:
                            basketsData?.find((basket) => basket.user_id === user.id) || null,
                    })) || [];
                setMembers(processedMembers);
                console.log("Realtime: Members data refreshed with updated basket statuses.");
            } else {
                setMembers([]);
            }
        }
    }, [chatroomId, user?.id]);

    const {
        uploadFileToStorage,
        sendMessage,
        markAsOrdered,
        markAsDeliveredByAdmin,
        confirmDelivery,
        leaveGroup,
        makeAdmin,
        removeMember,
    } = useChatroomActions({
        chatroomId,
        currentUser,
        isAdmin,
        chatroom,
        refreshChatroom,
        setNotification,
        setMembers,
        members,
    });

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
                console.error("getCurrentUser: Error fetching user profile:", profileError);
                setLoading(false);
                return;
            }
            console.log("getCurrentUser: User profile set:", profile?.id);
            setCurrentUser(profile);
        };
        getCurrentUser();
    }, [user, authLoading]);

    useEffect(() => {
        if (!currentUser || authLoading || !chatroomId) {
            console.log("loadChatroomData: Waiting for currentUser or chatroomId...");
            return;
        }

        const loadChatroomData = async () => {
            console.log("loadChatroomData: Starting data fetch for chatroom:", chatroomId);
            console.log("loadChatroomData: Current User ID:", currentUser?.id);
            setLoading(true);

            try {
                const { data: chatroomData, error: chatroomError } = await supabase
                    .from("chatroom")
                    .select( // REQUIRED: Fetch total_extension_days_delivered_state on initial load
                        `
                        *,
                        extended_once_before_ordered,
                        total_extension_days_ordered_state,
                        total_extension_days_delivered_state,
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
                    console.error("loadChatroomData: Error fetching chatroom:", chatroomError);
                    throw chatroomError;
                }
                if (!chatroomData) {
                    console.warn("loadChatroomData: No chatroom data found for ID:", chatroomId);
                    setLoading(false);
                    return;
                }
                console.log("loadChatroomData: Chatroom data fetched:", chatroomData);
                console.log("loadChatroomData: Chatroom state is now:", chatroomData.state);
                console.log("loadChatroomData: Chatroom admin ID is:", chatroomData.admin_id);
                setChatroom(chatroomData);
                setIsAdmin(chatroomData.admin_id === currentUser.id);

                const { data: membershipsData, error: membershipsError } = await supabase
                    .from("chat_membership")
                    .select("user_id")
                    .eq("chatroom_id", chatroomId)
                    .is("left_at", null);

                if (membershipsError) throw membershipsError;

                if (membershipsData && membershipsData.length > 0) {
                    const userIds = membershipsData.map((m) => m.user_id);
                    const { data: usersData, error: usersError } = await supabase
                        .from("user")
                        .select("*")
                        .in("id", userIds);
                    if (usersError) throw usersError;

                    const { data: basketsData, error: basketsError } = await supabase
                        .from("basket")
                        .select("*")
                        .in("user_id", userIds)
                        .eq("chatroom_id", chatroomId);
                    if (basketsError) throw basketsError;

                    const processedMembers: ChatMember[] =
                        usersData?.map((user) => ({
                            ...user,
                            basket:
                                basketsData?.find((basket) => basket.user_id === user.id) || null,
                        })) || [];
                    setMembers(processedMembers);
                    console.log("loadChatroomData: Members data fetched with all basket statuses.");
                } else {
                    setMembers([]);
                }

                const { data: messagesData, error: messagesError } = await supabase
                    .from("message")
                    .select(`*, user:user_id (id, email, image)`)
                    .eq("chatroom_id", chatroomId)
                    .order("sent_at", { ascending: true });

                if (messagesError) throw messagesError;

                if (messagesData && messagesData.length > 0) {
                    const uniqueUserIds = messagesData.map((m) => m.user_id);
                    const messageUserIds = Array.from(new Set(uniqueUserIds));
                    const { data: messageUsersData } = await supabase.from("user").select("*").in("id", messageUserIds);

                    if (messageUsersData) {
                        const processedMessages: MessageType[] = messagesData.map(
                            (message) => ({
                                ...message,
                                user: messageUsersData.find((user) => user.id === message.user_id) || {
                                    id: message.user_id, email: "Unknown", dormitory_id: null, profile: {},
                                    created_at: new Date().toISOString(), updated_at: new Date().toISOString(),
                                    first_name: null, last_name: null, favorite_store: null, image: null,
                                },
                            })
                        );
                        setMessages(processedMessages);
                    } else {
                        setMessages(messagesData.map(message => ({ ...message, user: { id: message.user_id, email: "Unknown", dormitory_id: null, profile: {}, created_at: new Date().toISOString(), updated_at: new Date().toISOString(), first_name: null, last_name: null, favorite_store: null, image: null, } })));
                    }
                    console.log("loadChatroomData: Messages data fetched.");
                } else {
                    setMessages([]);
                }

                const hasSeenTutorial = localStorage.getItem('hasSeenChatroomPageTutorial');
                if (!hasSeenTutorial) {
                    setShowTutorial(true);
                }
            } catch (error) {
                console.error("loadChatroomData: Caught an error during chatroom data loading:", error);
            } finally {
                setLoading(false);
            }
        };
        loadChatroomData();
    }, [currentUser, chatroomId, authLoading, refreshChatroom]);

    useEffect(() => {
        if (!chatroomId || authLoading || !currentUser) {
            console.log("Realtime: chatroomId not available for subscriptions or auth loading.");
            return;
        }
        console.log("Realtime: Setting up Supabase real-time subscriptions for chatroom:", chatroomId);

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
                    const { data: userData, error: userDataError } = await supabase
                        .from("user")
                        .select("*")
                        .eq("id", payload.new.user_id) // Corrected from payload.new.user as per previous correction
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
                            id: payload.new.id, chatroom_id: payload.new.chatroom_id, user_id: payload.new.user_id,
                            content: payload.new.content, type: payload.new.type || "text", sent_at: payload.new.sent_at,
                            read_at: payload.new.read_at, user: userData,
                        };
                        setMessages((prev) => {
                            const isDuplicate = prev.some(msg => msg.id === newMessage.id);
                            if (isDuplicate) {
                                console.log("Realtime: Skipping duplicate message:", newMessage.id);
                                return prev;
                            }
                            return [...prev, newMessage];
                        });
                        console.log("Realtime: Messages updated with new message.");
                    }
                }
            )
            .subscribe();

        // Updated to handle both chatroom and basket updates to trigger refresh
        const mainChatroomSubscription = supabase
            .channel(`chatroom_and_baskets:${chatroomId}`)
            .on(
                "postgres_changes",
                {
                    event: "*", // Listen for all events (INSERT, UPDATE, DELETE)
                    schema: "public",
                    table: "chatroom",
                    filter: `id=eq.${chatroomId}`,
                },
                async (payload) => {
                    console.log("Realtime: Chatroom update received:", payload);
                    refreshChatroom();
                }
            )
            .on(
                "postgres_changes",
                {
                    event: "UPDATE",
                    schema: "public",
                    table: "basket",
                    filter: `chatroom_id=eq.${chatroomId}`,
                },
                async (payload) => {
                    console.log("Realtime: Basket update received:", payload);
                    refreshChatroom();
                }
            )
            .subscribe();

        const membershipSubscription = supabase
            .channel(`membership:${chatroomId}`)
            .on(
                "postgres_changes",
                {
                    event: "INSERT",
                    schema: "public",
                    table: "chat_membership",
                    filter: `chatroom_id=eq.${chatroomId}`,
                },
                async (payload) => {
                    console.log("Realtime: New member joined:", payload.new);
                    if (payload.new.user_id === currentUser?.id) return;

                    const { data: userData } = await supabase
                        .from("user")
                        .select("first_name, email")
                        .eq("id", payload.new.user_id)
                        .single();

                    if (userData) {
                        const userName = userData.first_name || userData.email.split('@')[0] || 'Someone';
                        notify({
                            type: "info", title: "New Member Joined", message: `${userName} joined the chatroom.`,
                            duration: 4000, dismissible: true,
                        });
                    }
                    refreshChatroom();
                }
            )
            .subscribe();

        return () => {
            console.log("Realtime: Unsubscribing from real-time channels.");
            messagesSubscription.unsubscribe();
            mainChatroomSubscription.unsubscribe(); // Changed this to the new subscription variable
            membershipSubscription.unsubscribe();
        };
    }, [chatroomId, authLoading, refreshChatroom, notify, currentUser]);

    const handleTutorialComplete = useCallback(() => {
        setShowTutorial(false);
        localStorage.setItem('hasSeenChatroomPageTutorial', 'true');
    }, []);

    const handleDismissOrderPlaced = useCallback(() => setOrderPlaced(false), []);
    const handleDismissOrderDelivered = useCallback(() => setOrderDelivered(false), []);
    const handleDismissTimeRunningOut = useCallback(() => setTimeRunningOut(false), []);
    const handleDismissNewMember = useCallback(() => setNewMemberJoined(false), []);
    const handleDismissAdminAssigned = useCallback(() => setAdminAssigned(false), []);

    const handleExtendTime = useCallback(async (days: number) => {
        if (!chatroomId) {
            console.error("Cannot extend time: chatroom ID is not available.");
            notify({ type: "warning", title: "Error", message: "Chatroom ID not found." });
            return;
        }

        setLoading(true);
        console.log(`handleExtendTime: Attempting to extend by ${days} days for chatroom: ${chatroomId}`);
        try {
            const { data, error: rpcError } = await supabase.rpc('extend_chatroom_expire_at', { p_chatroom_id: chatroomId, p_days_to_extend: days });

            if (rpcError) {
                console.error("handleExtendTime: Error extending chatroom time:", rpcError);
                notify({ type: "warning", title: "Error", message: rpcError.message || "Failed to extend chatroom time." });
                return;
            }

            console.log("handleExtendTime: Chatroom extension RPC result:", data);
            notify({ type: "success", title: "Success!", message: data });
            await refreshChatroom();
        } catch (err: any) {
            console.error("handleExtendTime: Unexpected error during time extension:", err);
            notify({ type: "warning", title: "Error", message: err.message || "An unexpected error occurred." });
        } finally {
            setLoading(false);
            setShowTimeExtension(false);
        }
    }, [chatroomId, notify, refreshChatroom]);


    const calculateTimeLeft = (expireAt: string) => {
        const expires = new Date(expireAt).getTime();
        const now = new Date().getTime();
        const difference = expires - now;

        if (difference <= 0) {
            return { hours: 0, minutes: 0 };
        }

        const hours = Math.floor((difference % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
        const minutes = Math.floor((difference % (1000 * 60 * 60)) / (1000 * 60));
        return { hours, minutes };
    };

    if (authLoading || loading) {
        return (
            <div className="flex items-center justify-center min-h-screen">
                <div className="text-lg">
                    <LoadingBall size="large" color="shelivery-primary-yellow" />
                </div>
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

    console.log("Render: Displaying Chatroom content. Current chatroom state:", chatroom.state);
    const isOrderedState = chatroom.state === "ordered";
    const timeLeftDisplay = calculateTimeLeft(chatroom.expire_at);

    if (currentView === "orderDetails") {
        return (
            <>
                <OrderDetailsView
                    chatroomName={`${chatroom.pool.shop.name} Basket Chatroom`}
                    onBack={() => setCurrentView("chat")}
                    state={chatroom.state}
                    poolTotal={chatroom.last_amount}
                    orderCount={members.length}
                    timeLeft={chatroom.expire_at}
                    isAdmin={isAdmin}
                    onMarkOrdered={markAsOrdered}
                    onMarkDelivered={markAsDeliveredByAdmin}
                    onConfirmDelivery={confirmDelivery}
                    members={members}
                    currentUser={currentUser}
                    adminId={chatroom.admin_id || ""}
                    onMakeAdmin={makeAdmin}
                    onRemoveMember={removeMember}
                    onLeaveGroup={leaveGroup}
                    orderPlaced={orderPlaced}
                    orderDelivered={orderDelivered}
                    timeRunningOut={timeRunningOut}
                    newMemberJoined={newMemberJoined}
                    adminAssigned={adminAssigned}
                    onDismissOrderPlaced={handleDismissOrderPlaced}
                    onDismissOrderDelivered={handleDismissOrderDelivered}
                    onDismissTimeRunningOut={handleDismissTimeRunningOut}
                    onDismissNewMember={handleDismissNewMember}
                    onDismissAdminAssigned={handleDismissAdminAssigned}
                    onExtendTime={() => setShowTimeExtension(true)}
                    showTutorial={showTutorial}
                    tutorialStepIds={{
                        adminSection: "order-details-admin-section",
                        changeAdminButton: "change-admin-button",
                        membersList: "order-details-members-list",
                        readyStatus: "order-details-ready-status",
                        markOrderedButton: "mark-as-ordered-button",
                        markDeliveredButton: "mark-as-delivered-button",
                        leaveGroupButton: "leave-group-button",
                    }}
                />

                {showTimeExtension && chatroom && (
                    <TimeExtensionModal
                        isOpen={showTimeExtension}
                        timeLeft={timeLeftDisplay}
                        onClose={() => setShowTimeExtension(false)}
                        onExtend={handleExtendTime}
                        isOrderedState={isOrderedState}
                        hasExtendedOnceBeforeOrdered={chatroom.extended_once_before_ordered}
                        currentTotalExtendedDaysInOrderedState={chatroom.total_extension_days_ordered_state}
                        // CRUCIAL ADDITION: Pass these two props for the modal's internal logic
                        currentTotalExtendedDaysInDeliveredState={chatroom.total_extension_days_delivered_state}
                        chatroomState={chatroom.state}
                    />
                )}
                {showTutorial && currentView === "orderDetails" && (
                    <ChatroomPageTutorial
                        onComplete={handleTutorialComplete}
                        currentView={currentView}
                        setCurrentView={setCurrentView}
                    />
                )}
            </>
        );
    }

    return (
        <div className="fixed inset-0 flex flex-col bg-white">
            <div className="flex-shrink-0">
                <SimpleChatHeader
                    chatroomName={`${chatroom.pool.shop.name} Basket Chatroom`}
                    memberCount={members.length}
                    timeLeft={chatroom.expire_at}
                    onBack={() => router.push("/dashboard" as any)}
                    onMenuClick={() => setCurrentView("orderDetails")}
                    showMenuButton={true}
                    menuButtonId="chat-menu-button"
                />
            </div>

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
                <OrderPlacedBanner onDismiss={handleDismissOrderPlaced} />
            )}
            {orderDelivered && (
                <OrderDeliveredBanner onDismiss={handleDismissOrderDelivered} />
            )}
            {timeRunningOut && (
                <TimeRunningOutBanner
                    timeLeft={`${timeLeftDisplay.hours} hours ${timeLeftDisplay.minutes} minutes`}
                    onExtend={() => setShowTimeExtension(true)}
                    onDismiss={handleDismissTimeRunningOut}
                />
            )}
            {newMemberJoined && (
                <NewMemberBanner
                    memberName="Alice"
                    onDismiss={handleDismissNewMember}
                />
            )}
            {adminAssigned && (
                <AdminAssignedBanner
                    adminName="Bob"
                    onDismiss={handleDismissAdminAssigned}
                />
            )}

            <div className="flex-1 flex flex-col min-h-0 overflow-hidden">
                <div className="flex-1 overflow-y-auto">
                    <ChatMessages
                        messages={messages}
                        currentUserId={currentUser?.id || ""}
                    />
                </div>

                <div className="flex-shrink-0">
                    <ChatInput
                        onSendMessage={sendMessage}
                        onUploadFile={uploadFileToStorage}
                        disabled={chatroom.state === "resolved" || chatroom.state === "canceled"}
                        chatroomId={chatroomId}
                    />
                </div>
            </div>

            {showTimeExtension && chatroom && (
                <TimeExtensionModal
                    isOpen={showTimeExtension}
                    timeLeft={timeLeftDisplay}
                    onClose={() => setShowTimeExtension(false)}
                    onExtend={handleExtendTime}
                    isOrderedState={isOrderedState}
                    hasExtendedOnceBeforeOrdered={chatroom.extended_once_before_ordered}
                    currentTotalExtendedDaysInOrderedState={chatroom.total_extension_days_ordered_state}
                    // CRUCIAL ADDITION: Pass these two props for the modal's internal logic
                    currentTotalExtendedDaysInDeliveredState={chatroom.total_extension_days_delivered_state}
                    chatroomState={chatroom.state}
                />
            )}
            {showTutorial && currentView === "chat" && (
                    <ChatroomPageTutorial
                        onComplete={handleTutorialComplete}
                        currentView={currentView}
                        setCurrentView={setCurrentView}
                    />
                )}
        </div>
    );
}
