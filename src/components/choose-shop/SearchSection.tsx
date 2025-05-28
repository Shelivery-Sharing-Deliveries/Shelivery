"use client";

interface SearchSectionProps {
  searchQuery: string;
  onSearchChange: (query: string) => void;
}

export default function SearchSection({
  searchQuery,
  onSearchChange,
}: SearchSectionProps) {
  return (
    <div className="mb-4">
      {/* Search Input */}
      <div className="relative">
        <div className="w-full bg-white border border-[#E5E8EB] rounded-[18px] px-4 py-3 flex items-center gap-3">
          {/* Search Icon */}
          <svg
            width="20"
            height="20"
            viewBox="0 0 20 20"
            fill="none"
            xmlns="http://www.w3.org/2000/svg"
            className="flex-shrink-0"
          >
            <path
              d="M9.16667 15.8333C12.8486 15.8333 15.8333 12.8486 15.8333 9.16667C15.8333 5.48477 12.8486 2.5 9.16667 2.5C5.48477 2.5 2.5 5.48477 2.5 9.16667C2.5 12.8486 5.48477 15.8333 9.16667 15.8333Z"
              stroke="#181D27"
              strokeWidth="1.5"
              strokeLinecap="round"
              strokeLinejoin="round"
            />
            <path
              d="M17.5 17.5L13.875 13.875"
              stroke="#181D27"
              strokeWidth="1.5"
              strokeLinecap="round"
              strokeLinejoin="round"
            />
          </svg>

          {/* Input Field */}
          <input
            type="text"
            placeholder="Search"
            value={searchQuery}
            onChange={(e) => onSearchChange(e.target.value)}
            className="flex-1 text-[14px] font-normal text-black placeholder:text-[#AEB4BC] outline-none bg-transparent"
          />
        </div>
      </div>
    </div>
  );
}
