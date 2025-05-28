"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "@/hooks/useAuth";
import { supabase } from "@/lib/supabase";
import { Button } from "@/components/ui/Button";
import { Navigation } from "@/components/ui/Navigation";

interface Shop {
  id: string;
  name: string;
  description: string;
  category: string;
  logo_url: string | null;
  minimum_order: number;
  delivery_fee: number;
  estimated_delivery_time: string;
  is_active: boolean;
  created_at: string;
}

export default function ShopsPage() {
  const [shops, setShops] = useState<Shop[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [selectedCategory, setSelectedCategory] = useState<string>("all");

  const { user, loading: authLoading } = useAuth();
  const router = useRouter();

  // Redirect if not authenticated
  useEffect(() => {
    if (!authLoading && !user) {
      router.push("/auth");
    }
  }, [user, authLoading, router]);

  // Fetch shops from Supabase
  useEffect(() => {
    const fetchShops = async () => {
      try {
        setLoading(true);
        const { data, error } = await supabase
          .from("shops")
          .select("*")
          .eq("is_active", true)
          .order("name");

        if (error) {
          throw error;
        }

        setShops(data || []);
      } catch (err: any) {
        console.error("Error fetching shops:", err);
        setError(err.message || "Failed to load shops");
      } finally {
        setLoading(false);
      }
    };

    if (user) {
      fetchShops();
    }
  }, [user]);

  // Get unique categories
  const categories = [
    "all",
    ...Array.from(new Set(shops.map((shop) => shop.category))),
  ];

  // Filter shops by category
  const filteredShops =
    selectedCategory === "all"
      ? shops
      : shops.filter((shop) => shop.category === selectedCategory);

  const handleShopSelect = (shop: Shop) => {
    // Navigate to basket creation for this shop
    router.push(`/shops/${shop.id}/basket` as any);
  };

  if (authLoading || loading) {
    return (
      <div className="min-h-screen bg-shelivery-background-gray">
        <Navigation />
        <div className="flex items-center justify-center pt-20">
          <div className="text-center">
            <div className="w-8 h-8 border-4 border-shelivery-primary-yellow border-t-transparent rounded-full animate-spin mx-auto mb-4" />
            <p className="text-shelivery-text-secondary">Loading shops...</p>
          </div>
        </div>
      </div>
    );
  }

  if (!user) {
    return null; // Will redirect
  }

  if (error) {
    return (
      <div className="min-h-screen bg-shelivery-background-gray">
        <Navigation />
        <div className="flex items-center justify-center pt-20 p-4">
          <div className="text-center max-w-md">
            <div className="w-16 h-16 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <svg
                className="w-8 h-8 text-red-600"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
                />
              </svg>
            </div>
            <h2 className="text-xl font-semibold text-shelivery-text-primary mb-2">
              Failed to Load Shops
            </h2>
            <p className="text-shelivery-text-secondary mb-6">{error}</p>
            <Button onClick={() => window.location.reload()}>Try Again</Button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-shelivery-background-gray">
      <Navigation />

      <div className="pt-20 pb-6 px-4 max-w-2xl mx-auto">
        {/* Header */}
        <div className="text-center mb-8">
          <h1 className="text-3xl font-bold text-shelivery-text-primary mb-2">
            Choose a Shop
          </h1>
          <p className="text-shelivery-text-secondary">
            Select a delivery service to start your basket
          </p>
        </div>

        {/* Category Filter */}
        <div className="mb-6">
          <div className="flex gap-2 overflow-x-auto pb-2">
            {categories.map((category) => (
              <button
                key={category}
                onClick={() => setSelectedCategory(category)}
                className={`px-4 py-2 rounded-shelivery-lg text-sm font-medium whitespace-nowrap transition-colors ${
                  selectedCategory === category
                    ? "bg-shelivery-primary-yellow text-shelivery-text-primary"
                    : "bg-white text-shelivery-text-secondary hover:bg-shelivery-primary-yellow/20"
                }`}
              >
                {category === "all"
                  ? "All Shops"
                  : category.charAt(0).toUpperCase() + category.slice(1)}
              </button>
            ))}
          </div>
        </div>

        {/* Shops Grid */}
        {filteredShops.length === 0 ? (
          <div className="text-center py-12">
            <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <svg
                className="w-8 h-8 text-gray-400"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10"
                />
              </svg>
            </div>
            <h3 className="text-lg font-medium text-shelivery-text-primary mb-2">
              No shops found
            </h3>
            <p className="text-shelivery-text-secondary">
              {selectedCategory === "all"
                ? "No shops are currently available"
                : `No shops found in ${selectedCategory} category`}
            </p>
          </div>
        ) : (
          <div className="space-y-4">
            {filteredShops.map((shop) => (
              <div
                key={shop.id}
                className="bg-white rounded-shelivery-lg p-4 border border-gray-200 hover:border-shelivery-primary-blue transition-colors cursor-pointer"
                onClick={() => handleShopSelect(shop)}
              >
                <div className="flex items-start gap-4">
                  {/* Shop Logo */}
                  <div className="w-16 h-16 bg-gray-100 rounded-shelivery-md flex items-center justify-center flex-shrink-0">
                    {shop.logo_url ? (
                      <img
                        src={shop.logo_url}
                        alt={shop.name}
                        className="w-full h-full object-cover rounded-shelivery-md"
                      />
                    ) : (
                      <svg
                        className="w-8 h-8 text-gray-400"
                        fill="none"
                        stroke="currentColor"
                        viewBox="0 0 24 24"
                      >
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth={2}
                          d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10"
                        />
                      </svg>
                    )}
                  </div>

                  {/* Shop Info */}
                  <div className="flex-1 min-w-0">
                    <div className="flex items-start justify-between mb-2">
                      <div>
                        <h3 className="text-lg font-semibold text-shelivery-text-primary">
                          {shop.name}
                        </h3>
                        <span className="text-sm text-shelivery-text-tertiary bg-gray-100 px-2 py-1 rounded-shelivery-sm">
                          {shop.category}
                        </span>
                      </div>
                      <svg
                        className="w-5 h-5 text-shelivery-text-tertiary"
                        fill="none"
                        stroke="currentColor"
                        viewBox="0 0 24 24"
                      >
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth={2}
                          d="M9 5l7 7-7 7"
                        />
                      </svg>
                    </div>

                    <p className="text-shelivery-text-secondary text-sm mb-3">
                      {shop.description}
                    </p>

                    {/* Shop Details */}
                    <div className="flex flex-wrap gap-4 text-sm text-shelivery-text-tertiary">
                      <div className="flex items-center gap-1">
                        <svg
                          className="w-4 h-4"
                          fill="none"
                          stroke="currentColor"
                          viewBox="0 0 24 24"
                        >
                          <path
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            strokeWidth={2}
                            d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1"
                          />
                        </svg>
                        Min: €{shop.minimum_order}
                      </div>

                      <div className="flex items-center gap-1">
                        <svg
                          className="w-4 h-4"
                          fill="none"
                          stroke="currentColor"
                          viewBox="0 0 24 24"
                        >
                          <path
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            strokeWidth={2}
                            d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z"
                          />
                          <path
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            strokeWidth={2}
                            d="M15 11a3 3 0 11-6 0 3 3 0 016 0z"
                          />
                        </svg>
                        Delivery: €{shop.delivery_fee}
                      </div>

                      <div className="flex items-center gap-1">
                        <svg
                          className="w-4 h-4"
                          fill="none"
                          stroke="currentColor"
                          viewBox="0 0 24 24"
                        >
                          <path
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            strokeWidth={2}
                            d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z"
                          />
                        </svg>
                        {shop.estimated_delivery_time}
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
