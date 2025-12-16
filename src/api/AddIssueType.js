const API_URL = import.meta.env.VITE_API_URL

export async function AddIssueType(Issue_Type) {
  try {
    const res = await fetch(`${API_URL}/AddIssueType`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(Issue_Type),
    });
    const data = await res.json();
    if (!res.ok) {
      throw new Error(`Error adding issue: ${res.status}`);
    }
    return data;
  } catch (error) {
    console.error("Error:", error);
    return {};
  }
}
