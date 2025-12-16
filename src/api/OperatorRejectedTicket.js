const API_URL = import.meta.env.VITE_API_URL

export async function operatorRejectedTicketFunction() {
  try {
    const res = await fetch(`${API_URL}/RejectedUserlistNew`, {
      
      method: 'GET',
      headers: { 'Content-Type': 'application/json' },
      // body: JSON.stringify(),
    });

    const data = await res.json();
    if (!res.ok) {
      throw new Error(`Error in fetching Rejected Tickets: ${res.status}`);
    }
    return data;
  } catch (error) {
    console.error('Error:', error);
    return {};
  }
}
