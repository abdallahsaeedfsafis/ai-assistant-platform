const API_BASE_URL = import.meta.env.VITE_API_URL || "http://localhost:8000";

export async function sendChatMessage(message, history) {
  let response;

  try {
    response = await fetch(`${API_BASE_URL}/api/chat`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ message, history }),
    });
  } catch (networkError) {
    throw new Error("Couldn't reach the server. Make sure it's running and try again.");
  }

  let data;
  try {
    data = await response.json();
  } catch {
    throw new Error("Unexpected response from the server.");
  }

  if (!response.ok) {
    throw new Error(data.detail || "Something went wrong. Please try again.");
  }

  return data.reply;
}