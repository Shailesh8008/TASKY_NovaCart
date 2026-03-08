import { Request, Response } from "express";
import productModel from "../models/product";
import queryModel from "../models/query";
import imageKit from "../config/imageKit";

const nodemailer = require("nodemailer") as {
  createTransport: (options: unknown) => {
    sendMail: (mailOptions: unknown) => Promise<unknown>;
  };
};

type FileRequest = Request & {
  file?: {
    buffer: Buffer;
    originalname: string;
  };
};

const checkAdmin = (req: Request, res: Response) => res.json({ ok: true });

const addproduct = async (
  req: FileRequest &
    Request<
      unknown,
      unknown,
      { pname?: string; price?: number; category?: string }
    >,
  res: Response,
) => {
  try {
    const { pname, price, category } = req.body;
    if (!pname || !price || !category || !req.file) {
      return res.json({ ok: false, message: "All fields are required!" });
    }

    const { buffer, originalname } = req.file;
    const uploadImage = (await imageKit.upload({
      file: buffer,
      fileName: `${Date.now()}-${originalname}`,
      folder: "/products",
    })) as { url: string };

    const record = new productModel({
      pname,
      price,
      category,
      status: "In Stock",
      pimage: uploadImage.url,
    });
    await record.save();
    return res.json({ ok: true, message: "Product added successfully" });
  } catch (error) {
    return res.json({ ok: false, message: "Internal server error" });
  }
};

const getProducts = async (_req: Request, res: Response) => {
  try {
    const data = await productModel.find();
    if (!data) {
      return res.json({ ok: false, message: "Cannot find any product" });
    }
    return res.json({ ok: true, data });
  } catch (error) {
    return res.json({ ok: false, message: "Internal server error" });
  }
};

const deleteProduct = async (req: Request<{ pid: string }>, res: Response) => {
  try {
    const { pid } = req.params;
    await productModel.findByIdAndDelete(pid);
    const data = await productModel.find();
    return res.json({ ok: true, data });
  } catch (error) {
    return res.json({ ok: false, message: "Internal server error" });
  }
};

const getOneProduct = async (req: Request<{ pid: string }>, res: Response) => {
  try {
    const { pid } = req.params;
    const record = await productModel.findById(pid);
    if (!record) {
      return res.json({ ok: false, message: "Cannot find product" });
    }
    return res.json({ ok: true, data: record });
  } catch (error) {
    return res.json({ ok: false, message: "Internal server error" });
  }
};

const editProduct = async (
  req: FileRequest &
    Request<
      { pid: string },
      unknown,
      { pname?: string; price?: string | number; category?: string; status?: string }
    >,
  res: Response,
) => {
  try {
    const { pid } = req.params;
    const { pname, price, category, status } = req.body;
    const priceValue = typeof price === "string" ? Number(price) : price;
    if (!pname || !category || !status || !priceValue || Number.isNaN(priceValue)) {
      return res.json({ ok: false, message: "All fields are required" });
    }

    const updatePayload: {
      pname: string;
      price: number;
      category: string;
      status: string;
      pimage?: string;
    } = {
      pname,
      price: priceValue,
      category,
      status,
    };

    if (req.file) {
      const { buffer, originalname } = req.file;
      const uploadImage = (await imageKit.upload({
        file: buffer,
        fileName: `${Date.now()}-${originalname}`,
        folder: "/products",
      })) as { url: string };
      updatePayload.pimage = uploadImage.url;
    }

    const isUpdated = await productModel.findByIdAndUpdate(pid, {
      $set: updatePayload,
    });

    if (!isUpdated) {
      return res.json({ ok: false, message: "Cannot update this product" });
    }
    return res.json({ ok: true, message: "Updated Successfully" });
  } catch (error) {
    return res.json({ ok: false, message: "Internal server error" });
  }
};

const getQueries = async (_req: Request, res: Response) => {
  try {
    const record = await queryModel.find();
    if (!record) {
      return res.json({ ok: false, message: "No queries" });
    }
    return res.json({ ok: true, data: record });
  } catch (error) {
    return res.json({ ok: false, message: "Internal server error" });
  }
};

const deleteQuery = async (req: Request<{ qid: string }>, res: Response) => {
  try {
    const { qid } = req.params;
    await queryModel.findByIdAndDelete(qid);
    const record = await queryModel.find();
    return res.json({ ok: true, data: record });
  } catch (error) {
    return res.json({ ok: false, message: "Internal server error" });
  }
};

const getOneQuery = async (req: Request<{ qid: string }>, res: Response) => {
  try {
    const { qid } = req.params;
    const record = await queryModel.findById(qid);
    if (!record) {
      return res.json({ ok: false, message: "Cannot find query" });
    }
    return res.json({ ok: true, data: record });
  } catch (error) {
    return res.json({ ok: false, message: "Internal server error" });
  }
};

const updateQuery = async (req: Request<{ qid: string }>, res: Response) => {
  try {
    const { qid } = req.params;
    await queryModel.findByIdAndUpdate(qid, { status: "Seen" });
    const record = await queryModel.find();
    return res.json({ ok: true, data: record });
  } catch (error) {
    return res.json({ ok: false, message: "Internal server error" });
  }
};

const queryReply = async (
  req: Request<
    { qid: string },
    unknown,
    { to?: string; sub?: string; reply?: string }
  >,
  res: Response,
) => {
  try {
    const { qid } = req.params;
    const { to, sub, reply } = req.body;
    if (!to || !sub || !reply) {
      return res.json({ ok: false, message: "All fields are required" });
    }
    if (!process.env.ADMIN_EMAIL || !process.env.SMTP_PASS) {
      return res
        .status(500)
        .json({ ok: false, message: "Mail configuration is missing" });
    }

    const transporter = nodemailer.createTransport({
      host: "smtp.gmail.com",
      port: 587,
      secure: false,
      auth: {
        user: process.env.ADMIN_EMAIL,
        pass: process.env.SMTP_PASS,
      },
    });

    const info = await transporter.sendMail({
      from: `"ShopBag" <${process.env.ADMIN_EMAIL}>`,
      to,
      subject: sub,
      text: reply,
      html: reply,
    });

    if (!info) {
      return res.json({ ok: false, message: "Cannot sent" });
    }

    await queryModel.findByIdAndUpdate(qid, { status: "Replied" });
    return res.json({ ok: true, message: "Successfully sent" });
  } catch (error) {
    return res.json({ ok: false, message: "Internal server error" });
  }
};

const adminController = {
  checkAdmin,
  addproduct,
  getProducts,
  deleteProduct,
  getOneProduct,
  editProduct,
  getQueries,
  deleteQuery,
  getOneQuery,
  updateQuery,
  queryReply,
};
export default adminController;
