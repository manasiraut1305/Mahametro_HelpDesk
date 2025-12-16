const API_URL = import.meta.env.VITE_API_URL

export async function getDepartmentWiseUserFunction(department) {
  try {
    const res = await fetch(`${API_URL}/GetDepartment?department=${department}`, {
   
      method: 'GET',
      headers: { 'Content-Type': 'application/json' },
    });

    const data = await res.json();
    if (!res.ok) {
      throw new Error(`Error in getting Department wise user list`);
    }
    return data;
  } catch (error) {
    console.error('Error:', error);
    return {};
  }
}