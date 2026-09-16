import type { SachwertReport } from "./sachwertPdf.js";

function escapeHtml(value: string): string {
  return value.replace(/[&<>"']/g, (char) => ({
    "&": "&amp;",
    "<": "&lt;",
    ">": "&gt;",
    '"': "&quot;",
    "'": "&#039;",
  })[char] ?? char);
}

export async function sendSachwertReportEmail(input: {
  to: string;
  firstName: string;
  report: SachwertReport;
  pdf: Buffer;
}): Promise<void> {
  const apiKey = process.env.BREVO_API_KEY;
  const senderEmail = process.env.BREVO_SENDER_EMAIL;
  const senderName = process.env.BREVO_SENDER_NAME || "IMMOMONKEY";

  if (!apiKey || !senderEmail) {
    throw new Error("Brevo ist nicht vollständig konfiguriert.");
  }

  const firstName = escapeHtml(input.firstName);
  const address = escapeHtml(input.report.propertyAddress);
  const value = escapeHtml(input.report.finalValue);
  const response = await fetch("https://api.brevo.com/v3/smtp/email", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      "api-key": apiKey,
    },
    body: JSON.stringify({
      sender: { name: senderName, email: senderEmail },
      to: [{ email: input.to }],
      subject: "Ihre Sachwert-Kurzbewertung von IMMOMONKEY",
      htmlContent: `
        <div style="font-family:Arial,sans-serif;background:#f4f7f3;padding:24px;color:#1d2720">
          <div style="max-width:600px;margin:0 auto;background:#fff;padding:36px 30px;border-top:5px solid #103D20">
            <p style="margin:0 0 18px;color:#103D20;font-weight:700;letter-spacing:.08em;font-size:12px">IMMOMONKEY</p>
            <h1 style="margin:0 0 16px;font-size:26px;color:#103D20">Ihre Sachwert-Kurzbewertung</h1>
            <p>Hallo ${firstName},</p>
            <p>anbei erhalten Sie die Auswertung für <strong>${address}</strong>.</p>
            <div style="margin:24px 0;padding:20px;background:#f4f7f3">
              <div style="font-size:12px;color:#64706a;text-transform:uppercase;letter-spacing:.08em">Sachwertindikation</div>
              <div style="margin-top:6px;font-size:28px;font-weight:700;color:#103D20">${value}</div>
            </div>
            <p>Die Auswertung ist eine erste Orientierung auf Grundlage Ihrer Eingaben und kein Verkehrswertgutachten nach § 194 BauGB.</p>
            <p style="margin-top:28px">Beste Grüße<br><strong>Michael Giese</strong><br>IMMOMONKEY</p>
          </div>
        </div>`,
      attachment: [{
        content: input.pdf.toString("base64"),
        name: "IMMOMONKEY-Sachwert-Kurzbewertung.pdf",
      }],
    }),
  });

  if (!response.ok) {
    throw new Error("Brevo PDF-Versand fehlgeschlagen: " + (await response.text()));
  }
}
