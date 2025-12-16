const API_URL = import.meta.env.VITE_API_URL;

export async function UserResolvedwiseCount() {
  try {
    const res = await fetch(`${API_URL}/UserResolvedwiseCount`, {
      method: 'GET',
      headers: { 'Content-Type': 'application/json' },
    });

       const data = await res.json();
    if (!res.ok) {
      throw new Error(`Error fetching Engineer's List: ${res.status}`);
    }
    return data;
  } catch (error) {
    console.error('Error:', error);
    return{};
}
}