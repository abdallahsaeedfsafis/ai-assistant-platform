const API_BASE_URL = import.meta.env.VITE_API_URL || "http://localhost:8000";

const TOKEN_KEY = "auth_token";

export function getToken() {
  return localStorage.getItem(TOKEN_KEY);
}

export function setToken(token) {
  localStorage.setItem(TOKEN_KEY, token);
}

export function clearToken() {
  localStorage.removeItem(TOKEN_KEY);
}

function authHeaders() {
  const token = getToken();
  return token ? { Authorization: `Bearer ${token}` } : {};
}

async function handleResponse(response) {
  const data = await response.json().catch(() => ({}));
  if (!response.ok) {
    throw new Error(data.detail || "Something went wrong. Please try again.");
  }
  return data;
}

// ---------------------------------------------------------------------------
// Auth
// ---------------------------------------------------------------------------

export async function signup(email, password) {
  const response = await fetch(`${API_BASE_URL}/api/auth/signup`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ email, password }),
  });
  const data = await handleResponse(response);
  setToken(data.access_token);
  return data;
}

export async function login(email, password) {
  const response = await fetch(`${API_BASE_URL}/api/auth/login`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ email, password }),
  });
  const data = await handleResponse(response);
  setToken(data.access_token);
  return data;
}

export async function getMe() {
  const response = await fetch(`${API_BASE_URL}/api/auth/me`, {
    headers: { ...authHeaders() },
  });
  return handleResponse(response);
}

export function logout() {
  clearToken();
}

// ---------------------------------------------------------------------------
// Conversations
// ---------------------------------------------------------------------------

export async function listConversations() {
  const response = await fetch(`${API_BASE_URL}/api/conversations`, {
    headers: { ...authHeaders() },
  });
  return handleResponse(response);
}

export async function createConversation(title = "New conversation") {
  const response = await fetch(`${API_BASE_URL}/api/conversations`, {
    method: "POST",
    headers: { "Content-Type": "application/json", ...authHeaders() },
    body: JSON.stringify({ title }),
  });
  return handleResponse(response);
}

export async function getConversation(conversationId) {
  const response = await fetch(`${API_BASE_URL}/api/conversations/${conversationId}`, {
    headers: { ...authHeaders() },
  });
  return handleResponse(response);
}

export async function deleteConversation(conversationId) {
  const response = await fetch(`${API_BASE_URL}/api/conversations/${conversationId}`, {
    method: "DELETE",
    headers: { ...authHeaders() },
  });
  return handleResponse(response);
}

// ---------------------------------------------------------------------------
// Chat
// ---------------------------------------------------------------------------

export async function sendChatMessage(conversationId, message) {
  const response = await fetch(`${API_BASE_URL}/api/chat`, {
    method: "POST",
    headers: { "Content-Type": "application/json", ...authHeaders() },
    body: JSON.stringify({ conversation_id: conversationId, message }),
  });
  const data = await handleResponse(response);
  return { reply: data.reply, toolsUsed: data.tools_used || [] };
}

// ---------------------------------------------------------------------------
// RAG / Admin
// ---------------------------------------------------------------------------

export async function verifyAdminPassword(password) {
  const response = await fetch(`${API_BASE_URL}/api/rag/verify-admin`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ password }),
  });
  return handleResponse(response);
}

export async function uploadPdf(file, password) {
  const formData = new FormData();
  formData.append("file", file);

  const response = await fetch(`${API_BASE_URL}/api/rag/upload`, {
    method: "POST",
    headers: { "X-Admin-Password": password },
    body: formData,
  });
  return handleResponse(response);
}

// ---------------------------------------------------------------------------
// Prompt Playground
// ---------------------------------------------------------------------------

export async function getPlaygroundCategories() {
  const response = await fetch(`${API_BASE_URL}/api/playground/categories`);
  const data = await handleResponse(response);
  return data.categories;
}

export async function comparePromptStrategies(category, input) {
  const response = await fetch(`${API_BASE_URL}/api/playground/compare`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ category, input }),
  });
  return handleResponse(response);
}