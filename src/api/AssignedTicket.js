const API_URL = import.meta.env.VITE_API_URL

export async function assignedTicketFunction() {
  try {
    const res = await fetch(`${API_URL}/AsignedUserlistNew`, {
      
      method: 'GET',
      headers: { 'Content-Type': 'application/json' },
      // body: JSON.stringify(),
    });

    const data = await res.json();
    if (!res.ok) {
      throw new Error(`Error in fetching Assigned Tickets: ${res.status}`);
    }
    return data;
  } catch (error) {
    console.error('Error:', error);
    return {};
  }
}
