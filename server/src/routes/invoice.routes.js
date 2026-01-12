import express from "express";
import { authMiddleware } from "../authMiddleware/auth.middleware.js";
import { createInvoice, getInvoices } from "../controllers/invoice.controller.js";
import { validate } from "../utils/validate.utils.js";
import { invoiceSchema } from "../validators/invoice.schema.js";

const router = express.Router();
router.use(authMiddleware);

router.post("/", validate(invoiceSchema), createInvoice);
router.get("/", getInvoices);

export default router;