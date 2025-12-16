// engineerApi.js
import { decryptBase64AES } from "../Crypto";

const API_URL = import.meta.env.VITE_API_URL;

export async function engineerListFunction() {
  try {
    const res = await fetch(`${API_URL}/Engineer`, {
      method: "GET",
      headers: { "Content-Type": "application/json" },
    });

    if (!res.ok) {
      throw new Error(`Error fetching Engineer's List: ${res.status}`);
    }

    // read as text first (server might send encrypted base64 or plain JSON)
    const resText = await res.text();

    // Attempt 1: is it plain JSON?
    try {
      const parsed = JSON.parse(resText);

      // Case A: server returned JSON but with an encrypted field, e.g. { encryptedData: "..." }
      if (parsed && parsed.encryptedData && typeof parsed.encryptedData === "string") {
        const decryptedStr = decryptBase64AES(parsed.encryptedData);
        return JSON.parse(decryptedStr);
      }

      // Case B: server returned plain JSON (already decrypted)
      return parsed;
    } catch (err) {
      // Not plain JSON: assume resText itself is encrypted Base64
      const decryptedStr = decryptBase64AES(resText);
      try {
        return JSON.parse(decryptedStr);
      } catch (parseErr) {
        // decrypted string is not JSON; return as plain text
        return decryptedStr;
      }
    }
  } catch (error) {
    console.error("Error:", error);
    return {};
  }
}
