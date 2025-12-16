const API_URL = import.meta.env.VITE_API_URL;

export async function getCommentFunction({ Token }) {
  try {
    const payload = { Token };
    const res = await fetch(`${API_URL}/GetComment`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload),
    });

    const data = await res.json();

    if (!res.ok) {
      throw new Error(`Error fetching comments: ${res.status}`);
    }

    return data; // Should contain `comments` array
  } catch (error) {
    console.error('Error:', error);
    throw error;
  }
}



