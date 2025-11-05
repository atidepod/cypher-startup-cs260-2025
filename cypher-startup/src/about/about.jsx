import React, { useState, useRef, useEffect } from 'react';
import { BrowserRouter, NavLink, Route, Routes } from 'react-router-dom';
import { Login } from '../login/login.jsx';
//import { About } from './about/about';
import { Message } from '../message/message.jsx';
import '../app.css'

export function About() {
  const [message, setMessage] = useState("");
  const [output, setOutput] = useState("");
  const [keys, setKeys] = useState(null);

  const userPassword = "myDemoPassword123!";

  const alphabetMap = {
    ...Object.fromEntries(Array.from({ length: 26 }, (_, i) => [String.fromCharCode(97 + i), i])), // a-z
    ...Object.fromEntries(Array.from({ length: 26 }, (_, i) => [String.fromCharCode(65 + i), 26 + i])), // A-Z
    ...Object.fromEntries(Array.from({ length: 10 }, (_, i) => [String(i), 52 + i])), // 0-9
    " ": 62, ".": 63, ",": 64, "!": 65, "?": 66,
    "'": 67, '"': 68, ":": 69, ";": 70, "-": 71,
    "(": 72, ")": 73
  };
  const reverseMap = Object.fromEntries(Object.entries(alphabetMap).map(([k, v]) => [v, k]));

  function textToNumbers(s) { return [...s].map(c => alphabetMap[c]).filter(v => v !== undefined); }
  function numbersToText(nums) { return nums.map(n => reverseMap[n] || "").join(""); }

  function generateOtp(length) {
    const otp = new Uint8Array(length);
    crypto.getRandomValues(otp);
    return Array.from(otp, b => b % Object.keys(alphabetMap).length);
  }
  function otpEncrypt(numbers, key) {
    const L = Object.keys(alphabetMap).length;
    return numbers.map((n, i) => (n + key[i]) % L);
  }
  function otpDecrypt(numbers, key) {
    const L = Object.keys(alphabetMap).length;
    return numbers.map((c, i) => (c - key[i] + L) % L);
  }

  async function generateRSAKeys() {
    return await crypto.subtle.generateKey(
      { name: "RSA-OAEP", modulusLength: 2048, publicExponent: new Uint8Array([1, 0, 1]), hash: "SHA-256" },
      true,
      ["encrypt", "decrypt"]
    );
  }
  async function exportKey(key) {
    const exported = await crypto.subtle.exportKey("spki", key);
    return btoa(String.fromCharCode(...new Uint8Array(exported)));
  }
  async function importPublicKey(base64Key) {
    const binary = Uint8Array.from(atob(base64Key), c => c.charCodeAt(0));
    return await crypto.subtle.importKey("spki", binary.buffer, { name: "RSA-OAEP", hash: "SHA-256" }, true, ["encrypt"]);
  }

  async function generateHmac(keyBytes, messageBytes) {
    const cryptoKey = await crypto.subtle.importKey(
      "raw", new Uint8Array(keyBytes), { name: "HMAC", hash: "SHA-256" }, false, ["sign"]
    );
    const sig = await crypto.subtle.sign("HMAC", cryptoKey, new Uint8Array(messageBytes));
    return Array.from(new Uint8Array(sig)).map(b => b.toString(16).padStart(2, "0")).join("");
  }

  async function hybridEncrypt(message, publicKey) {
    const msgNumbers = textToNumbers(message);
    const otpKey = generateOtp(msgNumbers.length);
    const encryptedMessage = otpEncrypt(msgNumbers, otpKey);

    const encryptedOtpKey = await Promise.all(
      otpKey.map(async k => {
        const enc = await crypto.subtle.encrypt({ name: "RSA-OAEP" }, publicKey, new Uint8Array([k]));
        return btoa(String.fromCharCode(...new Uint8Array(enc)));
      })
    );

    const mac = await generateHmac(otpKey, encryptedMessage);
    return { encrypted_message: encryptedMessage, encrypted_otp_key: encryptedOtpKey, hmac: mac };
  }

  async function hybridDecrypt(pkg, privateKey) {
    const otpKey = await Promise.all(
      pkg.encrypted_otp_key.map(async encStr => {
        const binary = Uint8Array.from(atob(encStr), c => c.charCodeAt(0));
        const dec = await crypto.subtle.decrypt({ name: "RSA-OAEP" }, privateKey, binary.buffer);
        const arr = new Uint8Array(dec);

        return arr[arr.length - 1];
      })
    );

    const macCheck = await generateHmac(otpKey, pkg.encrypted_message);
    if (macCheck !== pkg.hmac) throw new Error("Message integrity check failed!");

    const decryptedNumbers = otpDecrypt(pkg.encrypted_message, otpKey);
    return numbersToText(decryptedNumbers);
  }

  async function deriveKeyFromPassword(password, salt) {
    const enc = new TextEncoder();
    const keyMaterial = await crypto.subtle.importKey("raw", enc.encode(password), "PBKDF2", false, ["deriveKey"]);
    return crypto.subtle.deriveKey({ name: "PBKDF2", salt, iterations: 100000, hash: "SHA-256" }, keyMaterial, { name: "AES-GCM", length: 256 }, true, ["encrypt", "decrypt"]);
  }
  async function encryptPrivateKey(privateKey, password) {
    const exported = await crypto.subtle.exportKey("pkcs8", privateKey);
    const salt = crypto.getRandomValues(new Uint8Array(16));
    const iv = crypto.getRandomValues(new Uint8Array(12));
    const aesKey = await deriveKeyFromPassword(password, salt);
    const encrypted = await crypto.subtle.encrypt({ name: "AES-GCM", iv }, aesKey, exported);
    return { encrypted: new Uint8Array(encrypted), salt, iv };
  }
  async function decryptPrivateKey(encryptedObj, password) {
    const aesKey = await deriveKeyFromPassword(password, encryptedObj.salt);
    const decrypted = await crypto.subtle.decrypt({ name: "AES-GCM", iv: encryptedObj.iv }, aesKey, encryptedObj.encrypted);
    return await crypto.subtle.importKey("pkcs8", decrypted, { name: "RSA-OAEP", hash: "SHA-256" }, true, ["decrypt"]);
  }

  useEffect(() => {
    let mounted = true;

    async function setup() {
      try {
        const stored = localStorage.getItem("encryptedPrivateKey");
        const storedPub = localStorage.getItem("publicKey");

        if (stored && storedPub) {
          const parsed = JSON.parse(stored);
          const privateKey = await decryptPrivateKey({
            encrypted: new Uint8Array(parsed.encrypted),
            salt: new Uint8Array(parsed.salt),
            iv: new Uint8Array(parsed.iv)
          }, userPassword);

          const publicKey = await importPublicKey(storedPub);

          if (mounted) {
            setKeys({ privateKey, publicKey });
            console.log("Keys loaded successfully!");
          }
        } else {
          const newKeys = await generateRSAKeys();
          const encryptedKey = await encryptPrivateKey(newKeys.privateKey, userPassword);

          localStorage.setItem("encryptedPrivateKey", JSON.stringify({
            encrypted: Array.from(encryptedKey.encrypted),
            salt: Array.from(encryptedKey.salt),
            iv: Array.from(encryptedKey.iv)
          }));

          const pubExport = await exportKey(newKeys.publicKey);
          localStorage.setItem("publicKey", pubExport);

          if (mounted) {
            setKeys({ privateKey: newKeys.privateKey, publicKey: newKeys.publicKey });
            console.log("New key pair generated and stored.");
          }
        }
      } catch (e) {
        console.error(e);
        alert("Failed to load/generate keys. Clearing storage.");
        localStorage.clear();
        window.location.reload();
      }
    }

    setup();
    return () => { mounted = false; };
  }, []); 

  const runEncryptDecrypt = async () => {
    if (!keys) {
      alert("Keys not ready yet. Please wait a moment.");
      return;
    }
    try {
      const encryptedPkg = await hybridEncrypt(message, keys.publicKey);
      const decryptedMsg = await hybridDecrypt(encryptedPkg, keys.privateKey);

      const out = [
        "Original: " + message,
        "",
        "Encrypted Package:",
        JSON.stringify(encryptedPkg, null, 2),
        "",
        "Decrypted: " + decryptedMsg
      ].join("\n");

      setOutput(out);
    } catch (e) {
      console.error(e);
      setOutput("Error: " + e.message);
    }
  };

  return (
    <main className="container">
      <h1>Cypher Encryption Demo</h1>
      <p>
        This is a quick demo of what goes on behind the scenes with this messaging software.
        A plaintext message is encrypted using a One-Time-Pad style algorithm. A new random key
        is generated for each message, ensuring security. The random key is also encrypted using
        a RSA Modulus cypher, and is packed with HMAC noise to ensure message integrity.
        Type something into the example box to see the raw values that make up your messages.
      </p>

      <div className="mb-3">
        <textarea
          id="message"
          rows="4"
          className="form-control"
          placeholder="Type a message..."
          value={message}
          onChange={(e) => setMessage(e.target.value)}
        />
      </div>

      <button id="run" className="btn btn-primary" onClick={runEncryptDecrypt}>
        Encrypt &amp; Decrypt
      </button>

      <div className="mt-4">
        <pre id="output">{output}</pre>
      </div>
    </main>
  );
}