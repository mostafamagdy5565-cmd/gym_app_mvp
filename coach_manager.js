/**
 * محرك متابعة المدرب للخطط والملاحظات وتقدم المتدربين
 */
function createCoachWorkspace(coachName = "Coach") {
  return {
    coachName,
    clients: []
  };
}

function assignClientPlan(workspace, clientPlan) {
  if (!workspace || !Array.isArray(workspace.clients) || !clientPlan || !clientPlan.clientId) {
    return { ok: false, message: "Invalid client plan data." };
  }

  const existingIndex = workspace.clients.findIndex(
    (c) => c.clientId === clientPlan.clientId
  );

  const normalizedClient = {
    clientId: clientPlan.clientId,
    name: clientPlan.name || clientPlan.clientId,
    goal: clientPlan.goal || "recomp",
    dailyBudget: Number(clientPlan.dailyBudget) || 0,
    currency: clientPlan.currency || "EGP",
    daysPerWeek: Number(clientPlan.daysPerWeek) || 4,
    focusTags: Array.isArray(clientPlan.focusTags) ? clientPlan.focusTags : [],
    targetBodyType: clientPlan.targetBodyType || "lean_athletic",
    adherencePercent: Number(clientPlan.adherencePercent) || 0,
    coachNotes: Array.isArray(clientPlan.coachNotes) ? clientPlan.coachNotes : [],
    updatedAt: new Date().toISOString()
  };

  if (existingIndex >= 0) {
    workspace.clients[existingIndex] = {
      ...workspace.clients[existingIndex],
      ...normalizedClient,
      coachNotes:
        normalizedClient.coachNotes.length > 0
          ? normalizedClient.coachNotes
          : workspace.clients[existingIndex].coachNotes
    };
  } else {
    workspace.clients.push(normalizedClient);
  }

  return {
    ok: true,
    client: existingIndex >= 0 ? workspace.clients[existingIndex] : normalizedClient
  };
}

function addCoachNote(workspace, clientId, noteText, lang = "ar") {
  const safeLang = lang === "en" ? "en" : "ar";
  if (!workspace || !Array.isArray(workspace.clients)) {
    return {
      ok: false,
      message: safeLang === "ar" ? "مساحة المدرب غير متاحة." : "Coach workspace unavailable."
    };
  }

  const client = workspace.clients.find((c) => c.clientId === clientId);
  if (!client) {
    return {
      ok: false,
      message: safeLang === "ar" ? "المتدرب غير موجود." : "Client not found."
    };
  }

  const cleanNote = String(noteText || "").trim();
  if (!cleanNote) {
    return {
      ok: false,
      message: safeLang === "ar" ? "اكتب ملاحظة واضحة أولاً." : "Please enter a non-empty note."
    };
  }

  const entry = {
    id: `note_${Date.now()}`,
    text: cleanNote,
    createdAt: new Date().toISOString()
  };

  client.coachNotes.push(entry);
  client.updatedAt = entry.createdAt;

  return {
    ok: true,
    note: entry,
    client
  };
}

function updateClientAdherence(workspace, clientId, adherencePercent) {
  if (!workspace || !Array.isArray(workspace.clients)) {
    return { ok: false };
  }
  const client = workspace.clients.find((c) => c.clientId === clientId);
  if (!client) {
    return { ok: false };
  }

  const clamped = Math.min(100, Math.max(0, Number(adherencePercent) || 0));
  client.adherencePercent = clamped;
  client.updatedAt = new Date().toISOString();

  return { ok: true, client };
}

function getCoachDashboardSummary(workspace, lang = "ar") {
  const safeLang = lang === "en" ? "en" : "ar";
  const clients = workspace && Array.isArray(workspace.clients) ? workspace.clients : [];

  const totalClients = clients.length;
  const averageAdherence =
    totalClients > 0
      ? Math.round(
          clients.reduce((sum, c) => sum + (Number(c.adherencePercent) || 0), 0) /
            totalClients
        )
      : 0;

  return {
    ok: true,
    coachName: (workspace && workspace.coachName) || "Coach",
    totalClients,
    averageAdherence,
    clients: clients.map((c) => ({
      clientId: c.clientId,
      name: c.name,
      goal: c.goal,
      daysPerWeek: c.daysPerWeek,
      dailyBudget: c.dailyBudget,
      currency: c.currency,
      adherencePercent: c.adherencePercent,
      notesCount: c.coachNotes.length,
      latestNote:
        c.coachNotes.length > 0
          ? c.coachNotes[c.coachNotes.length - 1].text
          : safeLang === "ar"
          ? "لا توجد ملاحظات بعد"
          : "No notes yet"
    }))
  };
}

if (typeof module !== "undefined" && module.exports) {
  module.exports = {
    createCoachWorkspace,
    assignClientPlan,
    addCoachNote,
    updateClientAdherence,
    getCoachDashboardSummary
  };
}