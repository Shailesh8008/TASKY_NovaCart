import {
  clearCart,
  decrementQuantity,
  incrementQuantity,
  removeFromCart,
} from "../store/cartSlice";
import { useState } from "react";
import toast from "react-hot-toast";
import { useAppDispatch, useAppSelector } from "../store/hooks";
import Modal from "./Modal";

type CartModalProps = {
  isOpen: boolean;
  isLoggedIn: boolean;
  cartCount: number;
  onClose: () => void;
  onLoginClick: () => void;
};

type RazorpaySuccessResponse = {
  razorpay_order_id: string;
  razorpay_payment_id: string;
  razorpay_signature: string;
};

type RazorpayInstance = {
  open: () => void;
};

type RazorpayOptions = {
  key: string;
  amount: number;
  currency: string;
  name: string;
  order_id: string;
  prefill: {
    name: string;
    email: string;
  };
  handler: (response: RazorpaySuccessResponse) => void | Promise<void>;
  modal?: {
    ondismiss?: () => void;
  };
};

type RazorpayConstructor = new (options: RazorpayOptions) => RazorpayInstance;

type WindowWithRazorpay = Window & {
  Razorpay?: RazorpayConstructor;
};

let razorpayScriptPromise: Promise<boolean> | null = null;

function loadRazorpayScript(): Promise<boolean> {
  if (typeof window === "undefined") {
    return Promise.resolve(false);
  }

  if ((window as WindowWithRazorpay).Razorpay) {
    return Promise.resolve(true);
  }

  if (razorpayScriptPromise) {
    return razorpayScriptPromise;
  }

  razorpayScriptPromise = new Promise((resolve) => {
    const script = document.createElement("script");
    script.src = "https://checkout.razorpay.com/v1/checkout.js";
    script.async = true;
    script.onload = () => resolve(true);
    script.onerror = () => resolve(false);
    document.body.appendChild(script);
  });

  return razorpayScriptPromise;
}

export default function CartModal({
  isOpen,
  isLoggedIn,
  cartCount,
  onClose,
  onLoginClick,
}: CartModalProps) {
  const dispatch = useAppDispatch();
  const user = useAppSelector((state) => state.auth.user);
  const cartItems = useAppSelector((state) => state.cart.items);
  const [isCheckingOut, setIsCheckingOut] = useState(false);
  const subtotal = cartItems.reduce(
    (sum, item) => sum + item.price * item.quantity,
    0,
  );

  const formatCurrency = (value: number) =>
    new Intl.NumberFormat("en-IN", {
      style: "currency",
      currency: "INR",
      maximumFractionDigits: 2,
    }).format(value);

  const backendUrl =
    (import.meta.env.VITE_BACKEND_URL as string | undefined)?.trim().replace(/\/$/, "") ?? "";
  const razorpayKey = (import.meta.env.VITE_RAZORPAY_ID as string | undefined)?.trim() ?? "";

  const handleCheckout = async () => {
    if (isCheckingOut) {
      return;
    }
    if (!isLoggedIn) {
      toast("Please login first", { icon: "ℹ️" });
      onLoginClick();
      return;
    }
    if (subtotal <= 0) {
      toast.error("Your cart is empty.");
      return;
    }
    if (!backendUrl) {
      toast.error("Backend URL is missing.");
      return;
    }
    if (!razorpayKey) {
      toast.error("Razorpay key is missing.");
      return;
    }

    setIsCheckingOut(true);
    const amount = Number(subtotal.toFixed(2));

    try {
      const sdkReady = await loadRazorpayScript();
      if (!sdkReady) {
        throw new Error("Unable to load Razorpay.");
      }

      const checkoutResponse = await fetch(`${backendUrl}/api/checkout`, {
        method: "POST",
        credentials: "include",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          amount,
          currency: "INR",
          receipt: `receipt#${Date.now()}`,
        }),
      });

      const checkoutData: unknown = await checkoutResponse.json();
      const checkoutRoot =
        typeof checkoutData === "object" && checkoutData !== null
          ? (checkoutData as Record<string, unknown>)
          : null;

      if (!checkoutResponse.ok) {
        throw new Error(
          typeof checkoutRoot?.message === "string"
            ? checkoutRoot.message
            : `Checkout failed (${checkoutResponse.status})`,
        );
      }

      if (!checkoutRoot || checkoutRoot.ok !== true) {
        throw new Error(
          typeof checkoutRoot?.message === "string"
            ? checkoutRoot.message
            : "Unable to create payment order.",
        );
      }

      const orderData =
        typeof checkoutRoot.data === "object" && checkoutRoot.data !== null
          ? (checkoutRoot.data as Record<string, unknown>)
          : null;

      if (!orderData) {
        throw new Error("Invalid checkout response.");
      }

      const RazorpayCtor = (window as WindowWithRazorpay).Razorpay;
      if (!RazorpayCtor) {
        throw new Error("Razorpay SDK unavailable.");
      }

      const options: RazorpayOptions = {
        key: razorpayKey,
        amount:
          typeof orderData.amount === "number" ? orderData.amount : Math.round(amount * 100),
        currency: typeof orderData.currency === "string" ? orderData.currency : "INR",
        name: "ShopBag",
        order_id: typeof orderData.id === "string" ? orderData.id : "",
        prefill: {
          name: user?.name ?? "",
          email: typeof checkoutRoot.email === "string" ? checkoutRoot.email : "",
        },
        handler: async (response) => {
          try {
            const verifyResponse = await fetch(`${backendUrl}/api/verifypayment`, {
              method: "POST",
              credentials: "include",
              headers: {
                "Content-Type": "application/json",
              },
              body: JSON.stringify({
                amount,
                orderId: response.razorpay_order_id,
                paymentId: response.razorpay_payment_id,
                signature: response.razorpay_signature,
              }),
            });

            const verifyData: unknown = await verifyResponse.json();
            const verifyRoot =
              typeof verifyData === "object" && verifyData !== null
                ? (verifyData as Record<string, unknown>)
                : null;

            if (!verifyResponse.ok || !verifyRoot || verifyRoot.ok !== true) {
              toast.error(
                typeof verifyRoot?.message === "string"
                  ? verifyRoot.message
                  : "Payment verification failed",
              );
              setIsCheckingOut(false);
              return;
            }

            toast.success(
              typeof verifyRoot.message === "string" ? verifyRoot.message : "Payment Success",
            );
            dispatch(clearCart());
            onClose();
            setIsCheckingOut(false);
          } catch (_error) {
            toast.error("Something went wrong");
            setIsCheckingOut(false);
          }
        },
        modal: {
          ondismiss: () => setIsCheckingOut(false),
        },
      };

      if (!options.order_id) {
        throw new Error("Order ID not found.");
      }

      const razorpayWindow = new RazorpayCtor(options);
      razorpayWindow.open();
    } catch (error) {
      const message = error instanceof Error ? error.message : "Something went wrong";
      toast.error(message);
      setIsCheckingOut(false);
    }
  };

  return (
    <Modal isOpen={isOpen} onClose={onClose} title="Your cart" scrollContent={false}>
      <div className="flex max-h-[calc(100vh-10rem)] flex-col space-y-4">
        {cartItems.length === 0 ? (
          <>
            <p className="text-sm text-slate-600">Your cart is currently empty.</p>
            <button
              type="button"
              onClick={onClose}
              className="w-full rounded-full bg-slate-900 px-5 py-3 text-sm font-semibold text-white transition hover:bg-slate-700 cursor-pointer"
            >
              Continue shopping
            </button>
          </>
        ) : (
          <>
            <div className="min-h-0 flex-1 space-y-3 overflow-y-auto pr-1">
              {cartItems.map((item) => (
                <article key={item.id} className="rounded-xl border border-slate-200 p-3">
                  <div className="flex items-start gap-3">
                    <div className="h-14 w-14 shrink-0 overflow-hidden rounded-md bg-slate-100">
                      {item.imageUrl ? (
                        <img
                          src={item.imageUrl}
                          alt={item.name}
                          className="h-full w-full object-contain"
                        />
                      ) : null}
                    </div>
                    <div className="min-w-0 flex-1">
                      <p className="truncate text-sm font-semibold text-slate-900">
                        {item.name}
                      </p>
                      <p className="text-xs text-slate-600">{formatCurrency(item.price)}</p>
                      <div className="mt-2 flex items-center gap-2">
                        <button
                          type="button"
                          onClick={() => dispatch(decrementQuantity(item.id))}
                          className="rounded-md border border-slate-300 px-2 py-0.5 text-sm text-slate-700 cursor-pointer"
                        >
                          -
                        </button>
                        <span className="text-sm font-medium text-slate-800">
                          {item.quantity}
                        </span>
                        <button
                          type="button"
                          onClick={() => dispatch(incrementQuantity(item.id))}
                          className="rounded-md border border-slate-300 px-2 py-0.5 text-sm text-slate-700 cursor-pointer"
                        >
                          +
                        </button>
                        <button
                          type="button"
                          onClick={() => dispatch(removeFromCart(item.id))}
                          className="ml-auto text-xs font-semibold text-rose-600 hover:text-rose-700 cursor-pointer"
                        >
                          Remove
                        </button>
                      </div>
                    </div>
                  </div>
                </article>
              ))}
            </div>

            <div className="rounded-xl bg-slate-50 p-3 text-sm">
              <div className="flex items-center justify-between text-slate-700">
                <span>Items</span>
                <span>{cartCount}</span>
              </div>
              <div className="mt-1 flex items-center justify-between font-semibold text-slate-900">
                <span>Subtotal</span>
                <span>{formatCurrency(subtotal)}</span>
              </div>
            </div>

            {!isLoggedIn && (
              <p className="text-xs text-amber-700">
                Login to sync this cart to your account and continue checkout.
              </p>
            )}

            <div className="grid gap-2">
              <button
                type="button"
                onClick={handleCheckout}
                disabled={isCheckingOut}
                className="w-full rounded-full bg-slate-900 px-5 py-3 text-sm font-semibold text-white transition hover:bg-slate-700 disabled:cursor-not-allowed disabled:opacity-70 cursor-pointer"
              >
                {isCheckingOut
                  ? "Processing..."
                  : isLoggedIn
                    ? "Checkout"
                    : "Login to checkout"}
              </button>
              <button
                type="button"
                onClick={() => dispatch(clearCart())}
                className="w-full rounded-full border border-slate-300 px-5 py-3 text-sm font-semibold text-slate-700 transition hover:border-slate-900 hover:text-slate-900 cursor-pointer"
              >
                Clear cart
              </button>
            </div>
          </>
        )}
      </div>
    </Modal>
  );
}
