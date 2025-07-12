import { supabase } from "@/lib/supabase";
import { useEffect, useState } from "react";
import Image from "next/image";
import { Tables } from "@/lib/supabase"; // type helper

interface BannerProps {
  className?: string;
}

type Banner = Tables<"banners">;

export default function Banner({ className = "" }: BannerProps) {
  const [banners, setBanners] = useState<Banner[]>([]);
  const [loading, setLoading] = useState(true);

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

  if (loading) return <p>Loading banners...</p>;

  return (
    <div className={`flex flex-col gap-3 ${className}`}>
      {banners.length === 0 ? (
        <p className="text-center text-gray-500">No new banners</p>
      ) : (
        banners.map((banner) => (
          <div
            key={banner.id}
            className="w-full h-[172px] rounded-[20px] relative overflow-hidden cursor-pointer hover:opacity-90 transition-opacity"
            style={{ backgroundColor: "#f3f3f3" }}
          >
            <Image
              src={banner.image}
              alt={`Banner ${banner.id}`}
              fill
              className="object-cover"
            />
          </div>
        ))
      )}
    </div>
  );
}
