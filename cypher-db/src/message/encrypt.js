// encryption.js
// (trimmed to only what's needed for encryption in the chat)

const alphabetMap = {
  ...Object.fromEntries(Array.from({length:26}, (_, i) => [String.fromCharCode(97+i), i])),
  ...Object.fromEntries(Array.from({length:26}, (_, i) => [String.fromCharCode(65+i), 26 + i])),
  ...Object.fromEntries(Array.from({length:10}, (_, i) => [String(i), 52 + i])),
  " ": 62, ".": 63, ",": 64, "!": 65, "?": 66,
  "'": 67, "\"": 68, ":": 69, ";": 70, "-": 71,
  "(": 72, ")": 73
};
const reverseMap = Object.fromEntries(Object.entries(alphabetMap).map(([k,v]) => [v,k]));

export function textToNumbers(s){ return [...s].map(c=>alphabetMap[c]).filter(v=>v!==undefined); }
export function numbersToText(nums){ return nums.map(n => reverseMap[n]||"").join(""); }

export function generateOtp(length){
  const otp = new Uint8Array(length);
  crypto.getRandomValues(otp);
  return Array.from(otp, b => b % Object.keys(alphabetMap).length);
}
export function otpEncrypt(numbers,key){
  const L = Object.keys(alphabetMap).length;
  return numbers.map((n,i)=> (n + key[i]) % L);
}
export function otpDecrypt(numbers,key){
  const L = Object.keys(alphabetMap).length;
  return numbers.map((c,i)=> (c - key[i] + L) % L);
}

export async function generateRSAKeys(){
  return await crypto.subtle.generateKey(
    { name:"RSA-OAEP", modulusLength:2048, publicExponent:new Uint8Array([1,0,1]), hash:"SHA-256" },
    true,
    ["encrypt","decrypt"]
  );
}

export async function generateHmac(keyBytes,messageBytes){
  const cryptoKey = await crypto.subtle.importKey(
    "raw", new Uint8Array(keyBytes), {name:"HMAC", hash:"SHA-256"}, false, ["sign"]
  );
  const sig = await crypto.subtle.sign("HMAC", cryptoKey, new Uint8Array(messageBytes));
  return Array.from(new Uint8Array(sig)).map(b=>b.toString(16).padStart(2,"0")).join("");
}

export async function hybridEncrypt(message, publicKey){
  const msgNumbers = textToNumbers(message);
  const otpKey = generateOtp(msgNumbers.length);
  const encryptedMessage = otpEncrypt(msgNumbers, otpKey);

  const encryptedOtpKey = await Promise.all(
    otpKey.map(async k => {
      const enc = await crypto.subtle.encrypt({name:"RSA-OAEP"}, publicKey, new Uint8Array([k]));
      return btoa(String.fromCharCode(...new Uint8Array(enc)));
    })
  );

  const mac = await generateHmac(otpKey, encryptedMessage);
  // return as JSON string to show in chat bubble
  return JSON.stringify({encryptedMessage});
}
