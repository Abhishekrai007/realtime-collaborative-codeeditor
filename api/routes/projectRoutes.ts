import express from "express";
import {
  createProject,
  getProjects,
  getProject,
  updateProject,
  deleteProject,
  addCollaborator,
} from "../controllers/projectController";
import { authMiddleware } from "../middleware/auth";
import { executeCode } from "../controllers/codeExecutionController";

const router = express.Router();

router.use(authMiddleware);

router.post("/", createProject);
router.get("/", getProjects);
router.get("/:id", getProject);
router.put("/:id", updateProject);
router.post("/execute", executeCode);
router.delete("/:id", deleteProject);
router.post("/:id/collaborators", addCollaborator);
router.post("/api/projects/execute", executeCode);
export default router;
