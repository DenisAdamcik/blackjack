const express = require('express');
const fs = require('fs').promises;
const app = express();
const port = 3000;

app.use(express.json());
app.use(express.static('public'));

app.get('/', (req, res) => {
    res.sendFile(__dirname + '/public/index.html');
});

app.get('/scoreboard.json', async (req, res) => {
    try {
        const scoreboardData = await fs.readFile(__dirname + '/public/scoreboard.json', 'utf8');
        const parsedData = JSON.parse(scoreboardData);
        res.json(parsedData);
    } catch (error) {
        console.error('Error fetching scoreboard:', error);
        res.status(500).json({ error: 'Internal Server Error' });
    }
});

app.post('/save-score', async (req, res) => {
    // Destrukturuje požadované údaje z těla požadavku
    const { playerName, balance, maxScore } = req.body;

    // Ověří, zda jsou všechna potřebná data v požadavku přítomna
    if (!playerName || balance == null || maxScore == null) {
        return res.status(400).json({ error: 'Invalid request data' });
    }

    try {
        // Definuje cestu k souboru scoreboard.json
        const scoreboardFilePath = __dirname + '/public/scoreboard.json';

        // Čte obsah scoreboard.json a převádí jej do JavaScript objektu
        const data = await fs.readFile(scoreboardFilePath, 'utf8');
        const scoreboard = JSON.parse(data);

        // Přidává nové skóre do scoreboardu
        scoreboard.push({ playerName, balance, maxScore });

        // Zapisuje aktualizovaný scoreboard zpět do scoreboard.json
        await fs.writeFile(scoreboardFilePath, JSON.stringify(scoreboard, null, 2));

        // Odesílá úspěšnou odpověď
        res.status(200).json({ message: 'Score saved successfully' });
    } catch (error) {
        // Zachycuje chyby
        console.error('Error saving score:', error);
        res.status(500).json({ error: 'Internal Server Error' });
    }
});


app.listen(port, () => {
    console.log(`Server running at http://localhost:${port}`);
});
