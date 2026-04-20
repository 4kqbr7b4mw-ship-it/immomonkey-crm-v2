import type { CSSProperties } from "react";
import type {
  LeadFollowUpFilter,
  LeadSortOption,
  LeadStatus,
} from "../types/crm";

type LeadFiltersProps = {
  leadSearch: string;
  setLeadSearch: (value: string) => void;
  leadStatusFilter: LeadStatus | "all";
  setLeadStatusFilter: (value: LeadStatus | "all") => void;
  leadSort: LeadSortOption;
  setLeadSort: (value: LeadSortOption) => void;
  leadFollowUpFilter: LeadFollowUpFilter;
  setLeadFollowUpFilter: (value: LeadFollowUpFilter) => void;
  LEAD_STATUSES: LeadStatus[];
  getStatusLabel: (status?: string | null) => string;
  styles: Record<string, CSSProperties>;
};

export default function LeadFilters({
  leadSearch,
  setLeadSearch,
  leadStatusFilter,
  setLeadStatusFilter,
  leadSort,
  setLeadSort,
  leadFollowUpFilter,
  setLeadFollowUpFilter,
  LEAD_STATUSES,
  getStatusLabel,
  styles,
}: LeadFiltersProps) {
  return (
    <div
      style={{
        display: "grid",
        gridTemplateColumns: "repeat(auto-fit, minmax(220px, 1fr))",
        gap: 12,
        marginBottom: 16,
        alignItems: "end",
      }}
    >
      <input
        type="text"
        placeholder="Leads durchsuchen..."
        value={leadSearch}
        onChange={(e) => setLeadSearch(e.target.value)}
        style={styles.input}
      />

      <select
        value={leadStatusFilter}
        onChange={(e) =>
          setLeadStatusFilter(e.target.value as LeadStatus | "all")
        }
        style={styles.select}
      >
        <option value="all">Alle Status</option>
        {LEAD_STATUSES.map((status) => (
          <option key={status} value={status}>
            {getStatusLabel(status)}
          </option>
        ))}
      </select>

      <select
        value={leadFollowUpFilter}
        onChange={(e) =>
          setLeadFollowUpFilter(e.target.value as LeadFollowUpFilter)
        }
        style={styles.select}
      >
        <option value="all">Alle Follow-ups</option>
        <option value="overdue">Nur überfällige</option>
        <option value="today">Heute fällig</option>
      </select>

      <select
        value={leadSort}
        onChange={(e) => setLeadSort(e.target.value as LeadSortOption)}
        style={styles.select}
      >
        <option value="newest">Neueste zuerst</option>
        <option value="oldest">Älteste zuerst</option>
        <option value="name_asc">Name A-Z</option>
        <option value="name_desc">Name Z-A</option>
        <option value="follow_up">Follow-up (Priorität)</option>
      </select>
    </div>
  );
}