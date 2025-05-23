import { Router } from "express";
import { processDocs } from "../controllers/document.controller";

const router: Router = Router();

router.get("/documents", processDocs);

export default router;
