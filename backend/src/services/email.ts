export async function sendLeadNotification(payload: {
  firstName: string;
  lastName: string;
  email: string;
  phone?: string | null;
  city?: string | null;
  notes: string;
}) {
  try {
    const res = await fetch("https://api.brevo.com/v3/smtp/email", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "api-key": process.env.BREVO_API_KEY as string,
      },
      body: JSON.stringify({
        sender: {
          name: process.env.BREVO_SENDER_NAME,
          email: process.env.BREVO_SENDER_EMAIL,
        },
        to: [
          {
            email: process.env.BREVO_SENDER_EMAIL,
          },
        ],
        subject: "Neuer Website Lead",
        htmlContent: `
          <h2>Neuer Lead</h2>
          <p><strong>Name:</strong> ${payload.firstName} ${payload.lastName}</p>
          <p><strong>E-Mail:</strong> ${payload.email}</p>
          <p><strong>Telefon:</strong> ${payload.phone ?? "-"}</p>
          <p><strong>Ort:</strong> ${payload.city ?? "-"}</p>
          <p><strong>Nachricht:</strong><br>${payload.notes}</p>
        `,
      }),
    });

    if (!res.ok) {
      const text = await res.text();
      console.error("Brevo Fehler:", text);
    }
  } catch (error) {
    console.error("E-Mail Fehler:", error);
  }
}

export async function sendLeadConfirmationEmail(
  to: string,
  firstName: string
) {
  try {
    const res = await fetch("https://api.brevo.com/v3/smtp/email", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "api-key": process.env.BREVO_API_KEY as string,
      },
      body: JSON.stringify({
        sender: {
          name: process.env.BREVO_SENDER_NAME,
          email: process.env.BREVO_SENDER_EMAIL,
        },
        to: [
          {
            email: to,
          },
        ],
        subject: "Ihre Anfrage bei Immomonkey",
        htmlContent: `
<div style="font-family: Arial, sans-serif; background-color: #f3f3f3; padding: 24px;">
  <div style="max-width: 600px; margin: 0 auto; background: #ffffff; padding: 40px 32px; border-radius: 10px; text-align: center;">

    <img src="https://immomonkey.de/images/logo-immomonkey.png" alt="IMMOMONKEY" style="width: 90px; margin-bottom: 24px;" />

    <h2 style="margin: 0 0 24px 0; font-size: 32px; color: #111111;">
      Vielen Dank für Ihre Anfrage
    </h2>

    <p style="margin: 0 0 16px 0; font-size: 17px; color: #222222;">
      Hallo ${firstName},
    </p>

    <p style="margin: 0 0 20px 0; font-size: 17px; line-height: 1.6; color: #222222;">
      vielen Dank für Ihre Nachricht und Ihr Vertrauen.
    </p>

    <p style="margin: 0 0 28px 0; font-size: 17px; line-height: 1.6; color: #222222;">
      Ich melde mich zeitnah persönlich bei Ihnen, um Ihre Situation sauber einzuordnen
      und Ihnen eine klare Grundlage für die nächsten Schritte zu geben.
    </p>

    <a
      href="https://wa.me/493053647941?text=Hallo%20ich%20bin%20${firstName}%20und%20habe%20gerade%20eine%20Anfrage%20ueber%20Immomonkey%20gestellt"
      style="display: inline-block; padding: 14px 28px; background-color: #103D20; color: #ffffff; text-decoration: none; border-radius: 6px; font-size: 16px;"
    >
      WhatsApp
    </a>

    <hr style="margin: 32px 0; border: none; border-top: 1px solid #e6e6e6;" />

    <p style="margin: 0; font-size: 14px; color: #666666; line-height: 1.7;">
      Klare Einschätzung.<br />
      Transparente nächste Schritte.<br />
      Persönliche Rückmeldung.
    </p>

    <p style="margin-top: 28px; margin-bottom: 0; font-size: 16px; color: #222222; line-height: 1.7;">
      Beste Grüße<br />
      <strong>Michael Giese</strong><br />
      Immobilienberater | <strong>IMMOMONKEY</strong><br />
      <a href="mailto:office@immomonkey.de" style="color: #103D20; text-decoration: none;">office@immomonkey.de</a><br />
      <a href="https://immomonkey.de" style="color: #103D20; text-decoration: none;">www.immomonkey.de</a>
    </p>

  </div>
</div>
`,
      }),
    });

    if (!res.ok) {
      const text = await res.text();
      console.error("Brevo Fehler (Lead Mail):", text);
    }
  } catch (error) {
    console.error("Bestaetigungs-Mail Fehler:", error);
  }
}