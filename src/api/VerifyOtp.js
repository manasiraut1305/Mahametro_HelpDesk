const API_URL = import.meta.env.VITE_API_URL;

export async function verifyOtpFunction(payload) {
  try {
    const res = await fetch(`${API_URL}/ForgetPassword`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload),
    });

    const data = await res.json();

    if (!res.ok) {
      throw new Error('Error in sending email or verifying OTP');
    }

    return data;
  } catch (error) {
    console.error('Error:', error);
    return {};
  }
}
