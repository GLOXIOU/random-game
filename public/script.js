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
const currentPlatform = document.getElementById('currentPlatform');
const platformMenu = document.getElementById('platformMenu');
const errorModal = document.getElementById('errorModal');
const closeErrorModal = document.getElementById('closeErrorModal');

currentPlatform.addEventListener('click', (e) => {
    e.stopPropagation();
    platformMenu.classList.toggle('show');
});

document.addEventListener('click', (e) => {
    if (!platformMenu.contains(e.target) && !currentPlatform.contains(e.target)) {
        platformMenu.classList.remove('show');
    }
});

addUserBtn.addEventListener('click', () => {
    const username = usernameInput.value.trim();
    if (username) {
        addUser(username);
    }
});

usernameInput.addEventListener('keypress', (e) => {
    if (e.key === 'Enter') addUserBtn.click();
});

async function addUser(username) {
    if (users.some(u => u.originalInput.toLowerCase() === username.toLowerCase())) {
        return;
    }

    addUserBtn.disabled = true;
    usernameInput.disabled = true;
    const originalBtnHtml = addUserBtn.innerHTML;
    addUserBtn.innerHTML = '<i class="fa-solid fa-circle-notch fa-spin"></i>';

    try {
        const response = await fetch(`/api/games/${encodeURIComponent(username)}`);
        const data = await response.json();

        if (!response.ok) {
            throw new Error(data.error);
        }

        const userAvatar = data.avatar || `https://api.dicebear.com/7.x/pixel-art/svg?seed=${data.username}`;

        users.push({
            id: Date.now(),
            originalInput: username,
            name: data.username,
            games: data.games.map(g => g.name),
            avatar: userAvatar
        });

        usernameInput.value = '';
        renderUsers();
        updateCommonGames();
    } catch (err) {
        errorModal.style.display = 'flex';
        document.body.style.overflow = 'hidden';
    } finally {
        addUserBtn.disabled = false;
        usernameInput.disabled = false;
        addUserBtn.innerHTML = originalBtnHtml;
        usernameInput.focus();
    }
}

window.removeUser = function(id) {
    users = users.filter(u => u.id !== id);
    renderUsers();
    updateCommonGames();
}

window.removeCommonGame = function(gameToRemove) {
    commonGames = commonGames.filter(game => game !== gameToRemove);
    renderCommonGames();
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
            
            const icon = document.createElement('i');
            icon.className = 'fa-solid fa-gamepad';
            
            const textNode = document.createTextNode(' ' + game + ' ');

            const removeBtn = document.createElement('button');
            removeBtn.className = 'btn-remove-common';
            removeBtn.innerHTML = '<i class="fa-solid fa-xmark"></i>';
            removeBtn.onclick = () => removeCommonGame(game);

            chip.appendChild(icon);
            chip.appendChild(textNode);
            chip.appendChild(removeBtn);

            commonGamesList.appendChild(chip);
        });
    } else {
        randomizeBtn.disabled = true;
        commonGamesList.innerHTML = '<div class="empty-state">No common games...</div>';
    }
}

addManualGameBtn.addEventListener('click', () => {
    const manualGame = prompt("Name of the game to add:");
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
        document.body.style.overflow = 'hidden';
        
        const confettis = document.querySelectorAll('.confetti');
        confettis.forEach(c => {
            c.style.animation = 'none';
            c.offsetHeight;
            c.style.animation = 'fall 2.5s linear forwards';
        });

        randomizeBtn.disabled = false;
        randomizeBtn.innerHTML = '<i class="fa-solid fa-dice"></i> FIND A GAME';
    }, 1000);
});

closeModal.addEventListener('click', () => {
    resultModal.style.display = 'none';
    document.body.style.overflow = '';
});

closeErrorModal.addEventListener('click', () => {
    errorModal.style.display = 'none';
    document.body.style.overflow = '';
});

window.onclick = (e) => { 
    if (e.target == resultModal) {
        resultModal.style.display = "none";
        document.body.style.overflow = '';
    }
    if (e.target == errorModal) {
        errorModal.style.display = "none";
        document.body.style.overflow = '';
    }
};