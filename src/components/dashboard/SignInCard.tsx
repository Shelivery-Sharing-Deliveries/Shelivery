import { useRouter } from "next/navigation";

interface SignInCardProps {
  id?: string;
}

export default function SignInCard({ id }: SignInCardProps) {
  const router = useRouter();

  const handleSignInClick = () => {
    router.push('/auth');
  };

  return (
    <button
      id={id}
      onClick={handleSignInClick}
      className="flex items-center gap-[18px] mb-[18px] w-full text-left hover:opacity-80 transition-opacity cursor-pointer"
    >
      {/* Avatar with default profile picture */}
      <div className="relative w-[52px] h-[52px]   overflow-hidden">
        <img
          src="/icons/shelivery-logo3.svg"
          alt="Default Avatar"
          className="w-full h-full object-cover"
        />
      </div>

      {/* Greeting */}
      <div className="flex flex-col gap-1">
        <span className="text-[20px] font-normal leading-[28px] text-[#111827]">
          Welcome to Shelivery!
        </span>
        <span className="text-[14px] font-normal leading-[20px] text-[#6B7280]">
          Sign in to track your baskets
        </span>
      </div>
    </button>
  );
}
