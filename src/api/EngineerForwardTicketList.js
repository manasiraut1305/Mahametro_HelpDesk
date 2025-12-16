const API_URL = import.meta.env.VITE_API_URL

export async function engineerTicketForwardListFunction({ id , status }) {
  try {
    const res = await fetch(`${API_URL}/ForwardedTicketsByEngineer?engineerId=${id}&status=${status}`, {
      
      method: 'GET',
      headers: { 'Content-Type': 'application/json' },
    });

    const data = await res.json();
    if (!res.ok) {
      throw new Error(`Error fetching Engineer's user List: ${res.status}`);
    }
    return data;
  } catch (error) {
    console.error('Error:', error);
    return{};
 }
}