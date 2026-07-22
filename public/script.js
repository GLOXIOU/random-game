let users = [];
let commonGames = [];
let hasStarted = false;

const mainWrapper = document.getElementById('mainWrapper');
const actionSection = document.getElementById('actionSection');
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
const themeToggle = document.getElementById('themeToggle');
const modalIcon = document.querySelector('.icon-box i');

themeToggle.addEventListener('click', () => {
    const isDark = document.body.getAttribute('data-theme') === 'dark';
    document.body.setAttribute('data-theme', isDark ? 'light' : 'dark');
    themeToggle.innerHTML = isDark ? '<i class="fa-solid fa-moon"></i>' : '<i class="fa-solid fa-sun"></i>';
});

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

        if (!hasStarted) {
            hasStarted = true;
            mainWrapper.classList.add('active');
            actionSection.classList.remove('hidden-action');
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
    
    if (users.length === 0) {
        hasStarted = false;
        mainWrapper.classList.remove('active');
        actionSection.classList.add('hidden-action');
    }
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
        
        card.innerHTML = `
            <img src="${user.avatar}" class="user-avatar" alt="avatar">
            <div class="user-info">
                <div class="user-name">${user.name}</div>
                <div class="user-game-count">${user.games.length} jeux</div>
            </div>
            <button class="btn-remove-user" onclick="removeUser(${user.id})"><i class="fa-solid fa-xmark"></i></button>
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
            
            const textNode = document.createElement('span');
            textNode.textContent = game;

            const removeBtn = document.createElement('button');
            removeBtn.className = 'btn-remove-common';
            removeBtn.innerHTML = '<i class="fa-solid fa-xmark"></i>';
            removeBtn.onclick = () => removeCommonGame(game);

            chip.appendChild(textNode);
            chip.appendChild(removeBtn);

            commonGamesList.appendChild(chip);
        });
    } else {
        randomizeBtn.disabled = true;
        commonGamesList.innerHTML = '<div class="empty-state">Ajoutez des joueurs pour voir les jeux en commun...</div>';
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
    resultModal.style.display = 'flex';
    document.body.style.overflow = 'hidden';
    winnerText.classList.remove('winner-pop');
    randomizeBtn.disabled = true;
    
    modalIcon.className = 'fa-solid fa-crosshairs fa-spin';
    modalIcon.style.color = 'var(--text-muted)';

    const winner = commonGames[Math.floor(Math.random() * commonGames.length)];
    const duration = 2500;
    const intervalTime = 60;
    let elapsed = 0;

    const shuffle = setInterval(() => {
        winnerText.textContent = commonGames[Math.floor(Math.random() * commonGames.length)];
        elapsed += intervalTime;
        
        if (elapsed >= duration) {
            clearInterval(shuffle);
            winnerText.textContent = winner;
            winnerText.classList.add('winner-pop');
            modalIcon.className = 'fa-solid fa-trophy';
            modalIcon.style.color = 'var(--primary-green)';
            randomizeBtn.disabled = false;
        }
    }, intervalTime);
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
    if (e.target == resultModal && !randomizeBtn.disabled) {
        resultModal.style.display = "none";
        document.body.style.overflow = '';
    }
    if (e.target == errorModal) {
        errorModal.style.display = "none";
        document.body.style.overflow = '';
    }
};