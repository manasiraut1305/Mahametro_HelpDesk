const API_URL = import.meta.env.VITE_API_URL

export async function uploadFileFunction(formData) {
  try {
    const res = await fetch(`${API_URL}/allsidefileupload`, {
      method: 'POST',
      body: formData,
    });

    console.log("Raw API Response:", res);
    console.log("API Response Status:", res.status);
    console.log("API Response OK status:", res.ok);
    if (!res.ok) {
      const errorText = await res.text();
      console.error(`API Error: HTTP Status ${res.status} -`, errorText);
      throw new Error(`API Error: ${res.statusText || 'Unknown error'} - ${errorText}`);
    }
    const responseClone = res.clone();
    let data;
    try {
      const text = await res.text();
      if (!text) {
        
        console.warn("Received a successful but empty response.");
        return { result: true, message: "Upload successful, but no data was returned." };
      }
      data = JSON.parse(text);
      console.log("Successfully parsed JSON data:", data);
    } catch (jsonError) {
      const errorText = await responseClone.text();
      console.error("Error parsing JSON response:", jsonError);
      console.error("Response text that failed to parse:", errorText);
      throw new Error("Invalid JSON response from server.");
    }

    return data;

  } catch (error) {
    console.error('Issue in uploading', error);
    return { result: false, message: error.message || "Network error or invalid response from server." };
  }
}