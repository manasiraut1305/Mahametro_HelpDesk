// File: ChangeStatusToApproved.js
const API_URL = import.meta.env.VITE_API_URL;

export async function changeStatusToApprovedFunction(Token, EngineerId) {
  try {
    const payload = {
      Token,         
      EngineerId,   
    };

    console.log("Sending payload:", payload); 

    // const res = await fetch(`${API_URL}/EngineerApproved`, {
    const res = await fetch(`${API_URL}/EngineerApproveWithForwardCheck`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(payload),
    });

    const data = await res.json();

    if (!res.ok) {
      throw new Error(`Error in approving ticket: ${res.status}`);
    }

    return data;
  } catch (error) {
    console.error('Error:', error);
    throw error;
  }
}
