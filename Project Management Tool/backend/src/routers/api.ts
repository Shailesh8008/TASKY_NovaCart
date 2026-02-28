import express from "express";
import { auth } from "../middleware/auth";
const apiRouter = express.Router();
import userController from "../controllers/user";

apiRouter.get("/health", (req, res) => res.json({ response: "ok" }));
apiRouter.get("/api/auth/user", auth, userController.checkUser);
apiRouter.get("/api/get-users", userController.getUsers);
apiRouter.get("/api/dashboard", auth, userController.getDashboardOverview);
apiRouter.get("/api/my-projects", auth, userController.getMyProjects);

apiRouter.post("/api/register", userController.register);
apiRouter.post("/api/login", userController.login);
apiRouter.post("/api/logout", auth, userController.logout);
apiRouter.post("/api/create-project", auth, userController.createProject);
apiRouter.post("/api/edit-project", auth, userController.editProject);
apiRouter.post("/api/add-task", auth, userController.addTask);

export default apiRouter;
