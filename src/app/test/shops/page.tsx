"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/Button";
import { PageLayout } from "@/components/ui/PageLayout";

// Mock data for shops
const mockShops = [
    {
        id: 'shop-1',
        name: 'Mock Shop A',
        min_amount: 10,
        logo_url: '/shop-logos/default-logo.png',
        is_active: true,
    },
    {
        id: 'shop-2',
        name: 'Mock Shop B',
        min_amount: 15,
        logo_url: '/shop-logos/default-logo.png',
        is_active: true,
    },
    {
        id: 'shop-3',
        name: 'Mock Shop C',
        min_amount: 5,
        logo_url: '/shop-logos/default-logo.png',
        is_active: false, // Inactive shop
    },
];

// Mock data for active baskets (for a test user)
const mockActiveBaskets = [
    {
        id: 'basket-1',
        shop_id: 'shop-1',
        status: 'in_pool',
    },
];

// Interface for a Shop
interface Shop {
    id: string;
    name: string;
    min_amount: number;
    logo_url: string | null;
    is_active: boolean;
}

// Interface for a user\'s Basket
interface Basket {
    id: string;
    shop_id: string;
    status: string;
}

export default function TestShopsPage() {
    const [shops, setShops] = useState<Shop[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);


    const router = useRouter();

    // Simulate fetching data
    useEffect(() => {
        setLoading(true);
        setError(null);

        // Simulate API call delay
        const timer = setTimeout(() => {
            try {
                // Filter active shops
                const activeMockShops = mockShops.filter(shop => shop.is_active);
                setShops(activeMockShops);
            } catch (err: any) {
                setError(err.message || "Failed to load mock shops.");
            } finally {
                setLoading(false);
            }
        }, 500); // Simulate 500ms loading time

        return () => clearTimeout(timer);
    }, []);

    const filteredShops = shops;

    const handleShopSelect = (shop: Shop) => {
        // Always redirect to the test basket creation page
        router.push(`/test/shops/${shop.id}/basket` as any);
    };

    const handleAddStoreClick = () => {
        // In a test environment, this might navigate to a mock feedback page or just log
        console.log("Navigating to feedback page (mock action)");
        router.push("/test/feedback"); // Assuming a test feedback page exists or will be created
    };

    if (loading) {
        return (
            <div className="min-h-screen bg-shelivery-background-gray">
                <div className="flex items-center justify-center pt-20">
                    <div className="text-center">
                        <div className="w-8 h-8 border-4 border-shelivery-primary-yellow border-t-transparent rounded-full animate-spin mx-auto mb-4" />
                        <p className="text-shelivery-text-secondary">Loading mock shops...</p>
                    </div>
                </div>
            </div>
        );
    }

    if (error) {
        return (
            <div className="min-h-screen bg-shelivery-background-gray">
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
                            Failed to Load Mock Shops
                        </h2>
                        <p className="text-shelivery-text-secondary mb-6">{error}</p>
                        <Button onClick={() => window.location.reload()}>Try Again</Button>
                    </div>
                </div>
            </div>
        );
    }

    const headerContent = (
        <div className="text-center mb-8">
            <h1 className="text-3xl font-bold text-shelivery-text-primary mb-2">
                Choose a Shop (Test)
            </h1>
            <p className="text-shelivery-text-secondary">
                Select a delivery service to start your basket (Test Environment)
            </p>
        </div>
    );

    return (
        <PageLayout header={headerContent}>
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
                        No mock shops found
                    </h3>
                    <p className="text-shelivery-text-secondary">
                        No mock shops are currently available for testing.
                    </p>
                </div>
            ) : (
                <div className="space-y-4 py-2">
                    {filteredShops.map((shop) => (
                        <div
                            key={shop.id}
                            className="bg-white rounded-shelivery-lg p-4 border border-gray-200 hover:border-shelivery-primary-blue transition-colors cursor-pointer"
                            onClick={() => handleShopSelect(shop)}
                        >
                            <div className="flex items-start gap-4">
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

                                <div className="flex-1 min-w-0">
                                    <div className="flex items-start justify-between mb-2">
                                        <div>
                                            <h3 className="text-lg font-semibold text-shelivery-text-primary">
                                                {shop.name}
                                            </h3>
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

                                    <div className="flex flex-wrap gap-4 text-sm text-shelivery-text-tertiary">
                                        <div className="flex items-center gap-1">
                                            Min: CHF {shop.min_amount}
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </div>
                    ))}
                </div>
            )}
            <div className="mt-8 p-6 bg-shelivery-primary-blue text-white rounded-shelivery-lg shadow-xl text-center">
                <h3 className="text-xl font-bold mb-2">Want to add a store? (Test)</h3>
                <p className="text-sm mb-4">
                    Please open a ticket with some information and we'll add it to Shelivery shortly.
                </p>
                <Button onClick={handleAddStoreClick} variant="primary" className="text-sm font-semibold">
                    Open a Ticket (Test)
                </Button>
            </div>
        </PageLayout>
    );
}
