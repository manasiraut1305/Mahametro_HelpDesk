const API_URL = import.meta.env.VITE_API_URL

export async function GetCount(Id) {
  try {
    const res = await fetch(`${API_URL}/GetStatusCount_Update?Id=${Id}`, {
      
      method: 'GET',
      headers: { 'Content-Type': 'application/json' },
    });

    const data = await res.json();
    if (!res.ok) {
      throw new Error(`Error fetching Engineer's List: ${res.status}`);
    }
    return data;
  } catch (error) {
    console.error('Error:', error);
    return{};
}
}


