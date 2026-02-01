export function formatInvoiceDate(date, timeZone = "Asia/Kolkata") {
  const d = new Date(date);

  const day = d.getDate();
  const month = d.toLocaleString("en-US", { month: "short" });
  const year = d.getFullYear().toString().slice(-2);

  const time = d.toLocaleString("en-US", {
    hour: "numeric",
    minute: "2-digit",
    hour12: true,
    timeZone
  });

  return `${day} ${month} ${year}, ${time}`;
}
