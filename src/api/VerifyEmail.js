const API_URL = import.meta.env.VITE_API_URL

export async function verifyEmailFunction(payload) {
  try {
    const res = await fetch(`${API_URL}/SendOtp`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload),
    });

    const data = await res.json();

    // Instead of throwing, return response with success = false
    if (!res.ok) {
      console.error("Server returned error:", data.message);
      return { success: false, message: data.message || "Error in sending OTP" };
    }

    return data;
  } catch (error) {
    console.error("Fetch/network error:", error);
    return { success: false, message: "Network error occurred" };
  }
}
