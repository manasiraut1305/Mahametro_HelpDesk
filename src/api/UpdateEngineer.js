
const API_URL = import.meta.env.VITE_API_URL;

export async function updateEngineerFunction({ token, currentEngineerId, newEngineerId }) {
  try {
    console.log("Calling API with:", { token, currentEngineerId, newEngineerId });
    const url = new URL(`${API_URL}/UpdateAssignedEngineer`);
    url.searchParams.append('token', token);
    url.searchParams.append('currentEngineerId', currentEngineerId);
    url.searchParams.append('newEngineerId', newEngineerId);

    const res = await fetch(
      url.toString(), 
      {
        method: 'POST',
       
      }
    );

    // --- IMPORTANT: Add proper error handling for non-OK responses ---
    if (!res.ok) {
      const errorDetail = await res.text(); 
      console.error(`Server responded with status ${res.status}:`, errorDetail);
      throw new Error(`Server error: ${res.status} ${res.statusText}. Details: ${errorDetail}`);
    }

    const data = await res.json();
    console.log("API Success Response:", data);
    return data;

  } catch (error) {
    console.error('Error in reassignEngineerFunction:', error);
    throw error; 
  }
}