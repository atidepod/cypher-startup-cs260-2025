# Cypher Startup

[My Notes](notes.md)

This startup will be a prototype of a secure message transfer website/app. So far, I have working code for sending all text messages, in the future we can incoorperate sending images and video. This project will incoorperate a hybrid of RSA and One-Time_Pad encryption to produce a secure message sharing environment. This website will eventually be converted to an app for a more realistic use model.  



## 🚀 Specification Deliverable

For this deliverable I did the following. I checked the box `[x]` and added a description for things I completed.

- '[x]' Proper use of Markdown
- '[x]' A concise and compelling elevator pitch
- '[x]' Description of key features
- '[x]' Description of how you will use each technology
- '[x]' One or more rough sketches of your application. Images must be embedded in this file using Markdown image references.

### Elevator pitch

Have you ever wanted to send a potentially risky text, but were afraid that your messaging service was insecure? Worry no more! Get registered at Cypher.com to get peace of mind through secure messeging for free!

### Design

![Design image](startup_drawing.jpg)

This website is a completly free End to End Encrypted messaging service. It will securelly transmit your messages via a system of encryption that utilises "private" and "public" keys, and RSA encrypted One-Time-Pad decryption keys. Each message has a compeltely new randomly generated One-Time-Pad key, ensuring Cypher's integrety

### User Flow Chart
1. Message Sender Logs In
2. Cypher produces a random RSA "public" and "private" key pair
3. "Private" key is storred on device, "public" key on Cypher database
4. Sender inputs message
5. Cypher produces a random One-Time-Pad style encryption of the Sender's message
6. Cypher encrypts the One-Time-Pad key using RSA
7. Cypher transmits the encrypted key and message to the Receiver
8. Reciever's Cypher account will decrypt the message using their "private" key and the Sender's "public" key
   

### Key features

- One-Time-Pad encryption for each character of each message
- New random One-Time_pad key for each sent message
- RSA assymetric style One-Time-Pad key encryption and transmission

### Technologies

I am going to use the required technologies in the following ways.

- **HTML** - Used for the basic frame of the website
- **CSS** - Used to make the website more visually appealing 
- **React** - Used to control the messy JavaScript that makes the encryption work
- **Service** - Used to store databases and "public" keys
- **DB/Login** - Used to secure users private and public keys, register accounts, and provide message access across multiple devices
- **WebSocket** - Used to communicate with the servers

### HTML Startup
This is a description of what I did in the HTML startup submission. I built three pages: a login page, a messaging page, and an about page. These pages are interlinked via the nav bar up top. The login portal is a placeholder for now. On the messages page, I installed a database placeholder on the left where past conversations are storred. I installed a websocket placeholder in the center of the page, where a current conversation would require real time communication between the website and the server. In the "about" page, I included a quick demo of the input and outputs that this website deals with, feel free to try it out! It took forever to translate the original python code into the javascript that the page runs on. 

