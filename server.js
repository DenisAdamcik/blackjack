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
    const { playerName, balance, maxScore } = req.body;
    if (!playerName || balance == null || maxScore == null) {
        return res.status(400).json({ error: 'Invalid request data' });
    }
    try {
        const scoreboardFilePath = __dirname + '/public/scoreboard.json';
        const data = await fs.readFile(scoreboardFilePath, 'utf8');
        const scoreboard = JSON.parse(data);
        scoreboard.push({ playerName, balance, maxScore });
        await fs.writeFile(scoreboardFilePath, JSON.stringify(scoreboard, null, 2));
        res.status(200).json({ message: 'Score saved successfully' });
    } catch (error) {
        console.error('Error saving score:', error);
        res.status(500).json({ error: 'Internal Server Error' });
    }
});


app.listen(port, () => {
    console.log(`Server running at http://localhost:${port}`);
});
