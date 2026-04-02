// invites.ts
import { supabase } from "./supabase";
import { Database } from './database.types';

type InvitationRow = Database['public']['Tables']['invitation']['Row'];

/**
 * Generates an invite code by calling the 'create_invitation' PostgreSQL function via Supabase RPC.
 * This function handles checking for existing unused/unexpired codes and generating new ones on the backend.
 * @param userId The ID of the user generating the invite.
 * @returns The invite code string or null if an error occurred.
 */
export async function generateInvite(userId: string): Promise<string | null> {
    try {
        const expiresInDays = 7; 

        console.log(`Calling PostgreSQL function 'create_invitation' for userId: ${userId}`);

        const { data: inviteCode, error: rpcError } = await supabase.rpc('create_invitation', {
            expires_in_days: expiresInDays
        });

        if (rpcError) {
            console.error("Error calling create_invitation RPC:", rpcError.message, rpcError);
            return null;
        }

        if (!inviteCode) {
            console.error("create_invitation RPC returned null or undefined code.");
            return null;
        }

        console.log("Successfully retrieved invite code from RPC:", inviteCode);
        return inviteCode;
    } catch (err) {
        console.error("Unexpected error in generateInvite (RPC call):", err);
        return null;
    }
}

/**
 * Validates an invite code.
 * Checks if the code exists, is not used, and is not expired.
 * @param code The invite code to validate.
 * @returns An object indicating validity and the invite data if valid.
 */
export async function validateInviteCode(code: string) {
    const { data, error } = await supabase
        .from("invitation")
        .select("*")
        .eq("code", code)
        .is("used_by", null)
        .gt("expires_at", new Date().toISOString())
        .single();

    if (error || !data) {
        console.error("Validation error or no data:", error?.message || "No data");
        return { valid: false, reason: "Invalid or expired code" };
    }

    return { valid: true, invite: data };
}

/**
 * Marks an invite code as used by a specific user.
 * @param code The invite code to mark.
 * @param userId The ID of the user who used the invite.
 */
export async function markInviteAsUsed(code: string, userId: string) {
    try {
        const { error } = await supabase
            .from("invitation")
            .update({
                used_by: userId,
                used_at: new Date().toISOString(),
            })
            .eq("code", code);

        if (error) {
            console.error("Failed to mark invite as used:", error.message);
        } else {
            console.log(`Invite code ${code} marked as used by ${userId}`);
        }
    } catch (err) {
        console.error("Unexpected error in markInviteAsUsed:", err);
    }
}

/**
 * Increments the counter for an invite code if it exists in the database.
 * Only increments the counter for valid invite codes that exist in the invitation table.
 * @param code The invite code to increment the counter for.
 * @returns Promise<boolean> - true if counter was incremented, false otherwise.
 */
export async function incrementInviteCounter(code: string): Promise<boolean> {
    try {
        const { data: existingInvites, error: selectError } = await supabase
            .from("invitation")
            .select("id, counter")
            .eq("code", code);

        if (selectError) {
            console.error("Failed to find invite code:", selectError.message);
            return false;
        }

        if (!existingInvites || existingInvites.length === 0) {
            console.log(`Invite code ${code} not found in database, skipping counter increment`);
            return false;
        }

        const existingInvite = existingInvites[0];
        
        if (!existingInvite) {
            console.log(`Invite code ${code} not found in database, skipping counter increment`);
            return false;
        }

        const newCounterValue = (existingInvite.counter || 0) + 1;
        const { error: updateError } = await supabase
            .from("invitation")
            .update({
                counter: newCounterValue
            })
            .eq("code", code);

        if (updateError) {
            console.error("Failed to increment invite counter:", updateError.message);
            return false;
        }

        return true;
    } catch (err) {
        console.error("Unexpected error in incrementInviteCounter:", err);
        return false;
    }
}
