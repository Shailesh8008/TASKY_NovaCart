import { Request, Response } from "express";
import bcrypt from "bcrypt";
import jwt from "jsonwebtoken";
import crypto from "crypto";
import Razorpay from "razorpay";
import type { Types } from "mongoose";
import userModel from "../models/user";
import queryModel from "../models/query";
import cartModel from "../models/cart";
import productModel from "../models/product";
import orderModel from "../models/order";
import { MyJwtPayload } from "../interfaces";

type UserRecord = {
  _id: Types.ObjectId;
  fname: string;
  lname?: string;
  email: string;
  pass: string;
  role: string;
};

type PurchasedItem = {
  productId: string;
  name: string;
  price: number;
  quantity: number;
  imageUrl: string | null;
};

function asRecord(value: unknown): Record<string, unknown> | null {
  if (typeof value !== "object" || value === null) {
    return null;
  }
  return value as Record<string, unknown>;
}

function readString(value: unknown): string {
  return typeof value === "string" ? value : "";
}

function readNumber(value: unknown): number {
  return typeof value === "number" && Number.isFinite(value) ? value : 0;
}

function normalizePurchasedItems(items: unknown[]): PurchasedItem[] {
  return items
    .map((item) => {
      const record = asRecord(item);
      if (!record) {
        return null;
      }
      const productId = readString(record.id) || readString(record.productId);
      const name = readString(record.name) || "Product";
      const price = readNumber(record.price);
      const quantity = Math.max(1, Math.floor(readNumber(record.quantity) || 1));
      const imageUrl = readString(record.imageUrl) || null;

      if (!productId) {
        return null;
      }

      return {
        productId,
        name,
        price,
        quantity,
        imageUrl,
      };
    })
    .filter((entry): entry is PurchasedItem => entry !== null);
}

const checkUser = (req: Request, res: Response) => {
  const user = req.user as MyJwtPayload | undefined;
  return res.json({ ok: true, userId: user?.id });
};

const reg = async (
  req: Request<unknown, unknown, { fname?: string; lname?: string; email?: string; pass1?: string }>,
  res: Response,
) => {
  try {
    const { fname, lname, email, pass1 } = req.body;

    if (!fname || !email || !pass1) {
      return res.json({
        message: "first name, email or password is/are missing!",
      });
    }

    const isEmailExists = await userModel.findOne({ email });
    if (isEmailExists) {
      return res.json({ ok: false, message: "Email already Exists!" });
    }

    const hashedPassword = await bcrypt.hash(pass1, 10);
    const record = new userModel({
      fname,
      lname,
      email,
      pass: hashedPassword,
    });

    await record.save();
    return res.json({ ok: true, message: "User registered successfully" });
  } catch (error) {
    console.error("Registration error:", error);
    return res.status(500).json({ message: "Internal server error" });
  }
};

const login = async (
  req: Request<unknown, unknown, { email?: string; pass?: string }>,
  res: Response,
) => {
  try {
    const { email, pass } = req.body;
    if (!email || !pass) {
      return res.json({ ok: false, message: "Email or password missing!" });
    }

    const emailExists = (await userModel.findOne({ email }).lean()) as UserRecord | null;
    if (!emailExists) {
      return res.json({ ok: false, message: "Email does not exist!" });
    }

    const isPass = await bcrypt.compare(pass, emailExists.pass);
    if (!isPass) {
      return res.json({ ok: false, message: "Invalid Password!" });
    }

    if (!process.env.JWT_SECRET_KEY) {
      return res.status(500).json({ ok: false, message: "JWT secret is missing" });
    }

    const token = jwt.sign(
      { id: emailExists._id.toString(), role: emailExists.role },
      process.env.JWT_SECRET_KEY,
      { expiresIn: "7d" },
    );

    res.cookie("token", token, {
      httpOnly: true,
      secure: process.env.ENV === "prod",
      sameSite: process.env.ENV === "prod" ? "none" : "lax",
      maxAge: 7 * 24 * 60 * 60 * 1000,
    });

    return res.json({
      ok: true,
      message: emailExists.role === "admin" ? "Welcome Admin" : "Login Successfully",
      userId: emailExists._id,
    });
  } catch (error) {
    return res.status(500).json({ ok: false, message: "Internal server error" });
  }
};

const query = async (
  req: Request<unknown, unknown, { username?: string; email?: string; query?: string }>,
  res: Response,
) => {
  try {
    const { username, email, query: userQuery } = req.body;
    if (!username || !email || !userQuery) {
      return res.json({ ok: false, message: "All fields are required" });
    }

    const record = new queryModel({
      username,
      email,
      query: userQuery,
    });
    await record.save();
    return res.json({ ok: true, message: "Query Submitted Successfully" });
  } catch (error) {
    return res.json({ ok: false, message: "Internal server error" });
  }
};

const userCart = async (
  req: Request<unknown, unknown, { cartData?: unknown[] }>,
  res: Response,
) => {
  try {
    const user = req.user as MyJwtPayload | undefined;
    const userId = user?.id;
    const { cartData } = req.body;
    if (!userId || !Array.isArray(cartData)) {
      return res.json({ ok: false, message: "Invalid cart data" });
    }

    const isCartExists = await cartModel.findOne({ userId });
    if (isCartExists) {
      isCartExists.userId = userId as unknown as Types.ObjectId;
      isCartExists.CartItems = cartData;
      await isCartExists.save();
    } else {
      const record = new cartModel({
        userId,
        CartItems: cartData,
      });
      await record.save();
    }
    return res.json({ ok: true });
  } catch (error) {
    return res.json({ ok: false, message: "Internal server error" });
  }
};

const getSearchResult = async (
  req: Request<unknown, unknown, unknown, { query?: string }>,
  res: Response,
) => {
  try {
    const searchTerm = typeof req.query.query === "string" ? req.query.query : "";
    const rec = await productModel.find({
      pname: { $regex: searchTerm, $options: "i" },
      status: "In Stock",
    });
    return res.json({ ok: true, data: rec });
  } catch (error) {
    return res.json({ ok: false, message: "Internal server error" });
  }
};

const fetchCart = async (req: Request, res: Response) => {
  try {
    const authUser = req.user as MyJwtPayload | undefined;
    const id = authUser?.id;
    if (!id) {
      return res.json({ ok: false, message: "Unauthorized" });
    }
    const rec = await cartModel.findOne({ userId: id });
    return res.json({ ok: true, data: rec });
  } catch (error) {
    return res.json({ ok: false, message: "Internal server error" });
  }
};

const myOrders = async (req: Request, res: Response) => {
  try {
    const authUser = req.user as MyJwtPayload | undefined;
    const userId = authUser?.id;
    if (!userId) {
      return res.json({ ok: false, message: "Unauthorized" });
    }

    const orders = await orderModel
      .find({ userId })
      .sort({ createdAt: -1 });
    return res.json({ ok: true, data: orders });
  } catch (error) {
    return res.json({ ok: false, message: "Internal server error" });
  }
};

const checkout = async (
  req: Request<unknown, unknown, { amount?: number; currency?: string; receipt?: string }>,
  res: Response,
) => {
  if (!process.env.RAZORPAY_ID || !process.env.RAZORPAY_SECRET_KEY) {
    return res.status(500).json({ ok: false, message: "Razorpay keys are missing" });
  }

  const instance = new Razorpay({
    key_id: process.env.RAZORPAY_ID,
    key_secret: process.env.RAZORPAY_SECRET_KEY,
  });

  try {
    const { amount, currency, receipt } = req.body;
    const user = req.user as MyJwtPayload | undefined;
    const id = user?.id;

    if (!id || !amount || !currency || !receipt) {
      return res.json({ ok: false, message: "Missing required fields" });
    }

    const userRecord = (await userModel.findById(id).lean()) as Pick<
      UserRecord,
      "fname" | "lname" | "email"
    > | null;
    if (!userRecord) {
      return res.json({ ok: false, message: "User not found" });
    }

    const order = await instance.orders.create({
      amount: amount * 100,
      currency,
      receipt,
      notes: {
        name: `${userRecord.fname}${userRecord.lname ? ` ${userRecord.lname}` : ""}`,
        userId: id,
      },
    });

    if (!order) {
      return res.json({ ok: false, message: "Error creating order" });
    }

    return res.json({ ok: true, data: order, email: userRecord.email });
  } catch (error) {
    return res.json({ ok: false, message: "Internal server error" });
  }
};

const verifyPayment = async (
  req: Request<
    unknown,
    unknown,
    { amount?: number; orderId?: string; paymentId?: string; signature?: string }
  >,
  res: Response,
) => {
  try {
    const { amount, orderId, paymentId, signature } = req.body;
    const user = req.user as MyJwtPayload | undefined;
    const userId = user?.id;

    if (!userId || !orderId || !paymentId || !signature || !amount) {
      return res.json({ ok: false, message: "Missing required fields" });
    }
    if (!process.env.RAZORPAY_SECRET_KEY) {
      return res.status(500).json({ ok: false, message: "Razorpay secret is missing" });
    }

    const hmac = crypto.createHmac("sha256", process.env.RAZORPAY_SECRET_KEY);
    hmac.update(`${orderId}|${paymentId}`);
    const generatedSignature = hmac.digest("hex");

    if (generatedSignature === signature) {
      const existingCart = await cartModel.findOne({ userId }).lean();
      const rawItems =
        existingCart && Array.isArray((existingCart as { CartItems?: unknown[] }).CartItems)
          ? (existingCart as { CartItems: unknown[] }).CartItems
          : [];
      const purchasedItems = normalizePurchasedItems(rawItems);

      const rec = new orderModel({
        userId,
        orderId,
        paymentId,
        signature,
        amount,
        purchasedItems,
        status: "paid",
      });
      await rec.save();
      await cartModel.updateOne({ userId }, { $set: { CartItems: [] } });
      return res.json({ ok: true, message: "Payment Success" });
    }

    return res.json({ ok: false, message: "Payment verification failed" });
  } catch (error) {
    return res.json({ ok: false, message: "Internal server error" });
  }
};

const logout = async (_req: Request, res: Response) => {
  try {
    res.clearCookie("token", {
      httpOnly: true,
      secure: process.env.ENV === "prod",
      sameSite: process.env.ENV === "prod" ? "none" : "lax",
    });
    return res.json({ ok: true, message: "Successfully Logout" });
  } catch (error) {
    return res.json({ ok: false, message: "Internal server error" });
  }
};

const userController = {
  reg,
  login,
  query,
  userCart,
  getSearchResult,
  fetchCart,
  myOrders,
  checkout,
  verifyPayment,
  checkUser,
  logout,
};

export default userController;
