const API_URL = import.meta.env.VITE_API_URL


export async function loginFunction(Email, Password) {
  try {
    const res = await fetch(`${API_URL}/login`, {
      
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ Email, Password }),
    });

    const data = await res.json();
    if (!res.ok) {
      throw new Error(`Error fetching login data: ${res.status}`);
    }
    return data;
  } catch (error) {
    console.error('Error:', error);
    return {};
  }
}
