const API_URL = import.meta.env.VITE_API_URL

export async function deleteDepartmentFunction({id}) {
  try {
    const res = await fetch(`${API_URL}/DeleteDepartment?id=${id}`, {
   
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({id}),
    });

    const data = await res.json();
    if (!res.ok) {
      throw new Error(`Error in adding Category`);
    }
    return data;
  } catch (error) {
    console.error('Error:', error);
    return {};
  }
}