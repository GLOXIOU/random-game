# 🎮 Random Game

**Struggling to choose a game to play with your friends every night?**  
Stop arguing, stop scrolling — let the randomness decide for you.

**Random Game** is a simple tool that takes multiple Steam accounts, finds the games you all have in common (even across other platforms), and randomly picks one so you can just play together.

---

## ✨ Features

* 🔍 Compare multiple Steam accounts, and other platforms
* 🤝 Find games everyone owns in common
* ➕ Add games from other platforms manually
* 🎲 Pick a **random game** from the common list
* ⚡ Quick setup, minimal configuration

---

## 📦 Installation

1. Clone the repository:

   ```bash
   git clone https://github.com/GLOXIOU/random-game.git
   cd random-game
   ```

2. Create a .env file:

    ```bash
    STEAM_API_KEY=your_steam_api_key_here
    ```

2. Install dependencies:

    ```bash
    npm install
    ```

4. Start the project:

    ```bash
    npm start
    ```

---

## 🕹️ How It Works
 - You provide multiple username
 - The app fetches owned games using APIS
 - It calculates the intersection (games everyone owns)
 - You can manually add games from other platforms
 - One random game is selected for everyone to play together 🎉

---

## 🌍 Platform Support
 - Steam (automatic)
 - Other platforms (manual add)
 - Other platforms (automatic) --> Coming soon

---

## 🧾 License
© GLOXIOU