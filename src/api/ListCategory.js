const API_URL = import.meta.env.VITE_API_URL;

export async function categoryListFunction(category) {
  try {
    const res = await fetch(`${API_URL}/GetSubCategories?category=${category}`, {
      method: 'GET',
      headers: { 'Content-Type': 'application/json' },
    });

    const data = await res.json();

    if (!res.ok) {
      throw new Error(`Error fetching subcategories: ${res.status}`);
    }

    // Normalize to array
    if (Array.isArray(data)) {
      return data;
    } else if (data?.result && Array.isArray(data.result)) {
      return data.result;
    } else {
      return [];
    }
  } catch (error) {
    console.error("Error fetching subcategories:", error);
    return [];
  }
}
