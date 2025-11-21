"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { supabase } from "@/lib/supabase";
import { ProgressBar } from "@/components/ui/ProgressBar";
import { useAuth } from "@/hooks/useAuth";

interface FeaturedPool {
    id: string;
    shop_id: string;
    shop_name: string;
    shop_logo_url: string | null;
    location_name: string;
    current_amount: number | null;
    min_amount: number;
    location_id: string;
    remaining_chf: number;
}

interface FeaturedShopCardProps {
    className?: string;
}

export default function FeaturedShopCard({ className }: FeaturedShopCardProps) {
    const [featuredPool, setFeaturedPool] = useState<FeaturedPool | null>(null);
    const [loading, setLoading] = useState(true);
    const { user, loading: authLoading } = useAuth();
    const router = useRouter();

    useEffect(() => {
        const fetchFeaturedPool = async () => {
            if (authLoading) return; // Wait for auth state

            try {
                setLoading(true);

                let query = supabase
                    .from("pool")
                    .select(`
                        id,
                        shop_id,
                        location_id,
                        current_amount,
                        min_amount,
                        shop:shop (
                            name,
                            logo_url,
                            is_active
                        ),
                        location:location (
                            name,
                            type
                        )
                    `);

                // Filter for meetup locations (type = 'other')
                query = query.eq("location.type", "other");

                // Filter based on user auth status
                if (user) {
                    // For authenticated users: public pools OR pools matching their dormitory
                    const { data: userData } = await supabase
                        .from("user")
                        .select("dormitory_id")
                        .eq("id", user.id)
                        .single();

                    if (userData?.dormitory_id) {
                        // Include public pools OR private pools matching user's dormitory
                        query = query.or(`dormitory_id.is.null,dormitory_id.eq.${userData.dormitory_id}`);
                    } else {
                        // User has no dormitory - only public pools
                        query = query.is("dormitory_id", null);
                    }
                } else {
                    // For guest users: only public pools
                    query = query.is("dormitory_id", null);
                }

                // Only active shops
                query = query.eq("shop.is_active", true);

                const { data, error } = await query;

                if (error) {
                    console.error("Error fetching featured pool:", error);
                    setFeaturedPool(null);
                    return;
                }

                if (!data || data.length === 0) {
                    setFeaturedPool(null);
                    return;
                }

                // Find the pool with minimum remaining CHF
                let bestPool: any = null;
                let minRemaining = Infinity;

                for (const pool of data) {
                    if (!pool.shop || !pool.location) continue;

                    const shop: any = pool.shop;
                    const location: any = pool.location;

                    if (!shop.name) continue;

                    const currentAmount = pool.current_amount || 0;
                    const remaining = pool.min_amount - currentAmount;

                    if (remaining < minRemaining && remaining > 0) { // Only show pools that need more money
                        minRemaining = remaining;
                        bestPool = {
                            id: pool.id,
                            shop_id: pool.shop_id,
                            shop_name: shop.name || "Unknown Shop",
                            shop_logo_url: shop.logo_url || null,
                            location_name: location.name || "Unknown Location",
                            current_amount: currentAmount,
                            min_amount: pool.min_amount,
                            location_id: pool.location_id,
                            remaining_chf: remaining
                        };
                    }
                }

                setFeaturedPool(bestPool);
            } catch (err) {
                console.error("Error fetching featured pool:", err);
                setFeaturedPool(null);
            } finally {
                setLoading(false);
            }
        };

        fetchFeaturedPool();
    }, [user, authLoading]);

    const handleClick = () => {
        // TODO: Use router.push(`/shops?type=meetup&meetupLocation=${featuredPool.location_id}`) for direct meetup selection
        router.push('/shops');
    };

    if (loading) {
        return (
            <div className={`bg-white rounded-shelivery-lg p-3 border border-gray-200 ${className}`}>
                <div className="flex items-center gap-3">
                    {/* Skeleton logo */}
                    <div className="w-12 h-12 bg-gray-100 rounded-shelivery-md flex items-center justify-center flex-shrink-0 animate-pulse" />

                    <div className="flex-1 min-w-0">
                        {/* Skeleton tag */}
                        <div className="w-24 h-3 bg-gray-200 rounded-full mb-1 animate-pulse" />

                        {/* Skeleton title */}
                        <div className="w-32 h-4 bg-gray-200 rounded mb-1 animate-pulse" />

                        {/* Skeleton progress and amount */}
                        <div className="flex items-center gap-2">
                            <div className="w-16 h-3 bg-gray-200 rounded animate-pulse" />
                            <div className="w-20 h-2 bg-gray-200 rounded animate-pulse" />
                        </div>
                    </div>

                    {/* Skeleton arrow */}
                    <div className="w-4 h-4 bg-gray-200 rounded animate-pulse" />
                </div>
            </div>
        );
    }

    if (!featuredPool) {
        return null; // Hide component if no featured pool available
    }

    return (
        <div
            className={` mb-2 bg-white rounded-shelivery-lg p-3 border border-gray-200 hover:border-shelivery-primary-blue transition-colors cursor-pointer ${className}`}
            onClick={handleClick}
        >
            <div className="flex items-center gap-3">
                {/* Shop Logo - Keep prominent size */}
                <div className="w-14 h-14 bg-gray-100 rounded-shelivery-md flex items-center justify-center flex-shrink-0">
                    {featuredPool.shop_logo_url ? (
                        <img
                            src={featuredPool.shop_logo_url}
                            alt={featuredPool.shop_name}
                            className="w-full h-full object-cover rounded-shelivery-md"
                        />
                    ) : (
                        <svg
                            className="w-7 h-7 text-gray-400"
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

                {/* Shop Info - More compact */}
                <div className="flex-1 min-w-0">
                    {/* Meetup point tag - smaller */}
                    <div className="mb-0.5">
                        <span className="inline-block bg-shelivery-primary-blue text-white text-[10px] px-1.5 py-0.5 rounded-full font-medium">
                            Meetup @ {featuredPool.location_name}
                        </span>
                    </div>

                    {/* Shop Name - smaller */}
                    <div className="flex items-center justify-between">
                        <h3 className="font-semibold text-shelivery-text-primary truncate">
                            {featuredPool.shop_name}
                        </h3>
                        <svg
                            className="w-4 h-4 text-shelivery-text-tertiary flex-shrink-0 ml-1"
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

                    {/* Progress - compact horizontal layout */}
                    <div className="flex items-center gap-2 mt-1">
                        <span className="text-[10px] text-shelivery-text-secondary font-medium">
                            {featuredPool.remaining_chf} CHF to go
                        </span>
                        <ProgressBar
                            current={featuredPool.current_amount || 0}
                            target={featuredPool.min_amount}
                            showPercentage={false}
                            showAmount={false}
                            animated={true}
                            variant="default"
                            className="h-1.5 flex-1"
                        />
                    </div>
                </div>
            </div>
        </div>
    );
}
