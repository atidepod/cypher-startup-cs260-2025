"""
hybrid_otp_rsa.py

Hybrid RSA + OTP secure messaging with:
- RSA key generation and encrypted private key storage
- OTP key generation with secrets
- RSA (OAEP) to encrypt OTP key
- OTP message encrypt/decrypt over a full character map (letters, digits, punctuation, space)
- HMAC-SHA256 for integrity (keyed with OTP key bytes)
"""

import secrets
import json
import base64
from typing import List, Tuple, Dict, Any

from cryptography.hazmat.primitives.asymmetric import rsa, padding # type: ignore
from cryptography.hazmat.primitives import serialization, hashes, hmac # type: ignore
from cryptography.hazmat.primitives.serialization import BestAvailableEncryption # type: ignore


# -------------------------
# Character mapping
# -------------------------
# a-z -> 0..25
# 0-9 -> 26..35
# punctuation + space assigned 36..47 (12 symbols)
PUNCT_MAP = {
    " ": 36, ".": 37, ",": 38, "!": 39, "?": 40,
    "'": 41, "\"": 42, ":": 43, ";": 44, "-": 45,
    "(": 46, ")": 47
}
REVERSE_MAP = {v: k for k, v in PUNCT_MAP.items()}

TOTAL_SYMBOLS = 48  # 0..47


def step1(s: str) -> List[int]:
    """Convert string to numeric representation using the char map."""
    s = s.lower()
    numbers: List[int] = []
    for ch in s:
        if 'a' <= ch <= 'z':
            numbers.append(ord(ch) - ord('a'))
        elif '0' <= ch <= '9':
            numbers.append(ord(ch) - ord('0') + 26)
        elif ch in PUNCT_MAP:
            numbers.append(PUNCT_MAP[ch])
        else:
            # if you want to preserve unknown characters, assign a placeholder;
            # Here we skip them to keep mapping consistent.
            continue
    return numbers


def step4(numbers: List[int]) -> str:
    """Convert numeric list back to string using reverse map."""
    out_chars = []
    for num in numbers:
        if 0 <= num <= 25:
            out_chars.append(chr(num + ord('a')))
        elif 26 <= num <= 35:
            out_chars.append(chr(num - 26 + ord('0')))
        elif num in REVERSE_MAP:
            out_chars.append(REVERSE_MAP[num])
        else:
            # skip unknown numbers
            continue
    return "".join(out_chars)


# -------------------------
# RSA key management
# -------------------------
def generate_rsa_keypair(key_size: int = 2048) -> rsa.RSAPrivateKey:
    """Generate RSA private key object (keep in memory or serialize)."""
    private_key = rsa.generate_private_key(public_exponent=65537, key_size=key_size)
    return private_key


def save_private_key_encrypted(private_key: rsa.RSAPrivateKey, filename: str, passphrase: bytes):
    """
    Serialize and save private key encrypted with passphrase (BestAvailableEncryption).
    passphrase: bytes (e.g. b'mystrongpassword')
    """
    pem = private_key.private_bytes(
        encoding=serialization.Encoding.PEM,
        format=serialization.PrivateFormat.PKCS8,
        encryption_algorithm=BestAvailableEncryption(passphrase)
    )
    with open(filename, "wb") as f:
        f.write(pem)


def load_private_key_encrypted(filename: str, passphrase: bytes) -> rsa.RSAPrivateKey:
    """Load an encrypted private key from disk using passphrase."""
    with open(filename, "rb") as f:
        data = f.read()
    private_key = serialization.load_pem_private_key(data, password=passphrase)
    return private_key


def save_public_key_pem(public_key: rsa.RSAPublicKey, filename: str):
    pem = public_key.public_bytes(encoding=serialization.Encoding.PEM,
                                  format=serialization.PublicFormat.SubjectPublicKeyInfo)
    with open(filename, "wb") as f:
        f.write(pem)


def load_public_key_pem(filename: str) -> rsa.RSAPublicKey:
    with open(filename, "rb") as f:
        data = f.read()
    public_key = serialization.load_pem_public_key(data)
    return public_key


# -------------------------
# OTP key generation & conversion
# -------------------------
def generate_otp_key(length: int) -> List[int]:
    """Generate an OTP key as a list of ints in range [0, TOTAL_SYMBOLS)."""
    return [secrets.randbelow(TOTAL_SYMBOLS) for _ in range(length)]


def otp_key_to_bytes(key: List[int]) -> bytes:
    """Pack the OTP numeric key into bytes (one byte per symbol)."""
    return bytes(key)


def bytes_to_otp_key(b: bytes) -> List[int]:
    """Convert bytes back to list of ints (each byte is a symbol)."""
    return list(b)


# -------------------------
# RSA encrypt/decrypt for key bytes (OAEP)
# -------------------------
def rsa_encrypt_key_bytes(pubkey: rsa.RSAPublicKey, key_bytes: bytes) -> bytes:
    """Encrypt small key_bytes with RSA OAEP; returns ciphertext bytes."""
    ct = pubkey.encrypt(
        key_bytes,
        padding.OAEP(mgf=padding.MGF1(algorithm=hashes.SHA256()),
                     algorithm=hashes.SHA256(),
                     label=None)
    )
    return ct


def rsa_decrypt_key_bytes(privkey: rsa.RSAPrivateKey, ciphertext: bytes) -> bytes:
    pt = privkey.decrypt(
        ciphertext,
        padding.OAEP(mgf=padding.MGF1(algorithm=hashes.SHA256()),
                     algorithm=hashes.SHA256(),
                     label=None)
    )
    return pt


# -------------------------
# OTP encryption/decryption (mod TOTAL_SYMBOLS)
# -------------------------
def otp_encrypt_numbers(msg_numbers: List[int], key: List[int]) -> List[int]:
    if len(key) < len(msg_numbers):
        raise ValueError("OTP key must be at least as long as the message")
    return [ (m + k) % TOTAL_SYMBOLS for m, k in zip(msg_numbers, key) ]


def otp_decrypt_numbers(cipher_numbers: List[int], key: List[int]) -> List[int]:
    if len(key) < len(cipher_numbers):
        raise ValueError("OTP key must be at least as long as the ciphertext")
    return [ (c - k) % TOTAL_SYMBOLS for c, k in zip(cipher_numbers, key) ]


# -------------------------
# HMAC for integrity
# -------------------------
def compute_hmac_sha256(key_bytes: bytes, msg_bytes: bytes) -> bytes:
    h = hmac.HMAC(key_bytes, hashes.SHA256())
    h.update(msg_bytes)
    return h.finalize()


def verify_hmac_sha256(key_bytes: bytes, msg_bytes: bytes, tag: bytes) -> bool:
    h = hmac.HMAC(key_bytes, hashes.SHA256())
    h.update(msg_bytes)
    try:
        h.verify(tag)
        return True
    except Exception:
        return False


# -------------------------
# High-level send/receive helpers
# -------------------------
def pack_transmit(encrypted_message: List[int], encrypted_otp_key_bytes: bytes, hmac_tag: bytes) -> str:
    """Create a JSON transport string (base64-encodes binary parts)."""
    payload = {
        "cipher": encrypted_message,                     # list of ints
        "enc_otp_key": base64.b64encode(encrypted_otp_key_bytes).decode(),
        "hmac": base64.b64encode(hmac_tag).decode()
    }
    return json.dumps(payload)


def unpack_transmit(payload_str: str) -> Dict[str, Any]:
    data = json.loads(payload_str)
    return {
        "cipher": data["cipher"],
        "enc_otp_key": base64.b64decode(data["enc_otp_key"]),
        "hmac": base64.b64decode(data["hmac"])
    }


def send_message(sender_message: str, receiver_pubkey: rsa.RSAPublicKey) -> str:
    """
    Full sender flow:
      - step1 map message -> numbers
      - generate otp key
      - otp-encrypt numbers
      - rsa-encrypt otp key bytes
      - compute hmac (keyed with otp key bytes) over ciphertext bytes
      - pack into JSON string
    Returns JSON payload string ready to transmit.
    """
    msg_numbers = step1(sender_message)
    otp_key = generate_otp_key(len(msg_numbers))
    cipher_numbers = otp_encrypt_numbers(msg_numbers, otp_key)

    otp_bytes = otp_key_to_bytes(otp_key)
    enc_otp_key = rsa_encrypt_key_bytes(receiver_pubkey, otp_bytes)

    # create a canonical bytes form of ciphertext for HMAC
    cipher_bytes = bytes(cipher_numbers)
    tag = compute_hmac_sha256(otp_bytes, cipher_bytes)

    payload = pack_transmit(cipher_numbers, enc_otp_key, tag)
    return payload


def receive_message(payload_str: str, receiver_privkey: rsa.RSAPrivateKey) -> Tuple[str, bool]:
    """
    Full receiver flow:
      - unpack message
      - rsa-decrypt otp key bytes
      - verify hmac
      - otp-decrypt numbers
      - step4 map numbers -> string
    Returns (plaintext_message, integrity_ok)
    """
    data = unpack_transmit(payload_str)
    cipher_numbers: List[int] = data["cipher"]
    enc_otp_key_bytes: bytes = data["enc_otp_key"]
    tag: bytes = data["hmac"]

    otp_bytes = rsa_decrypt_key_bytes(receiver_privkey, enc_otp_key_bytes)
    otp_key = bytes_to_otp_key(otp_bytes)

    cipher_bytes = bytes(cipher_numbers)
    integrity_ok = verify_hmac_sha256(otp_bytes, cipher_bytes, tag)

    if not integrity_ok:
        # If integrity fails, do not trust plaintext
        return ("", False)

    decrypted_numbers = otp_decrypt_numbers(cipher_numbers, otp_key)
    plaintext = step4(decrypted_numbers)
    return (plaintext, True)


# -------------------------
# Example usage (for CLI/testing)
# -------------------------
if __name__ == "__main__":
    # Generate RSA keys (only once)
    priv = generate_rsa_keypair(2048)
    pub = priv.public_key()

    # Save keys (encrypt private key with passphrase)
    passphrase = b"ironmansucks"  # replace with securely obtained passphrase
    save_private_key_encrypted(priv, "private_key.pem", passphrase)
    save_public_key_pem(pub, "public_key.pem")

    # Simulate sending a message
    message = "Hello, world! 123"
    print("Plaintext:", message)

    # Load receiver public key from file (simulate separate sender)
    receiver_pub = load_public_key_pem("public_key.pem")
    payload = send_message(message, receiver_pub)
    print("Payload to transmit (short):", payload[:120], "...")

    # Receiver loads private key and receives
    receiver_priv = load_private_key_encrypted("private_key.pem", passphrase)
    plaintext, ok = receive_message(payload, receiver_priv)
    print("Integrity OK:", ok)
    print("Decrypted plaintext:", plaintext)
