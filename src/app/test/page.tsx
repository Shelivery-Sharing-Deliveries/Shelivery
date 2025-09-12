"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";

export default function TestRootPage() {
  const router = useRouter();

  useEffect(() => {
    router.replace("/test/dashboard");
  }, [router]);

  return null;
}
