import PDFDocument from "pdfkit";
import path from "node:path";

export type SachwertReport = {
  propertyAddress: string; propertyCity: string; propertyType: string;
  valuationYear: string; landArea: string; landRate: string; landValue: string;
  bgf: string; yearBuilt: string; nhkValue: string; buildingCosts: string;
  remainingLife: string; buildingValue: string; outdoorValue: string;
  provisionalValue: string; marketFactor: string; marketValue: string; finalValue: string;
};

const GREEN = "#103D20", GOLD = "#E5B80B", INK = "#1D2720", MUTED = "#64706A";
const PALE = "#F1F5F0", LINE = "#D7DED7", WHITE = "#FFFFFF";
const PAGE_W = 595.28, PAGE_H = 841.89, LEFT = 54, RIGHT = 54, CONTENT_W = PAGE_W - LEFT - RIGHT;
const FONT_REGULAR = path.join(process.cwd(), "node_modules/@fontsource/mulish/files/mulish-latin-400-normal.woff");
const FONT_BOLD = path.join(process.cwd(), "node_modules/@fontsource/mulish/files/mulish-latin-700-normal.woff");

function clean(value: unknown, max = 220): string {
  return String(value ?? "").replace(/[\r\n]+/g, " ").replace(/\s+/g, " ").trim().slice(0, max);
}
function numeric(value: string): number {
  return Number.parseFloat(value.replace(/[^0-9,.-]/g, "").replace(/\./g, "").replace(",", ".")) || 0;
}
function header(doc: PDFKit.PDFDocument, page: number) {
  doc.font("Mulish-Bold").fontSize(8).fillColor(GREEN).text("IMMOMONKEY", LEFT, 34);
  doc.font("Mulish").fillColor(MUTED).text("Sachwert-Kurzbewertung", LEFT + 92, 34);
  doc.text(`SEITE ${page}`, PAGE_W - RIGHT - 48, 34, { width: 48, align: "right" });
  doc.moveTo(LEFT, 54).lineTo(PAGE_W - RIGHT, 54).lineWidth(1.2).strokeColor(GREEN).stroke();
}
function footer(doc: PDFKit.PDFDocument, page: number) {
  doc.moveTo(LEFT, PAGE_H - 50).lineTo(PAGE_W - RIGHT, PAGE_H - 50).lineWidth(0.5).strokeColor(LINE).stroke();
  doc.font("Mulish").fontSize(7.5).fillColor(MUTED).text("Automatisierte Ersteinschätzung | Kein Verkehrswertgutachten nach § 194 BauGB", LEFT, PAGE_H - 38, { width: CONTENT_W - 35 });
  doc.font("Mulish-Bold").fillColor(GREEN).text(String(page).padStart(2, "0"), PAGE_W - RIGHT - 28, PAGE_H - 38, { width: 28, align: "right" });
}
function newPage(doc: PDFKit.PDFDocument, page: number) { doc.addPage(); header(doc, page); footer(doc, page); }
function h1(doc: PDFKit.PDFDocument, title: string, subtitle?: string) {
  doc.font("Mulish-Bold").fontSize(25).fillColor(GREEN).text(title, LEFT, 82, { width: CONTENT_W, lineGap: 2 });
  if (subtitle) doc.font("Mulish").fontSize(10.5).fillColor(MUTED).text(subtitle, LEFT, doc.y + 9, { width: CONTENT_W, lineGap: 3 });
  doc.y += 22;
}
function section(doc: PDFKit.PDFDocument, title: string) {
  doc.font("Mulish-Bold").fontSize(12).fillColor(GREEN).text(title, LEFT, doc.y, { width: CONTENT_W }); doc.moveDown(0.55);
}
function paragraph(doc: PDFKit.PDFDocument, text: string) {
  doc.font("Mulish").fontSize(9.5).fillColor(INK).text(text, LEFT, doc.y, { width: CONTENT_W, lineGap: 3 }); doc.moveDown(0.8);
}
function table(doc: PDFKit.PDFDocument, rows: Array<[string, string]>) {
  const rowH = 29;
  rows.forEach(([label, value], index) => {
    const top = doc.y;
    if (index % 2 === 0) doc.rect(LEFT, top, CONTENT_W, rowH).fill(PALE);
    doc.font("Mulish").fontSize(9).fillColor(MUTED).text(clean(label), LEFT + 11, top + 10, { width: 235 });
    doc.font("Mulish-Bold").fontSize(9.3).fillColor(INK).text(clean(value), LEFT + 252, top + 10, { width: CONTENT_W - 263, align: "right" });
    doc.y = top + rowH;
  });
  doc.y += 12;
}
function formula(doc: PDFKit.PDFDocument, label: string, expression: string, result: string) {
  const y = doc.y;
  doc.roundedRect(LEFT, y, CONTENT_W, 72, 5).fill(PALE);
  doc.font("Mulish-Bold").fontSize(8).fillColor(GREEN).text(label.toUpperCase(), LEFT + 16, y + 13);
  doc.font("Mulish").fontSize(10).fillColor(INK).text(clean(expression), LEFT + 16, y + 34, { width: 300 });
  doc.font("Mulish-Bold").fontSize(14).fillColor(GREEN).text(clean(result), LEFT + 326, y + 31, { width: CONTENT_W - 342, align: "right" });
  doc.y = y + 90;
}
function note(doc: PDFKit.PDFDocument, title: string, text: string, color = GREEN) {
  const y = doc.y;
  doc.font("Mulish").fontSize(9);
  const height = doc.heightOfString(text, { width: CONTENT_W - 34, lineGap: 3 }) + 45;
  doc.roundedRect(LEFT, y, CONTENT_W, height, 5).fill(PALE); doc.rect(LEFT, y, 5, height).fill(color);
  doc.font("Mulish-Bold").fontSize(9.5).fillColor(GREEN).text(title, LEFT + 18, y + 13, { width: CONTENT_W - 34 });
  doc.font("Mulish").fontSize(9).fillColor(INK).text(text, LEFT + 18, y + 31, { width: CONTENT_W - 34, lineGap: 3 });
  doc.y = y + height + 14;
}
function bullet(doc: PDFKit.PDFDocument, text: string) {
  const y = doc.y; doc.circle(LEFT + 4, y + 5, 2.2).fill(GOLD);
  doc.font("Mulish").fontSize(9.2).fillColor(INK).text(text, LEFT + 15, y, { width: CONTENT_W - 15, lineGap: 3 }); doc.moveDown(0.5);
}
function compositionChart(doc: PDFKit.PDFDocument, r: SachwertReport) {
  const land = numeric(r.landValue), building = numeric(r.buildingValue), outdoor = numeric(r.outdoorValue);
  const total = Math.max(land + building + outdoor, 1);
  const values = [["Bodenwert", land, GREEN], ["Gebäudewert", building, "#3F7250"], ["Außenanlagen", outdoor, GOLD]] as const;
  const x = LEFT, y = doc.y, width = CONTENT_W, h = 24; let cursor = x;
  values.forEach(([, value, color]) => { const w = width * value / total; doc.rect(cursor, y, Math.max(w, 1), h).fill(color); cursor += w; });
  let legendX = x;
  values.forEach(([label, value, color]) => { const pct = Math.round(value / total * 100); doc.rect(legendX, y + 39, 8, 8).fill(color); doc.font("Mulish").fontSize(8).fillColor(INK).text(`${label} ${pct} %`, legendX + 13, y + 38); legendX += 150; });
  doc.y = y + 72;
}

export function createSachwertPdf(r: SachwertReport): Promise<Buffer> {
  return new Promise((resolve, reject) => {
    const doc = new PDFDocument({ size: "A4", margin: 0, autoFirstPage: false, info: { Title: "IMMOMONKEY Sachwert-Kurzbewertung", Author: "IMMOMONKEY", Subject: `Sachwert-Kurzbewertung ${clean(r.propertyAddress)}` }});
    doc.registerFont("Mulish", FONT_REGULAR).registerFont("Mulish-Bold", FONT_BOLD);
    const chunks: Buffer[] = [];
    doc.on("data", (chunk: Buffer) => chunks.push(chunk)); doc.on("end", () => resolve(Buffer.concat(chunks))); doc.on("error", reject);

    doc.addPage(); doc.rect(0, 0, PAGE_W, PAGE_H).fill(GREEN); doc.rect(LEFT, 64, 42, 5).fill(GOLD);
    doc.font("Mulish-Bold").fontSize(10).fillColor(WHITE).text("IMMOMONKEY", LEFT, 86);
    doc.font("Mulish-Bold").fontSize(34).fillColor(WHITE).text("Sachwert-\nKurzbewertung", LEFT, 175, { width: 400, lineGap: 3 });
    doc.font("Mulish").fontSize(13).fillColor("#D9E5DA").text("Automatisierte Ersteinschätzung Ihrer Immobilie", LEFT, 285, { width: 400 });
    doc.roundedRect(LEFT, 390, CONTENT_W, 190, 8).fill(WHITE);
    doc.font("Mulish-Bold").fontSize(9).fillColor(GREEN).text("BEWERTUNGSOBJEKT", LEFT + 24, 416);
    doc.font("Mulish-Bold").fontSize(18).fillColor(INK).text(clean(r.propertyAddress), LEFT + 24, 446, { width: CONTENT_W - 48 });
    doc.font("Mulish").fontSize(11).fillColor(MUTED).text(clean(r.propertyCity), LEFT + 24, doc.y + 7, { width: CONTENT_W - 48 });
    doc.moveTo(LEFT + 24, 515).lineTo(PAGE_W - RIGHT - 24, 515).strokeColor(LINE).stroke();
    doc.font("Mulish").fontSize(9).fillColor(MUTED).text("Objekttyp", LEFT + 24, 534); doc.font("Mulish-Bold").fillColor(INK).text(clean(r.propertyType), LEFT + 120, 534);
    doc.font("Mulish").fillColor(MUTED).text("Wertermittlung", LEFT + 285, 534); doc.font("Mulish-Bold").fillColor(INK).text(clean(r.valuationYear), LEFT + 405, 534);
    doc.font("Mulish").fontSize(8).fillColor("#C2D2C4").text("Persönlich. Klar. Immobilien.", LEFT, 770); doc.text("immomonkey.de", PAGE_W - RIGHT - 120, 770, { width: 120, align: "right" });

    newPage(doc, 2); h1(doc, "Ihre Bewertung im Überblick", "Die wesentlichen Ergebnisse auf einer Seite - mit den zugrunde gelegten Objektdaten.");
    const cardY = doc.y; doc.roundedRect(LEFT, cardY, CONTENT_W, 118, 7).fill(PALE);
    doc.font("Mulish-Bold").fontSize(9).fillColor(GREEN).text("ORIENTIERUNGSWERT IM SACHWERTVERFAHREN", LEFT + 20, cardY + 22);
    doc.font("Mulish-Bold").fontSize(31).fillColor(GREEN).text(clean(r.finalValue), LEFT + 20, cardY + 54, { width: CONTENT_W - 40 }); doc.y = cardY + 142;
    section(doc, "Eckdaten"); table(doc, [["Immobilie", r.propertyType], ["Grundstück", r.landArea], ["Brutto-Grundfläche", r.bgf], ["Baujahr", r.yearBuilt], ["Bewertungsstichtag", r.valuationYear]]);
    note(doc, "So ist das Ergebnis einzuordnen", "Der ausgewiesene Wert ist eine rechnerische Orientierung auf Basis Ihrer Eingaben. Lagequalität, Zustand, Modernisierungen, Rechte, Belastungen und die konkrete Nachfrage können den am Markt erzielbaren Preis verändern.");

    newPage(doc, 3); h1(doc, "Objekt und Bewertungsansatz", "Warum das Sachwertverfahren verwendet wird und welche Angaben in die Berechnung einfließen.");
    section(doc, "Objektdaten"); table(doc, [["Adresse", `${r.propertyAddress}, ${r.propertyCity}`], ["Objekttyp", r.propertyType], ["Baujahr", r.yearBuilt], ["Grundstücksfläche", r.landArea], ["Brutto-Grundfläche", r.bgf]]);
    section(doc, "Das Verfahren in drei Schritten"); bullet(doc, "Bodenwert: Grundstücksfläche multipliziert mit dem angesetzten Bodenrichtwert."); bullet(doc, "Gebäudesachwert: normalisierte Herstellungskosten abzüglich der Alterswertminderung."); bullet(doc, "Marktanpassung: Zusammenführung der Bestandteile und Anpassung an das regionale Marktgeschehen.");
    note(doc, "Wichtige Abgrenzung", "Das Sachwertverfahren bildet die Substanz rechnerisch ab. Eine Vor-Ort-Besichtigung und die Prüfung objektspezifischer Unterlagen sind in dieser automatisierten Kurzbewertung nicht enthalten.", GOLD);
    section(doc, "Was diese Kurzbewertung leistet");
    paragraph(doc, "Sie macht die Rechenschritte transparent und zeigt, welche Annahmen den Orientierungswert beeinflussen. Sie ersetzt nicht die fachliche Prüfung einer konkreten Immobilie, kann aber sehr gut die Grundlage für eine erste Entscheidung und ein persönliches Gespräch sein.");

    newPage(doc, 4); h1(doc, "1. Ermittlung des Bodenwerts", "Der Bodenwert bildet den Grundstücksanteil der Sachwertberechnung.");
    section(doc, "Ausgangswerte"); table(doc, [["Grundstücksfläche", r.landArea], ["Angesetzter Bodenrichtwert", r.landRate]]); formula(doc, "Rechenschritt", `${r.landArea} × ${r.landRate}`, r.landValue);
    section(doc, "Bedeutung des Bodenrichtwerts"); paragraph(doc, "Der Bodenrichtwert ist ein durchschnittlicher Lagewert für Grundstücke einer Bodenrichtwertzone. Das konkrete Grundstück kann davon abweichen - beispielsweise durch Zuschnitt, Erschließung, bauliche Ausnutzbarkeit, Altlasten oder besondere Rechte.");
    note(doc, "In dieser Kurzbewertung", "Der eingegebene Bodenrichtwert wird ohne Zu- oder Abschläge übernommen. Eine grundstücksscharfe Prüfung der wertbeeinflussenden Merkmale ist nicht erfolgt.");
    section(doc, "Der im Rechner ausgewählte Bodenrichtwert");
    paragraph(doc, "Der Wert ist ein Ausgangspunkt für die Berechnung des Bodens. Grundlage können die veröffentlichten Bodenrichtwerte der zuständigen Gutachterausschüsse sein. Entscheidend ist jedoch, dass der gewählte Wert zur konkreten Lage, Bodenrichtwertzone und den Merkmalen des Grundstücks passt. Diese Zuordnung prüft der Rechner nicht verbindlich.");

    newPage(doc, 5); h1(doc, "2. Gebäude und Herstellungskosten", "Aus der Gebäudefläche und dem Kostenkennwert wird zunächst der Herstellungswert abgeleitet.");
    section(doc, "Berechnungsgrundlage"); table(doc, [["Objekttyp", r.propertyType], ["Brutto-Grundfläche", r.bgf], ["NHK-Kostenkennwert", r.nhkValue], ["Index-/Bewertungsstand", r.valuationYear]]); formula(doc, "Herstellungskosten neu", `${r.bgf} × ${r.nhkValue}`, r.buildingCosts);
    section(doc, "Was die NHK abbilden"); paragraph(doc, "Normalherstellungskosten sind typisierte Kostenkennwerte für vergleichbare Gebäude. Sie ersetzen weder eine individuelle Baukostenberechnung noch die Bewertung besonderer Ausstattungen oder baulicher Schäden.");
    note(doc, "Flächenhinweis", "Die Brutto-Grundfläche ist nicht mit der Wohnfläche identisch. Eine fehlerhafte Flächenangabe wirkt sich unmittelbar auf den Gebäudewert aus.", GOLD);
    section(doc, "Warum der Kennwert nicht die Baukosten Ihres Hauses sind");
    paragraph(doc, "Der NHK-Kostenkennwert dient der vergleichbaren Bewertung typisierter Gebäude. Er sagt nicht, was ein Neubau heute tatsächlich kosten würde. Hochwertige Ausstattung, Anbauten, Keller, energetische Besonderheiten oder Schäden werden durch den pauschalen Kennwert nur begrenzt abgebildet.");

    newPage(doc, 6); h1(doc, "3. Alterswertminderung und Außenanlagen", "Der Neubauwert wird auf den wirtschaftlichen Zeitwert des Gebäudes zurückgeführt.");
    section(doc, "Gebäudezeitwert"); table(doc, [["Baujahr", r.yearBuilt], ["Angesetzte Restnutzungsdauer", r.remainingLife], ["Herstellungskosten neu", r.buildingCosts], ["Gebäudesachwert nach Altersminderung", r.buildingValue]]); formula(doc, "Zeitwert des Gebäudes", `Herstellungskosten ${r.buildingCosts} abzüglich Alterswertminderung`, r.buildingValue);
    section(doc, "Außenanlagen"); table(doc, [["Pauschaler Wertansatz", r.outdoorValue]]);
    note(doc, "Modernisierungen können entscheidend sein", "Eine umfassende Modernisierung kann die wirtschaftliche Restnutzungsdauer verlängern. Da Art, Umfang und Zeitpunkt hier nicht geprüft werden, bleibt die Kurzbewertung an dieser Stelle bewusst typisiert.");
    section(doc, "Warum die Restnutzungsdauer wichtig ist");
    paragraph(doc, "Sie beschreibt nicht nur das kalendarische Alter des Hauses, sondern seine wirtschaftliche Verwendbarkeit. Ein gepflegtes oder umfassend modernisiertes Gebäude kann wirtschaftlich länger nutzbar sein; ein erheblicher Sanierungsstau kann den Zeitwert dagegen stärker mindern.");

    newPage(doc, 7); h1(doc, "4. Vorläufiger Sachwert", "Boden, Gebäude und Außenanlagen werden zu einem rechnerischen Ausgangswert zusammengeführt.");
    section(doc, "Wertbestandteile"); table(doc, [["Bodenwert", r.landValue], ["Gebäudesachwert", r.buildingValue], ["Außenanlagen", r.outdoorValue], ["Vorläufiger Sachwert", r.provisionalValue]]); compositionChart(doc, r); formula(doc, "Zusammenführung", `${r.landValue} + ${r.buildingValue} + ${r.outdoorValue}`, r.provisionalValue);
    paragraph(doc, "Die Grafik zeigt die rechnerische Zusammensetzung des vorläufigen Sachwerts. Sie ist keine Aussage darüber, welcher Bestandteil beim Verkauf tatsächlich den größten Preiseffekt hat.");
    section(doc, "Was der vorläufige Sachwert noch nicht enthält");
    paragraph(doc, "Der vorläufige Sachwert ist ein rechnerisches Zwischenergebnis. Er berücksichtigt noch nicht, ob Kaufinteressenten am konkreten Standort aktuell mehr oder weniger als den rechnerischen Sachwert zahlen. Genau dafür wird im nächsten Schritt der Sachwertfaktor verwendet.");

    newPage(doc, 8); h1(doc, "Ihr Ergebnis", "Der vorläufige Sachwert wird mit dem angesetzten Sachwertfaktor an das Marktgeschehen angepasst.");
    section(doc, "Marktanpassung"); table(doc, [["Vorläufiger Sachwert", r.provisionalValue], ["Angesetzter Sachwertfaktor", r.marketFactor], ["Marktangepasster Sachwert", r.marketValue]]); formula(doc, "Marktangepasster Sachwert", `${r.provisionalValue} × ${r.marketFactor}`, r.marketValue);
    const resultY = doc.y; doc.roundedRect(LEFT, resultY, CONTENT_W, 126, 7).fill(GREEN);
    doc.font("Mulish-Bold").fontSize(9).fillColor("#D9E5DA").text("ORIENTIERUNGSWERT", LEFT + 22, resultY + 24); doc.font("Mulish-Bold").fontSize(34).fillColor(WHITE).text(clean(r.finalValue), LEFT + 22, resultY + 55, { width: CONTENT_W - 44 }); doc.y = resultY + 148;
    note(doc, "Nächster sinnvoller Schritt", "Für eine belastbare Verkaufspreiseinschätzung sollten Zustand, Mikrolage, Modernisierungen, Unterlagen und aktuelle Vergleichsangebote persönlich eingeordnet werden.", GOLD);
    section(doc, "Was der Sachwertfaktor bewirkt");
    paragraph(doc, "Der im Rechner verwendete Sachwertfaktor passt das rechnerische Ergebnis an die angenommene Marktsituation an. Liegt er unter 1,00, wird der vorläufige Sachwert rechnerisch reduziert; liegt er über 1,00, wird er erhöht. Er ist ein wichtiger Annahmewert und keine Preisgarantie.");

    newPage(doc, 9); h1(doc, "Hinweise und Datenbasis", "Was berücksichtigt wurde - und was für eine belastbare Wertermittlung zusätzlich geprüft werden muss.");
    section(doc, "Verwendete Angaben"); bullet(doc, "Ihre Eingaben zu Grundstück, Gebäude, Baujahr und Flächen."); bullet(doc, "Der von Ihnen angesetzte Bodenrichtwert und NHK-Kostenkennwert."); bullet(doc, "Die eingegebene Restnutzungsdauer, Außenanlagen und der Sachwertfaktor.");
    section(doc, "Nicht geprüft"); bullet(doc, "Grundbuch, Baulasten, Altlasten, Erschließung und öffentlich-rechtliche Genehmigungen."); bullet(doc, "Tatsächliche Flächen, baulicher Zustand, Schäden und Modernisierungsumfang."); bullet(doc, "Miet- oder Pachtverhältnisse sowie weitere Rechte und Belastungen.");
    note(doc, "Datenverantwortung und rechtlicher Hinweis", "Diese Berechnung beruht auf den vom Nutzer eingegebenen, ausgewählten oder selbst recherchierten Angaben und Werten. IMMOMONKEY prüft deren Richtigkeit, Vollständigkeit und Aktualität nicht. Die automatisierte Kurzbewertung ist kein Verkehrswertgutachten im Sinne des § 194 BauGB, keine verbindliche Preiszusage und keine Rechts- oder Steuerberatung.");
    const contactY = doc.y + 5; doc.roundedRect(LEFT, contactY, CONTENT_W, 92, 6).fill(PALE);
    doc.font("Mulish-Bold").fontSize(12).fillColor(GREEN).text("Sie möchten den Wert persönlich einordnen?", LEFT + 18, contactY + 17); doc.font("Mulish").fontSize(9).fillColor(INK).text("IMMOMONKEY | Michael Giese | office@immomonkey.de | immomonkey.de", LEFT + 18, contactY + 45, { width: CONTENT_W - 36 }); doc.font("Mulish").fontSize(8).fillColor(MUTED).text("Persönlich. Klar. Immobilien.", LEFT + 18, contactY + 65);

    doc.end();
  });
}
