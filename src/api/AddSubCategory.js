const API_URL = import.meta.env.VITE_API_URL

export async function addSubCategoryFunction({SubCategory, CatId}) {
  try {
    const res = await fetch(`${API_URL}/AddSubCategory`, {
   
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({SubCategory, CatId}),
    });

    const data = await res.json();
    if (!res.ok) {
      throw new Error(`Error in adding Sub Category`);
    }
    return data;
  } catch (error) {
    console.error('Error:', error);
    return {};
  }
}