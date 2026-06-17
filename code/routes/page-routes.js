import { Router } from "express";
import PageController from "../controllers/page-controller.js";

const router = Router();
const controller = new PageController();

router.get("/", (req, res) => controller.renderIndex(req, res));
router.get("/partials/notes", (req, res, next) => controller.renderNotesPartial(req, res, next));

export default router;
