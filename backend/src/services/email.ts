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