import express from "express";
import { auth } from "../middleware/auth";
const apiRouter = express.Router();
import userController from "../controllers/user";

apiRouter.get("/health", (req, res) => res.json({ response: "ok" }));
apiRouter.get("/api/auth/user", auth, userController.checkUser);

apiRouter.post("/api/register", userController.register);
apiRouter.post("/api/login", userController.login);
apiRouter.post("/api/logout", auth, userController.logout);

export default apiRouter;
