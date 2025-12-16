const API_URL = import.meta.env.VITE_API_URL

export async function TicketReport({FromDate , ToDate, engineer_id, status,Category, Sub_Category,Ticket_type}) {
  try {
    const res = await fetch(`${API_URL}/TicketReportWithAssignmentHistory_New`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({FromDate,ToDate, engineer_id, status,Category, Sub_Category,Ticket_type}),
    });

    const data = await res.json();
    if (!res.ok) {
      const errorMessage = data?.message || `Error in fetching total ticket count: ${res.status}`;
      throw new Error(errorMessage);
    }
    return data;
  } catch (error) {
    console.error('Error in totalCountFunction:', error);
    throw error;
  }
}