import { supabase } from "@/lib/supabase";
import { useEffect, useState } from "react";
import Image from "next/image";
import { Tables } from "@/lib/supabase"; // type helper

interface BannerProps {
  className?: string;
}

type Banner = Tables<"banner">;

export default function Banner({ className = "" }: BannerProps) {
  const [banners, setBanners] = useState<Banner[]>([]);
  const [loading, setLoading] = useState(true);
  const [loadedImages, setLoadedImages] = useState<{ [key: number]: boolean }>({});

  // Fetch banners from Supabase
  useEffect(() => {
    async function fetchBanners() {
      setLoading(true);
      const { data, error } = await supabase
        .from("banner")
        .select("*")
        .order("date", { ascending: false });

      if (error) {
        console.error("Failed to fetch banners:", error);
      } else {
        setBanners(data || []);
      }
      setLoading(false);
    }
    fetchBanners();
  }, []);

  // Preload images manually, mark as loaded when done
  useEffect(() => {
    banners.forEach((banner) => {
      if (!banner.image) return;

      const img = new window.Image();
      img.src = banner.image;
      img.onload = () => {
        setLoadedImages((prev) => ({ ...prev, [banner.id]: true }));
      };
    });
  }, [banners]);

  if (loading) return <p>Loading banners...</p>;

  if (banners.length === 0)
    return <p className="text-center text-gray-500">No new banners</p>;

  return (
    <div className={`flex flex-col gap-3 ${className}`}>
      {banners
        .filter((banner) => banner.image)
        .map((banner) => (
          <div
            key={banner.id}
            className="relative w-full rounded-[20px] overflow-hidden cursor-pointer hover:opacity-90 transition-opacity"
            style={{ aspectRatio: "16 / 9", backgroundColor: "#f3f3f3" }}
          >
            {loadedImages[banner.id] && (
              <Image
                src={banner.image!}
                alt={`Banner ${banner.id}`}
                fill
                className="object-cover rounded-[20px]"
                priority={true}
              />
            )}
          </div>
        ))}
    </div>
  );
}
