// File: ChangeStatusToApproved.js
const API_URL = import.meta.env.VITE_API_URL;

export async function userResetPasswordFunction(Email, Password) {
  try {
    const payload = {
      Email,         
      Password,   
    };

    console.log("Sending payload:", payload); 

    const res = await fetch(`${API_URL}/ResetPassword`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(payload),
    });

    const data = await res.json();

    if (!res.ok) {
      throw new Error(`Error in reseting password: ${res.status}`);
    }

    return data;
  } catch (error) {
    console.error('Error:', error);
    throw error;
  }
}
