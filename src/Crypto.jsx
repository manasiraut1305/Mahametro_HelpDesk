// decryptUtils.js
import CryptoJS from "crypto-js";

// -- configure these (but avoid putting secrets in client in production) --
const AES_KEY = "770A8A65DA156D24EE2A093277530142"; // HEX string
const AES_IV  = "fsNjib4bGvPKKcRTqbSo5A==";       // BASE64 string

// parse the key/iv correctly
const key = CryptoJS.enc.Hex.parse(AES_KEY);        // HEX -> WordArray
const iv  = CryptoJS.enc.Base64.parse(AES_IV);      // BASE64 -> WordArray

/**
 * Decrypt an AES-CBC-PKCS7 ciphertext encoded in Base64.
 * @param {string} encryptedBase64 - ciphertext as base64 string
 * @returns {string} decrypted UTF-8 string
 */
export function decryptBase64AES(encryptedBase64) {
  if (!encryptedBase64) return "";

  // Create CipherParams from the Base64 ciphertext (expected by CryptoJS)
  const cipherParams = CryptoJS.lib.CipherParams.create({
    ciphertext: CryptoJS.enc.Base64.parse(encryptedBase64),
  });

  const decrypted = CryptoJS.AES.decrypt(cipherParams, key, {
    iv: iv,
    mode: CryptoJS.mode.CBC,
    padding: CryptoJS.pad.Pkcs7,
  });

  return decrypted.toString(CryptoJS.enc.Utf8);
}
