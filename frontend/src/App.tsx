import { useEffect, useState, type CSSProperties } from "react";
import LeadList from "./components/LeadList";
import LeadFilters from "./components/LeadFilters";
import LeadDetail from "./components/LeadDetail";
import LeadForm from "./components/LeadForm";
import {
  updateLeadRequest,
  updateLeadStatusRequest,
  updateTaskRequest,
  createNoteRequest,
} from "./api/leads";
import type {
  Lead,
  LeadStatus,
  LeadSortOption,
  LeadFollowUpFilter,
} from "./types/crm";

type StatsResponse = {
  total_leads: number;
  by_pipeline: Array<{
    pipeline_stage: string;
    count: number;
  }>;
  by_score: Array<{
    score: string;
    count: number;
  }>;
};

type Note = {
  id: number;
  leadId: number;
  content: string;
  createdAt: string;
  updatedAt: string;
};

type Task = {
  id: number;
  leadId: number;
  title: string;
  description: string | null;
  dueAt: string | null;
  done: boolean;
  doneAt: string | null;
  createdAt: string;
  updatedAt: string;
};

const API_URL = import.meta.env.VITE_API_URL;

const LEAD_STATUSES: LeadStatus[] = [
  "new",
  "contact_attempt",
  "contacted",
  "qualified",
  "appointment_scheduled",
  "analysis_in_progress",
  "offer_sent",
  "follow_up",
  "won",
  "lost",
  "archived",
];

const STATUS_LABELS: Record<LeadStatus, string> = {
  new: "Neu",
  contact_attempt: "Kontaktversuch",
  contacted: "Kontaktiert",
  qualified: "Qualifiziert",
  appointment_scheduled: "Termin vereinbart",
  analysis_in_progress: "Analyse in Arbeit",
  offer_sent: "Angebot gesendet",
  follow_up: "Nachfassen",
  won: "Gewonnen",
  lost: "Verloren",
  archived: "Archiviert",
};

function getStatusLabel(status?: string | null) {
  if (!status) return "-";
  return STATUS_LABELS[status as LeadStatus] ?? status;
}

export default function App() {
  const [stats, setStats] = useState<StatsResponse | null>(null);
  const [leads, setLeads] = useState<Lead[]>([]);

  const [editSaving, setEditSaving] = useState(false);
  const [editFirstName, setEditFirstName] = useState("");
  const [editLastName, setEditLastName] = useState("");
  const [editEmail, setEditEmail] = useState("");
  const [editPhone, setEditPhone] = useState("");
  const [editFollowUpAt, setEditFollowUpAt] = useState("");

  const [selectedLeadId, setSelectedLeadId] = useState<number | null>(null);
  const [selectedLead, setSelectedLead] = useState<Lead | null>(null);
  const [notes, setNotes] = useState<Note[]>([]);
  const [tasks, setTasks] = useState<Task[]>([]);

  const [loading, setLoading] = useState(true);
  const [detailLoading, setDetailLoading] = useState(false);
  const [statusSaving, setStatusSaving] = useState(false);
  const [noteSaving, setNoteSaving] = useState(false);
  const [taskSaving, setTaskSaving] = useState(false);
  const [leadSaving, setLeadSaving] = useState(false);

  const [newNote, setNewNote] = useState("");
  const [newTaskTitle, setNewTaskTitle] = useState("");
  const [newTaskDescription, setNewTaskDescription] = useState("");
  const [newTaskDueAt, setNewTaskDueAt] = useState("");

  const [newLeadFirstName, setNewLeadFirstName] = useState("");
  const [newLeadLastName, setNewLeadLastName] = useState("");
  const [newLeadEmail, setNewLeadEmail] = useState("");
  const [newLeadPhone, setNewLeadPhone] = useState("");

  const [leadSearch, setLeadSearch] = useState("");
  const [leadStatusFilter, setLeadStatusFilter] =
    useState<LeadStatus | "all">("all");
  const [leadSort, setLeadSort] = useState<LeadSortOption>("newest");
  const [leadFollowUpFilter, setLeadFollowUpFilter] =
    useState<LeadFollowUpFilter>("all");

  const [error, setError] = useState<string | null>(null);
  const [isMobileLayout, setIsMobileLayout] = useState(false);

  const filteredLeads = leads
    .filter((lead) => {
      const matchesStatus =
        leadStatusFilter === "all" || lead.status === leadStatusFilter;

      const haystack = [
        lead.firstName,
        lead.lastName,
        lead.email,
        lead.phone,
      ]
        .filter(Boolean)
        .join(" ")
        .toLowerCase();

      const matchesSearch = haystack.includes(leadSearch.toLowerCase().trim());

      const startOfToday = new Date();
      startOfToday.setHours(0, 0, 0, 0);

      const endOfToday = new Date();
      endOfToday.setHours(23, 59, 59, 999);

      const followUpTime = lead.nextFollowUpAt
        ? new Date(lead.nextFollowUpAt).getTime()
        : null;

      const matchesFollowUp =
        leadFollowUpFilter === "all" ||
        (leadFollowUpFilter === "overdue" &&
          followUpTime !== null &&
          followUpTime < now) ||
        (leadFollowUpFilter === "today" &&
          followUpTime !== null &&
          followUpTime >= startOfToday.getTime() &&
          followUpTime <= endOfToday.getTime());

      return matchesStatus && matchesSearch && matchesFollowUp;
    })
    .sort((a, b) => {
      if (leadSort === "oldest") {
        return new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime();
      }

      if (leadSort === "name_asc") {
        return `${a.lastName} ${a.firstName}`.localeCompare(
          `${b.lastName} ${b.firstName}`,
          "de"
        );
      }

      if (leadSort === "name_desc") {
        return `${b.lastName} ${b.firstName}`.localeCompare(
          `${a.lastName} ${a.firstName}`,
          "de"
        );
      }

      if (leadSort === "follow_up") {
        const getFollowUpPriority = (lead: Lead) => {
          if (!lead.nextFollowUpAt) return 4;

          const diff = new Date(lead.nextFollowUpAt).getTime() - Date.now();

          if (diff < 0) return 0;
          if (diff < 24 * 60 * 60 * 1000) return 1;
          if (diff < 72 * 60 * 60 * 1000) return 2;
          return 3;
        };

        const priorityDiff = getFollowUpPriority(a) - getFollowUpPriority(b);

        if (priorityDiff !== 0) {
          return priorityDiff;
        }

        if (!a.nextFollowUpAt && !b.nextFollowUpAt) {
          return 0;
        }

        if (!a.nextFollowUpAt) {
          return 1;
        }

        if (!b.nextFollowUpAt) {
          return -1;
        }

        return (
          new Date(a.nextFollowUpAt).getTime() -
          new Date(b.nextFollowUpAt).getTime()
        );
      }

      return b.id - a.id;
    });
  const now = Date.now();

  const startOfToday = new Date();
  startOfToday.setHours(0, 0, 0, 0);

  const endOfToday = new Date();
  endOfToday.setHours(23, 59, 59, 999);

  const overdueCount = leads.filter((lead) => {
    if (!lead.nextFollowUpAt) return false;

    const time = new Date(lead.nextFollowUpAt).getTime();
    return time < now;
  }).length;

  const todayCount = leads.filter((lead) => {
    if (!lead.nextFollowUpAt) return false;

    const time = new Date(lead.nextFollowUpAt).getTime();
    return (
      time >= startOfToday.getTime() &&
      time <= endOfToday.getTime()
    );
  }).length;

  async function createLead() {
    try {
      setLeadSaving(true);
      setError(null);

      const res = await fetch(`${API_URL}/leads`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          firstName: newLeadFirstName.trim(),
          lastName: newLeadLastName.trim(),
          email: newLeadEmail.trim() || undefined,
          phone: newLeadPhone.trim() || undefined,
        }),
      });

      if (!res.ok) {
        throw new Error("Lead konnte nicht angelegt werden");
      }

      const createdLead: Lead = await res.json();

      setNewLeadFirstName("");
      setNewLeadLastName("");
      setNewLeadEmail("");
      setNewLeadPhone("");

      await loadOverview();
      setSelectedLeadId(createdLead.id);
    } catch (err) {
      const message =
        err instanceof Error ? err.message : "Unbekannter Fehler";
      setError(message);
    } finally {
      setLeadSaving(false);
    }
  }

  async function loadLeadDetails(leadId: number) {
    try {
      setDetailLoading(true);
      setError(null);

      const [leadRes, notesRes, tasksRes] = await Promise.all([
        fetch(`${API_URL}/leads/${leadId}`),
        fetch(`${API_URL}/leads/${leadId}/notes`),
        fetch(`${API_URL}/leads/${leadId}/tasks`),
      ]);

      if (!leadRes.ok) {
        throw new Error("Lead-Details konnten nicht geladen werden");
      }

      if (!notesRes.ok) {
        throw new Error("Notizen konnten nicht geladen werden");
      }

      if (!tasksRes.ok) {
        throw new Error("Aufgaben konnten nicht geladen werden");
      }

      const leadData: Lead = await leadRes.json();
      const notesData: Note[] = await notesRes.json();
      const tasksData: Task[] = await tasksRes.json();

      setSelectedLead(leadData);
      setEditFirstName(leadData.firstName ?? "");
      setEditLastName(leadData.lastName ?? "");
      setEditEmail(leadData.email ?? "");
      setEditPhone(leadData.phone ?? "");
      setEditFollowUpAt(
        leadData.nextFollowUpAt
          ? new Date(leadData.nextFollowUpAt).toISOString().slice(0, 16)
          : ""
      );
      setNotes(notesData);
      setTasks(tasksData);
    } catch (err) {
      const message =
        err instanceof Error ? err.message : "Unbekannter Fehler";
      setError(message);
    } finally {
      setDetailLoading(false);
    }
  }

  async function updateLeadStatus(status: string) {
    if (!selectedLead) return;

    try {
      setStatusSaving(true);
      setError(null);

      const updatedLead: Lead = await updateLeadStatusRequest(
        API_URL,
        selectedLead.id,
        { status }
      );

      setSelectedLead(updatedLead);
      setLeads((prev) =>
        prev.map((lead) => (lead.id === updatedLead.id ? updatedLead : lead))
      );
    } catch (err) {
      const message =
        err instanceof Error ? err.message : "Unbekannter Fehler";
      setError(message);
    } finally {
      setStatusSaving(false);
    }
  }

  async function updateLead(payload: {
    firstName?: string;
    lastName?: string;
    email?: string;
    phone?: string;
    nextFollowUpAt?: string;
  }) {
    if (!selectedLead) return;

    return updateLeadRequest(API_URL, selectedLead.id, payload);
  }

  async function handleSaveLead() {
    if (!selectedLead) return;

    try {
      setEditSaving(true);
      setError(null);

      const updatedLead: Lead = await updateLead({
        firstName: editFirstName.trim(),
        lastName: editLastName.trim(),
        email: editEmail.trim() || undefined,
        phone: editPhone.trim() || undefined,
        nextFollowUpAt: editFollowUpAt
          ? new Date(editFollowUpAt).toISOString()
          : undefined,
      });

      setSelectedLead(updatedLead);
      setLeads((prev) =>
        prev.map((lead) => (lead.id === updatedLead.id ? updatedLead : lead))
      );
    } catch (err) {
      const message =
        err instanceof Error ? err.message : "Unbekannter Fehler";
      setError(message);
    } finally {
      setEditSaving(false);
    }
  }

  async function createNote() {
    if (!selectedLead) return;
    if (!newNote.trim()) return;

    try {
      setNoteSaving(true);
      setError(null);

      const createdNote: Note = await createNoteRequest(
        API_URL,
        selectedLead.id,
        {
          content: newNote.trim(),
        }
      );

      setNotes((prev) => [createdNote, ...prev]);
      setNewNote("");
    } catch (err) {
      const message =
        err instanceof Error ? err.message : "Unbekannter Fehler";
      setError(message);
    } finally {
      setNoteSaving(false);
    }
  }

  async function createTask() {
    if (!selectedLead) return;
    if (!newTaskTitle.trim()) return;

    try {
      setTaskSaving(true);
      setError(null);

      const res = await fetch(`${API_URL}/leads/${selectedLead.id}/tasks`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          title: newTaskTitle.trim(),
          description: newTaskDescription.trim() || undefined,
          dueAt: newTaskDueAt ? new Date(newTaskDueAt).toISOString() : "",
        }),
      });

      if (!res.ok) {
        throw new Error("Aufgabe konnte nicht gespeichert werden");
      }

      const createdTask: Task = await res.json();

      setTasks((prev) => [createdTask, ...prev]);
      setNewTaskTitle("");
      setNewTaskDescription("");
      setNewTaskDueAt("");
    } catch (err) {
      const message =
        err instanceof Error ? err.message : "Unbekannter Fehler";
      setError(message);
    } finally {
      setTaskSaving(false);
    }
  }

  async function updateTask(taskId: number, payload: { done?: boolean }) {
    return updateTaskRequest(API_URL, taskId, payload);
  }

  async function handleTaskDone(taskId: number) {
    try {
      setError(null);

      await updateTask(taskId, { done: true });

      setTasks((prev) =>
        prev.map((task) =>
          task.id === taskId ? { ...task, done: true } : task
        )
      );
    } catch (err) {
      const message =
        err instanceof Error ? err.message : "Unbekannter Fehler";
      setError(message);
    }
  }

  async function loadOverview() {
    try {
      setLoading(true);
      setError(null);

      const [statsRes, leadsRes] = await Promise.all([
        fetch(`${API_URL}/stats`),
        fetch(`${API_URL}/leads`),
      ]);

      if (!statsRes.ok) {
        throw new Error("Statistiken konnten nicht geladen werden");
      }

      if (!leadsRes.ok) {
        throw new Error("Leads konnten nicht geladen werden");
      }

      const statsData: StatsResponse = await statsRes.json();
      const leadsData: Lead[] = await leadsRes.json();

      setStats(statsData);
      setLeads(leadsData);

      if (!selectedLeadId && leadsData.length > 0) {
        setSelectedLeadId(leadsData[0].id);
      }
    } catch (err) {
      const message =
        err instanceof Error ? err.message : "Unbekannter Fehler";
      setError(message);
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    void loadOverview();
  }, []);

  useEffect(() => {
    function handleResize() {
      setIsMobileLayout(window.innerWidth < 1100);
    }

    handleResize();
    window.addEventListener("resize", handleResize);

    return () => window.removeEventListener("resize", handleResize);
  }, []);

  useEffect(() => {
    if (selectedLeadId) {
      void loadLeadDetails(selectedLeadId);
    }
  }, [selectedLeadId]);

  return (
    <div style={styles.page}>
      <div style={styles.container}>
        <header style={styles.header}>
          <div>
            <h1 style={styles.title}>Immomonkey CRM</h1>
            <p style={styles.subtitle}>Dashboard, Leads und Detailansicht</p>
          </div>
          <button style={styles.button} onClick={() => void loadOverview()}>
            Übersicht neu laden
          </button>
        </header>

        {loading && <p>Daten werden geladen...</p>}

        {error && (
          <div style={styles.errorBox}>
            <strong>Fehler:</strong> {error}
          </div>
        )}

        {!loading && !error && stats && (
          <>
            <section style={styles.grid}>
              <div style={styles.card}>
                <h2 style={styles.cardTitle}>Gesamtzahl Leads</h2>
                <p style={styles.bigNumber}>{stats.total_leads}</p>
              </div>

              <div style={styles.card}>
                <h2 style={styles.cardTitle}>Status</h2>
                <div style={styles.list}>
                  {stats.by_pipeline.map((item) => (
                    <div key={item.pipeline_stage} style={styles.listRow}>
                      <span>{getStatusLabel(item.pipeline_stage)}</span>
                      <strong>{item.count}</strong>
                    </div>
                  ))}
                </div>
              </div>
              <div style={styles.card}>
                <h2 style={styles.cardTitle}>Heute zu tun</h2>

                <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
                  <div style={{ color: "#b91c1c", fontWeight: 600 }}>
                    🔴 Überfällig: {overdueCount}
                  </div>

                  <div style={{ color: "#ea580c", fontWeight: 600 }}>
                    🟠 Heute: {todayCount}
                  </div>
                </div>
              </div>

              <div style={styles.card}>
                <h2 style={styles.cardTitle}>Score</h2>
                <div style={styles.list}>
                  {stats.by_score.map((item) => (
                    <div key={item.score} style={styles.listRow}>
                      <span>
                        {item.score === "unrated" ? "Unbewertet" : item.score}
                      </span>
                      <strong>{item.count}</strong>
                    </div>
                  ))}
                </div>
              </div>
            </section>

            <section
              style={
                isMobileLayout
                  ? { display: "flex", flexDirection: "column", gap: "16px" }
                  : styles.layoutGrid
              }
            >
              <div style={styles.card}>
                <h2 style={styles.cardTitle}>Leads</h2>

                {leads.length === 0 ? (
                  <p>Keine Leads vorhanden.</p>
                ) : (
                  <>
                    <LeadForm
                      newLeadFirstName={newLeadFirstName}
                      setNewLeadFirstName={setNewLeadFirstName}
                      newLeadLastName={newLeadLastName}
                      setNewLeadLastName={setNewLeadLastName}
                      newLeadEmail={newLeadEmail}
                      setNewLeadEmail={setNewLeadEmail}
                      newLeadPhone={newLeadPhone}
                      setNewLeadPhone={setNewLeadPhone}
                      handleCreateLead={createLead}
                      leadSaving={leadSaving}
                      styles={styles}
                    />

                    <LeadFilters
                      leadSearch={leadSearch}
                      setLeadSearch={setLeadSearch}
                      leadStatusFilter={leadStatusFilter}
                      setLeadStatusFilter={setLeadStatusFilter}
                      leadSort={leadSort}
                      setLeadSort={setLeadSort}
                      leadFollowUpFilter={leadFollowUpFilter}
                      setLeadFollowUpFilter={setLeadFollowUpFilter}
                      LEAD_STATUSES={LEAD_STATUSES}
                      getStatusLabel={getStatusLabel}
                      styles={styles}
                    />

                    <div
                      style={
                        isMobileLayout
                          ? {
                            display: "flex",
                            flexDirection: "column",
                            gap: "16px",
                          }
                          : {
                            display: "grid",
                            gridTemplateColumns:
                              "minmax(320px, 1fr) minmax(380px, 1.2fr)",
                            gap: "16px",
                            alignItems: "start",
                          }
                      }
                    >
                      <LeadList
                        filteredLeads={filteredLeads}
                        selectedLeadId={selectedLeadId}
                        setSelectedLeadId={setSelectedLeadId}
                        getStatusLabel={getStatusLabel}
                        styles={styles}
                      />

                      <LeadDetail
                        detailLoading={detailLoading}
                        selectedLead={selectedLead}
                        editFirstName={editFirstName}
                        setEditFirstName={setEditFirstName}
                        editLastName={editLastName}
                        setEditLastName={setEditLastName}
                        editEmail={editEmail}
                        setEditEmail={setEditEmail}
                        editPhone={editPhone}
                        setEditPhone={setEditPhone}
                        editFollowUpAt={editFollowUpAt}
                        setEditFollowUpAt={setEditFollowUpAt}
                        handleSaveLead={handleSaveLead}
                        editSaving={editSaving}
                        LEAD_STATUSES={LEAD_STATUSES}
                        getStatusLabel={getStatusLabel}
                        updateLeadStatus={updateLeadStatus}
                        statusSaving={statusSaving}
                        newNote={newNote}
                        setNewNote={setNewNote}
                        createNote={createNote}
                        noteSaving={noteSaving}
                        notes={notes}
                        newTaskTitle={newTaskTitle}
                        setNewTaskTitle={setNewTaskTitle}
                        newTaskDescription={newTaskDescription}
                        setNewTaskDescription={setNewTaskDescription}
                        newTaskDueAt={newTaskDueAt}
                        setNewTaskDueAt={setNewTaskDueAt}
                        createTask={createTask}
                        taskSaving={taskSaving}
                        tasks={tasks}
                        handleTaskDone={handleTaskDone}
                        styles={styles}
                      />
                    </div>
                  </>
                )}
              </div>
            </section>
          </>
        )}
      </div>
    </div>
  );
}

const styles: Record<string, CSSProperties> = {
  page: {
    minHeight: "100vh",
    background: "#f5f7fb",
    padding: "24px 12px",
    fontFamily:
      "Inter, system-ui, -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif",
    color: "#1f2937",
    boxSizing: "border-box",
  },
  container: {
    width: "100%",
    maxWidth: "1400px",
    margin: "0 auto",
  },
  header: {
    display: "flex",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: "20px",
    gap: "16px",
    flexWrap: "wrap",
  },
  title: {
    margin: 0,
    fontSize: "clamp(26px, 4vw, 32px)",
    fontWeight: 700,
    lineHeight: 1.1,
  },
  subtitle: {
    margin: "6px 0 0 0",
    color: "#6b7280",
    fontSize: "14px",
  },
  button: {
    background: "#111827",
    color: "#ffffff",
    border: "none",
    borderRadius: "12px",
    padding: "12px 18px",
    cursor: "pointer",
    fontSize: "14px",
    fontWeight: 600,
    whiteSpace: "nowrap",
  },
  secondaryButton: {
    background: "#e5e7eb",
    color: "#374151",
    border: "none",
    borderRadius: "12px",
    padding: "12px 18px",
    cursor: "pointer",
    fontSize: "14px",
    fontWeight: 600,
  },
  grid: {
    display: "grid",
    gridTemplateColumns: "repeat(auto-fit, minmax(240px, 1fr))",
    gap: "16px",
    marginBottom: "24px",
  },
  layoutGrid: {
    display: "grid",
    gridTemplateColumns: "minmax(320px, 0.95fr) minmax(420px, 1.25fr)",
    gap: "16px",
    alignItems: "start",
  },
  card: {
    background: "#ffffff",
    borderRadius: "20px",
    padding: "20px",
    boxShadow: "0 8px 24px rgba(15, 23, 42, 0.06)",
    overflow: "hidden",
  },
  cardTitle: {
    margin: "0 0 16px 0",
    fontSize: "18px",
    lineHeight: 1.2,
  },
  bigNumber: {
    margin: 0,
    fontSize: "clamp(34px, 5vw, 42px)",
    fontWeight: 700,
    lineHeight: 1,
  },
  list: {
    display: "flex",
    flexDirection: "column",
    gap: "10px",
  },
  listRow: {
    display: "flex",
    justifyContent: "space-between",
    gap: "12px",
    borderBottom: "1px solid #e5e7eb",
    paddingBottom: "8px",
    fontSize: "14px",
  },
  tableWrapper: {
    width: "100%",
    overflowX: "auto",
    WebkitOverflowScrolling: "touch",
  },
  table: {
    width: "100%",
    minWidth: "760px",
    borderCollapse: "collapse",
  },
  th: {
    textAlign: "left",
    padding: "12px",
    borderBottom: "1px solid #e5e7eb",
    fontSize: "14px",
    whiteSpace: "nowrap",
  },
  td: {
    padding: "12px",
    borderBottom: "1px solid #f1f5f9",
    fontSize: "14px",
    verticalAlign: "top",
  },
  rowClickable: {
    cursor: "pointer",
  },
  rowActive: {
    background: "#eef2ff",
  },
  detailSection: {
    display: "flex",
    flexDirection: "column",
    gap: "12px",
  },
  detailRow: {
    display: "flex",
    justifyContent: "space-between",
    gap: "16px",
    borderBottom: "1px solid #e5e7eb",
    paddingBottom: "10px",
    flexWrap: "wrap",
  },
  detailLabel: {
    color: "#6b7280",
    minWidth: "110px",
    fontSize: "14px",
  },
  detailBlock: {
    display: "flex",
    flexDirection: "column",
    gap: "8px",
    marginTop: "8px",
  },
  messageBox: {
    background: "#f9fafb",
    borderRadius: "12px",
    padding: "12px",
  },
  subSection: {
    marginTop: "24px",
  },
  subTitle: {
    margin: "0 0 12px 0",
    fontSize: "16px",
    lineHeight: 1.2,
  },
  noteForm: {
    display: "flex",
    flexDirection: "column",
    gap: "10px",
    marginBottom: "16px",
  },
  textarea: {
    width: "100%",
    padding: "12px",
    borderRadius: "12px",
    border: "1px solid #d1d5db",
    fontSize: "14px",
    fontFamily: "inherit",
    resize: "vertical",
    boxSizing: "border-box",
    minHeight: "96px",
  },
  input: {
    width: "100%",
    padding: "12px",
    borderRadius: "12px",
    border: "1px solid #d1d5db",
    fontSize: "14px",
    fontFamily: "inherit",
    boxSizing: "border-box",
  },
  stack: {
    display: "flex",
    flexDirection: "column",
    gap: "10px",
  },
  noteCard: {
    background: "#f9fafb",
    borderRadius: "12px",
    padding: "12px",
  },
  noteMeta: {
    fontSize: "12px",
    color: "#6b7280",
    marginBottom: "6px",
  },
  select: {
    width: "100%",
    padding: "12px",
    borderRadius: "12px",
    border: "1px solid #d1d5db",
    background: "#ffffff",
    fontSize: "14px",
    boxSizing: "border-box",
  },
  errorBox: {
    background: "#fee2e2",
    color: "#991b1b",
    padding: "14px 16px",
    borderRadius: "12px",
    marginBottom: "20px",
    fontSize: "14px",
  },
  statusRow: {
    display: "flex",
    gap: "10px",
    alignItems: "center",
    flexWrap: "wrap",
  },
  smallInfo: {
    fontSize: "12px",
  },
  taskDescription: {
    marginTop: "6px",
  },
  taskDue: {
    marginTop: "6px",
    color: "#6b7280",
    fontSize: "13px",
  },
};