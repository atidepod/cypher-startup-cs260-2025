import math
import secrets




# Miller-Rabin primality test
def is_prime(n, k=5):  # n = number to test, k = number of trials
    if n <= 1:
        return False
    if n <= 3:
        return True
    if n % 2 == 0:
        return False

    # write n-1 as 2^r * d
    r, d = 0, n - 1
    while d % 2 == 0:
        d //= 2
        r += 1

    for _ in range(k):
        a = secrets.randbelow(n - 3) + 2  # random in [2, n-2]
        x = pow(a, d, n)
        if x == 1 or x == n - 1:
            continue
        for _ in range(r - 1):
            x = pow(x, 2, n)
            if x == n - 1:
                break
        else:
            return False
    return True

def generate_large_prime(bits=512):
    while True:
        # generate random odd number of desired bit length
        p = secrets.randbits(bits) | (1 << bits - 1) | 1  # odd, exact bit length
        if is_prime(p):
            return p
        
primes = [0,0,0]
for i in range(len(primes)):
    primes[i] = generate_large_prime(512)  # small for demo; use 512+ for real RSA
# Step 1
p = primes[0]
q = primes[1]

# Step 2
n = p*q
# print("n =", n)

# Step 3
phi = (p-1)*(q-1)

# Step 4: Choose e
e = 2
while(e < phi):
    if math.gcd(e, phi) == 1:
        break
    e = e + 1
# print("e =", e)

# Step 5: Compute d using modular inverse
d = pow(e, -1, phi)
# print("d =", d)

#print(f'Public key: ({e}, {n})')
#print(f'Private key: ({d}, {n})')

def enter(msg,e,n):
    return pow(msg,e,n)

def exit(code,d,n):
    return pow(code,d,n)
def string_to_list(s):

    return [int(char) for char in s if char.isdigit()]

def digits_to_list(n):
    return [int(d) for d in str(n)]


def step1(s):
    s = s.lower()
    numbers = []
    punctuation_map = {
        " ": 36,
        ".": 37,
        ",": 38,
        "!": 39,
        "?": 40,
        "'": 41,
        "\"": 42,
        ":": 43,
        ";": 44,
        "-": 45,
        "(": 46,
        ")": 47
    }

    for char in s:
        if 'a' <= char <= 'z':           # letters
            numbers.append(ord(char) - ord('a'))
        elif '0' <= char <= '9':         # digits
            numbers.append(ord(char) - ord('0') + 26)
        elif char in punctuation_map:    # punctuation / space
            numbers.append(punctuation_map[char])
        # ignore any other characters
    return numbers

def step4(numbers):
    s = ""
    reverse_map = {
        36: " ",
        37: ".",
        38: ",",
        39: "!",
        40: "?",
        41: "'",
        42: "\"",
        43: ":",
        44: ";",
        45: "-",
        46: "(",
        47: ")"
    }

    for num in numbers:
        if 0 <= num <= 25:              # letters
            s += chr(num + ord('a'))
        elif 26 <= num <= 35:           # digits
            s += chr(num - 26 + ord('0'))
        elif num in reverse_map:        # punctuation / space
            s += reverse_map[num]
        # ignore any other numbers
    return s
def send_key(key,e,n):
    return enter(key,e,n)


def get_key(u,d,n):
    return exit(u,d,n)

def send_list(u,e,n):
    final_message = [0] * len(u)
    for i in range(len(u)):
        final_message[i] = enter(u[i],e,n)
    return final_message



def get_list(u,d,n):
    raw_numbers = [0] * len(u)

    for i in range(len(u)):
        raw_numbers[i] = exit(u[i],d,n)
    return raw_numbers


def send_str(u,e,n):
    return send_list((step1(u)),e,n)


def get_str(u,d,n):
    return step4(get_list(u,d,n))

def send_str_otp(u,k):
    
    if type(u) == str:
        numbers = step1(u)
        message_length = len(numbers)

        for i in range(message_length):
            numbers[i] = numbers[i] + k[i]
        for i in range(message_length):
            numbers[i] = numbers[i]%48

        short_key = k[:message_length]
        return [numbers, short_key]
    

    else:
        print("message must be a simple string")


def get_otp(u,k):
    if type(u) == list:
        numbers = []
       
        numbers = []
        for i in range(len(u)):
            val = (u[i] - k[i]) % 48
            numbers.append(val)

        return step4(numbers)
    

    else:
        print("message must be a simple list")
            
message = "hello, world! this is secure :)"
print(step1(message))
plain_key = digits_to_list(primes[2])
print(message)
cypher,cypher_key = send_str_otp(message, plain_key)
rsa_key = send_list(cypher_key,e,n)
print("mm: ", cypher)
incoming_key = get_list(rsa_key,d,n)
print("xx: ", get_otp(cypher, incoming_key))
