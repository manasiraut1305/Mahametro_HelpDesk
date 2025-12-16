const API_URL = import.meta.env.VITE_API_URL;

export async function generateTicketFunction(formData) {
  try {
    const res = await fetch(`${API_URL}/TicketGenerateForm`, {
      method: 'POST',
      body: formData,
    });

    const data = await res.json();
    if (!res.ok) {
      throw new Error(`Error in generating ticket: ${res.status}`);
    }
    return data;
  } catch (error) {
    console.error('Error:', error);
    return {};
  }
}
