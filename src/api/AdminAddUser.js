const API_URL = import.meta.env.VITE_API_URL

export async function adminAddUserFunction(payload) {
  try {
    const res = await fetch(`${API_URL}/AddUser`, {
   
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload),
    });

    const data = await res.json();
    if (!res.ok) {
      throw new Error(`Error in adding user`);
    }
    return data;
  } catch (error) {
    console.error('Error:', error);
    return {};
  }
}
