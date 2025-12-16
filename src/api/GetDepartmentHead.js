const API_URL = import.meta.env.VITE_API_URL

export async function getDepartmentHead(department) {
  try {
    const res = await fetch(`${API_URL}/GetDepartmentHead?department=${department}`, {
      
      method: 'GET',
      headers: { 'Content-Type': 'application/json' },
    });

    const data = await res.json();
    if (!res.ok) {
      throw new Error(`Error fetching Heads's List: ${res.status}`);
    }
    return data;
  } catch (error) {
    console.error('Error:', error);
    return {};
  }
}
