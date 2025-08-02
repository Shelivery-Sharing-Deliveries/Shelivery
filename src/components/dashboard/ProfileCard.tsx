import { useRouter } from "next/navigation";

interface ProfileCardProps {
  userName: string;
  userAvatar: string;
  id?: string; // Add id to the interface
}

export default function ProfileCard({
  userName,
  userAvatar,
  id, // Destructure id
}: ProfileCardProps) {
  const router = useRouter();

  const handleProfileClick = () => {
    // Navigate to profile edit page
    // Using a placeholder userId since we don't have authentication yet
    router.push("/profile/current-user");
  };

  return (
    <button
      id={id} // Apply the id to the button
      onClick={handleProfileClick}
      className="flex items-center gap-[18px] mb-[18px] w-full text-left hover:opacity-80 transition-opacity cursor-pointer"
    >
      {/* User Avatar */}
      <div className="relative">
        <div
          className="w-[54px] h-[54px] rounded-full bg-cover bg-center border-2 border-[#FFDB0D]"
          style={{ backgroundImage: `url(${userAvatar})` }}
        />
      </div>

      {/* Greeting Text */}
      <div className="flex flex-col gap-1">
        <span className="text-[20px] font-normal leading-[28px] text-[#111827]">
          Hi {userName}!
        </span>
      </div>
    </button>
  );
}
