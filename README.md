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
This is a description of what I did in the HTML startup submission. I built three pages: a login page, a messaging page, and an about page. These pages are interlinked via the nav bar up top. The login portal is a placeholder for now. On the messages page, I installed a database placeholder on the left where past conversations are storred. I installed a websocket placeholder in the center of the page, where a current conversation would require real time communication between the website and the server. In the "about" page, I included a quick demo of the input and outputs that this website deals with, feel free to try it out! It took forever to translate the original python code into the javascript that the page runs on. This website will involve thrid party service by saving public keys on the server, while a person's private key will also be encrypted and storred behind a firewall. 

### CSS Startup
This is a description of what I did in the CSS startup submission. I installed and used Bootstrap to make a navigation bar, and to dynamicly respond to the webpage being resized. I used CSS elements to isolate and style the login box, message sidebar, chat area, and cypher demo sections of the pages. I deployed simon css to https://simon.cypherw.click. I used a simple animation to change the colors of buttons when hovered over. I installed a short paragraph that details how the "about" page works, and some blank placeholder messages in the message section. 

### REACT Startup
Holy cow this one was rough. I broke everything appart into the various .jsx files, consolidated the .css files, and made the proper file directory to make it all work. I incooperated enough javascript to make the "message" and "about" pages work, which required me to import and link several .js and .jsx files. You can now type a message into any of the conversations and view it in plain text. When hovered over, the message will display the cypher text. I added a "lock" button that will turn all plain text on screen into cypher text, just in case your screen was being viewed remotely. Inputing the password "royer" will unlock the screen and display plain text. The "about" page has the javascript that will allow it to demonstrate the hybrid encryption process like it did on previous startup deliverables. Everything is built and wrapped in vite, including a react router that enables the website to work. I was able to demo and edit the webpage using the router on my localhost page. I also deployed "simon react p1" to the "simon" subdomain of cypherw.click. 

### REACT Part Dos
This one was a little better. I changed the login page to work properly using useState and useEffect. Now the other pages are only unlocked when the user enters a username and password. The user's name is stored in localstorage and displayed. I added a logout button. Any message is stored, so they will be available when the user logs back in. I already had to use a lot of these effects on the message page, so that one was pretty well taken care of. I also added the updated react components to the simon subdomain of cypherw.click. Pretty much all aspects of this website have a dummy, once we get the databases going this will actually begin to be functional. 

### STARTUP
This one really made the website start to feel like a working project rather than a few pages of code. The server is very important to a website based on messaging. This website has a few unique properties that deal with the server and communication. For instance, the server can never see the plain text of any message. This would open the door to hacking. Public keys can be stored on the server, as well as usernames on a secure database. Private keys however would ideally be stored on the user's personal device. Because that is not always an available option, the user will be given the option in the future to store them on the secure server. I deployed the Sinom-Startup to the simon subdomain of cypherw.click. I also used a random word generator api on the login page as a placeholder for the future. I installed express and loaded all pages through port 4000. I edited the navigation bar to display the github link prior to loging in, with the other pages unlocking afterwards. 

### DATABASE
This section was super important for this website to work well. I made it so that outgoing and incoming messages are storred securely on the database. I installed a section of code that will allow user authentication and creation. I also added a part that will allow public and private keys to be storred securely. I deployed the simon-db website to the "simon" subdomain of cypherw.click. With the addition of websocket next week, this will finally be a fully operational website. 

### WEBSOCKET
This is the final edit of the website before it is fully live and running. After I finished this section, I set up an account and gave the link to a friend of mine. I think that the next step would be to enable image and video support. I wonder how those could be properly encrypted to maintain the standard of the rest of the website. To complete this deliverable, I deployed Simon Websocket to the Simon subdomain of cypherw.click. I enable websocket requests on the backend, and connected it on the front end. I also configured the vite.config.js file to allow debugging during websocket requests. With this, the webiste is functional. But I think there is a long way to go before it has an easy user interface. 

