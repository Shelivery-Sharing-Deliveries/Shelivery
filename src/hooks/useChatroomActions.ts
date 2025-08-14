// src/hooks/useChatroomActions.ts
import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { supabase } from '@/lib/supabase';

interface User {
    id: string;
    email: string;
    dormitory_id: number | null;
    profile: any;
    created_at: string | null;
    updated_at: string | null;
    first_name: string | null;
    last_name: string | null;
    image: string | null;
}

interface Chatroom {
    id: string;
    pool_id: string;
    state: "waiting" | "active" | "ordered" | "resolved";
    admin_id: string;
    last_amount: number;
    created_at: string;
    updated_at: string;
    expire_at: string;
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
        is_delivered_by_user: boolean;
    } | null;
}

interface UseChatroomActionsProps {
    chatroomId: string;
    currentUser: User | null;
    isAdmin: boolean;
    chatroom: Chatroom | null;
    refreshChatroom: () => Promise<void>;
    setNotification: (message: string | null) => void;
    members: ChatMember[];
}

export const useChatroomActions = ({
    chatroomId,
    currentUser,
    isAdmin,
    chatroom,
    refreshChatroom,
    setNotification,
    members,
}: UseChatroomActionsProps) => {
    const router = useRouter();

    /**
     * Uploads a file (image or audio) to the private "chat-uploads" Supabase bucket.
     * @param file The file to upload.
     * @param folder The subfolder within "chat-uploads" (e.g., "images", "audio").
     * @returns The file path if successful, otherwise null.
     */
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

    /**
     * Sends a message to the chatroom. Supports text, image, and audio messages.
     * @param content The message content (string for text, or object for file paths).
     */
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
            messageContent = content.url; // File path (e.g., "images/chatroom123_abc.png")
            messageType = content.type; // "audio" or "image"
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
            } else {
                console.log("sendMessage: Message inserted successfully.");
            }
        } catch (error) {
            console.error("sendMessage: Caught error during message send:", error);
        }
    };

    /**
     * Marks the current chatroom as 'ordered'. This action is typically performed by the admin.
     */
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
                await refreshChatroom(); // Immediately fetch fresh chatroom state to update UI
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

    /**
     * Marks the current user's basket as 'delivered' (is_delivered_by_user = true).
     * After updating, it checks if all other members have also marked their baskets delivered.
     * If all are delivered, the chatroom state and all associated baskets' statuses are updated to 'resolved'.
     */
    const markMyBasketAsDelivered = async () => {
        if (!currentUser || !chatroomId) {
            console.warn("markMyBasketAsDelivered: Current user or chatroom ID missing.");
            return;
        }

        console.log(`markMyBasketAsDelivered: User ${currentUser.id} attempting to mark their basket as delivered in chatroom ${chatroomId}.`);

        try {
            // 1. Update the current user's basket to indicate it's delivered
            const { error: updateBasketError } = await supabase
                .from("basket")
                .update({ is_delivered_by_user: true, updated_at: new Date().toISOString() })
                .eq("user_id", currentUser.id)
                .eq("chatroom_id", chatroomId);

            if (updateBasketError) {
                console.error("markMyBasketAsDelivered: Error updating user's basket status:", updateBasketError);
                setNotification("Failed to mark your basket as delivered.");
                setTimeout(() => setNotification(null), 3000);
                return; // Stop execution if update fails
            }

            console.log("markMyBasketAsDelivered: Current user's basket marked as delivered.");
            setNotification("Your basket has been marked as delivered!");
            setTimeout(() => setNotification(null), 3000);
            await refreshChatroom(); // Refresh to get the latest basket statuses for all members

            // 2. Now, check if all members have marked their baskets as delivered
            console.log("markMyBasketAsDelivered: Checking if all baskets are delivered...");
            const { data: allBaskets, error: fetchBasketsError } = await supabase
                .from("basket")
                .select("id, user_id, is_delivered_by_user, status") // Select status too for more detailed logging
                .eq("chatroom_id", chatroomId);

            if (fetchBasketsError) {
                console.error("markMyBasketAsDelivered: Error fetching all baskets for check:", fetchBasketsError);
                return;
            }

            // --- DEBUG: Log all retrieved baskets ---
            console.log("markMyBasketAsDelivered: All baskets retrieved:", allBaskets);
            // --- END DEBUG ---

            if (allBaskets && allBaskets.length > 0) {
                // Log current 'is_delivered_by_user' status for all baskets
                console.log("markMyBasketAsDelivered: Current 'is_delivered_by_user' status for all baskets in chatroom:",
                    allBaskets.map(b => ({ id: b.id, userId: b.user_id, isDelivered: b.is_delivered_by_user, status: b.status }))
                );

                const allMembersDelivered = allBaskets.every(basket => basket.is_delivered_by_user === true);

                if (allMembersDelivered) {
                    console.log("markMyBasketAsDelivered: All members have marked their baskets as delivered. Updating chatroom and all baskets to 'resolved'.");

                    // Update the overall chatroom state to 'resolved'
                    const { error: chatroomUpdateError } = await supabase
                        .from("chatroom")
                        .update({ state: "resolved", updated_at: new Date().toISOString() })
                        .eq("id", chatroomId);

                    if (chatroomUpdateError) {
                        console.error("markMyBasketAsDelivered: Error updating chatroom state to resolved:", chatroomUpdateError);
                        setNotification("Error finalizing order as delivered.");
                        setTimeout(() => setNotification(null), 3000);
                        return;
                    }
                    console.log("markMyBasketAsDelivered: Chatroom state updated to 'resolved' successfully.");

                    // --- START OF NEW CHANGE: Call RPC for bulk basket update ---
                    const { error: rpcError } = await supabase.rpc("resolve_chatroom_baskets", {
                        p_chatroom_id: chatroomId,
                    });

                    if (rpcError) {
                        console.error("markMyBasketAsDelivered: Error calling RPC to resolve all baskets:", rpcError);
                        setNotification("Error finalizing baskets as delivered.");
                        setTimeout(() => setNotification(null), 3000);
                        return;
                    }
                    console.log("markMyBasketAsDelivered: RPC 'resolve_chatroom_baskets' called successfully.");
                    // --- END OF NEW CHANGE ---

                    console.log("markMyBasketAsDelivered: All baskets in chatroom status updated to 'resolved' successfully."); // This log now reflects RPC success
                    setNotification("Order fully delivered and closed!");
                    setTimeout(() => setNotification(null), 3000);
                    await refreshChatroom(); // Final refresh to show resolved state

                } else {
                    console.log("markMyBasketAsDelivered: Not all members have marked their baskets as delivered yet.");
                }
            } else {
                console.log("markMyBasketAsDelivered: No baskets found for this chatroom, or an unexpected state.");
            }

        } catch (error) {
            console.error("markMyBasketAsDelivered: Caught error during basket delivery process:", error);
            setNotification("An unexpected error occurred.");
            setTimeout(() => setNotification(null), 3000);
        }
    };

    /**
     * Allows a user to leave the current chat group.
     * This calls a Supabase RPC function to handle the complex logic of leaving.
     */
    const leaveGroup = async () => {
        if (!currentUser) {
            console.warn("leaveGroup: No current user to leave group.");
            return;
        }
        console.log("leaveGroup: Attempting to leave group via backend function...");

        try {
            const { error } = await supabase.rpc("leave_chatroom", {
                chatroom_id_param: chatroomId,
            });

            if (error) {
                console.error("leaveGroup: Error calling backend function:", error);
                setNotification("Failed to leave group.");
            } else {
                router.push("/dashboard"); // Redirect on success
                setNotification("Successfully left group!");
                console.log("leaveGroup: Successfully left group, redirecting to dashboard.");
            }
            setTimeout(() => setNotification(null), 3000);
        }
        catch (error) {
            console.error("leaveGroup: Caught unexpected error during leave group RPC call:", error);
            setNotification("An unexpected error occurred while leaving.");
            setTimeout(() => setNotification(null), 3000);
        }
    };

    /**
     * Transfers admin privileges to another user within the chatroom.
     * Only the current admin can perform this action.
     * @param userId The ID of the user to make admin.
     */
    const makeAdmin = async (userId: string) => {
        if (!isAdmin) {
            console.warn("makeAdmin: Current user is not admin, cannot make another user admin.");
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

    /**
     * Removes a member from the chatroom. Only the admin can perform this, and they cannot remove themselves.
     * @param userId The ID of the user to remove.
     */
    const removeMember = async (userId: string) => {
        if (!isAdmin || userId === currentUser?.id) {
            console.warn("removeMember: Cannot remove member. Either not admin or trying to remove self.");
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
            } else {
                setNotification("Member removed from group");
                setTimeout(() => setNotification(null), 3000);
                console.log("removeMember: Member removed successfully.");
                await refreshChatroom(); // Ensure UI reflects the change properly
            }
        } catch (error) {
            console.error("removeMember: Caught error during remove member:", error);
        }
    };

    /**
     * Extends the expiration time of the chatroom. Only the admin can perform this.
     */
    const onExtendTime = async () => {
        if (!isAdmin) {
            console.warn("onExtendTime: User is not admin, cannot extend time.");
            return;
        }
        console.log("onExtendTime: Attempting to extend chatroom time...");
        try {
            const { error } = await supabase.rpc("extend_chatroom_expiration", {
                p_chatroom_id: chatroomId,
                p_minutes_to_add: 30, // Example: add 30 minutes to expiration
            });

            if (error) {
                console.error("onExtendTime: Error extending chatroom time:", error);
                setNotification("Failed to extend time.");
            } else {
                await refreshChatroom();
                setNotification("Chatroom time extended by 30 minutes!");
            }
            setTimeout(() => setNotification(null), 3000);
        } catch (error) {
            console.error("onExtendTime: Caught error during extend time:", error);
        }
    };


    return {
        uploadFileToStorage,
        sendMessage,
        markAsOrdered,
        markMyBasketAsDelivered,
        leaveGroup,
        makeAdmin,
        removeMember,
        onExtendTime,
    };
};
