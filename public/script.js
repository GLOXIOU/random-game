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
const multiWarningContainer = document.getElementById('multiWarningContainer');
const gameExtraInfo = document.getElementById('gameExtraInfo');
const rerollBtn = document.getElementById('rerollBtn');

const infoType = document.getElementById('infoType');
const infoDeveloper = document.getElementById('infoDeveloper');
const infoPublisher = document.getElementById('infoPublisher');
const infoRelease = document.getElementById('infoRelease');
const infoPrice = document.getElementById('infoPrice');
const infoGenres = document.getElementById('infoGenres');
const infoCategories = document.getElementById('infoCategories');
const infoMetacritic = document.getElementById('infoMetacritic');
const infoPlatforms = document.getElementById('infoPlatforms');
const infoController = document.getElementById('infoController');

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
            games: data.games,
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

window.removeCommonGame = function(gameId) {
    commonGames = commonGames.filter(game => game.appid !== gameId);
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
                <div class="user-game-count">${user.games.length} games</div>
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
            const userGameIds = new Set(users[i].games.map(g => g.appid));
            commonGames = commonGames.filter(game => userGameIds.has(game.appid));
        }
    }
    renderCommonGames();
}

async function fetchGameDetails(appid) {
    if (sessionStorage.getItem(`game_${appid}`)) {
        return JSON.parse(sessionStorage.getItem(`game_${appid}`));
    }
    try {
        const res = await fetch(`/api/game-details/${appid}`);
        const data = await res.json();
        if (data && data[appid] && data[appid].success) {
            sessionStorage.setItem(`game_${appid}`, JSON.stringify(data[appid].data));
            return data[appid].data;
        }
    } catch (e) {}
    return null;
}

function renderCommonGames() {
    commonGamesList.innerHTML = '';
    commonCount.textContent = commonGames.length;

    if (commonGames.length > 0) {
        randomizeBtn.disabled = false;
        commonGames.forEach(game => {
            const chip = document.createElement('div');
            chip.className = 'common-game-chip';
            chip.dataset.appid = game.appid;

            const textNode = document.createElement('span');
            textNode.textContent = game.name;

            const removeBtn = document.createElement('button');
            removeBtn.className = 'btn-remove-common';
            removeBtn.innerHTML = '<i class="fa-solid fa-xmark"></i>';
            removeBtn.onclick = () => removeCommonGame(game.appid);

            chip.appendChild(textNode);
            chip.appendChild(removeBtn);

            commonGamesList.appendChild(chip);
        });
    } else {
        randomizeBtn.disabled = true;
        commonGamesList.innerHTML = '<div class="empty-state">Add players to see common games...</div>';
    }
}

addManualGameBtn.addEventListener('click', () => {
    const manualGameName = prompt("Nom du jeu externe à ajouter :");
    if (manualGameName) {
        const manualGame = { appid: 'custom_' + Date.now(), name: manualGameName, isCustom: true };
        if (!commonGames.some(g => g.name.toLowerCase() === manualGameName.toLowerCase())) {
            commonGames.push(manualGame);
            renderCommonGames();
            randomizeBtn.disabled = false;
        }
    }
});

async function triggerRandomization() {
    resultModal.style.display = 'flex';
    document.body.style.overflow = 'hidden';
    winnerText.classList.remove('winner-pop');
    randomizeBtn.disabled = true;
    multiWarningContainer.style.display = 'none';
    gameExtraInfo.style.display = 'none';
    rerollBtn.style.display = 'none';
    
    modalIcon.className = 'fa-solid fa-crosshairs fa-spin';
    modalIcon.style.color = 'var(--text-muted)';

    const winnerGame = commonGames[Math.floor(Math.random() * commonGames.length)];
    const duration = 2500;
    const intervalTime = 60;
    let elapsed = 0;

    const shuffle = setInterval(async () => {
        const randomTempGame = commonGames[Math.floor(Math.random() * commonGames.length)];
        winnerText.textContent = randomTempGame.name;
        elapsed += intervalTime;
        
        if (elapsed >= duration) {
            clearInterval(shuffle);
            winnerText.textContent = winnerGame.name;
            winnerText.classList.add('winner-pop');
            modalIcon.className = 'fa-solid fa-trophy';
            modalIcon.style.color = 'var(--primary-green)';
            randomizeBtn.disabled = false;

            if (winnerGame.isCustom) {
                modalIcon.className = 'fa-solid fa-gamepad';
                modalIcon.style.color = 'var(--text-main)';
                infoType.textContent = 'Jeu personnalisé externe';
                infoDeveloper.textContent = 'N/A';
                infoPublisher.textContent = 'N/A';
                infoRelease.textContent = 'N/A';
                infoPrice.textContent = 'N/A';
                infoGenres.textContent = 'N/A';
                infoCategories.textContent = 'N/A';
                infoMetacritic.textContent = 'N/A';
                infoPlatforms.textContent = 'N/A';
                infoController.textContent = 'N/A';
                gameExtraInfo.style.display = 'block';
            } else {
                try {
                    const data = await fetchGameDetails(winnerGame.appid);

                    if (data) {
                        infoType.textContent = data.type || 'N/A';
                        infoDeveloper.textContent = data.developers ? data.developers.join(', ') : 'N/A';
                        infoPublisher.textContent = data.publishers ? data.publishers.join(', ') : 'N/A';
                        infoRelease.textContent = data.release_date ? data.release_date.date : 'N/A';
                        infoPrice.textContent = data.is_free ? 'Gratuit' : (data.price_overview ? data.price_overview.final_formatted : 'N/A');
                        infoGenres.textContent = data.genres ? data.genres.map(g => g.description).join(', ') : 'N/A';
                        
                        const categories = data.categories ? data.categories.map(c => c.description) : [];
                        infoCategories.textContent = categories.length > 0 ? categories.join(', ') : 'N/A';
                        
                        infoMetacritic.textContent = data.metacritic ? data.metacritic.score : 'N/A';
                        
                        const platformsObj = data.platforms;
                        let plats = [];
                        if(platformsObj) {
                            if(platformsObj.windows) plats.push('Windows');
                            if(platformsObj.mac) plats.push('Mac');
                            if(platformsObj.linux) plats.push('Linux');
                        }
                        infoPlatforms.textContent = plats.length > 0 ? plats.join(', ') : 'N/A';
                        
                        infoController.textContent = data.controller_support ? data.controller_support : 'Non spécifié';

                        gameExtraInfo.style.display = 'block';

                        const isMultiplayer = categories.some(cat => 
                            cat.toLowerCase().includes('multi') || 
                            cat.toLowerCase().includes('co-op') || 
                            cat.toLowerCase().includes('pvp') ||
                            cat.toLowerCase().includes('online')
                        );

                        if (!isMultiplayer) {
                            multiWarningContainer.style.display = 'block';
                            rerollBtn.style.display = 'inline-block';
                        }
                    } else {
                        infoType.textContent = 'Données non disponibles';
                        gameExtraInfo.style.display = 'block';
                    }
                } catch (e) {
                    console.error(e);
                }
            }
        }
    }, intervalTime);
}

randomizeBtn.addEventListener('click', triggerRandomization);
rerollBtn.addEventListener('click', triggerRandomization);

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