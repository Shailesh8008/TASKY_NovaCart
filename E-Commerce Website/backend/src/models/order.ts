import { Schema, model } from "mongoose";

const purchasedItemSchema = new Schema(
  {
    productId: { type: String, required: true },
    name: { type: String, required: true },
    price: { type: Number, required: true },
    quantity: { type: Number, required: true, min: 1 },
    imageUrl: { type: String, default: null },
  },
  { _id: false },
);

const orderSchema = new Schema({
  userId: { type: Schema.Types.ObjectId, ref: "users" },
  orderId: String,
  paymentId: String,
  signature: String,
  amount: Number,
  purchasedItems: { type: [purchasedItemSchema], default: [] },
  status: { type: String, default: "pending" },
  createdAt: { type: Date, default: Date.now },
});

export default model("orders", orderSchema);
