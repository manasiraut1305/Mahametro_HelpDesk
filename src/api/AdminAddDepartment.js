const API_URL = import.meta.env.VITE_API_URL

export async function addDepartmentFunction({DepartmentName}) {
  try {
    const res = await fetch(`${API_URL}/AddDepartment`, {
   
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({DepartmentName}),
    });

    const data = await res.json();
    if (!res.ok) {
      throw new Error(`Error in adding Department`);
    }
    return data;
  } catch (error) {
    console.error('Error:', error);
    return {};
  }
}