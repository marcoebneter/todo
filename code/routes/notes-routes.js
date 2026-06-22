import { Router } from "express";
import NotesApiController from "../controllers/notes-api-controller.js";

const router = Router();
const controller = new NotesApiController();

router.get("/", (req, res, next) => controller.list(req, res, next));
router.post("/", (req, res, next) => controller.create(req, res, next));
router.put("/:id", (req, res, next) => controller.replace(req, res, next));
router.patch("/:id", (req, res, next) => controller.patch(req, res, next));
router.delete("/:id", (req, res, next) => controller.softDelete(req, res, next));

export default router;
