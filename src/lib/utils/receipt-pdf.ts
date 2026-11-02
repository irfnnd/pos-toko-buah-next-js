import { jsPDF } from "jspdf";
import { format } from "date-fns";
import { id } from "date-fns/locale";

export interface ReceiptPdfOptions {
  paperWidth?: 58 | 80;
  storeName?: string;
  storeAddress?: string;
  storePhone?: string;
  footerMessage?: string;
}

export interface ReceiptSaleItem {
  id?: string;
  quantity: number;
  sellPrice: number;
  subtotal: number;
  fruit?: {
    name?: string;
    unit?: string;
  };
  stockBatch?: {
    batchNumber?: string;
  };
}

export interface ReceiptSaleData {
  id?: string;
  invoiceNo: string;
  saleDate?: string | Date;
  paymentMethod: string;
  totalAmount: number;
  paidAmount: number;
  changeAmount: number;
  note?: string | null;
  cashier?: {
    name?: string;
    username?: string;
  };
  items?: ReceiptSaleItem[];
}

function formatCurrency(amount: number): string {
  return "Rp " + new Intl.NumberFormat("id-ID", {
    maximumFractionDigits: 0,
  }).format(Math.round(amount || 0));
}

/**
 * Renders receipt content onto a jsPDF document or measures total required height in mm.
 */
function renderReceiptContent(
  targetDoc: jsPDF,
  sale: ReceiptSaleData,
  options: ReceiptPdfOptions = {}
): number {
  const paperWidth = options.paperWidth || 58;
  const is58 = paperWidth === 58;
  const marginLeft = is58 ? 3.5 : 5;
  const marginRight = is58 ? 3.5 : 5;
  const contentWidth = paperWidth - marginLeft - marginRight;
  const centerX = paperWidth / 2;
  const rightX = paperWidth - marginRight;

  const storeName = (options.storeName || "POS TOKO BUAH SEGAR").toUpperCase();
  const storeAddress = options.storeAddress || "Jl. Buah Segar No. 88, Jakarta";
  const storePhone = options.storePhone || "Telp/WA: 0812-3456-7890";
  const footerMessage = options.footerMessage || "Terima Kasih Atas Kunjungan Anda!";

  let y = 6;

  const drawDashedLine = () => {
    y += 1.2;
    targetDoc.setLineDashPattern([1, 1], 0);
    targetDoc.setDrawColor(120, 120, 120);
    targetDoc.setLineWidth(0.2);
    targetDoc.line(marginLeft, y, rightX, y);
    y += 3.2;
  };

  // 1. Store Header
  targetDoc.setFont("courier", "bold");
  targetDoc.setFontSize(is58 ? 9.5 : 11);
  targetDoc.text(storeName, centerX, y, { align: "center" });
  y += 4;

  targetDoc.setFont("courier", "normal");
  targetDoc.setFontSize(is58 ? 7 : 8);
  targetDoc.text(storeAddress, centerX, y, { align: "center" });
  y += 3.2;
  targetDoc.text(storePhone, centerX, y, { align: "center" });
  y += 1.5;

  drawDashedLine();

  // 2. Transaction Metadata
  targetDoc.setFont("courier", "normal");
  targetDoc.setFontSize(is58 ? 7 : 8);

  const saleDateObj = sale.saleDate ? new Date(sale.saleDate) : new Date();
  const formattedDate = !isNaN(saleDateObj.getTime())
    ? format(saleDateObj, "dd MMM yyyy HH:mm", { locale: id })
    : "-";

  const metaList: [string, string][] = [
    ["No. Invoice:", sale.invoiceNo || "-"],
    ["Tanggal:", formattedDate],
    ["Kasir:", sale.cashier?.name || "Kasir"],
    ["Metode:", (sale.paymentMethod || "TUNAI").toUpperCase()],
  ];

  for (const [label, val] of metaList) {
    targetDoc.text(label, marginLeft, y);
    targetDoc.text(val, rightX, y, { align: "right" });
    y += 3.2;
  }

  drawDashedLine();

  // 3. Itemized List
  const items = sale.items || [];
  for (const item of items) {
    const fruitName = item.fruit?.name || "Buah";
    const subtotalText = formatCurrency(item.subtotal);

    targetDoc.setFont("courier", "bold");
    targetDoc.setFontSize(is58 ? 7.5 : 8.5);

    // Reserve width for subtotal
    const subtotalWidth = targetDoc.getTextWidth(subtotalText) + 2;
    const nameWidth = contentWidth - subtotalWidth;
    const splitName = targetDoc.splitTextToSize(fruitName, nameWidth);

    targetDoc.text(splitName, marginLeft, y);
    targetDoc.text(subtotalText, rightX, y, { align: "right" });
    y += splitName.length * 3.2;

    // Quantity x Price & Batch Number
    targetDoc.setFont("courier", "normal");
    targetDoc.setFontSize(is58 ? 6.5 : 7.5);

    const qtyText = `${item.quantity ?? 1} ${item.fruit?.unit || "Kg"} x ${formatCurrency(
      item.sellPrice
    )}`;
    targetDoc.text(qtyText, marginLeft, y);

    if (item.stockBatch?.batchNumber) {
      targetDoc.text(`(B:${item.stockBatch.batchNumber})`, rightX, y, {
        align: "right",
      });
    }
    y += 3.8;
  }

  drawDashedLine();

  // 4. Totals
  targetDoc.setFont("courier", "bold");
  targetDoc.setFontSize(is58 ? 8.5 : 10);
  targetDoc.text("TOTAL", marginLeft, y);
  targetDoc.text(formatCurrency(sale.totalAmount), rightX, y, {
    align: "right",
  });
  y += 4;

  targetDoc.setFont("courier", "normal");
  targetDoc.setFontSize(is58 ? 7 : 8);
  targetDoc.text(
    `Bayar (${(sale.paymentMethod || "TUNAI").toUpperCase()}):`,
    marginLeft,
    y
  );
  targetDoc.text(formatCurrency(sale.paidAmount), rightX, y, {
    align: "right",
  });
  y += 3.2;

  targetDoc.text("Kembalian:", marginLeft, y);
  targetDoc.text(formatCurrency(sale.changeAmount), rightX, y, {
    align: "right",
  });
  y += 1.5;

  // Optional Note
  if (sale.note && sale.note.trim()) {
    drawDashedLine();
    targetDoc.setFont("courier", "normal");
    targetDoc.setFontSize(is58 ? 6.5 : 7.5);
    const noteLines = targetDoc.splitTextToSize(`Catatan: ${sale.note.trim()}`, contentWidth);
    targetDoc.text(noteLines, marginLeft, y);
    y += noteLines.length * 3.2;
  }

  drawDashedLine();

  // 5. Footer
  targetDoc.setFont("courier", "bold");
  targetDoc.setFontSize(is58 ? 7 : 8);
  targetDoc.text(footerMessage, centerX, y, { align: "center" });
  y += 3.2;

  targetDoc.setFont("courier", "normal");
  targetDoc.setFontSize(is58 ? 6 : 7);
  targetDoc.text("Buah Segar Setiap Hari • Garansi Kualitas", centerX, y, {
    align: "center",
  });
  y += 8; // Extra padding for thermal paper tear-off

  return y;
}

/**
 * Calculates dynamic height in mm for the receipt on mini thermal printer paper.
 */
export function calculateReceiptHeight(
  sale: ReceiptSaleData,
  options: ReceiptPdfOptions = {}
): number {
  const paperWidth = options.paperWidth || 58;
  const measureDoc = new jsPDF({
    orientation: "portrait",
    unit: "mm",
    format: [paperWidth, 1000],
  });

  const measuredHeight = renderReceiptContent(measureDoc, sale, options);
  return Math.ceil(measuredHeight);
}

/**
 * Generates a jsPDF instance sized accurately for mini printer struk (58mm or 80mm).
 */
export function generateReceiptPdf(
  sale: ReceiptSaleData,
  options: ReceiptPdfOptions = {}
): jsPDF {
  const paperWidth = options.paperWidth || 58;
  const dynamicHeight = calculateReceiptHeight(sale, options);

  const doc = new jsPDF({
    orientation: "portrait",
    unit: "mm",
    format: [paperWidth, dynamicHeight],
  });

  renderReceiptContent(doc, sale, options);
  return doc;
}

/**
 * Triggers PDF print via jsPDF without using window.print()
 */
export function printReceiptPdf(
  sale: ReceiptSaleData,
  options: ReceiptPdfOptions = {}
): void {
  const doc = generateReceiptPdf(sale, options);
  doc.autoPrint();

  const blob = doc.output("blob");
  const blobUrl = URL.createObjectURL(blob);

  // Open the PDF in a dedicated window/tab which triggers the auto-print dialog cleanly
  const printWindow = window.open(blobUrl, "_blank");

  if (!printWindow) {
    // If popup is blocked by the browser, use a hidden iframe fallback
    const iframe = document.createElement("iframe");
    iframe.style.position = "fixed";
    iframe.style.top = "-9999px";
    iframe.style.left = "-9999px";
    iframe.style.width = "0px";
    iframe.style.height = "0px";
    iframe.style.border = "none";
    iframe.src = blobUrl;
    document.body.appendChild(iframe);

    iframe.onload = () => {
      try {
        iframe.contentWindow?.focus();
        iframe.contentWindow?.print();
      } catch (err) {
        // Fallback: download if both popup and iframe print failed
        doc.save(`struk-${sale.invoiceNo || "transaksi"}.pdf`);
      }
      setTimeout(() => {
        if (document.body.contains(iframe)) {
          document.body.removeChild(iframe);
        }
      }, 60000);
    };
  } else {
    printWindow.focus();
  }

  // Revoke blob URL after 1 minute
  setTimeout(() => URL.revokeObjectURL(blobUrl), 60000);
}

/**
 * Directly downloads the receipt as a PDF file formatted for mini printer.
 */
export function downloadReceiptPdf(
  sale: ReceiptSaleData,
  options: ReceiptPdfOptions = {}
): void {
  const doc = generateReceiptPdf(sale, options);
  const fileName = `struk-${sale.invoiceNo || "transaksi"}.pdf`;
  doc.save(fileName);
}

