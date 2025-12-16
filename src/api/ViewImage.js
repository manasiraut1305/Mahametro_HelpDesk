const API_URL = import.meta.env.VITE_API_URL

export async function viewImageFunction({ token }) {
  try {
    const res = await fetch(`${API_URL}/Viewimage/${token}`, {
      
      method: 'GET',
    //   headers: { 'Content-Type': 'application/json' },
      body: formData,
    });

    const data = await res.json();
    if (!res.ok) {
      throw new Error(`Error in fetching image ${res.status}`);
    }
    return data;
  } catch (error) {
    console.error('Error:', error);
    return{};
 }
}