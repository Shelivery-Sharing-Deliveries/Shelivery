import { useCallback } from 'react';
import { useRouter } from 'next/navigation';
import { supabase } from '@/lib/supabase';

// Interface definitions... (unchanged)
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

interface Chatroom {
    id: string;
    pool_id: string;
    state: "waiting" | "active" | "ordered" | "delivered" | "resolved" | "canceled";
    admin_id: string;
    last_amount: number;
    created_at: string;
    updated_at: string;
    expire_at: string;
    extended_once_before_ordered?: boolean;
    total_extension_days_ordered_state?: number;
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

interface UseChatroomActionsProps {
    chatroomId: string;
    currentUser: User | null;
    isAdmin: boolean;
    chatroom: Chatroom | null;
    refreshChatroom: () => Promise<void>;
    setNotification: (message: string | null) => void;
    setMembers: React.Dispatch<React.SetStateAction<ChatMember[]>>;
    members: ChatMember[];
}

export const useChatroomActions = ({
    chatroomId,
    currentUser,
    isAdmin,
    chatroom,
    refreshChatroom,
    setNotification,
    setMembers,
    members,
}: UseChatroomActionsProps) => {
    const router = useRouter();

    const uploadFileToStorage = async (
        file: File,
        folder: "images" | "audio"
    ): Promise<string | null> => {
        if (!chatroomId) {
            console.error("uploadFileToStorage: chatroomId is missing.");
            setNotification('Chatroom ID is missing. Cannot upload file.');
            return null;
        }
        const randomSuffix = Math.random().toString(36).substring(2, 10);
        const fileName = `${folder}/${chatroomId}_${Date.now()}_${randomSuffix}_${file.name}`;

        const { error } = await supabase.storage
            .from("chat-uploads")
            .upload(fileName, file, {
                cacheControl: "3600",
                upsert: false,
            });

        if (error) {
            console.error("File upload failed:", error);
            setNotification(`File upload failed: ${error.message}`);
            return null;
        }

        const { data } = supabase.storage.from('chat-uploads').getPublicUrl(fileName);
        if (data?.publicUrl) {
            sendMessage({ type: folder === 'images' ? 'image' : 'audio', url: data.publicUrl });
        }
        return data.publicUrl;
    };

    const sendMessage = async (
        content: string | { type: "audio" | "image"; url: string }
    ) => {
        if (!currentUser || !content) {
            console.log("sendMessage: Cannot send message, user or content missing.");
            return;
        }

        let messageContent = "";
        let messageType: "text" | "image" | "audio" = "text";

        if (typeof content === "string") {
            if (!content.trim()) {
                console.log("sendMessage: Empty text message. Not sending.");
                return;
            }
            messageContent = content.trim();
        } else {
            messageContent = content.url;
            messageType = content.type;
        }

        console.log(`sendMessage: Sending ${messageType} message...`);

        try {
            const { error } = await supabase.from("message").insert({
                chatroom_id: chatroomId,
                user_id: currentUser.id,
                content: messageContent,
                type: messageType,
            });

            if (error) {
                console.error("sendMessage: Error inserting message:", error);
                setNotification(`Failed to send message: ${error.message}`);
            } else {
                console.log("sendMessage: Message inserted successfully.");
            }
        } catch (error) {
            console.error("sendMessage: Caught error during message send:", error);
            setNotification('An unexpected error occurred while sending the message.');
        }
    };

    const markAsOrdered = async () => {
        if (!isAdmin) {
            console.warn("markAsOrdered: User is not admin, cannot mark as ordered.");
            setNotification('You are not the admin. Cannot mark as ordered.');
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
                setNotification('Failed to mark as ordered.');
            } else {
                await refreshChatroom();
                setNotification("Order has been marked as placed!");
                console.log("markAsOrdered: Chatroom state updated to 'ordered'.");
            }
        } catch (error) {
            console.error(
                "markAsOrdered: Caught error during mark as ordered:",
                error
            );
            setNotification('An unexpected error occurred.');
        }
    };

    const markAsDeliveredByAdmin = useCallback(async () => {
        if (!isAdmin || !currentUser) {
            console.error("markAsDeliveredByAdmin: Only admin can mark the chatroom as delivered.");
            setNotification('Only the admin can mark the order as delivered.');
            return;
        }
        console.log("markAsDeliveredByAdmin: Attempting to mark chatroom as delivered by admin...");

        try {
            // Step 1: Mark the chatroom as 'delivered'
            const { error: chatroomUpdateError } = await supabase
                .from("chatroom")
                .update({ state: "delivered" })
                .eq("id", chatroomId);
            
            if (chatroomUpdateError) {
                console.error("markAsDeliveredByAdmin: Error marking chatroom as delivered:", chatroomUpdateError);
                setNotification('Failed to mark as delivered. Please try again.');
                return;
            }

            // Step 2: Mark the admin's own basket as delivered
            const { error: basketUpdateError } = await supabase
                .from("basket")
                .update({ is_delivered_by_user: true })
                .eq("user_id", currentUser.id)
                .eq("chatroom_id", chatroomId);
            
            if (basketUpdateError) {
                console.error("markAsDeliveredByAdmin: Error updating admin's basket status:", basketUpdateError);
                setNotification('Failed to confirm admin delivery.');
                // Note: The chatroom is already marked as delivered, but we should notify.
                return;
            }

            setNotification('Order marked as delivered! Waiting for members to confirm receipt.');
            await refreshChatroom();
        } catch (error) {
            console.error("markAsDeliveredByAdmin: An unexpected error occurred:", error);
            setNotification('An unexpected error occurred.');
        }
    }, [chatroomId, isAdmin, currentUser, refreshChatroom, setNotification]);

    const confirmDelivery = useCallback(async () => {
        if (!currentUser || !chatroomId) {
            console.error("Confirm Delivery: User or Chatroom ID not available.");
            setNotification('User or Chatroom ID not found.');
            return;
        }

        console.log("confirmDelivery: Initiating delivery confirmation for user:", currentUser.id);

        try {
            // Step 1: Update the current user's basket status
            const { error: basketUpdateError } = await supabase
                .from("basket")
                .update({ is_delivered_by_user: true })
                .eq("user_id", currentUser.id)
                .eq("chatroom_id", chatroomId);

            if (basketUpdateError) {
                console.error("confirmDelivery: Error updating basket delivery status:", basketUpdateError);
                setNotification('Failed to confirm delivery. Please try again.');
                return;
            }
            
            setNotification('Delivery confirmed! Waiting for others to confirm.');
            
            // Step 2: Query ALL baskets in the chatroom to check their delivery status.
            const { data: basketsData, error: basketsFetchError } = await supabase
                .from("basket")
                .select(`user_id, is_delivered_by_user, status`) // 🌟 ADDED 'user_id' and 'status' for more comprehensive logging
                .eq("chatroom_id", chatroomId);

            if (basketsFetchError) {
                console.error("confirmDelivery: Error fetching baskets:", basketsFetchError);
                setNotification('Error fetching order statuses.');
                return;
            }

            // 🌟 LOG: Display the fetched baskets data to inspect their individual statuses
            console.log("confirmDelivery: Fetched all baskets for chatroom:", basketsData);

            // Check if all baskets in the chatroom have confirmed delivery
            // We ensure that all baskets (regardless of their initial status)
            // have their `is_delivered_by_user` flag set to true.
            const allConfirmed = basketsData?.every(
                (basket) => basket.is_delivered_by_user === true
            );

            // 🌟 LOG: Display the result of the allConfirmed check
            console.log("confirmDelivery: Result of allConfirmed check:", allConfirmed);
            
            // Step 3: If all confirmed, resolve the chatroom
            if (allConfirmed) {
                console.log("All members have confirmed. Attempting to resolve chatroom and baskets...");
                // 🏆 FIX: Changed RPC call to 'resolve_chatroom_baskets' based on user's clarification.
                const { error: rpcError } = await supabase.rpc('resolve_chatroom_baskets', { // Corrected function name
                    p_chatroom_id: chatroomId
                });

                if (rpcError) {
                    // 🌟 LOG: Log any errors from the RPC call
                    console.error("confirmDelivery: Error calling resolve_chatroom_baskets RPC:", rpcError); // Updated log message
                    setNotification(`Failed to finalize chatroom: ${rpcError.message || 'Unknown error'}`);
                    return;
                }
                console.log("confirmDelivery: RPC 'resolve_chatroom_baskets' executed successfully."); // Updated log message
                setNotification("All members have confirmed! The chatroom is now resolved.");
            } else {
                console.log("confirmDelivery: Not all members have confirmed yet. Chatroom remains in 'delivered' state.");
            }
            
            // Step 4: Refresh chatroom data to reflect all changes
            // This is crucial for the UI to update with the new state (e.g., 'resolved')
            await refreshChatroom();

        } catch (error) {
            console.error("confirmDelivery: An unexpected error occurred:", error);
            setNotification('An unexpected error occurred.');
        }
    }, [chatroomId, currentUser, refreshChatroom, setNotification]);

    const leaveGroup = async () => {
        if (!currentUser) {
            console.warn("leaveGroup: No current user to leave group.");
            setNotification('You are not logged in.');
            return;
        }
        console.log("leaveGroup: Attempting to leave group via backend function...");
        try {
            const { error } = await supabase.rpc("leave_chatroom", {
                chatroom_id_param: chatroomId,
            });

            if (error) {
                console.error("leaveGroup: Error calling backend function:", error);
                setNotification('Failed to leave group.');
            } else {
                setNotification('You have left the group.');
                router.push("/dashboard");
                console.log("leaveGroup: Successfully left group, redirecting to dashboard.");
            }
        } catch (error) {
            console.error("leaveGroup: Caught unexpected error during leave group RPC call:", error);
            setNotification('An unexpected error occurred while leaving the group.');
        }
    };

    const makeAdmin = async (userId: string) => {
        if (!isAdmin) {
            console.warn("makeAdmin: Current user is not admin, cannot make another user admin.");
            setNotification('Only the current admin can transfer the admin role.');
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
                setNotification('Failed to transfer admin role.');
            } else {
                await refreshChatroom();
                setNotification("Admin role transferred successfully!");
            }
        } catch (error) {
            console.error("makeAdmin: Caught error during make admin:", error);
            setNotification('An unexpected error occurred during admin transfer.');
        }
    };

    const removeMember = async (userId: string) => {
        if (!isAdmin || userId === currentUser?.id) {
            console.warn("removeMember: Cannot remove member. Either not admin or trying to remove self.");
            setNotification('You cannot remove yourself or you are not the admin.');
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
                console.error("removeMember: Error removing member from chat_memberships:", error);
                setNotification('Failed to remove member.');
            } else {
                setMembers((prev) => prev.filter((member) => member.id !== userId));
                setNotification("Member removed from group");
            }
        } catch (error) {
            console.error("removeMember: Caught error during remove member:", error);
            setNotification('An unexpected error occurred while removing the member.');
        }
    };

    return {
        uploadFileToStorage,
        sendMessage,
        markAsOrdered,
        markAsDeliveredByAdmin,
        confirmDelivery,
        leaveGroup,
        makeAdmin,
        removeMember,
    };
};
