const API_BASE_URL = import.meta.env.VITE_API_URL || "http://localhost:8000";

export async function sendChatMessage(message, history) {
  let response;

  try {
    response = await fetch(`${API_BASE_URL}/api/chat`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ message, history }),
    });
  } catch {
    throw new Error("Couldn't reach the server. Make sure it's running and try again.");
  }

  const data = await response.json().catch(() => ({}));

  if (!response.ok) {
    throw new Error(data.detail || "Something went wrong. Please try again.");
  }

  return { reply: data.reply, toolsUsed: data.tools_used || [] };
}

export async function askDocumentQuestion(question) {
  let response;
  try {
    response = await fetch(`${API_BASE_URL}/api/rag/ask`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ question }),
    });
  } catch {
    throw new Error("Couldn't reach the server. Make sure it's running and try again.");
  }

  const data = await response.json().catch(() => ({}));
  if (!response.ok) {
    throw new Error(data.detail || "Something went wrong. Please try again.");
  }
  return data; // { answer, sources, has_context }
}

export async function verifyAdminPassword(password) {
  const response = await fetch(`${API_BASE_URL}/api/rag/verify-admin`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ password }),
  });
  const data = await response.json().catch(() => ({}));
  if (!response.ok) {
    throw new Error(data.detail || "Invalid password.");
  }
  return true;
}

export async function uploadPdf(file, password) {
  const formData = new FormData();
  formData.append("file", file);

  const response = await fetch(`${API_BASE_URL}/api/rag/upload`, {
    method: "POST",
    headers: { "X-Admin-Password": password },
    body: formData,
  });

  const data = await response.json().catch(() => ({}));
  if (!response.ok) {
    throw new Error(data.detail || "Upload failed.");
  }
  return data; // { doc_id, filename, chunks_added }
}