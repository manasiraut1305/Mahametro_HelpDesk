const API_URL = import.meta.env.VITE_API_URL;

export async function DeleteIssueType(Id) {
  try {
    const res = await fetch(`${API_URL}/DeleteIssueTypeById?Id=${Id}`, {
      method: "GET",
      headers: { "Content-Type": "application/json" },
      
    });

    if (!res.ok) {
      throw new Error(`Error deleting issue: ${res.status}`);
    }

    const data = await res.json();
    return data;
  } catch (error) {
    console.error("Error deleting issue:", error);
    return { result: false, message: error.message };
  }
}
