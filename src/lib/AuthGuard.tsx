// hooks/AuthGuard.ts
"use client";

import { useEffect, useState, useRef } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "@/hooks/useAuth";
import { supabase } from "@/lib/supabase";
import posthog, { PostHog } from "posthog-js";

interface AuthGuardProps {
  children: React.ReactNode;
}

export default function AuthGuard({ children }: AuthGuardProps) {
  const { user, loading: authLoading } = useAuth();
  const router = useRouter();
  const [isCheckingDormitory, setIsCheckingDormitory] = useState(true);
  const checkedUserIdRef = useRef<string | null>(null);

  useEffect(() => {
    const checkAuthAndDormitory = async () => {
      if (authLoading) {
        setIsCheckingDormitory(true);
        return;
      }

      if (!user) {
        router.push("/auth");
        setIsCheckingDormitory(false);
        checkedUserIdRef.current = null;
        return;
      }

      if (user.id !== checkedUserIdRef.current) {
        setIsCheckingDormitory(true);

        try {
          const { data: userData, error: userError } = await supabase
            .from("user")
            .select("dormitory_id")
            .eq("id", user.id)
            .single();

          if (userError) {
            console.error(
              "AuthGuard: Error fetching dormitory_id from 'user' table:",
              userError.message
            );
            router.push(`/profile-set/${user.id}`);
          } else if (
            userData?.dormitory_id === null ||
            userData?.dormitory_id === undefined
          ) {
            router.push(`/profile-set/${user.id}`);
          } else {
            checkedUserIdRef.current = user.id;
            posthog.identify(user.id);
          }
        } catch (error) {
          console.error(
            "AuthGuard: Unexpected error during dormitory_id check in AuthGuard:",
            error
          );
          router.push(`/profile-set/${user.id}`);
        } finally {
          setIsCheckingDormitory(false);
        }
      } else {
        setIsCheckingDormitory(false);
      }
    };

    checkAuthAndDormitory();
  }, [user, authLoading, router]);

  if (authLoading || isCheckingDormitory) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-white">
        <div className="text-center">
          <div className="w-8 h-8 border-4 border-[#FFDB0D] border-t-transparent rounded-full animate-spin mx-auto mb-4" />
          <p className="text-[#A4A7AE]">Checking authentication...</p>
        </div>
      </div>
    );
  }

  return <>{children}</>;
}
