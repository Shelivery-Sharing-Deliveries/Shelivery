import { useRouter } from "next/navigation";
import Image from "next/image";

interface ProfileCardProps {
  userName: string;
  userAvatar: string;
  id?: string;
}

export default function ProfileCard({
  userName,
  userAvatar,
  id,
}: ProfileCardProps) {
  const router = useRouter();

  const handleProfileClick = () => {
    router.push("/profile/current-user");
  };

  // If your backend supports resizing (Supabase example), use smaller size directly
  const optimizedAvatar =
    userAvatar.includes("supabase")
      ? `${userAvatar}?width=54&height=54&quality=70`
      : userAvatar;

  return (
    <button
      id={id}
      onClick={handleProfileClick}
      className="flex items-center gap-[18px] mb-[18px] w-full text-left hover:opacity-80 transition-opacity cursor-pointer"
    >
      {/* Avatar */}
      <div className="relative w-[54px] h-[54px] rounded-full border-2 border-[#FFDB0D] overflow-hidden">
        <Image
          src={optimizedAvatar}
          alt={userName}
          fill
          sizes="54px"
          className="object-cover"
          loading="lazy"
        />
      </div>

      {/* Greeting */}
      <div className="flex flex-col gap-1">
        <span className="text-[20px] font-normal leading-[28px] text-[#111827]">
          Hi {userName}!
        </span>
      </div>
    </button>
  );
}
