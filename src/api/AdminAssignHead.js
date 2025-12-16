const API_URL = import.meta.env.VITE_API_URL

export async function assignHeadFunction(UserId, Department) {
  try {
    const res = await fetch(`${API_URL}/AssignDepartmentHead`, {
   
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({UserId, Department}),
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