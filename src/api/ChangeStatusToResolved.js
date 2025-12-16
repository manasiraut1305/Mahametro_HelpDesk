const API_URL = import.meta.env.VITE_API_URL;

export async function changeStatusToResolvedFunction(Token, EngineerId) {
  try {
    const payload = {
      Token,         
      EngineerId,   
    };

    console.log("Sending payload:", payload); 

    // const res = await fetch(`${API_URL}/EngineerResolvedNew`, {
    const res = await fetch(`${API_URL}/EngineerResolvedNotifyWithHistory
      `, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(payload),
    });

    const data = await res.json();

    if (!res.ok) {
      throw new Error(`Error in resolving ticket: ${res.status}`);
    }

    return data;
  } catch (error) {
    console.error('Error:', error);
    throw error;
  }
}










