import type { CSSProperties } from "react";

type LeadFormProps = {
  newLeadFirstName: string;
  setNewLeadFirstName: (value: string) => void;
  newLeadLastName: string;
  setNewLeadLastName: (value: string) => void;
  newLeadEmail: string;
  setNewLeadEmail: (value: string) => void;
  newLeadPhone: string;
  setNewLeadPhone: (value: string) => void;
  handleCreateLead: () => Promise<void> | void;
  leadSaving: boolean;
  styles: Record<string, CSSProperties>;
};

export default function LeadForm({
  newLeadFirstName,
  setNewLeadFirstName,
  newLeadLastName,
  setNewLeadLastName,
  newLeadEmail,
  setNewLeadEmail,
  newLeadPhone,
  setNewLeadPhone,
  handleCreateLead,
  leadSaving,
  styles,
}: LeadFormProps) {
  return (
    <div style={styles.card}>
      <h3 style={styles.subTitle}>Neuen Lead anlegen</h3>

      <div style={{ display: "grid", gap: 10 }}>
        <input
          type="text"
          placeholder="Vorname"
          value={newLeadFirstName}
          onChange={(e) => setNewLeadFirstName(e.target.value)}
          style={styles.input}
        />

        <input
          type="text"
          placeholder="Nachname"
          value={newLeadLastName}
          onChange={(e) => setNewLeadLastName(e.target.value)}
          style={styles.input}
        />

        <input
          type="email"
          placeholder="E-Mail"
          value={newLeadEmail}
          onChange={(e) => setNewLeadEmail(e.target.value)}
          style={styles.input}
        />

        <input
          type="text"
          placeholder="Telefon"
          value={newLeadPhone}
          onChange={(e) => setNewLeadPhone(e.target.value)}
          style={styles.input}
        />

        <button
          onClick={() => void handleCreateLead()}
          disabled={
            leadSaving ||
            !newLeadFirstName.trim() ||
            !newLeadLastName.trim()
          }
          style={styles.button}
        >
          {leadSaving ? "Speichert..." : "Lead anlegen"}
        </button>
      </div>
    </div>
  );
}