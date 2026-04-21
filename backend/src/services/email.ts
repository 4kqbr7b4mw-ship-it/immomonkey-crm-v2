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
  <p>Hallo ${firstName},</p>

  <p>vielen Dank fuer Ihre Anfrage.</p>

  <p>Ich melde mich zeitnah persoenlich bei Ihnen.</p>

  <p>Wenn Sie es schneller moechten, schreiben Sie mir direkt bei WhatsApp:</p>

  <p>
    <a href="https://wa.me/493053647941?text=Hallo%20ich%20bin%20${firstName}%20und%20habe%20gerade%20eine%20Anfrage%20ueber%20Immomonkey%20gestellt">
      Jetzt WhatsApp starten
    </a>
  </p>

  <p>Beste Gruesse<br />Immomonkey</p>
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