type UpdateLeadPayload = {
  firstName?: string;
  lastName?: string;
  email?: string;
  phone?: string;
  nextFollowUpAt?: string;
};

type UpdateLeadStatusPayload = {
  status: string;
};

type UpdateTaskPayload = {
  done?: boolean;
};

type CreateNotePayload = {
  content: string;
};

export async function updateLeadRequest(
  apiUrl: string,
  leadId: number,
  payload: UpdateLeadPayload
) {
  const res = await fetch(`${apiUrl}/leads/${leadId}`, {
    method: "PATCH",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify(payload),
  });

  if (!res.ok) {
    throw new Error("Lead konnte nicht aktualisiert werden");
  }

  return res.json();
}

export async function updateLeadStatusRequest(
  apiUrl: string,
  leadId: number,
  payload: UpdateLeadStatusPayload
) {
  const res = await fetch(`${apiUrl}/leads/${leadId}/status`, {
    method: "PATCH",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify(payload),
  });

  if (!res.ok) {
    throw new Error("Status konnte nicht aktualisiert werden");
  }

  return res.json();
}

export async function updateTaskRequest(
  apiUrl: string,
  taskId: number,
  payload: UpdateTaskPayload
) {
  const res = await fetch(`${apiUrl}/leads/tasks/${taskId}`, {
    method: "PATCH",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify(payload),
  });

  if (!res.ok) {
    throw new Error("Aufgabe konnte nicht aktualisiert werden");
  }

  return res.json();
}

export async function createNoteRequest(
  apiUrl: string,
  leadId: number,
  payload: CreateNotePayload
) {
  const res = await fetch(`${apiUrl}/leads/${leadId}/notes`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify(payload),
  });

  if (!res.ok) {
    throw new Error("Notiz konnte nicht gespeichert werden");
  }

  return res.json();
}