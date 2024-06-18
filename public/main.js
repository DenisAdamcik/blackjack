let dealerSum = 0;
let yourSum = 0;
let dealerAceCount = 0;
let yourAceCount = 0;
let deck;
let canHit = true;
let balance = 100; // Player's initial balance
let bet = 0; // Current bet amount
let maxScore = 100; // Track the maximum score achieved

window.onload = function () {
    buildDeck();
    shuffleDeck();
    updateScores();
    document.getElementById("place-bet").addEventListener("click", startGameWithBet);
    document.getElementById("hit").addEventListener("click", hit);
    document.getElementById("stay").addEventListener("click", stay);
    document.getElementById("submit-name").addEventListener("click", submitName);
    document.getElementById("player-name").disabled = true;
    document.getElementById("submit-name").disabled = true;
    
    // Fetch and display the leaderboard on page load
    fetchLeaderboard();
};

function buildDeck() {
    let values = ["A", "2", "3", "4", "5", "6", "7", "8", "9", "10", "J", "Q", "K"];
    let types = ["C", "D", "H", "S"];
    deck = [];

    for (let i = 0; i < types.length; i++) {
        for (let j = 0; j < values.length; j++) {
            deck.push(values[j] + "-" + types[i]);
        }
    }
}

function shuffleDeck() {
    for (let i = 0; i < deck.length; i++) {
        let j = Math.floor(Math.random() * deck.length);
        let temp = deck[i];
        deck[i] = deck[j];
        deck[j] = temp;
    }
}

function createCardImage(src) {
    let img = document.createElement("img");
    img.src = src;
    return img;
}

function startGame() {
    console.log("Starting game...");
    for (let i = 0; i < 2; i++) {
        let card = deck.pop();
        let cardImg = createCardImage("./cards/" + card + ".png");
        dealerSum += getValue(card);
        dealerAceCount += checkAce(card);
        document.getElementById("dealer-cards").append(cardImg);
    }

    for (let i = 0; i < 2; i++) {
        let card = deck.pop();
        let cardImg = createCardImage("./cards/" + card + ".png");
        yourSum += getValue(card);
        yourAceCount += checkAce(card);
        document.getElementById("your-cards").append(cardImg);
    }
    blackJack();
    updateScores();
}

function drawCard(target) {
    const card = deck.pop();
    const cardImg = createCardImage("./cards/" + card + ".png");
    const value = getValue(card);
    const aceCount = checkAce(card);

    if (target === "dealer-cards") {
        dealerSum += value;
        dealerAceCount += aceCount;
        reduceDealerAce();
    } else {
        yourSum += value;
        yourAceCount += aceCount;

        while (yourSum > 21 && yourAceCount > 0) {
            yourSum -= 10;
            yourAceCount -= 1;
        }
    }

    document.getElementById(target).append(cardImg);
    updateScores();
}

function hit() {
    console.log("Hit button clicked");
    if (!canHit) {
        console.log("Cannot hit anymore");
        return;
    }

    drawCard("your-cards");

    if (reduceAce(yourSum, yourAceCount) > 21) {
        canHit = false;
        stay();
    }

    updateScores();
}

function stay() {
    console.log("Stay button clicked");
    reduceDealerAce();
    canHit = false;

    while (dealerSum < 17) {
        drawCard("dealer-cards");
    }

    let message = "";
    if (yourSum > 21) {
        message = "You lose!";
        balance -= bet;
    } else if (dealerSum > 21 || yourSum > dealerSum) {
        message = "You win!";
        balance += bet;
        maxScore = Math.max(maxScore, balance); // Update maxScore if new balance is higher
    } else if (yourSum == dealerSum) {
        message = "It's a tie!";
    } else if (yourSum < dealerSum) {
        message = "You lose!";
        balance -= bet;
    }

    updateScores();
    document.getElementById("results").innerText = message;
    document.getElementById("hit").disabled = true;
    document.getElementById("stay").disabled = true;
    document.getElementById("place-bet").disabled = false;

    if (balance <= 0) {
        document.getElementById("game-over").innerText = "Game Over! No balance left.\n please enter your name to be in";
        document.getElementById("hit").disabled = true;
        document.getElementById("stay").disabled = true;
        document.getElementById("place-bet").disabled = true;
        document.getElementById("player-name").disabled = false;
        document.getElementById("submit-name").disabled = false;
    }
}

function getValue(card) {
    let data = card.split("-");
    let value = data[0];

    if (isNaN(value)) {
        if (value == "A") {
            return 11;
        }
        return 10;
    }
    return parseInt(value);
}

function checkAce(card) {
    if (card[0] == "A") {
        return 1;
    }
    return 0;
}

function reduceAce(playerSum, aceCount) {
    while (playerSum > 21 && aceCount > 0) {
        playerSum -= 10;
        aceCount -= 1;
    }
    return playerSum;
}

function reduceDealerAce() {
    while (dealerSum > 21 && dealerAceCount > 0) {
        dealerSum -= 10;
        dealerAceCount -= 1;
    }
}

function updateScores() {
    document.getElementById("dealer-sum").innerText = dealerSum;
    document.getElementById("your-sum").innerText = yourSum;
    document.getElementById("balance").innerText = balance;
}

function blackJack() {
    if (yourSum === 21) {
        document.getElementById("blackjack").innerText = "BLACKJACK!";
        document.getElementById("hit").disabled = true;
        document.getElementById("stay").disabled = true;
        document.getElementById("place-bet").disabled = false;
        balance += bet;
        maxScore = Math.max(maxScore, balance);
    }
}

function submitName() {
    // Retrieve player's name from input and trim any extra whitespace
    const playerName = document.getElementById("player-name").value.trim();
    
    // Check if the player name is empty
    if (!playerName) {
        alert("Please enter your name.");
        return;
    }

    // Send player's name, balance, and max score to the server
    fetch("/save-score", {
        method: "POST",
        headers: {
            "Content-Type": "application/json"
        },
        body: JSON.stringify({ playerName, balance, maxScore })
    })
    .then(response => {
        // Check if the response is not ok, throw an error
        if (!response.ok) {
            throw new Error("Failed to save score.");
        }
        return response.json();
    })
    .then(() => {
        // Notify the user that the score was saved successfully and fetch the updated leaderboard
        alert("Score saved successfully!");
        fetchLeaderboard();
    })
    .catch(error => {
        // Log the error and notify the user
        console.error("Error saving score:", error);
        alert("Error saving score. Please try again.");
    });
}

function startGameWithBet() {
    // Retrieve bet amount from input and convert it to an integer
    bet = parseInt(document.getElementById("bet-amount").value);
    
    // Validate the bet amount
    if (isNaN(bet) || bet <= 0) {
        alert("Please enter a valid bet amount.");
        return;
    }
    if (bet > balance) {
        alert("Insufficient balance.");
        return;
    }

    // Reset game state variables
    dealerSum = 0;
    yourSum = 0;
    dealerAceCount = 0;
    yourAceCount = 0;
    deck = [];
    buildDeck(); // Build a new deck of cards
    shuffleDeck(); // Shuffle the deck
    document.getElementById("dealer-cards").innerHTML = ""; // Clear dealer's cards display
    document.getElementById("your-cards").innerHTML = ""; // Clear player's cards display
    document.getElementById("results").innerText = ""; // Clear results display
    document.getElementById("blackjack").innerText = ""; // Clear blackjack display
    document.getElementById("game-over").innerText = ""; // Clear game-over display
    canHit = true; // Allow hitting

    // Disable bet button and enable game buttons
    document.getElementById("place-bet").disabled = true;
    document.getElementById("hit").disabled = false;
    document.getElementById("stay").disabled = false;

    // Start the game
    startGame();
}

function fetchLeaderboard() {
    // Fetch leaderboard data from the server
    fetch("/scoreboard.json")
        .then(response => response.json())
        .then(data => {
            // Sort the data by maxScore in descending order
            const sortedData = data.sort((a, b) => b.maxScore - a.maxScore);
            // Update the leaderboard display with the sorted data
            updateLeaderboard(sortedData);
        })
        .catch(error => {

            console.error("Error fetching leaderboard:", error);
        });
}

function updateLeaderboard(sortedData) {
    // Get the leaderboard element
    const leaderboard = document.getElementById("leaderboard");
    // Clear the existing leaderboard
    leaderboard.innerHTML = ""; 

    sortedData.forEach((entry, index) => {
        const listItem = document.createElement("li");
        listItem.textContent = `${index + 1}. ${entry.playerName} - ${entry.maxScore}`;
        leaderboard.appendChild(listItem);
    });
}

