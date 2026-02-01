import { formatInvoiceDate } from "../utils/dateFormatter.utils.js";
export default function invoiceTemplate({ user, invoice }) {
  return `
<!DOCTYPE html>
<html lang="en">
<head>
<meta charset="UTF-8">
<title>Invoice</title>
</head>
<body>

<div class="invoice-wrapper">
  <!-- HEADER -->
  <div class="invoice-header">
    <div class="logo">
      <span>K</span>OICE
    </div>
    <h2>Invoice</h2>
  </div>

  <hr>

  <!-- META -->
  <div class="invoice-meta">
    <div>
      <strong>Date:</strong>${formatInvoiceDate(invoice.customer.due_date)}
    </div>
    <div class="right">
      <strong>Invoice No:</strong> ${invoice.invoiceNo}
    </div>
  </div>
  <hr>
  <!-- ADDRESSES -->
  <div class="addresses">
    <div>
      <div class="title">Invoiced To:</div>
      ${invoice.customer.name}<br>
    </div>

    <div class="right">
      <div class="title">Pay To:</div>
      ${user.shopName}<br>
      ${user.shopAddress}<br>
      ${user.email}
    </div>
  </div>

  <!-- TABLE -->
  <table>
    <thead>
      <tr>
        <th>PRODUCT</th>
        <th>Rate</th>
        <th>QTY</th>
        <th>DISCOUNT</th>
        <th class="right">TOTAL</th>
      </tr>
    </thead>

    <tbody>
      ${invoice.items.map(product =>
        `
        <tr>
          <td>${product.product}</td>
          <td>₹${product.price?.toFixed(2)}</td>
          <td>${product.qty}</td>
          <td>${product.discount ? product.discount + '%' : '-'}</td>
          <td class="right">₹${product.total}</td>
        </tr>
      `).join("")}
    </tbody>

    <tfoot>
      <tr>
        <td colspan="4" class="right">Discount (${invoice.commonDiscount.toFixed(2)}%)</td>
        <td class="right">-${invoice.totalDiscount.toFixed(2)}</td>
      </tr>
      <tr>
        <td colspan="4" class="right">Subtotal</td>
        <td class="right">${invoice.subTotal.toFixed(2)}</td>
      </tr>
      <tr>
        <td colspan="4" class="right">${invoice.extraCharge.label}</td>
        <td class="right">${invoice.extraChargeAmount.toFixed(2)}</td>
      </tr>
      <tr>
        <td colspan="4" class="right">Taxable Amount</td>
        <td class="right">${invoice.taxableAmount.toFixed(2)}</td>
      </tr>
      <tr>
        <td colspan="4" class="right">GST (${invoice.gstRate.toFixed(2)}%)</td>
        <td class="right">${invoice.gstAmount.toFixed(2)}</td>
      </tr>
      <tr>
        <td colspan="4" class="right">Grand Total</td>
        <td class="right">${invoice.grandTotal.toFixed(2)}</td>
      </tr>
      <tr>
        <td colspan="4" class="right">Advance Paid</td>
        <td class="right">-${invoice.advancePaid.toFixed(2)}</td>
      </tr>
      <tr>
        <td colspan="4" class="right">Balance Due</td>
        <td class="right">${invoice.balanceDue.toFixed(2)}</td>
      </tr>
    </tfoot>
  </table>

  <p class="note">
    NOTE : This is computer generated receipt and does not require physical signature.
  </p>

</div>

</body>
</html>
`;
}
