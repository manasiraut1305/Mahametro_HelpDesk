const API_URL = import.meta.env.VITE_API_URL;

export async function changeStatusToAssignedFunction({Token, EngineerId, priority}) {
  try {
    const payload = {
      Token,         
      EngineerId,
      priority,   
    };

    console.log("Sending payload:", payload); 

    const res = await fetch(`${API_URL}/Asigned_NewRequirement`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(payload),
    });

    const data = await res.json();

    if (!res.ok) {
      throw new Error(`Error in assigning ticket: ${res.status}`);
    }

    return data;
  } catch (error) {
    console.error('Error:', error);
    throw error;
  }
}










