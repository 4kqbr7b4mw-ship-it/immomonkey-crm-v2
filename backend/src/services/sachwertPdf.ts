type ReportLine = [string, string];

function safeText(value: unknown, max = 160): string {
  return String(value ?? "")
    .replace(/[\r\n]+/g, " ")
    .replace(/[^\x20-\x7EäöüÄÖÜß€]/g, "")
    .trim()
    .slice(0, max);
}

function pdfText(value: string): string {
  return safeText(value)
    .replace(/ä/g, "ae").replace(/ö/g, "oe").replace(/ü/g, "ue")
    .replace(/Ä/g, "Ae").replace(/Ö/g, "Oe").replace(/Ü/g, "Ue")
    .replace(/ß/g, "ss").replace(/€/g, "EUR")
    .replace(/\\/g, "\\\\").replace(/\(/g, "\\(").replace(/\)/g, "\\)");
}

function pageStream(title: string, lines: ReportLine[], page: number): string {
  const out: string[] = [
    "q",
    "0.063 0.239 0.125 rg",
    "50 792 495 2 re f",
    "BT /F2 9 Tf 0.063 0.239 0.125 rg 50 812 Td (IMMOMONKEY | Sachwert-Kurzbewertung) Tj ET",
    "BT /F1 8 Tf 0.38 0.45 0.40 rg 470 812 Td (Seite " + page + ") Tj ET",
    "BT /F2 20 Tf 0.063 0.239 0.125 rg 50 760 Td (" + pdfText(title) + ") Tj ET",
  ];
  let y = 728;
  for (const [label, value] of lines) {
    if (label === "__section__") {
      y -= 16;
      out.push("BT /F2 11 Tf 0.063 0.239 0.125 rg 50 " + y + " Td (" + pdfText(value) + ") Tj ET");
      y -= 14;
      continue;
    }
    out.push("0.86 0.89 0.86 RG 50 " + (y - 7) + " m 545 " + (y - 7) + " l S");
    out.push("BT /F1 9 Tf 0.16 0.18 0.16 rg 50 " + y + " Td (" + pdfText(label) + ") Tj ET");
    out.push("BT /F2 9 Tf 0.16 0.18 0.16 rg 545 " + y + " Td (" + pdfText(value) + ") Tj ET");
    y -= 22;
  }
  out.push("BT /F1 7 Tf 0.38 0.45 0.40 rg 50 32 Td (Automatisierte Ersteinschaetzung - kein Verkehrswertgutachten nach § 194 BauGB.) Tj ET");
  out.push("Q");
  return out.join("\n");
}

function object(number: number, body: string): string {
  return number + " 0 obj\n" + body + "\nendobj\n";
}

export type SachwertReport = {
  propertyAddress: string;
  propertyCity: string;
  propertyType: string;
  valuationYear: string;
  landArea: string;
  landRate: string;
  landValue: string;
  bgf: string;
  yearBuilt: string;
  nhkValue: string;
  buildingCosts: string;
  remainingLife: string;
  buildingValue: string;
  outdoorValue: string;
  provisionalValue: string;
  marketFactor: string;
  marketValue: string;
  finalValue: string;
};

export function createSachwertPdf(report: SachwertReport): Buffer {
  const pages = [
    pageStream("Ihre Sachwert-Kurzbewertung", [
      ["__section__", "Bewertungsobjekt"],
      ["Adresse", report.propertyAddress],
      ["Ort", report.propertyCity],
      ["Objekttyp", report.propertyType],
      ["Wertermittlungsjahr", report.valuationYear],
      ["__section__", "Ergebnis"],
      ["Sachwertindikation", report.finalValue],
      ["", ""],
      ["Hinweis", "Diese Auswertung ist eine erste Orientierung auf Basis Ihrer Eingaben."],
    ], 1),
    pageStream("Bodenwert und Herstellungskosten", [
      ["__section__", "Bodenwert"],
      ["Grundstücksfläche", report.landArea],
      ["Bodenrichtwert", report.landRate],
      ["Bodenwert", report.landValue],
      ["__section__", "Herstellungskosten"],
      ["Brutto-Grundfläche", report.bgf],
      ["Baujahr", report.yearBuilt],
      ["NHK-Kostenkennwert", report.nhkValue],
      ["Herstellungskosten", report.buildingCosts],
    ], 2),
    pageStream("Sachwertverfahren", [
      ["__section__", "Alterswertminderung und Außenanlagen"],
      ["Restnutzungsdauer", report.remainingLife],
      ["Gebäudesachwert", report.buildingValue],
      ["Außenanlagen", report.outdoorValue],
      ["Vorläufiger Sachwert", report.provisionalValue],
      ["__section__", "Marktanpassung"],
      ["Sachwertfaktor", report.marketFactor],
      ["Marktangepasster Sachwert", report.marketValue],
      ["Sachwertindikation", report.finalValue],
      ["__section__", "Einordnung"],
      ["", "Bodenrichtwert, Flächen, Zustand, Rechte und Marktparameter wurden nicht geprüft."],
    ], 3),
  ];
  const streams = pages.map((content) => Buffer.byteLength(content, "utf8"));
  const objects = [
    object(1, "<< /Type /Catalog /Pages 2 0 R >>"),
    object(2, "<< /Type /Pages /Kids [3 0 R 5 0 R 7 0 R] /Count 3 >>"),
    object(3, "<< /Type /Page /Parent 2 0 R /MediaBox [0 0 595 842] /Resources << /Font << /F1 9 0 R /F2 10 0 R >> >> /Contents 4 0 R >>"),
    object(4, "<< /Length " + streams[0] + " >>\nstream\n" + pages[0] + "\nendstream"),
    object(5, "<< /Type /Page /Parent 2 0 R /MediaBox [0 0 595 842] /Resources << /Font << /F1 9 0 R /F2 10 0 R >> >> /Contents 6 0 R >>"),
    object(6, "<< /Length " + streams[1] + " >>\nstream\n" + pages[1] + "\nendstream"),
    object(7, "<< /Type /Page /Parent 2 0 R /MediaBox [0 0 595 842] /Resources << /Font << /F1 9 0 R /F2 10 0 R >> >> /Contents 8 0 R >>"),
    object(8, "<< /Length " + streams[2] + " >>\nstream\n" + pages[2] + "\nendstream"),
    object(9, "<< /Type /Font /Subtype /Type1 /BaseFont /Helvetica >>"),
    object(10, "<< /Type /Font /Subtype /Type1 /BaseFont /Helvetica-Bold >>"),
  ];
  let pdf = "%PDF-1.4\n";
  const offsets = [0];
  for (const entry of objects) {
    offsets.push(Buffer.byteLength(pdf, "utf8"));
    pdf += entry;
  }
  const xref = Buffer.byteLength(pdf, "utf8");
  pdf += "xref\n0 " + (objects.length + 1) + "\n0000000000 65535 f \n";
  for (let i = 1; i < offsets.length; i++) pdf += String(offsets[i]).padStart(10, "0") + " 00000 n \n";
  pdf += "trailer\n<< /Size " + (objects.length + 1) + " /Root 1 0 R >>\nstartxref\n" + xref + "\n%%EOF";
  return Buffer.from(pdf, "utf8");
}
