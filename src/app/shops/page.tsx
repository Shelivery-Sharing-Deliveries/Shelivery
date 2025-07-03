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
    // MODIFIED: Only include specified fields
    min_amount: number;
    logo_url: string | null;
    is_active: boolean;
    // description: string; // Commented out
    // category: string; // Commented out
    // minimum_order: number; // Commented out (using min_amount instead)
    // delivery_fee: number; // Commented out
    // estimated_delivery_time: string; // Commented out
    // created_at: string; // Commented out
}

export default function ShopsPage() {
    const [shops, setShops] = useState<Shop[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    // REMOVED: selectedCategory as category field is not present
    // const [selectedCategory, setSelectedCategory] = useState<string>("all");

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
            if (!user) {
                setLoading(false);
                return;
            }

            setLoading(true);
            setError(null);

            try {
                // MODIFIED: Select only the specified columns
                const { data, error: fetchError } = await supabase
                    .from("shop")
                    .select("id, name, min_amount, logo_url, is_active")
                    .eq("is_active", true)
                    .order("name");

                if (fetchError) {
                    throw fetchError;
                }

                setShops(data || []);
            } catch (err: any) {
                console.error("Error fetching shops:", err);
                setError(err.message || "Failed to load shops");
            } finally {
                setLoading(false);
            }
        };

        fetchShops();
    }, [user]);

    // REMOVED: Category filtering logic as 'category' column is not present
    // const categories = [
    //   "all",
    //   ...Array.from(new Set(shops.map((shop) => shop.category))),
    // ];

    // Filtered shops will just be all shops since no category filter
    const filteredShops = shops; // MODIFIED: No filtering for now

    const handleShopSelect = (shop: Shop) => {
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
        return null;
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

                {/* REMOVED: Category Filter */}
                {/* <div className="mb-6">
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
        </div> */}

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
                            No shops are currently available.
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
                                                {/* REMOVED: Category display */}
                                                {/* <span className="text-sm text-shelivery-text-tertiary bg-gray-100 px-2 py-1 rounded-shelivery-sm">
                          {shop.category}
                        </span> */}
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

                                        {/* REMOVED: Description display */}
                                        {/* <p className="text-shelivery-text-secondary text-sm mb-3">
                      {shop.description}
                    </p> */}

                                        {/* Shop Details */}
                                        <div className="flex flex-wrap gap-4 text-sm text-shelivery-text-tertiary">
                                            <div className="flex items-center gap-1">
                                                {/* REMOVED: SVG icon that was drawing the dollar sign */}
                                                Min: CHF {shop.min_amount}
                                            </div>

                                            {/* REMOVED: Delivery Fee and Estimated Delivery Time */}
                                            {/* <div className="flex items-center gap-1">
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
                      </div> */}
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
