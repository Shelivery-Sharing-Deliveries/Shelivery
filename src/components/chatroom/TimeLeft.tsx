import { useAutoUpdatingTimeLeft } from "@/lib/utils";

export function TimeLeft({ expireAt }: { expireAt: string }) {
  const timeLeft = useAutoUpdatingTimeLeft(expireAt);
  return <>{timeLeft}</>;
}
