import os
import secrets
import hmac
import hashlib
import json
from cryptography.hazmat.primitives.asymmetric import rsa, padding # type: ignore
from cryptography.hazmat.primitives import serialization, hashes# type: ignore
from cryptography.hazmat.backends import default_backend#type: ignore

# ============================================================
# KEY MANAGEMENT (Persistent storage in "keys/" folder)
# ============================================================

KEY_FOLDER = "keys"  # folder where keys are stored
PRIVATE_KEY_FILE = os.path.join(KEY_FOLDER, "private_key.pem")
PUBLIC_KEY_FILE = os.path.join(KEY_FOLDER, "public_key.pem")

# Ensure key folder exists
os.makedirs(KEY_FOLDER, exist_ok=True)

# Passphrase for private key encryption
PASSPHRASE = b"your-strong-passphrase"


def load_or_generate_keys():
    """Load RSA keys from disk, or generate and save them if not found."""
    if os.path.exists(PRIVATE_KEY_FILE) and os.path.exists(PUBLIC_KEY_FILE):
        print("[+] Loading existing RSA keys...")

        # Load private key
        with open(PRIVATE_KEY_FILE, "rb") as f:
            private_key = serialization.load_pem_private_key(
                f.read(),
                password=PASSPHRASE,
                backend=default_backend()
            )

        # Load public key
        with open(PUBLIC_KEY_FILE, "rb") as f:
            public_key = serialization.load_pem_public_key(f.read(), backend=default_backend())

    else:
        print("[+] Generating new RSA keys...")

        # Generate new private key
        private_key = rsa.generate_private_key(
            public_exponent=65537,
            key_size=2048
        )
        public_key = private_key.public_key()

        # Save private key
        with open(PRIVATE_KEY_FILE, "wb") as f:
            f.write(private_key.private_bytes(
                encoding=serialization.Encoding.PEM,
                format=serialization.PrivateFormat.PKCS8,
                encryption_algorithm=serialization.BestAvailableEncryption(PASSPHRASE),
            ))

        # Save public key
        with open(PUBLIC_KEY_FILE, "wb") as f:
            f.write(public_key.public_bytes(
                encoding=serialization.Encoding.PEM,
                format=serialization.PublicFormat.SubjectPublicKeyInfo,
            ))

    return private_key, public_key


# ============================================================
# MESSAGE ENCODING / DECODING (letters, digits, punctuation)
# ============================================================

alphabet_map = {
    **{chr(i + ord("a")): i for i in range(26)},  # a-z → 0-25
    **{str(i): 26 + i for i in range(10)},        # 0-9 → 26-35
    " ": 36, ".": 37, ",": 38, "!": 39, "?": 40,
    "'": 41, "\"": 42, ":": 43, ";": 44, "-": 45,
    "(": 46, ")": 47
}
reverse_map = {v: k for k, v in alphabet_map.items()}


def text_to_numbers(s: str):
    """Convert text into list of numbers based on alphabet_map."""
    s = s.lower()
    return [alphabet_map[c] for c in s if c in alphabet_map]


def numbers_to_text(numbers: list):
    """Convert list of numbers back into text."""
    return "".join(reverse_map.get(n, "") for n in numbers)


# ============================================================
# OTP ENCRYPTION
# ============================================================

def generate_otp(length: int):
    """Generate a cryptographically secure OTP key (list of ints)."""
    return [secrets.randbelow(len(alphabet_map)) for _ in range(length)]


def otp_encrypt(numbers: list, key: list):
    """Encrypt numbers with OTP key."""
    return [(n + k) % len(alphabet_map) for n, k in zip(numbers, key)]


def otp_decrypt(numbers: list, key: list):
    """Decrypt numbers with OTP key."""
    return [(c - k) % len(alphabet_map) for c, k in zip(numbers, key)]


# ============================================================
# HYBRID ENCRYPTION (RSA + OTP)
# ============================================================

def hybrid_encrypt(message: str, public_key):
    """Encrypt a message using OTP + RSA."""
    # Convert message to numbers
    msg_numbers = text_to_numbers(message)

    # Generate OTP key
    otp_key = generate_otp(len(msg_numbers))

    # Encrypt message with OTP
    encrypted_message = otp_encrypt(msg_numbers, otp_key)

    # Encrypt OTP key with RSA (with padding)
    encrypted_otp_key = [
        public_key.encrypt(
            k.to_bytes(2, "big"),
            padding.OAEP(
                mgf=padding.MGF1(algorithm=hashes.SHA256()),
                algorithm=hashes.SHA256(),
                label=None,
            )
        ) for k in otp_key
    ]

    # Generate HMAC for integrity
    mac = hmac.new(bytes(otp_key), bytes(encrypted_message), hashlib.sha256).hexdigest()

    return {
        "encrypted_message": encrypted_message,
        "encrypted_otp_key": [c.hex() for c in encrypted_otp_key],
        "hmac": mac,
    }


def hybrid_decrypt(package: dict, private_key):
    """Decrypt package using RSA + OTP."""
    # Decrypt OTP key with private key
    otp_key = [
        int.from_bytes(
            private_key.decrypt(
                bytes.fromhex(c),
                padding.OAEP(
                    mgf=padding.MGF1(algorithm=hashes.SHA256()),
                    algorithm=hashes.SHA256(),
                    label=None,
                )
            ),
            "big"
        ) for c in package["encrypted_otp_key"]
    ]

    # Verify HMAC
    encrypted_message = package["encrypted_message"]
    mac_check = hmac.new(bytes(otp_key), bytes(encrypted_message), hashlib.sha256).hexdigest()
    if mac_check != package["hmac"]:
        raise ValueError("Message integrity check failed!")

    # Decrypt message with OTP
    decrypted_numbers = otp_decrypt(encrypted_message, otp_key)
    return numbers_to_text(decrypted_numbers)


# ============================================================
# DEMO
# ============================================================

if __name__ == "__main__":
    # Load or generate keys
    private_key, public_key = load_or_generate_keys()

    # Example message
    message = str(input("what do you want to say?"))

    print("\nOriginal Message:", message)

    # Encrypt
    package = hybrid_encrypt(message, public_key)
    print("\nEncrypted Package (JSON):")
    print(json.dumps(package, indent=2))

    # Decrypt
    decrypted_message = hybrid_decrypt(package, private_key)
    print("\nDecrypted Message:", decrypted_message)
