import express from "express";
import puppeteer from "puppeteer";
import { Invoice } from "../models/Invoice.js";
import {
  getInvoice, getPaginationParams, sendResponse, getTotalCount, generateInvoiceNumber
} from "../utils/funcation.js";
import { authMiddleware } from "../authMiddleware/auth.middleware.js";
import { User } from "../models.js";
import invoiceTemplate from "../templates/invoice.template.js";
import path from "path";
import { fileURLToPath } from "url";
import { invoiceSchema } from "../validators/invoice.schema.js";
import { validate } from "../utils/validate.js";

const router = express.Router();

// Create invoice
router.post("/", authMiddleware, validate(invoiceSchema), async (req, res) => {
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
    // res.json(invoice);
    sendResponse(res, { data: [] });
  } catch (err) {
    console.log(err);
    res.status(500).json({ error: "Failed to create invoice" });
  }
});

// Get all invoices
router.get("/", async (req, res) => {
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

function renderInvoiceHtml(invoice) {
  const rows = invoice.items
    .map(
      (it) => `
    <tr>
      <td>${escapeHtml(it.product)}</td>
      <td style="text-align:center">${it.qty}</td>
      <td style="text-align:right">₹${it.price.toFixed(2)}</td>
      <td style="text-align:right">${it.discount || 0}%</td>
      <td style="text-align:right">₹${(
          it.price * it.qty -
          ((it.discount || 0) / 100) * (it.price * it.qty)
        ).toFixed(2)}</td>
    </tr>
  `
    )
    .join("");

  const total =
    invoice.total?.toFixed(2) ??
    invoice.items
      .reduce(
        (s, it) =>
          s +
          (it.price * it.qty -
            ((it.discount || 0) / 100) * (it.price * it.qty)),
        0
      )
      .toFixed(2);

  return `
  <!doctype html>
  <html>
  <head>
    <meta charset="utf-8" />
    <title>Invoice ${invoice._id}</title>
    <style>
      body { font-family: Arial, sans-serif; margin: 24px; color: #222; }
      .header { display:flex; justify-content:space-between; align-items:center; }
      .shop { font-size:18px; font-weight:700; }
      .address { font-size:12px; color:#555; }
      table { width:100%; border-collapse: collapse; margin-top:20px; }
      th, td { border-bottom:1px solid #eee; padding:8px 6px; }
      th { text-align:left; font-weight:600; background:#fafafa; }
      .right { text-align:right; }
      .total-row td { border-top:2px solid #222; font-weight:700; }
      .small { font-size:12px; color:#666; }
    </style>
  </head>
  <body>
    <div class="header">
      <div>
        <div class="shop">Your Shop Name</div>
        <div class="address">Shop Address line 1<br/>City - PIN</div>
      </div>
      <div style="text-align:right">
        <div>Invoice #: <strong>${invoice._id
      .toString()
      .slice(-8)
      .toUpperCase()}</strong></div>
        <div>Date: ${new Date(invoice.createdAt).toLocaleDateString()}</div>
      </div>
    </div>

    <div style="margin-top:18px">
      <strong>Customer:</strong> ${escapeHtml(invoice.customer)}
    </div>

    <table>
      <thead>
        <tr>
          <th>Product</th>
          <th style="text-align:center">Qty</th>
          <th style="text-align:right">Price</th>
          <th style="text-align:right">Discount</th>
          <th style="text-align:right">Total</th>
        </tr>
      </thead>
      <tbody>
        ${rows}
        <tr class="total-row">
          <td colspan="4" class="right">Grand Total</td>
          <td class="right">₹${parseFloat(total).toFixed(2)}</td>
        </tr>
      </tbody>
    </table>

    <div style="margin-top:18px" class="small">
      Thank you for your business.
    </div>
  </body>
  </html>
  `;
}

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

router.get("/:id/pdf", async (req, res) => {
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

    // Create HTML template
    // const html = `
    //   <html>
    //     <head>
    //       <style>
    //         body { font-family: Arial, sans-serif; padding: 20px; }
    //         h1 { text-align: center; }
    //         table { width: 100%; border-collapse: collapse; margin-top: 20px; }
    //         th, td { border: 1px solid #ddd; padding: 8px; text-align: center; }
    //         th { background-color: #f2f2f2; }
    //         .total { text-align: right; margin-top: 20px; font-size: 18px; font-weight: bold; }
    //       </style>
    //     </head>
    //     <body>
    //       <h1>${user.shopName}</h1>
    //       <p><b>Address:</b> ${user.shopAddress}</p>
    //       <p><b>Customer:</b> ${invoice.customer.name}</p>
    //       <p><b>Date:</b> ${new Date(invoice.customer.due_date).toDateString()}</p>

    //       <table>
    //         <thead>
    //           <tr>
    //             <th>Product</th>
    //             <th>Price</th>
    //             <th>Qty</th>
    //             <th>Discount</th>
    //             <th>Total</th>
    //           </tr>
    //         </thead>
    //         <tbody>
    //           ${invoice.items
    //     .map(
    //       (it) => `
    //             <tr>
    //               <td>${it.product}</td>
    //               <td>₹${it.price}</td>
    //               <td>${it.qty}</td>
    //               <td>₹${it.discount || 0}</td>
    //               <td>₹${it.price * it.qty - (it.discount || 0)}</td>
    //             </tr>
    //           `
    //     )
    //     .join("")}
    //         </tbody>
    //       </table>

    //       <p class="total">Grand Total: ₹${invoice.total}</p>
    //     </body>
    //   </html>
    // `;

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

router.get("/:id/pdf-link", async (req, res) => {
  try {
    const invoice = await Invoice.findById(req.params.id);
    if (!invoice) return res.status(404).send("Invoice not found");

    const html = `<h1>Invoice for ${invoice.customer}</h1>`;
    const browser = await puppeteer.launch({
      headless: "new",
      args: ["--no-sandbox", "--disable-setuid-sandbox"],
    });
    const page = await browser.newPage();
    await page.setContent(html);
    const pdfBuffer = await page.pdf({ format: "A4" });
    await browser.close();

    res.set({
      "Content-Type": "application/pdf",
      "Content-Disposition": `inline; filename="invoice_${invoice._id}.pdf"`,
    });

    res.send(pdfBuffer);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Failed to generate PDF" });
  }
});

router.get("/:id/pdf-download", async (req, res) => {
  try {
    const invoice = await Invoice.findById(req.params.id);
    if (!invoice) return res.status(404).send("Invoice not found");

    const html = `<h1>Invoice for ${invoice.customer}</h1>`;
    const browser = await puppeteer.launch({
      headless: "new",
      args: ["--no-sandbox", "--disable-setuid-sandbox"],
    });
    const page = await browser.newPage();
    await page.setContent(html);
    const pdfBuffer = await page.pdf({ format: "A4" });
    await browser.close();

    res.set({
      "Content-Type": "application/pdf",
      "Content-Disposition": `attachment; filename=invoice_${invoice._id}.pdf`,
    });
    res.send(pdfBuffer);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "PDF download failed" });
  }
});

export default router;
