const API_URL = import.meta.env.VITE_API_URL

export async function adminEditUserFunction(payload) {
  try {
    const res = await fetch(`${API_URL}/UpdateUserlist`, {
   
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload),
    });

    const data = await res.json();
    if (!res.ok) {
      throw new Error(`Error in updating user`);
    }
    return data;
  } catch (error) {
    console.error('Error:', error);
    return {};
  }
}
