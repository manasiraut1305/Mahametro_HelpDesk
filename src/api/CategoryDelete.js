const API_URL = import.meta.env.VITE_API_URL

export async function deleteCategoryFunction({Id}) {
  try {
    const res = await fetch(`${API_URL}/DeleteCategory?Id=${Id}`, {
   
      method: 'GET',
      headers: { 'Content-Type': 'application/json' },
      // body: JSON.stringify({Category}),
    });

    const data = await res.json();
    if (!res.ok) {
      throw new Error(`Error in adding Category`);
    }
    return data;
  } catch (error) {
    console.error('Error:', error);
    return {};
  }
}