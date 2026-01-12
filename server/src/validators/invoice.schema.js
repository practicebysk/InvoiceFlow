// validators/invoice.schema.js
import { z } from "zod";

export const invoiceSchema = z.object({
    customer: z.object({
        name: z.string().trim().min(1, "Customer name required."),
        due_date: z.coerce.date().optional(),
        status: z.enum(["Pending", "Paid"]).optional()
    }),

    items: z.array(
        z.object({
            product: z.string().trim().min(1, "Product required."),
            price: z.number().positive("Price must be > 0."),
            qty: z.number().int().positive("Qty must be >= 1."),
            discount: z.number().min(0).optional()
        })
    ).min(1, "At least one item required"),
    commonDiscount: z.number().min(0).optional(),
    gstType: z.enum(["CGST_SGST", "IGST", "NONE"]).optional(),
    gstRate: z.number().min(0).optional(),
    advancePaid: z.number().min(0).optional(),
    extraCharge: z.object({
        label: z.string().optional(),
        amount: z.number().min(0).optional(),
    }),
});
