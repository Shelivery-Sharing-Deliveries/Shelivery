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

                // Filter based on user auth status
                let allPools: any[] = [];

                if (user) {
                    // For authenticated users: get user dormitory info
                    const { data: userData } = await supabase
                        .from("user")
                        .select("dormitory_id")
                        .eq("id", user.id)
                        .single();

                    // Query 1: Get pools with location.type = "other"
                    const otherLocationQuery = supabase
                        .from("pool")
                        .select(`
                            id,
                            shop_id,
                            location_id,
                            current_amount,
                            min_amount,
                            dormitory_id,
                            shop:shop (
                                name,
                                logo_url,
                                is_active
                            ),
                            location:location (
                                name,
                                type
                            ),
                            dormitory:dormitory (
                                name
                            )
                        `)
                        .eq("location.type", "other")
                        .eq("shop.is_active", true);

                    const { data: otherLocationPools, error: otherError } = await otherLocationQuery;

                    if (!otherError && otherLocationPools) {
                        allPools = [...allPools, ...otherLocationPools];
                    }

                    // Query 2: Get pools matching user's dormitory (if they have one)
                    if (userData?.dormitory_id) {
                        const dormitoryQuery = supabase
                            .from("pool")
                            .select(`
                                id,
                                shop_id,
                                location_id,
                                current_amount,
                                min_amount,
                                dormitory_id,
                                shop:shop (
                                    name,
                                    logo_url,
                                    is_active
                                ),
                                location:location (
                                    name,
                                    type
                                ),
                                dormitory:dormitory (
                                    name
                                )
                            `)
                            .eq("dormitory_id", userData.dormitory_id)
                            .eq("shop.is_active", true);

                        const { data: dormitoryPools, error: dormError } = await dormitoryQuery;

                        if (!dormError && dormitoryPools) {
                            // Filter out duplicates (pools that are already in otherLocationPools)
                            const uniqueDormitoryPools = dormitoryPools.filter(
                                dormPool => !allPools.some(pool => pool.id === dormPool.id)
                            );
                            allPools = [...allPools, ...uniqueDormitoryPools];
                        }
                    }
                } else {
                    // For guest users: only pools with location.type = "other"
                    const guestQuery = supabase
                        .from("pool")
                        .select(`
                            id,
                            shop_id,
                            location_id,
                            current_amount,
                            min_amount,
                            dormitory_id,
                            shop:shop (
                                name,
                                logo_url,
                                is_active
                            ),
                            location:location (
                                name,
                                type
                            )
                        `)
                        .eq("location.type", "other")
                        .eq("shop.is_active", true);

                    const { data, error } = await guestQuery;
                    if (!error && data) {
                        allPools = data;
                    }
                }

                // Use the data we collected
                const data = allPools;

                if (!data || data.length === 0) {
                    setFeaturedPool(null);
                    return;
                }

                // Find the pool with minimum remaining CHF using database calculation
                // First, enrich pools with calculated remaining amounts
                const poolsWithRemaining = data
                    .filter(pool => pool.shop && pool.shop.name) // Require shop data, but location is optional for dorm pools
                    .map(pool => {
                        const shop: any = pool.shop;
                        const location: any = pool.location;
                        const dormitory: any = pool.dormitory;
                        const currentAmount = pool.current_amount || 0;
                        const remaining = pool.min_amount - currentAmount;

                        // Use dormitory name if available, otherwise location name
                        const location_name = dormitory?.name || location?.name || "Unknown Location";

                        return {
                            ...pool,
                            shop_name: shop.name || "Unknown Shop",
                            shop_logo_url: shop.logo_url || null,
                            location_name: location_name,
                            current_amount: currentAmount,
                            remaining_chf: remaining
                        };
                    })
                    .filter(pool => pool.remaining_chf > 0); // Only pools that still need money

                if (poolsWithRemaining.length === 0) {
                    setFeaturedPool(null);
                    return;
                }

                // Find the pool with minimum remaining CHF
                const bestPool = poolsWithRemaining.reduce((best, current) =>
                    current.remaining_chf < best.remaining_chf ? current : best
                );

                setFeaturedPool({
                    id: bestPool.id,
                    shop_id: bestPool.shop_id,
                    shop_name: bestPool.shop_name,
                    shop_logo_url: bestPool.shop_logo_url,
                    location_name: bestPool.location_name,
                    current_amount: bestPool.current_amount,
                    min_amount: bestPool.min_amount,
                    location_id: bestPool.location_id,
                    remaining_chf: bestPool.remaining_chf
                });
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
