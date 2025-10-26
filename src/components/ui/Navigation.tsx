"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import Image from "next/image";
import { usePWA } from "@/hooks/usePWA";
import { usePWAPopup } from "@/contexts/PWAContext";
import { useState, useEffect } from "react";

interface NavigationProps {
  className?: string;
}

const navItems = [
  {
    name: "Dashboard",
    href: "/dashboard",
    icon: "category",
  },
  {
    name: "Stores",
    href: "/shops",
    icon: "shop",
  },
  {
    name: "Chatrooms",
    href: "/chatrooms",
    icon: "messages",
  },
];

export function Navigation({ className = "" }: NavigationProps) {
  const pathname = usePathname();
  const { isPWA, isLoading } = usePWA();
  const { setShowPwaPopup } = usePWAPopup();
  const [activeTab, setActiveTab] = useState<string | null>(null);
  const [isScrolled, setIsScrolled] = useState(false);

  // Dynamic background based on scroll and theme
  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 10);
    };

    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  const renderIcon = (iconType: string, isActive: boolean) => {
    let iconPath;

    if (iconType === "category") {
      // Category icon: already yellow, so use white filter when inactive
      iconPath = `/icons/navbar/category-bold-icon.svg`;
      const filter = isActive
        ? "none"
        : "brightness(0) saturate(100%) invert(100%)";

      return (
        <Image
          src={iconPath}
          alt={iconType}
          width={24}
          height={24}
          className="transition-all duration-200"
          style={{ filter }}
        />
      );
    } else {
      // For shop and messages icons, create SVG directly with the right color
      if (iconType === "shop") {
        const color = isActive ? "#FFDB0D" : "white";
        return (
          <svg
            width="21"
            height="22"
            viewBox="0 0 21 22"
            fill="none"
            xmlns="http://www.w3.org/2000/svg"
            className="transition-all duration-200"
          >
            <path
              d="M1.45156 10.0628V14.5946C1.45156 19.1264 3.26831 20.9431 7.8001 20.9431H13.2403C17.7721 20.9431 19.5888 19.1264 19.5888 14.5946V10.0628"
              stroke={color}
              strokeWidth="1.5"
              strokeLinecap="round"
              strokeLinejoin="round"
            />
            <path
              d="M10.5252 10.8501C12.3722 10.8501 13.7348 9.34619 13.5531 7.49916L12.887 0.756981H8.17353L7.49729 7.49916C7.31562 9.34619 8.67818 10.8501 10.5252 10.8501Z"
              stroke={color}
              strokeWidth="1.5"
              strokeLinecap="round"
              strokeLinejoin="round"
            />
            <path
              d="M16.8939 10.8501C18.9327 10.8501 20.4265 9.1948 20.2247 7.16609L19.9421 4.39049C19.5787 1.76629 18.5694 0.756981 15.925 0.756981H12.8466L13.5531 7.83223C13.7247 9.49759 15.2286 10.8501 16.8939 10.8501Z"
              stroke={color}
              strokeWidth="1.5"
              strokeLinecap="round"
              strokeLinejoin="round"
            />
            <path
              d="M4.10603 10.8501C5.77139 10.8501 7.27526 9.49759 7.43675 7.83223L7.6588 5.60166L8.14326 0.756981H5.06488C2.42049 0.756981 1.41118 1.76629 1.04783 4.39049L0.775316 7.16609C0.573455 9.1948 2.06723 10.8501 4.10603 10.8501Z"
              stroke={color}
              strokeWidth="1.5"
              strokeLinecap="round"
              strokeLinejoin="round"
            />
            <path
              d="M10.5252 15.8966C8.83968 15.8966 8.00196 16.7343 8.00196 18.4199V20.9431H13.0485V18.4199C13.0485 16.7343 12.2108 15.8966 10.5252 15.8966Z"
              stroke={color}
              strokeWidth="1.5"
              strokeLinecap="round"
              strokeLinejoin="round"
            />
          </svg>
        );
      } else if (iconType === "messages") {
        const color = isActive ? "#FFDB0D" : "white";
        return (
          <svg
            width="22"
            height="22"
            viewBox="0 0 22 22"
            fill="none"
            xmlns="http://www.w3.org/2000/svg"
            className="transition-all duration-200"
          >
            <path
              d="M17.0933 9.74715V13.834C17.0933 14.0996 17.083 14.3551 17.0524 14.6003C16.8174 17.3589 15.1929 18.728 12.1993 18.728H11.7906C11.5351 18.728 11.2899 18.8506 11.1367 19.0549L9.91063 20.6897C9.36912 21.4151 8.49043 21.4151 7.94892 20.6897L6.72286 19.0549C6.59003 18.8812 6.29375 18.728 6.06898 18.728H5.6603C2.40103 18.728 0.766285 17.9209 0.766285 13.834V9.74715C0.766285 6.75353 2.14561 5.12901 4.89401 4.89401C5.13922 4.86336 5.39465 4.85314 5.6603 4.85314H12.1993C15.4585 4.85314 17.0933 6.48788 17.0933 9.74715Z"
              stroke={color}
              strokeWidth="1.5"
              strokeMiterlimit="10"
              strokeLinecap="round"
              strokeLinejoin="round"
            />
            <path
              d="M21.1801 5.6603V9.74715C21.1801 12.751 19.8008 14.3653 17.0524 14.6003C17.0831 14.3551 17.0933 14.0996 17.0933 13.834V9.74715C17.0933 6.48788 15.4585 4.85314 12.1993 4.85314H5.66033C5.39468 4.85314 5.13926 4.86336 4.89404 4.89401C5.12904 2.14561 6.75356 0.766285 9.74718 0.766285H16.2861C19.5454 0.766285 21.1801 2.40103 21.1801 5.6603Z"
              stroke={color}
              strokeWidth="1.5"
              strokeMiterlimit="10"
              strokeLinecap="round"
              strokeLinejoin="round"
            />
            <path
              d="M12.5114 12.2606H12.5206"
              stroke={color}
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
            />
            <path
              d="M8.93539 12.2606H8.94458"
              stroke={color}
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
            />
            <path
              d="M5.35939 12.2606H5.36859"
              stroke={color}
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
            />
          </svg>
        );
      }
    }

    return null;
  };

  return (
    <div className="w-full relative">
      {/* Eclipse-shaped navigation container - Bottom positioned with safe area */}
      <div className="fixed bottom-0 left-0 right-0 z-50 pb-2 sm:pb-0" style={{ paddingBottom: 'env(safe-area-inset-bottom)' }}>
        <div className="w-full h-[74px] flex items-center justify-center px-4 py-1.5 pt-6 pb-2">
          <div
            className="relative flex items-center gap-[45px] px-8 py-3 rounded-[50px] transition-all duration-500"
            style={{
              background: isScrolled
                ? `
                  linear-gradient(135deg,
                    rgba(36, 91, 123, 0.95) 0%,
                    rgba(36, 91, 123, 0.98) 25%,
                    rgba(36, 91, 123, 0.98) 50%,
                    rgba(36, 91, 123, 0.98) 75%,
                    rgba(36, 91, 123, 0.95) 100%
                  ),
                  radial-gradient(circle at 50% 0%,
                    rgba(255, 255, 255, 0.15) 0%,
                    rgba(255, 255, 255, 0.08) 30%,
                    rgba(255, 255, 255, 0.03) 60%,
                    transparent 100%
                  )
                `
                : `
                  linear-gradient(135deg,
                    rgba(36, 91, 123, 0.85) 0%,
                    rgba(36, 91, 123, 0.92) 25%,
                    rgba(36, 91, 123, 0.92) 50%,
                    rgba(36, 91, 123, 0.92) 75%,
                    rgba(36, 91, 123, 0.85) 100%
                  ),
                  radial-gradient(circle at 50% 0%,
                    rgba(255, 255, 255, 0.12) 0%,
                    rgba(255, 255, 255, 0.06) 30%,
                    rgba(255, 255, 255, 0.02) 60%,
                    transparent 100%
                  )
                `,
              boxShadow: isScrolled
                ? `
                  0 20px 60px rgba(0, 0, 0, 0.4),
                  0 8px 32px rgba(0, 0, 0, 0.3),
                  inset 0 2px 0 rgba(255, 255, 255, 0.15),
                  inset 0 -2px 0 rgba(0, 0, 0, 0.1),
                  inset 0 0 0 1px rgba(255, 255, 255, 0.08)
                `
                : `
                  0 12px 40px rgba(0, 0, 0, 0.25),
                  0 4px 20px rgba(0, 0, 0, 0.2),
                  inset 0 1px 0 rgba(255, 255, 255, 0.1),
                  inset 0 -1px 0 rgba(0, 0, 0, 0.05),
                  inset 0 0 0 1px rgba(255, 255, 255, 0.05)
                `,
              border: '1px solid rgba(255, 255, 255, 0.1)',
              backdropFilter: isScrolled ? 'blur(40px)' : 'blur(25px)',
            }}
          >
            {navItems.map((item) => {
              // Enhanced active state check to include choose-shop for Stores
              const isActive =
                pathname === item.href ||
                pathname.startsWith(item.href + "/") ||
                (item.href === "/shops" && pathname === "/choose-shop");

              return (
                <Link
                  key={item.name}
                  href={item.href as any}
                  className="relative flex flex-col items-center gap-1 transition-all duration-300 group"
                  onMouseEnter={() => setActiveTab(item.name)}
                  onMouseLeave={() => setActiveTab(null)}
                >
                  {/* Ripple effect background */}
                  <div className="absolute inset-0 rounded-full opacity-0 group-hover:opacity-20 group-active:opacity-30 transition-all duration-200 bg-white/20 scale-75 group-active:scale-100" />

                  {/* Icon container with enhanced effects */}
                  <div
                    className={`relative w-6 h-6 transition-all duration-300 ${
                      isActive || activeTab === item.name
                        ? 'scale-110 drop-shadow-lg'
                        : 'scale-100 group-hover:scale-105'
                    }`}
                  >
                    {renderIcon(item.icon, isActive)}

                    {/* Active indicator glow */}
                    {isActive && (
                      <div className="absolute inset-0 rounded-full bg-[#FFDB0D]/30 blur-md animate-pulse" />
                    )}
                  </div>

                  {/* Enhanced text with better typography */}
                  <span
                    className={`text-[12px] font-semibold leading-4 transition-all duration-300 ${
                      isActive || activeTab === item.name
                        ? 'text-[#FFDB0D] scale-105'
                        : 'text-white/90 group-hover:text-white group-hover:scale-102'
                    }`}
                    style={{
                      textShadow: isActive
                        ? '0 0 8px rgba(255, 219, 13, 0.5)'
                        : 'none',
                    }}
                  >
                    {item.name}
                  </span>

                  {/* Active indicator bar */}
                  {isActive && (
                    <div className="absolute -bottom-1 left-1/2 transform -translate-x-1/2 w-1 h-1 bg-[#FFDB0D] rounded-full animate-pulse" />
                  )}
                </Link>
              );
            })}

            {/* Enhanced Install button */}
            {!isPWA && !isLoading && (
              <button
                onClick={() => setShowPwaPopup(true)}
                className="relative flex flex-col items-center gap-1 transition-all duration-300 group"
                aria-label="Install App"
                onMouseEnter={() => setActiveTab('install')}
                onMouseLeave={() => setActiveTab(null)}
              >
                {/* Ripple effect */}
                <div className="absolute inset-0 rounded-full opacity-0 group-hover:opacity-20 group-active:opacity-30 transition-all duration-200 bg-[#FFDB0D]/20 scale-75 group-active:scale-100" />

                <div
                  className={`relative w-6 h-6 transition-all duration-300 ${
                    activeTab === 'install'
                      ? 'scale-110 drop-shadow-lg'
                      : 'scale-100 group-hover:scale-105'
                  }`}
                >
                  <svg
                    width="24"
                    height="24"
                    viewBox="0 0 24 24"
                    fill="none"
                    xmlns="http://www.w3.org/2000/svg"
                    className="w-6 h-6 transition-all duration-300"
                  >
                    <path
                      d="M12 16L7 11L8.4 9.55L11 12.15V4H13V12.15L15.6 9.55L17 11L12 16ZM6 20C5.45 20 4.979 19.804 4.587 19.412C4.195 19.02 3.99933 18.5493 4 18V15H6V18H18V15H20V18C20 18.55 19.804 19.021 19.412 19.413C19.02 19.805 18.5493 20.0007 18 20H6Z"
                      fill="#FFDB0D"
                      className="transition-all duration-300 group-hover:drop-shadow-lg"
                    />
                  </svg>

                  {/* Glow effect for install button */}
                  {activeTab === 'install' && (
                    <div className="absolute inset-0 rounded-full bg-[#FFDB0D]/30 blur-md animate-pulse" />
                  )}
                </div>

                <span
                  className={`text-[12px] font-semibold leading-4 transition-all duration-300 ${
                    activeTab === 'install'
                      ? 'text-[#FFDB0D] scale-105'
                      : 'text-[#FFDB0D]/90 group-hover:text-[#FFDB0D] group-hover:scale-102'
                  }`}
                  style={{
                    textShadow: activeTab === 'install'
                      ? '0 0 8px rgba(255, 219, 13, 0.5)'
                      : 'none',
                  }}
                >
                  Install
                </span>
              </button>
            )}
          </div>
        </div>
      </div>

      {/* Spacer to prevent content overlap - Bottom navigation */}
      <div className="h-[74px] w-full" />
    </div>
  );
}
