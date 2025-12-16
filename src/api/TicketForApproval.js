const API_URL = import.meta.env.VITE_API_URL

export async function getTicketsForApproval(userId) {
  try {
    const res = await fetch(`${API_URL}/DeptHeadApprovedTicketsForHead?userId=${userId}`, {
   
      method: 'GET',
      headers: { 'Content-Type': 'application/json' },
    });

    const data = await res.json();
    if (!res.ok) {
      throw new Error(`Error in getting ticket for approval`);
    }
    return data;
  } catch (error) {
    console.error('Error:', error);
    return {};
  }
}