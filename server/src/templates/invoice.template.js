export default function invoiceTemplate({ user, invoice }) {
    return `
<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1.0" />
  <title>Invoice</title>
</head>
<body>

  <!-- Header -->
  <header class="header">
    <div class="brand">
      <div class="logo">K</div>
      <div>
        <h1>${user.shopName}</h1>
        <span class="brand-line"></span>
      </div>
    </div>
  </header>

  <!-- Info -->
  <section class="info">
    <div>
      <p class="label">ADDRESS</p>
      <p class="value">${user.shopAddress}</p>
    </div>
    <div>
      <p class="label">CUSTOMER</p>
      <p class="value">${invoice.customer.name}</p>
    </div>
    <div>
      <p class="label">DATE</p>
      <p class="value">${new Date(invoice.customer.due_date).toDateString()}</p>
    </div>
  </section>

  <!-- Table -->
  <section class="table-card">
    <table>
      <thead>
        <tr>
          <th>PRODUCT</th>
          <th>PRICE</th>
          <th>QTY</th>
          <th>DISCOUNT</th>
          <th class="right">TOTAL</th>
        </tr>
      </thead>
      <tbody>
        ${invoice.items.map(it => `
          <tr>
            <td>${it.product}</td>
            <td>₹${it.price}</td>
            <td>${it.qty}</td>
            <td>₹${it.discount || 0}</td>
            <td class="right bold">₹${it.price * it.qty - (it.discount || 0)}</td>
          </tr>
        `).join("")}
      </tbody>
    </table>
  </section>

  <!-- Totals -->
  <section class="summary">
  <div class="summary-box">
    <div class="row dark">
      <span>Grand Total</span>
      <strong>₹${invoice.total}</strong>
    </div>

    <div class="row success">
      <span>Advance Paid</span>
      <strong>₹${invoice.paid || 0}</strong>
    </div>

    <div class="row danger">
      <span>Pending Amount</span>
      <strong>₹${invoice.total - (invoice.paid || 0)}</strong>
    </div>
  </div>
</section>

</body>
</html>
`;
}
