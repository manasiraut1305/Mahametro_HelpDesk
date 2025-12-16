const API_URL = import.meta.env.VITE_API_URL
export async function operatorAddTicketFunction(formData) {
  try {
    const res = await fetch(`${API_URL}/EngineerTicketGenerateForm_New`, {
      method: 'POST',
      body: formData,
    });

    console.log("Raw API Response:", res);
    console.log("API Response Status:", res.status);
    console.log("API Response OK status:", res.ok);

    const responseText = await res.text();
    console.log("API Response as Text:", responseText);

    let data;
    try {
      data = JSON.parse(responseText);
      console.log("Successfully parsed JSON data:", data);
    } catch (jsonError) {
      console.error("Error parsing JSON response:", jsonError);
      console.error("Response text that failed to parse:", responseText);
      
      throw new Error("Invalid JSON response from server.");
    }

    if (!res.ok) {
      console.error(`API Error: HTTP Status ${res.status} -`, data);
      return data;
    }
    return data;
  } catch (error) {
    console.error('Final Catch: Network error or processing issue in operatorAddTicketFunction:', error);

    return { result: false, message: error.message || "Network error or invalid response from server." };
  }
}