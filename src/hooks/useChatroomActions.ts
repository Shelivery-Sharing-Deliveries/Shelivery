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
    favorite_store: string | null;
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

interface UseChatroomActionsProps {
    chatroomId: string;
    currentUser: User | null;
    isAdmin: boolean;
    chatroom: Chatroom | null;
    refreshChatroom: () => Promise<void>;
    setNotification: (message: string | null) => void;
    setMembers: React.Dispatch<React.SetStateAction<any[]>>;
}

export const useChatroomActions = ({
    chatroomId,
    currentUser,
    isAdmin,
    chatroom,
    refreshChatroom,
    setNotification,
    setMembers,
}: UseChatroomActionsProps) => {
    const router = useRouter();

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
    const markAsDelivered = async () => {
        if (!isAdmin) {
            console.warn(
                "markAsDelivered: User is not admin, cannot mark as delivered."
            );
            return;
        }
        console.log("markAsDelivered: Attempting to mark as delivered (client-side)...");
        try {
            // 1. Update the overall chatroom state to 'resolved'
            const { error: chatroomUpdateError } = await supabase
                .from("chatroom")
                .update({ state: "resolved", updated_at: new Date().toISOString() })
                .eq("id", chatroomId);

            if (chatroomUpdateError) {
                console.error(
                    "markAsDelivered: Error updating chatroom state to resolved:",
                    chatroomUpdateError
                );
                throw new Error("Failed to update chatroom state.");
            }
            console.log("markAsDelivered: Chatroom state updated to 'resolved'.");

            // 2. Update the status of ALL baskets belonging to this chatroom to 'resolved'
            // This ensures individual basket statuses also reflect the delivered state.
            const { error: basketsUpdateError } = await supabase
                .from("basket") // Target the 'basket' table
                .update({ status: "resolved", updated_at: new Date().toISOString() })
                .eq("chatroom_id", chatroomId); // Ensure you're updating baskets only for this specific chatroom

            if (basketsUpdateError) {
                console.error(
                    "markAsDelivered: Error updating baskets status:",
                    basketsUpdateError
                );
                throw new Error("Failed to update associated baskets.");
            }
            console.log("markAsDelivered: All baskets in chatroom updated to 'resolved'.");


            await refreshChatroom(); // Immediately fetch fresh chatroom and member states to update UI
            setNotification("Order has been marked as delivered!");
            setTimeout(() => setNotification(null), 3000);
            console.log("markAsDelivered: Chatroom state and baskets updated to 'resolved'.");
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
            if (error) {
                console.error("leaveGroup: Error calling backend function:", error);
            }


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

    return {
        uploadFileToStorage,
        sendMessage,
        markAsOrdered,
        markAsDelivered,
        leaveGroup,
        makeAdmin,
        removeMember,
    };
};
