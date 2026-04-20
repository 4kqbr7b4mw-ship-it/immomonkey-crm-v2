import React from "react";
import type { Lead } from "../types/crm";

type LeadListProps = {
  filteredLeads: Lead[];
  selectedLeadId: number | null;
  setSelectedLeadId: (id: number) => void;
  getStatusLabel: (status?: string | null) => string;
  styles: Record<string, React.CSSProperties>;
};

function formatFollowUp(value?: string | null) {
  if (!value) return "-";

  const date = new Date(value);

  return new Intl.DateTimeFormat("de-DE", {
    day: "2-digit",
    month: "2-digit",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  }).format(date);
}

function getFollowUpStyle(value?: string | null): React.CSSProperties {
  if (!value) {
    return {
      display: "inline-block",
      padding: "8px 12px",
      borderRadius: "14px",
      background: "#f3f4f6",
      color: "#6b7280",
      fontWeight: 600,
      fontSize: "13px",
      whiteSpace: "nowrap",
    };
  }

  const now = Date.now();
  const time = new Date(value).getTime();
  const diff = time - now;

  if (diff < 0) {
    return {
      display: "inline-block",
      padding: "8px 12px",
      borderRadius: "14px",
      background: "#dc2626",
      color: "#ffffff",
      fontWeight: 700,
      fontSize: "13px",
      whiteSpace: "nowrap",
    };
  }

  if (diff < 24 * 60 * 60 * 1000) {
    return {
      display: "inline-block",
      padding: "8px 12px",
      borderRadius: "14px",
      background: "#f97316",
      color: "#ffffff",
      fontWeight: 700,
      fontSize: "13px",
      whiteSpace: "nowrap",
    };
  }

  if (diff < 72 * 60 * 60 * 1000) {
    return {
      display: "inline-block",
      padding: "8px 12px",
      borderRadius: "14px",
      background: "#facc15",
      color: "#1f2937",
      fontWeight: 700,
      fontSize: "13px",
      whiteSpace: "nowrap",
    };
  }

  return {
    display: "inline-block",
    padding: "8px 12px",
    borderRadius: "14px",
    background: "#16a34a",
    color: "#ffffff",
    fontWeight: 700,
    fontSize: "13px",
    whiteSpace: "nowrap",
  };
}

function getStatusBadgeStyle(status?: string | null): React.CSSProperties {
  const base: React.CSSProperties = {
    display: "inline-block",
    padding: "8px 12px",
    borderRadius: "999px",
    fontWeight: 700,
    fontSize: "13px",
    whiteSpace: "nowrap",
  };

  switch (status) {
    case "new":
      return {
        ...base,
        background: "#dbeafe",
        color: "#2563eb",
      };
    case "contact_attempt":
      return {
        ...base,
        background: "#fef3c7",
        color: "#b45309",
      };
    case "contacted":
      return {
        ...base,
        background: "#dbeafe",
        color: "#0369a1",
      };
    case "qualified":
      return {
        ...base,
        background: "#dcfce7",
        color: "#15803d",
      };
    case "appointment_scheduled":
      return {
        ...base,
        background: "#ede9fe",
        color: "#7c3aed",
      };
    case "analysis_in_progress":
      return {
        ...base,
        background: "#e0f2fe",
        color: "#0284c7",
      };
    case "offer_sent":
      return {
        ...base,
        background: "#fae8ff",
        color: "#a21caf",
      };
    case "follow_up":
      return {
        ...base,
        background: "#ffedd5",
        color: "#ea580c",
      };
    case "won":
      return {
        ...base,
        background: "#dcfce7",
        color: "#15803d",
      };
    case "lost":
      return {
        ...base,
        background: "#fee2e2",
        color: "#b91c1c",
      };
    case "archived":
      return {
        ...base,
        background: "#e5e7eb",
        color: "#4b5563",
      };
    default:
      return {
        ...base,
        background: "#f3f4f6",
        color: "#374151",
      };
  }
}

export default function LeadList({
  filteredLeads,
  selectedLeadId,
  setSelectedLeadId,
  getStatusLabel,
  styles,
}: LeadListProps) {
  return (
    <div style={styles.tableWrapper}>
      <table style={styles.table}>
        <thead>
          <tr>
            <th style={styles.th}>ID</th>
            <th style={styles.th}>Name</th>
            <th style={styles.th}>Status</th>
            <th style={styles.th}>Follow-up</th>
            <th style={styles.th}>Score</th>
            <th style={styles.th}>Ort</th>
          </tr>
        </thead>

        <tbody>
          {filteredLeads.length === 0 ? (
            <tr>
              <td
                colSpan={6}
                style={{
                  ...styles.td,
                  textAlign: "center",
                  color: "#6b7280",
                  padding: "24px 12px",
                }}
              >
                Keine passenden Leads gefunden.
              </td>
            </tr>
          ) : (
            filteredLeads.map((lead) => {
              const isActive = selectedLeadId === lead.id;

              return (
                <tr
                  key={lead.id}
                  onClick={() => setSelectedLeadId(lead.id)}
                  style={{
                    ...styles.rowClickable,
                    ...(isActive ? styles.rowActive : {}),
                  }}
                >
                  <td style={styles.td}>{lead.id}</td>

                  <td style={styles.td}>
                    <div
                      style={{
                        display: "flex",
                        flexDirection: "column",
                        gap: 4,
                        minWidth: 140,
                      }}
                    >
                      <strong style={{ fontSize: "15px", lineHeight: 1.3 }}>
                        {lead.firstName} {lead.lastName}
                      </strong>

                      {lead.email && (
                        <span
                          style={{
                            fontSize: "12px",
                            color: "#6b7280",
                            wordBreak: "break-word",
                          }}
                        >
                          {lead.email}
                        </span>
                      )}
                    </div>
                  </td>

                  <td style={styles.td}>
                    <span style={getStatusBadgeStyle(lead.status)}>
                      {getStatusLabel(lead.status)}
                    </span>
                  </td>

                  <td style={styles.td}>
                    <span style={getFollowUpStyle(lead.nextFollowUpAt)}>
                      {formatFollowUp(lead.nextFollowUpAt)}
                    </span>
                  </td>

                  <td style={styles.td}>{lead.score ?? "-"}</td>
                  <td style={styles.td}>{"city" in lead ? lead.city ?? "-" : "-"}</td>
                </tr>
              );
            })
          )}
        </tbody>
      </table>
    </div>
  );
}