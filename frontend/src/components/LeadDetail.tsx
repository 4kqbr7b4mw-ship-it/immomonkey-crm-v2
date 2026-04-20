import { useEffect, useState } from "react";
import type { CSSProperties } from "react";
import type { Lead } from "../types/crm";


type Note = {
  id: number;
  createdAt: string;
  content: string;
};

type Task = {
  id: number;
  title: string;
  description?: string | null;
  dueAt?: string | null;
  done: boolean;
};

type LeadDetailProps = {
  detailLoading: boolean;
  selectedLead: Lead | null;
  editFollowUpAt: string;
  setEditFollowUpAt: (value: string) => void;

  editFirstName: string;
  setEditFirstName: (value: string) => void;
  editLastName: string;
  setEditLastName: (value: string) => void;
  editEmail: string;
  setEditEmail: (value: string) => void;
  editPhone: string;
  setEditPhone: (value: string) => void;

  handleSaveLead: () => Promise<void> | void;
  editSaving: boolean;

  LEAD_STATUSES: string[];
  getStatusLabel: (status?: string | null) => string;
  updateLeadStatus: (status: string) => Promise<void> | void;
  statusSaving: boolean;

  newNote: string;
  setNewNote: (value: string) => void;
  createNote: () => Promise<void> | void;
  noteSaving: boolean;
  notes: Note[];

  newTaskTitle: string;
  setNewTaskTitle: (value: string) => void;
  newTaskDescription: string;
  setNewTaskDescription: (value: string) => void;
  newTaskDueAt: string;
  setNewTaskDueAt: (value: string) => void;
  createTask: () => Promise<void> | void;
  taskSaving: boolean;
  tasks: Task[];
  handleTaskDone: (taskId: number) => void;

  styles: Record<string, CSSProperties>;
};

export default function LeadDetail({
  detailLoading,
  selectedLead,
  editFirstName,
  setEditFirstName,
  editLastName,
  setEditLastName,
  editEmail,
  setEditEmail,
  editPhone,
  setEditPhone,
  editFollowUpAt,
  setEditFollowUpAt,
  handleSaveLead,
  editSaving,
  LEAD_STATUSES,
  getStatusLabel,
  updateLeadStatus,
  statusSaving,
  newNote,
  setNewNote,
  createNote,
  noteSaving,
  notes,
  newTaskTitle,
  setNewTaskTitle,
  newTaskDescription,
  setNewTaskDescription,
  newTaskDueAt,
  setNewTaskDueAt,
  createTask,
  taskSaving,
  tasks,
  handleTaskDone,
  styles,
}: LeadDetailProps) {
  const [isMobile, setIsMobile] = useState(false);

  useEffect(() => {
    function handleResize() {
      setIsMobile(window.innerWidth < 768);
    }

    handleResize();
    window.addEventListener("resize", handleResize);

    return () => window.removeEventListener("resize", handleResize);
  }, []);
  return (
    <div style={styles.card}>
      <h2 style={styles.cardTitle}>Lead-Details</h2>

      {detailLoading && <p>Details werden geladen...</p>}

      {!detailLoading && !selectedLead && <p>Kein Lead ausgewählt.</p>}

      {!detailLoading && selectedLead && (
        <>
          <div style={styles.detailSection}>
            <div style={
              isMobile
                ? {
                  display: "flex",
                  flexDirection: "column",
                  gap: "6px",
                  borderBottom: "1px solid #e5e7eb",
                  paddingBottom: "10px",
                }
                : styles.detailRow
            }>
              <span style={styles.detailLabel}>Vorname</span>
              <input
                type="text"
                value={editFirstName}
                onChange={(e) => setEditFirstName(e.target.value)}
                style={styles.input}
              />
            </div>

            <div style={
              isMobile
                ? {
                  display: "flex",
                  flexDirection: "column",
                  gap: "6px",
                  borderBottom: "1px solid #e5e7eb",
                  paddingBottom: "10px",
                }
                : styles.detailRow
            }>
              <span style={styles.detailLabel}>Nachname</span>
              <input
                type="text"
                value={editLastName}
                onChange={(e) => setEditLastName(e.target.value)}
                style={styles.input}
              />
            </div>

            <div style={
              isMobile
                ? {
                  display: "flex",
                  flexDirection: "column",
                  gap: "6px",
                  borderBottom: "1px solid #e5e7eb",
                  paddingBottom: "10px",
                }
                : styles.detailRow
            }>
              <span style={styles.detailLabel}>E-Mail</span>
              <input
                type="email"
                value={editEmail}
                onChange={(e) => setEditEmail(e.target.value)}
                style={styles.input}
              />
            </div>

            <div style={
              isMobile
                ? {
                  display: "flex",
                  flexDirection: "column",
                  gap: "6px",
                  borderBottom: "1px solid #e5e7eb",
                  paddingBottom: "10px",
                }
                : styles.detailRow
            }>
              <span style={styles.detailLabel}>Telefon</span>
              <input
                type="text"
                value={editPhone}
                onChange={(e) => setEditPhone(e.target.value)}
                style={styles.input}
              />
            </div>
            <div
              style={
                isMobile
                  ? {
                    display: "flex",
                    flexDirection: "column",
                    gap: "6px",
                    borderBottom: "1px solid #e5e7eb",
                    paddingBottom: "10px",
                  }
                  : styles.detailRow
              }
            >
              <span style={styles.detailLabel}>Follow-up</span>
              <input
                type="datetime-local"
                value={editFollowUpAt}
                onChange={(e) => setEditFollowUpAt(e.target.value)}
                style={styles.input}
              />
            </div>

            <div style={{ marginBottom: 16 }}>
              <button
                style={styles.button}
                onClick={() => void handleSaveLead()}
                disabled={editSaving || !editFirstName.trim() || !editLastName.trim()}
              >
                {editSaving ? "Speichert..." : "Lead speichern"}
              </button>
            </div>

            <div style={
              isMobile
                ? {
                  display: "flex",
                  flexDirection: "column",
                  gap: "6px",
                  borderBottom: "1px solid #e5e7eb",
                  paddingBottom: "10px",
                }
                : styles.detailRow
            }>
              <span style={styles.detailLabel}>Status</span>
              <div style={styles.statusRow}>
                <select
                  value={selectedLead.status ?? ""}
                  onChange={(e) => void updateLeadStatus(e.target.value)}
                  disabled={statusSaving}
                  style={styles.select}
                >
                  {LEAD_STATUSES.map((status) => (
                    <option key={status} value={status}>
                      {getStatusLabel(status)}
                    </option>
                  ))}
                </select>
                {statusSaving && (
                  <span style={styles.smallInfo}>speichert...</span>
                )}
              </div>
            </div>

            <div style={
              isMobile
                ? {
                  display: "flex",
                  flexDirection: "column",
                  gap: "6px",
                  borderBottom: "1px solid #e5e7eb",
                  paddingBottom: "10px",
                }
                : styles.detailRow
            }>
              <span style={styles.detailLabel}>Score</span>
              <span>{selectedLead.score ?? "-"}</span>
            </div>

            <div style={
              isMobile
                ? {
                  display: "flex",
                  flexDirection: "column",
                  gap: "6px",
                  borderBottom: "1px solid #e5e7eb",
                  paddingBottom: "10px",
                }
                : styles.detailRow
            }>
              <span style={styles.detailLabel}>Objektart</span>
              <span>{selectedLead.propertyType ?? "-"}</span>
            </div>

            <div style={
              isMobile
                ? {
                  display: "flex",
                  flexDirection: "column",
                  gap: "6px",
                  borderBottom: "1px solid #e5e7eb",
                  paddingBottom: "10px",
                }
                : styles.detailRow
            }>
              <span style={styles.detailLabel}>Adresse</span>
              <span>
                {[selectedLead.street, selectedLead.zip, selectedLead.city]
                  .filter(Boolean)
                  .join(", ") || "-"}
              </span>
            </div>

            <div style={
              isMobile
                ? {
                  display: "flex",
                  flexDirection: "column",
                  gap: "6px",
                  borderBottom: "1px solid #e5e7eb",
                  paddingBottom: "10px",
                }
                : styles.detailRow
            }>
              <span style={styles.detailLabel}>Quelle</span>
              <span>{selectedLead.source ?? "-"}</span>
            </div>
            <div
              style={
                isMobile
                  ? {
                    display: "flex",
                    flexDirection: "column",
                    gap: "6px",
                    borderBottom: "1px solid #e5e7eb",
                    paddingBottom: "10px",
                  }
                  : styles.detailRow
              }
            >
              <span style={styles.detailLabel}>Nächstes Follow-up</span>
              <span>
                {selectedLead.nextFollowUpAt
                  ? new Date(selectedLead.nextFollowUpAt).toLocaleString("de-DE")
                  : "-"}
              </span>
            </div>

            <div style={styles.detailBlock}>
              <span style={styles.detailLabel}>Nachricht</span>
              <div style={styles.messageBox}>
                {selectedLead.message ?? "Keine Nachricht vorhanden."}
              </div>
            </div>
          </div>

          <div style={styles.subSection}>
            <h3 style={styles.subTitle}>Notizen</h3>

            <div style={styles.noteForm}>
              <textarea
                value={newNote}
                onChange={(e) => setNewNote(e.target.value)}
                placeholder="Neue Notiz eingeben..."
                rows={4}
                style={styles.textarea}
              />
              <button
                style={styles.button}
                onClick={() => void createNote()}
                disabled={noteSaving || !newNote.trim()}
              >
                {noteSaving ? "Speichert..." : "Notiz speichern"}
              </button>
            </div>

            {notes.length === 0 ? (
              <p>Keine Notizen vorhanden.</p>
            ) : (
              <div style={styles.stack}>
                {notes.map((note) => (
                  <div key={note.id} style={styles.noteCard}>
                    <div style={styles.noteMeta}>
                      Notiz #{note.id} ·{" "}
                      {new Date(note.createdAt).toLocaleString("de-DE")}
                    </div>
                    <div>{note.content}</div>
                  </div>
                ))}
              </div>
            )}
          </div>

          <div style={styles.subSection}>
            <h3 style={styles.subTitle}>Aufgaben</h3>

            <div style={styles.noteForm}>
              <input
                type="text"
                value={newTaskTitle}
                onChange={(e) => setNewTaskTitle(e.target.value)}
                placeholder="Titel der Aufgabe"
                style={styles.input}
              />

              <textarea
                value={newTaskDescription}
                onChange={(e) => setNewTaskDescription(e.target.value)}
                placeholder="Beschreibung (optional)"
                rows={3}
                style={styles.textarea}
              />

              <input
                type="datetime-local"
                value={newTaskDueAt}
                onChange={(e) => setNewTaskDueAt(e.target.value)}
                style={styles.input}
              />

              <button
                style={styles.button}
                onClick={() => void createTask()}
                disabled={taskSaving || !newTaskTitle.trim()}
              >
                {taskSaving ? "Speichert..." : "Aufgabe speichern"}
              </button>
            </div>

            {tasks.length === 0 ? (
              <p>Keine Aufgaben vorhanden.</p>
            ) : (
              <div style={styles.stack}>
                {tasks.map((task) => (
                  <div
                    key={task.id}
                    style={{
                      ...styles.noteCard,
                      opacity: task.done ? 0.65 : 1,
                    }}
                  >
                    <div style={styles.noteMeta}>
                      Aufgabe #{task.id} · {task.done ? "Erledigt" : "Offen"}
                    </div>

                    <strong
                      style={{
                        textDecoration: task.done ? "line-through" : "none",
                      }}
                    >
                      {task.title}
                    </strong>

                    {task.description && (
                      <div style={styles.taskDescription}>{task.description}</div>
                    )}

                    <div style={styles.taskDue}>
                      Fällig:{" "}
                      {task.dueAt
                        ? new Date(task.dueAt).toLocaleString("de-DE")
                        : "-"}
                    </div>

                    <div style={{ marginTop: 10 }}>
                      <button
                        onClick={() => handleTaskDone(task.id)}
                        disabled={task.done}
                        style={styles.button}
                      >
                        {task.done ? "Erledigt" : "Als erledigt markieren"}
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </>
      )}
    </div>
  );
}