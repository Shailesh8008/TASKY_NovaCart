import {
  clearCart,
  decrementQuantity,
  incrementQuantity,
  removeFromCart,
} from "../store/cartSlice";
import { useAppDispatch, useAppSelector } from "../store/hooks";
import Modal from "./Modal";

type CartModalProps = {
  isOpen: boolean;
  isLoggedIn: boolean;
  cartCount: number;
  onClose: () => void;
  onLoginClick: () => void;
};

export default function CartModal({
  isOpen,
  isLoggedIn,
  cartCount,
  onClose,
  onLoginClick,
}: CartModalProps) {
  const dispatch = useAppDispatch();
  const cartItems = useAppSelector((state) => state.cart.items);
  const subtotal = cartItems.reduce(
    (sum, item) => sum + item.price * item.quantity,
    0,
  );

  const formatCurrency = (value: number) =>
    new Intl.NumberFormat("en-US", {
      style: "currency",
      currency: "USD",
      maximumFractionDigits: 2,
    }).format(value);

  return (
    <Modal isOpen={isOpen} onClose={onClose} title="Your cart">
      <div className="space-y-4">
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
            <div className="max-h-72 space-y-3 overflow-y-auto pr-1">
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
                onClick={isLoggedIn ? onClose : onLoginClick}
                className="w-full rounded-full bg-slate-900 px-5 py-3 text-sm font-semibold text-white transition hover:bg-slate-700 cursor-pointer"
              >
                {isLoggedIn ? "Checkout" : "Login to checkout"}
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
