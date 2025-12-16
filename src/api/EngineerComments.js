const API_URL = import.meta.env.VITE_API_URL;

export async function engineerCommentFunction(Token, EngineerId, Comment) {
  try {
    const payload = {
      Token,         
      EngineerId,
      Comment   
    };

    console.log("Sending payload:", payload); 

    const res = await fetch(`${API_URL}/AddComments`, {
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










