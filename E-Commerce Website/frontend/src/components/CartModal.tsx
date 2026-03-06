import Modal from "./Modal";

type CartModalProps = {
  isOpen: boolean;
  isLoggedIn: boolean;
  onClose: () => void;
  onLoginClick: () => void;
};

export default function CartModal({
  isOpen,
  isLoggedIn,
  onClose,
  onLoginClick,
}: CartModalProps) {
  return (
    <Modal isOpen={isOpen} onClose={onClose} title="Your cart">
      {isLoggedIn ? (
        <div className="space-y-4">
          <p className="text-sm text-slate-600">Your cart is currently empty.</p>
          <button
            type="button"
            className="w-full rounded-full bg-slate-900 px-5 py-3 text-sm font-semibold text-white transition hover:bg-slate-700 cursor-pointer"
          >
            Continue shopping
          </button>
        </div>
      ) : (
        <div className="space-y-4">
          <p className="text-sm text-slate-600">
            Please login to access the cart.
          </p>
          <button
            type="button"
            onClick={onLoginClick}
            className="w-full rounded-full bg-slate-900 px-5 py-3 text-sm font-semibold text-white transition hover:bg-slate-700 cursor-pointer"
          >
            Login
          </button>
        </div>
      )}
    </Modal>
  );
}
