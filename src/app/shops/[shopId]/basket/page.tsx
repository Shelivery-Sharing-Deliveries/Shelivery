"use client";

import { useEffect, useState } from "react";
import { useRouter, useParams } from "next/navigation";
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
}

interface BasketItem {
  name: string;
  price: number;
  quantity: number;
}

export default function BasketCreationPage() {
  const [shop, setShop] = useState<Shop | null>(null);
  const [basketItems, setBasketItems] = useState<BasketItem[]>([]);
  const [newItemName, setNewItemName] = useState("");
  const [newItemPrice, setNewItemPrice] = useState("");
  const [loading, setLoading] = useState(true);
  const [creating, setCreating] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const { user, loading: authLoading } = useAuth();
  const router = useRouter();
  const params = useParams();
  const shopId = params?.shopId as string;

  // Redirect if not authenticated
  useEffect(() => {
    if (!authLoading && !user) {
      router.push("/auth");
    }
  }, [user, authLoading, router]);

  // Fetch shop details
  useEffect(() => {
    const fetchShop = async () => {
      if (!shopId) return;

      try {
        setLoading(true);
        const { data, error } = await supabase
          .from("shops")
          .select(
            "id, name, description, category, logo_url, minimum_order, delivery_fee, estimated_delivery_time"
          )
          .eq("id", shopId)
          .eq("is_active", true)
          .single();

        if (error) {
          throw error;
        }

        if (!data) {
          throw new Error("Shop not found");
        }

        setShop(data);
      } catch (err: any) {
        console.error("Error fetching shop:", err);
        setError(err.message || "Failed to load shop");
      } finally {
        setLoading(false);
      }
    };

    if (user && shopId) {
      fetchShop();
    }
  }, [user, shopId]);

  const addItem = () => {
    if (!newItemName.trim() || !newItemPrice.trim()) {
      return;
    }

    const price = parseFloat(newItemPrice);
    if (isNaN(price) || price <= 0) {
      setError("Please enter a valid price");
      return;
    }

    const newItem: BasketItem = {
      name: newItemName.trim(),
      price: price,
      quantity: 1,
    };

    setBasketItems([...basketItems, newItem]);
    setNewItemName("");
    setNewItemPrice("");
    setError(null);
  };

  const updateQuantity = (index: number, newQuantity: number) => {
    if (newQuantity <= 0) {
      removeItem(index);
      return;
    }

    const updatedItems = basketItems.map((item, i) =>
      i === index ? { ...item, quantity: newQuantity } : item
    );
    setBasketItems(updatedItems);
  };

  const removeItem = (index: number) => {
    const updatedItems = basketItems.filter((_, i) => i !== index);
    setBasketItems(updatedItems);
  };

  const calculateSubtotal = () => {
    return basketItems.reduce(
      (total, item) => total + item.price * item.quantity,
      0
    );
  };

  const calculateTotal = () => {
    const subtotal = calculateSubtotal();
    const deliveryFee = shop?.delivery_fee || 0;
    return subtotal + deliveryFee;
  };

  const canCreateBasket = () => {
    if (!shop || basketItems.length === 0) return false;
    const subtotal = calculateSubtotal();
    return subtotal >= shop.minimum_order;
  };

  const handleCreateBasket = async () => {
    if (!canCreateBasket() || !user || !shop) return;

    setCreating(true);
    setError(null);

    try {
      // Prepare basket data for RPC call
      const basketData = {
        shop_id: shop.id,
        total_amount: calculateTotal(),
        items: basketItems.map((item) => ({
          name: item.name,
          price: item.price,
          quantity: item.quantity,
        })),
      };

      // Call the RPC function to create basket and join pool
      const { data, error } = await supabase.rpc(
        "create_basket_and_join_pool",
        {
          basket_data: basketData,
        }
      );

      if (error) {
        throw error;
      }

      if (!data || !data.pool_id) {
        throw new Error("Failed to create basket and join pool");
      }

      // Track the basket creation event
      await supabase.rpc("track_event", {
        event_type_param: "basket_created",
        metadata_param: {
          user_id: user.id,
          shop_id: shop.id,
          basket_total: calculateTotal(),
          items_count: basketItems.length,
        },
      });

      // Navigate to the pool page
      router.push(`/pool/${data.pool_id}` as any);
    } catch (err: any) {
      console.error("Error creating basket:", err);
      setError(err.message || "Failed to create basket");
    } finally {
      setCreating(false);
    }
  };

  if (authLoading || loading) {
    return (
      <div className="min-h-screen bg-shelivery-background-gray">
        <Navigation />
        <div className="flex items-center justify-center pt-20">
          <div className="text-center">
            <div className="w-8 h-8 border-4 border-shelivery-primary-yellow border-t-transparent rounded-full animate-spin mx-auto mb-4" />
            <p className="text-shelivery-text-secondary">Loading...</p>
          </div>
        </div>
      </div>
    );
  }

  if (!user) {
    return null; // Will redirect
  }

  if (error && !shop) {
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
              Shop Not Found
            </h2>
            <p className="text-shelivery-text-secondary mb-6">{error}</p>
            <Button onClick={() => router.push("/shops")}>Browse Shops</Button>
          </div>
        </div>
      </div>
    );
  }

  if (!shop) return null;

  const subtotal = calculateSubtotal();
  const total = calculateTotal();
  const minimumOrderMet = subtotal >= shop.minimum_order;

  return (
    <div className="min-h-screen bg-shelivery-background-gray">
      <Navigation />

      <div className="pt-20 pb-6 px-4 max-w-2xl mx-auto">
        {/* Header */}
        <div className="mb-6">
          <button
            onClick={() => router.push("/shops")}
            className="flex items-center gap-2 text-shelivery-text-secondary hover:text-shelivery-text-primary mb-4"
          >
            <svg
              className="w-5 h-5"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M15 19l-7-7 7-7"
              />
            </svg>
            Back to Shops
          </button>

          <div className="flex items-center gap-4 mb-4">
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
            <div>
              <h1 className="text-2xl font-bold text-shelivery-text-primary">
                {shop.name}
              </h1>
              <p className="text-shelivery-text-secondary">
                {shop.description}
              </p>
              <div className="flex gap-4 text-sm text-shelivery-text-tertiary mt-1">
                <span>Min: €{shop.minimum_order}</span>
                <span>Delivery: €{shop.delivery_fee}</span>
                <span>{shop.estimated_delivery_time}</span>
              </div>
            </div>
          </div>
        </div>

        {/* Add Item Form */}
        <div className="bg-white rounded-shelivery-lg p-4 mb-6 border border-gray-200">
          <h2 className="text-lg font-semibold text-shelivery-text-primary mb-4">
            Add Items to Your Basket
          </h2>

          <div className="flex gap-2 mb-4">
            <div className="flex-1">
              <input
                type="text"
                placeholder="Item name"
                value={newItemName}
                onChange={(e) => setNewItemName(e.target.value)}
                className="shelivery-input w-full"
                onKeyPress={(e) => e.key === "Enter" && addItem()}
              />
            </div>
            <div className="w-24">
              <input
                type="number"
                placeholder="€0.00"
                value={newItemPrice}
                onChange={(e) => setNewItemPrice(e.target.value)}
                step="0.01"
                min="0"
                className="shelivery-input w-full"
                onKeyPress={(e) => e.key === "Enter" && addItem()}
              />
            </div>
            <Button onClick={addItem} size="sm">
              Add
            </Button>
          </div>

          {error && (
            <div className="bg-red-50 border border-red-200 text-red-700 px-3 py-2 rounded-shelivery-sm text-sm">
              {error}
            </div>
          )}
        </div>

        {/* Basket Items */}
        <div className="bg-white rounded-shelivery-lg border border-gray-200 mb-6">
          <div className="p-4 border-b border-gray-200">
            <h2 className="text-lg font-semibold text-shelivery-text-primary">
              Your Basket ({basketItems.length} items)
            </h2>
          </div>

          {basketItems.length === 0 ? (
            <div className="p-8 text-center">
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
                    d="M3 3h2l.4 2M7 13h10l4-8H5.4m0 0L7 13m0 0l-2.5 5M7 13v8a2 2 0 002 2h6a2 2 0 002-2v-8"
                  />
                </svg>
              </div>
              <p className="text-shelivery-text-secondary">
                Your basket is empty. Add items above to get started.
              </p>
            </div>
          ) : (
            <div className="p-4 space-y-3">
              {basketItems.map((item, index) => (
                <div key={index} className="flex items-center justify-between">
                  <div className="flex-1">
                    <p className="font-medium text-shelivery-text-primary">
                      {item.name}
                    </p>
                    <p className="text-sm text-shelivery-text-secondary">
                      €{item.price.toFixed(2)} each
                    </p>
                  </div>
                  <div className="flex items-center gap-2">
                    <button
                      onClick={() => updateQuantity(index, item.quantity - 1)}
                      className="w-8 h-8 rounded-full border border-gray-300 flex items-center justify-center hover:bg-gray-50"
                    >
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
                          d="M18 12H6"
                        />
                      </svg>
                    </button>
                    <span className="w-8 text-center font-medium">
                      {item.quantity}
                    </span>
                    <button
                      onClick={() => updateQuantity(index, item.quantity + 1)}
                      className="w-8 h-8 rounded-full border border-gray-300 flex items-center justify-center hover:bg-gray-50"
                    >
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
                          d="M12 6v6m0 0v6m0-6h6m-6 0H6"
                        />
                      </svg>
                    </button>
                    <button
                      onClick={() => removeItem(index)}
                      className="ml-2 text-red-500 hover:text-red-700"
                    >
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
                          d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"
                        />
                      </svg>
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Order Summary */}
        {basketItems.length > 0 && (
          <div className="bg-white rounded-shelivery-lg p-4 border border-gray-200 mb-6">
            <h3 className="text-lg font-semibold text-shelivery-text-primary mb-4">
              Order Summary
            </h3>

            <div className="space-y-2 text-sm">
              <div className="flex justify-between">
                <span className="text-shelivery-text-secondary">Subtotal</span>
                <span className="text-shelivery-text-primary">
                  €{subtotal.toFixed(2)}
                </span>
              </div>
              <div className="flex justify-between">
                <span className="text-shelivery-text-secondary">
                  Delivery Fee
                </span>
                <span className="text-shelivery-text-primary">
                  €{shop.delivery_fee.toFixed(2)}
                </span>
              </div>
              <div className="border-t border-gray-200 pt-2 mt-2">
                <div className="flex justify-between font-semibold">
                  <span className="text-shelivery-text-primary">Total</span>
                  <span className="text-shelivery-text-primary">
                    €{total.toFixed(2)}
                  </span>
                </div>
              </div>
            </div>

            {!minimumOrderMet && (
              <div className="mt-4 p-3 bg-yellow-50 border border-yellow-200 rounded-shelivery-sm">
                <p className="text-sm text-yellow-800">
                  Add €{(shop.minimum_order - subtotal).toFixed(2)} more to
                  reach the minimum order of €{shop.minimum_order.toFixed(2)}
                </p>
              </div>
            )}
          </div>
        )}

        {/* Create Basket Button */}
        <Button
          onClick={handleCreateBasket}
          disabled={!canCreateBasket()}
          loading={creating}
          className="w-full"
          size="lg"
        >
          {creating
            ? "Creating Basket..."
            : canCreateBasket()
              ? "Join Pool & Create Basket"
              : basketItems.length === 0
                ? "Add items to continue"
                : `Add €${(shop.minimum_order - subtotal).toFixed(2)} more`}
        </Button>
      </div>
    </div>
  );
}
