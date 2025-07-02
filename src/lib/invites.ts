//Generate Invite Code

import { supabase } from "./supabase";
import { nanoid } from "nanoid";

export async function generateInvite(userId: string) {
  const inviteCode = nanoid(8).toUpperCase();
  const expiresAt = new Date();
  expiresAt.setDate(expiresAt.getDate() + 7); // 7 days validity

  const { error } = await supabase.from("invitation").insert([
    {
      code: inviteCode,
      invited_by: userId,
      expires_at: expiresAt.toISOString(),
    },
  ]);

  if (error) {
    console.error("Error creating invite:", error.message);
    return null;
  }

  return inviteCode;
}

// Validate Invite Code

export async function validateInviteCode(code: string) {
  const { data, error } = await supabase
    .from("invitation")
    .select("*")
    .eq("code", code)
    .is("used_by", null)
    .gt("expires_at", new Date().toISOString())
    .single();

  if (error || !data) {
    return { valid: false, reason: "Invalid or expired code" };
  }

  return { valid: true, invite: data };
}

//Mark Invite as Used

export async function markInviteAsUsed(code: string, userId: string) {
  const { error } = await supabase
    .from("invitation")
    .update({
      used_by: userId,
      used_at: new Date().toISOString(),
    })
    .eq("code", code);

  if (error) {
    console.error("Failed to mark invite as used:", error.message);
  }
}
