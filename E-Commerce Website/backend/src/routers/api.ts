import express from "express";
import { auth } from "../middleware/auth";
import { adminAuth } from "../middleware/auth";
const apiRouter = express.Router();
import adminController from "../controllers/admin";
import userController from "../controllers/user";
import { uploads } from "../middleware/multer";

apiRouter.get("/health", (req, res) => res.json({ response: "ok" }));

apiRouter.post("/api/reg", userController.reg);
apiRouter.post("/api/login", userController.login);
apiRouter.post(
  "/api/addproduct",
  auth,
  adminAuth,
  uploads.single("pimage"),
  adminController.addproduct,
);
apiRouter.delete(
  "/api/deleteproduct/:pid",
  auth,
  adminAuth,
  adminController.deleteProduct,
);
apiRouter.post(
  "/api/editproduct/:pid",
  auth,
  adminAuth,
  uploads.single("pimage"),
  adminController.editProduct,
);
apiRouter.get("/api/getproducts", adminController.getProducts);
apiRouter.get("/api/getproduct/:pid", adminController.getOneProduct);
apiRouter.get("/api/getqueries", adminController.getQueries);
apiRouter.get("/api/getquerydetails/:qid", adminController.getOneQuery);
apiRouter.delete(
  "/api/deletequery/:qid",
  auth,
  adminAuth,
  adminController.deleteQuery,
);
apiRouter.get(
  "/api/updatestatus/:qid",
  auth,
  adminAuth,
  adminController.updateQuery,
);
apiRouter.post(
  "/api/queryreply/:qid",
  auth,
  adminAuth,
  adminController.queryReply,
);
apiRouter.get("/api/checkadmin", auth, adminAuth, adminController.checkAdmin);
apiRouter.delete("/api/logout", auth, userController.logout);
apiRouter.get("/api/auth/user", auth, userController.checkUser);
apiRouter.post("/api/submitquery", userController.query);
apiRouter.post("/api/savecart", auth, userController.userCart);
apiRouter.get("/api/search", userController.getSearchResult);
apiRouter.get("/api/fetchcart", auth, userController.fetchCart);
apiRouter.get("/api/myorders", auth, userController.myOrders);
apiRouter.post("/api/checkout", auth, userController.checkout);
apiRouter.post("/api/verifypayment", auth, userController.verifyPayment);

export default apiRouter;
