const possibleGames = [
    "Counter-Strike 2", "Elden Ring", "Cyberpunk 2077", "Among Us", 
    "Minecraft", "Rocket League", "GTA V", "Valheim", "Terraria", 
    "Apex Legends", "Stardew Valley", "Baldur's Gate 3", "Left 4 Dead 2",
    "Rust", "Helldivers 2", "Overwatch 2", "Phasmophobia", "The Forest"
];

let users = [];
let commonGames = [];

const usernameInput = document.getElementById('usernameInput');
const addUserBtn = document.getElementById('addUserBtn');
const usersContainer = document.getElementById('usersContainer');
const commonGamesList = document.getElementById('commonGamesList');
const commonCount = document.getElementById('commonCount');
const addManualGameBtn = document.getElementById('addManualGameBtn');
const randomizeBtn = document.getElementById('randomizeBtn');
const resultModal = document.getElementById('resultModal');
const winnerText = document.getElementById('winnerText');
const closeModal = document.getElementById('closeModal');

addUserBtn.addEventListener('click', () => {
    const username = usernameInput.value.trim();
    if (username) {
        addUser(username);
        usernameInput.value = '';
        usernameInput.focus();
    }
});

usernameInput.addEventListener('keypress', (e) => {
    if (e.key === 'Enter') addUserBtn.click();
});

function addUser(username) {
    const id = Date.now();
    const userGames = generateRandomGames();
    const userAvatar = `https://api.dicebear.com/7.x/pixel-art/svg?seed=${username}`;
    
    users.push({
        id: id,
        name: username,
        games: userGames,
        avatar: userAvatar
    });

    renderUsers();
    updateCommonGames();
}

window.removeUser = function(id) {
    users = users.filter(u => u.id !== id);
    renderUsers();
    updateCommonGames();
}

function generateRandomGames() {
    const shuffled = [...possibleGames].sort(() => 0.5 - Math.random());
    const count = Math.floor(Math.random() * 6) + 5; 
    const baseCommon = ["Minecraft", "Counter-Strike 2"];
    return Array.from(new Set([...baseCommon, ...shuffled.slice(0, count)]));
}

function renderUsers() {
    usersContainer.innerHTML = '';
    users.forEach(user => {
        const card = document.createElement('div');
        card.className = 'user-card';
        
        let gamesHtml = user.games.slice(0, 5).map(game => `<span class="game-tag">${game}</span>`).join('');
        if(user.games.length > 5) gamesHtml += `<span class="game-tag">+${user.games.length - 5}</span>`;

        card.innerHTML = `
            <button class="btn-remove-user" onclick="removeUser(${user.id})"><i class="fa-solid fa-xmark"></i></button>
            <div class="user-header">
                <img src="${user.avatar}" class="user-avatar" alt="avatar">
                <div class="user-name">${user.name}</div>
            </div>
            <div class="user-games-list">${gamesHtml}</div>
        `;
        usersContainer.appendChild(card);
    });
}

function updateCommonGames() {
    if (users.length === 0) {
        commonGames = [];
    } else {
        commonGames = users[0].games;
        for (let i = 1; i < users.length; i++) {
            commonGames = commonGames.filter(game => users[i].games.includes(game));
        }
    }
    renderCommonGames();
}

function renderCommonGames() {
    commonGamesList.innerHTML = '';
    commonCount.textContent = commonGames.length;

    if (commonGames.length > 0) {
        randomizeBtn.disabled = false;
        commonGames.forEach(game => {
            const chip = document.createElement('div');
            chip.className = 'common-game-chip';
            chip.innerHTML = `<i class="fa-solid fa-gamepad"></i> ${game}`;
            commonGamesList.appendChild(chip);
        });
    } else {
        randomizeBtn.disabled = true;
        commonGamesList.innerHTML = '<div class="empty-state">Aucun jeu en commun...</div>';
    }
}

addManualGameBtn.addEventListener('click', () => {
    const manualGame = prompt("Nom du jeu à ajouter :");
    if (manualGame) {
        if (!commonGames.includes(manualGame)) {
            commonGames.push(manualGame);
            renderCommonGames();
            randomizeBtn.disabled = false;
        }
    }
});

randomizeBtn.addEventListener('click', () => {
    randomizeBtn.disabled = true;
    randomizeBtn.innerHTML = '<i class="fa-solid fa-circle-notch fa-spin"></i>';

    setTimeout(() => {
        const winner = commonGames[Math.floor(Math.random() * commonGames.length)];
        winnerText.textContent = winner;
        resultModal.style.display = 'flex';
        
        const confettis = document.querySelectorAll('.confetti');
        confettis.forEach(c => {
            c.style.animation = 'none';
            c.offsetHeight;
            c.style.animation = 'fall 2.5s linear forwards';
        });

        randomizeBtn.disabled = false;
        randomizeBtn.innerHTML = '<i class="fa-solid fa-dice"></i> TROUVER UN JEU';
    }, 1000);
});

closeModal.addEventListener('click', () => resultModal.style.display = 'none');
window.onclick = (e) => { if (e.target == resultModal) resultModal.style.display = "none"; };