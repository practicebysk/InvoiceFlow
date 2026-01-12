
import puppeteer from "puppeteer";
import { Invoice } from "../models/Invoice.js";
import {
    getInvoice, getPaginationParams, sendResponse, getTotalCount, generateInvoiceNumber
} from "../utils/funcation.utils.js";
import invoiceTemplate from "../templates/invoice.template.js";
import path from "path";
import { fileURLToPath } from "url";
import { User } from "../models/User.js";

// Create invoice
export const createInvoice = async (req, res) => {
    try {
        const { customer, items, commonDiscount = 0, gstType = "CGST_SGST", gstRate = 18, advancePaid = 0, extraCharge } = req.body;
        // calculate total
        let subtotal = 0;
        items.forEach(it => {
            const itemTotal = it.price * it.qty;
            const discounted = itemTotal * ((it.discount || 0) / 100);
            subtotal += (itemTotal - discounted);
        });
        if (commonDiscount > 0) { subtotal -= subtotal * (commonDiscount / 100); }

        const extraChargeAmount = extraCharge?.amount || 0;
        const taxableAmount = subtotal + extraChargeAmount;

        const gstAmount = taxableAmount * (gstRate / 100);
        const grandTotal = taxableAmount + gstAmount;
        const balanceDue = grandTotal - (advancePaid || 0);

        const userId = req.user._id;
        const invoiceNo = await generateInvoiceNumber(userId);
        const invoice = new Invoice({
            invoiceNo, customer, items, advancePaid, createdBy: userId, commonDiscount, gstType, gstRate, extraCharge,
            totals: {
                taxableAmount,
                gstAmount,
                grandTotal,
                balanceDue: balanceDue < 0 ? 0 : balanceDue
            }
        });
        await invoice.save();
        sendResponse(res, { data: [] });
    } catch (err) {
        console.log(err);
        res.status(500).json({ error: "Failed to create invoice" });
    }
};

// Get all invoices
export const getInvoices = ("/", async (req, res) => {
    const { page, size, name, status, sortBy, sortOrder } = getPaginationParams(req.query);
    const filter = {};
    if (name?.trim()) {
        filter['customer.name'] = {
            $regex: name.trim(), $options: 'i'
        };
    }
    if (status?.trim()) {
        filter['customer.status'] = status.trim();
    }

    const sort = { [sortBy]: sortOrder };

    const rows = await getInvoice(page, size, filter, sort);
    const totalRows = await getTotalCount(filter);
    const totalPages = Math.ceil(totalRows / size);

    sendResponse(res, {
        data: rows,
        pagination: {
            total_pages: totalPages,
            total_rows: totalRows
        },
    });
});

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

export const pdfDownload = ("/:id/pdf", async (req, res) => {
    try {
        const invoice = await Invoice.findById(req.params.id);
        if (!invoice) {
            return res.status(404).json({ message: "Invoice not found" });
        }
        const user = await User.findById(invoice.createdBy);
        if (!user) {
            return res.status(404).json({ message: "User not found" });
        }
        if (!invoice) return res.status(404).send("Invoice not found");

        const html = invoiceTemplate({ user, invoice });

        // Launch Puppeteer
        const browser = await puppeteer.launch({
            headless: "new", // ✅ fix for newer Puppeteer
            args: ["--no-sandbox", "--disable-setuid-sandbox"],
        });
        const page = await browser.newPage();
        await page.setContent(html, { waitUntil: "networkidle0" });
        await page.addStyleTag({
            path: path.join(__dirname, "../templates/invoice.scss"),
        });

        const pdfBuffer = await page.pdf({ format: "A4", printBackground: true });
        await page.close();
        await browser.close();

        res.set({
            "Content-Type": "application/pdf",
            "Content-Disposition": `attachment; filename=invoice_${invoice._id}.pdf`,
        });
        res.send(pdfBuffer);
    } catch (err) {
        console.error(err);
        res.status(500).json({ error: "Failed to generate PDF" });
    }
});

// export const ("/:id/pdf-link", async (req, res) => {
//     try {
//         const invoice = await Invoice.findById(req.params.id);
//         if (!invoice) return res.status(404).send("Invoice not found");

//         const html = `<h1>Invoice for ${invoice.customer}</h1>`;
//         const browser = await puppeteer.launch({
//             headless: "new",
//             args: ["--no-sandbox", "--disable-setuid-sandbox"],
//         });
//         const page = await browser.newPage();
//         await page.setContent(html);
//         const pdfBuffer = await page.pdf({ format: "A4" });
//         await browser.close();

//         res.set({
//             "Content-Type": "application/pdf",
//             "Content-Disposition": `inline; filename="invoice_${invoice._id}.pdf"`,
//         });

//         res.send(pdfBuffer);
//     } catch (err) {
//         console.error(err);
//         res.status(500).json({ error: "Failed to generate PDF" });
//     }
// });
