"use client";

import { useEffect, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { useAuth } from "@/hooks/useAuth";
import { supabase } from "@/lib/supabase";
import { Button, PageLayout } from "@/components/ui";

interface BasketData {
  shopId: string;
  shopName: string;
  amount: number;
  link: string;
  currency: string;
  locationId: string;
  note?: string;
  items?: any[];
}

export default function SubmitBasketContent() {
  const { user, loading: authLoading } = useAuth();
  const router = useRouter();
  const searchParams = useSearchParams();
  const [basketData, setBasketData] = useState<BasketData | null>(null);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    // Try to get basket data from localStorage or URL params
    const storedBasket = localStorage.getItem('pendingBasket');
    if (storedBasket) {
      try {
        setBasketData(JSON.parse(storedBasket));
      } catch (err) {
        console.error('Error parsing stored basket:', err);
        setError('Invalid basket data found');
      }
    } else {
      // If no stored basket, redirect back to shops
      router.push('/shops');
    }
  }, [router]);

  useEffect(() => {
    // If user is authenticated and we have basket data, submit automatically
    if (!authLoading && user && basketData && !submitting) {
      handleSubmitBasket();
    }
  }, [user, authLoading, basketData, submitting]);

  const handleSubmitBasket = async () => {
    if (!user || !basketData) return;

    setSubmitting(true);
    setError(null);

    try {
      // Use the same RPC function as the authenticated basket creation
      const basketDataForRPC = {
        shop_id: basketData.shopId,
        amount: basketData.amount,
        link: basketData.link || null,
        note: basketData.note || null,
        location_id: basketData.locationId,
        user_id: user.id,
      };

      const { data, error: rpcError } = await supabase.rpc(
        "create_basket_and_join_pool",
        {
          basket_data: basketDataForRPC,
        }
      );

      if (rpcError) {
        throw rpcError;
      }

      if (!data || !data.pool_id) {
        throw new Error("Failed to create basket and join pool: Missing pool ID.");
      }

      // Track the event
      await supabase.rpc("track_event", {
        event_type_param: "basket_created",
        metadata_param: {
          user_id: user.id,
          shop_id: basketData.shopId,
          basket_total: basketData.amount,
          pool_id: data.pool_id,
          chatroom_id: data.chatroom_id || null,
          basket_id: data.basket_id,
        },
      });

      // Clear the stored basket data
      localStorage.removeItem('pendingBasket');

      // Redirect to the pool page
      router.push(`/pool/${data.basket_id}`);
    } catch (err: any) {
      console.error('Error submitting basket:', err);
      setError(err.message || 'Failed to submit basket');
      setSubmitting(false);
    }
  };

  const handleSignIn = () => {
    // Store current basket data and redirect to auth
    if (basketData) {
      localStorage.setItem('pendingBasket', JSON.stringify(basketData));
    }
    router.push('/auth?redirect=/submit-basket');
  };

  const handleGoBack = () => {
    router.back();
  };

  if (authLoading) {
    return (
      <PageLayout>
        <div className="flex items-center justify-center py-8">
          <div className="w-8 h-8 border-4 border-[#FFDB0D] border-t-transparent rounded-full animate-spin mr-2" />
          <p className="text-gray-600">Checking authentication...</p>
        </div>
      </PageLayout>
    );
  }

  if (submitting) {
    return (
      <PageLayout>
        <div className="flex items-center justify-center py-8">
          <div className="w-8 h-8 border-4 border-[#FFDB0D] border-t-transparent rounded-full animate-spin mr-2" />
          <p className="text-gray-600">Submitting your basket...</p>
        </div>
      </PageLayout>
    );
  }

  if (!basketData) {
    return (
      <PageLayout>
        <div className="text-center py-8">
          <h1 className="text-2xl font-bold mb-4">No Basket Found</h1>
          <p className="text-gray-600 mb-6">We couldn't find your basket data.</p>
          <Button onClick={() => router.push('/shops')}>
            Start Over
          </Button>
        </div>
      </PageLayout>
    );
  }

  if (error) {
    return (
      <PageLayout>
        <div className="text-center py-8">
          <h1 className="text-2xl font-bold mb-4 text-red-600">Submission Failed</h1>
          <p className="text-gray-600 mb-6">{error}</p>
          <div className="flex gap-4 justify-center">
            <Button onClick={handleGoBack} className="bg-gray-500">
              Go Back
            </Button>
            <Button onClick={() => setError(null)}>
              Try Again
            </Button>
          </div>
        </div>
      </PageLayout>
    );
  }

  // User is not authenticated - show sign in prompt
  if (!user) {
    return (
      <PageLayout>
        <div className="max-w-md mx-auto text-center py-8">
          <div className="bg-white rounded-lg shadow-lg p-6">
            <h1 className="text-2xl font-bold mb-4">Almost There!</h1>
            <p className="text-gray-600 mb-6">
              To submit your basket and join the pool, you'll need to sign in or create an account.
            </p>

            {basketData && (
              <div className="bg-gray-50 rounded-lg p-4 mb-6 text-left">
                <h3 className="font-semibold mb-2">Your Basket:</h3>
                <p className="text-sm text-gray-600">Shop: {basketData.shopName}</p>
                <p className="text-sm text-gray-600">Total: CHF {basketData.amount.toFixed(2)}</p>
              </div>
            )}

            <div className="flex flex-col gap-3">
              <Button
                onClick={handleSignIn}
                className="w-full bg-[#245B7B] text-white"
              >
                Sign In / Create Account
              </Button>
              <Button
                onClick={handleGoBack}
                className="w-full bg-gray-200 text-gray-700"
              >
                Go Back
              </Button>
            </div>
          </div>
        </div>
      </PageLayout>
    );
  }

  // This shouldn't be reached as authenticated users auto-submit
  return (
    <PageLayout>
      <div className="text-center py-8">
        <p>Processing your basket...</p>
      </div>
    </PageLayout>
  );
}
