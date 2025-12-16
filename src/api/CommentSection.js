const API_URL = import.meta.env.VITE_API_URL;

export async function commentSectionFunction({Userid, Name, Token, Comment }) {
  try {
    const payload = {
      Userid,         
      Name,
      Token,
      Comment,
    };

    console.log("Sending payload:", payload); 

    const res = await fetch(`${API_URL}/AddComment`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(payload),
    });

    const data = await res.json();

    if (!res.ok) {
      throw new Error(`Error in adding comment: ${res.status}`);
    }

    return data;
  } catch (error) {
    console.error('Error:', error);
    throw error;
  }
}


