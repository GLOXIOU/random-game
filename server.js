require('dotenv').config();
const express = require('express');
const path = require('path');
const app = express();

app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(express.static(path.join(__dirname, 'public')));

const STEAM_API_KEY = process.env.STEAM_API_KEY;

async function resolveSteamId(input) {
    if (/^\d{17}$/.test(input)) {
        return input;
    }
    const url = `https://api.steampowered.com/ISteamUser/ResolveVanityURL/v1/?key=${STEAM_API_KEY}&vanityurl=${encodeURIComponent(input)}`;
    const response = await fetch(url);
    const data = await response.json();
    if (data.response && data.response.success === 1) {
        return data.response.steamid;
    }
    return null;
}

app.get('/api/games/:username', async (req, res) => {
    const { username } = req.params;
    if (!STEAM_API_KEY) {
        return res.status(500).json({ error: 'Server is missing the STEAM_API_KEY environment variable.' });
    }
    try {
        const steamId = await resolveSteamId(username);
        if (!steamId) {
            return res.status(404).json({ error: `Aucun profil Steam trouvé pour "${username}".` });
        }
        const summaryUrl = `https://api.steampowered.com/ISteamUser/GetPlayerSummaries/v0002/?key=${STEAM_API_KEY}&steamids=${steamId}`;
        const summaryResponse = await fetch(summaryUrl);
        const summaryData = await summaryResponse.json();
        
        const playerInfo = summaryData.response.players[0] || {};
        const personaName = playerInfo.personaname || steamId;
        const avatar = playerInfo.avatarfull || null;

        const gamesUrl = `https://api.steampowered.com/IPlayerService/GetOwnedGames/v1/?key=${STEAM_API_KEY}&steamid=${steamId}&include_appinfo=1&include_played_free_games=1`;
        const gamesResponse = await fetch(gamesUrl);
        const gamesData = await gamesResponse.json();

        if (!gamesData.response || gamesData.response.game_count === undefined) {
            return res.status(403).json({ error: 'Ce profil Steam est privé. La bibliothèque de jeux doit être publique pour être comparée.' });
        }

        const games = (gamesData.response.games || []).map(game => ({
            appid: game.appid,
            name: game.name,
            playtime_forever: game.playtime_forever,
            icon: game.img_icon_url
                ? `https://media.steampowered.com/steamcommunity/public/images/apps/${game.appid}/${game.img_icon_url}.jpg`
                : null
        }));

        res.json({
            steamId,
            username: personaName,
            avatar: avatar,
            gameCount: games.length,
            games
        });
    } catch (err) {
        res.status(500).json({ error: 'Échec de la récupération des données Steam.' });
    }
});

app.get('/api/game-details/:appid', async (req, res) => {
    try {
        const response = await fetch(`https://store.steampowered.com/api/appdetails?appids=${req.params.appid}`);
        const data = await response.json();
        res.json(data);
    } catch (err) {
        res.status(500).json({ error: 'Échec de la récupération des détails du jeu.' });
    }
});

app.use((err, req, res, next) => {
    res.status(500).send('Something broke!');
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {});