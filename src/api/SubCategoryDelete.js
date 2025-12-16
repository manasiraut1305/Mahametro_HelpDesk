const API_URL = import.meta.env.VITE_API_URL

export async function subCategoryDeleteFunction({Id}) { 
  try {
    
    const url = new URL(`${API_URL}/DeleteSubCategory?Id=${Id}`);

    const res = await fetch(url.toString(), {
      method: 'GET',
      headers: { 'Content-Type': 'application/json' },
     
    });

    const data = await res.json();
    if (!res.ok) {
    
      throw new Error(`Failed to delete sub category: ${res.status} - ${data?.message || JSON.stringify(data)}`);
    }
    return data;
  } catch (error) {
    console.error('Error in subCategoryDeleteFunction:', error);
    return { error: error.message || 'An unexpected error occurred during sub category deletion.' };
  }
}