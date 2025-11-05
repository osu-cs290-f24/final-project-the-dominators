# 🎨 Depiction  
*A drawing game inspired by Telestrations and Gartic Phone*  

[![Live Demo](https://img.shields.io/badge/Live%20Demo-Depiction-blue?style=for-the-badge)](https://final-project-the-dominators-15fd22a7dbf1.herokuapp.com/)
[![GitHub Repo](https://img.shields.io/badge/GitHub-Repository-black?style=for-the-badge&logo=github)](https://github.com/osu-cs290-f24/final-project-the-dominators)
![Node.js](https://img.shields.io/badge/Node.js-18+-brightgreen?style=for-the-badge&logo=node.js)
![Socket.io](https://img.shields.io/badge/Socket.IO-Real--Time%20Multiplayer-blueviolet?style=for-the-badge)
![License: ISC](https://img.shields.io/badge/License-ISC-yellow?style=for-the-badge)

---

## 🕹️ Overview  
**Depiction** is a drawing game based on *Telestrations* and *Gartic Phone* that combines elements of *Telephone* and *Pictionary*. Players alternate between writing and drawing prompts, passing them around like a game of Telephone. At the end, everyone gets to see the chain of interpretations that evolved from the original idea.

> This project was developed as part of **CS 290 – Web Development** at **Oregon State University**.

---

## 👩‍💻 Team  
| Name | Role |
|------|------|
| **Ethan Harter** | Developer |
| **Sam Wilard** | Developer |
| **Rose Farrens** | Developer |

---

## 🧩 Game Flow  
1. **Join the Game** – Enter your name and join the lobby.  
2. **Ready Up** – Once everyone is ready, the host can start the game.  
3. **Prompt Round** – Each player writes a short prompt.  
4. **Drawing Round** – Players receive another player’s prompt and draw it.  
5. **Guessing Round** – Players interpret and guess others’ drawings.  
6. **Results** – At the end, everyone can review the full chain of prompts and drawings for each player.  

---

## ⚙️ Tech Stack  
- 🟢 **Node.js** – Backend runtime environment  
- ⚡ **Express** – Web server framework  
- 🧱 **Handlebars** – Dynamic HTML templating  
- 🔁 **Socket.IO** – Real-time communication for multiplayer gameplay  

---

## 🚀 Setup Instructions  

### Prerequisites  
Make sure you have **Node.js (v18 or later)** installed.

### Installation  
```bash
git clone https://github.com/osu-cs290-f24/final-project-the-dominators.git
cd final-project-the-dominators
npm install
```

### Run Locally
``bash
npm start
``

## 🧠 How It Works  
- The server uses **Express** to serve pages and handle routes.  
- **Socket.IO** synchronizes player actions and game state in real time.  
- **Handlebars** dynamically renders the UI for each stage of the game.  
- Game data (players, prompts, drawings) is stored in memory during gameplay.  

---

## 📜 License  
This project is licensed under the [ISC License](LICENSE).
