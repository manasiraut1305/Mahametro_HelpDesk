const API_URL = import.meta.env.VITE_API_URL

export async function userEditTicketFunction(formData) {
  try {
    const res = await fetch(`${API_URL}/Ticketupdate`, {
      method: 'POST',
    
      body: formData, // Directly send the FormData object
    });

    const data = await res.json();
    if (!res.ok) {
      
      console.error("API Error Response:", data);
      throw new Error(data.message || `Error in editing ticket: ${res.status} ${res.statusText}`);
    }
    return data;
  } catch (error) {
    console.error('Error in userEdit TicketFunction:', error); // More specific logging
    return { success: false, message: error.message || "An unexpected error occurred." }; // Return a consistent error structure
  }
}