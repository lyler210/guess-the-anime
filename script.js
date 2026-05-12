let playerName = "";
let currentAnime = null;
let animeNameList = [];
let animePool = [];
let score = 0;
let lives = 3;
let timeLeft = 10;
let timerInterval = null;
let loadAnimeTimeout = null;
let animeSeen = [];
let gameActive = false;
let countdown = 3;
let countdownInterval = null;

const startScreen = document.getElementById("start-screen");
const gameScreen = document.getElementById("game-screen");
const gameOverScreen = document.getElementById("game-over-screen");
const countdownScreen = document.getElementById("countdown-screen");

const nameInput = document.getElementById("name-input");
const startButton = document.getElementById("start-button");
const animeImage = document.getElementById("anime-image");
const feedback = document.getElementById("feedback");
const choices = document.getElementById("choices");
const finalScore = document.getElementById("final-score");
const finalName = document.getElementById("final-name");
const playAgainButton = document.getElementById("play-again-button");

const playerNameDisplay = document.getElementById("player-name");
const scoreDisplay = document.getElementById("score-display");
const livesDisplay = document.getElementById("lives-display");
const timerDisplay = document.getElementById("timer-display");
const leaderboardList = document.getElementById("leaderboard-list");
const countdownDisplay = document.getElementById("countdown-display");

startButton.addEventListener("click", () => {
    gameActive = true;
    playerName = nameInput.value.trim();

    if(playerName === "") {
        alert("Please enter your name!");
        return;
    }

    // hiding start screen and showing game screen
    startScreen.classList.add("hidden");
    startCountdown();
});

function startCountdown() {
    countdownScreen.classList.remove("hidden");
    gameScreen.classList.add("hidden");
    countdown = 3;
    countdownDisplay.textContent = "Ready!";
    fetchAnimeList();
    
    countdownInterval = setInterval(() => {
        countdown--;
        if(countdown === 2) {
            countdownDisplay.textContent = "Set!";
        } else if(countdown === 1) {
            countdownDisplay.textContent = "Go!";
        } else if(countdown === 0) {
            clearInterval(countdownInterval);
            setTimeout(() => {
                gameActive = true;
                countdownScreen.classList.add("hidden");
                gameScreen.classList.remove("hidden");
                playerNameDisplay.textContent = `Good luck, ${playerName}!`;
                loadAnime();
            }, 500);
        }
    }, 1000);
}

async function fetchAnimeList() {
    const pages = 3;

    const pageNumbers = [];
    while(pageNumbers.length < pages) {
        const randomPage = Math.floor(Math.random() * 15) + 1;
        if(!pageNumbers.includes(randomPage)) {
            pageNumbers.push(randomPage);
        }
    }
    
    for (let i = 0; i < pages; i++) {
        try {
            const response = await fetch(`https://api.jikan.moe/v4/top/anime?page=${pageNumbers[i]}&limit=20`);
            const data = await response.json();
            const titles = data.data.map(anime => anime.title);
            animeNameList = [...animeNameList, ...titles];
            animePool = [...animePool, ...data.data];
        } catch (error) {
            console.log(`Page ${pageNumbers[i]} failed, skipping...`);
        }
        await new Promise(resolve => setTimeout(resolve, 500));
    }

    animePool = animePool.filter(anime => 
        anime.images?.jpg.large_image_url &&
        !animeSeen.some(seen => seen.title === anime.title)
    );

    console.log("Anime list loaded:", animeNameList.length, "titles");
}

function loadAnime() {
    if(!gameActive) return;

    let decoys = [];
    let decoyIndex;
    let choiceBoxes = [];
    let choiceButton;

    if(animePool.length === 0)  {
        feedback.textContent = "Loading anime...";
        loadAnimeTimeout = setTimeout(loadAnime, 500);
        return;
    }
    
    if(animePool.length < 5) {
        fetchAnimeList();
    }

    const randomIndex = Math.floor(Math.random() * animePool.length);
    currentAnime = animePool[randomIndex];
    animePool.splice(randomIndex, 1); // removing from animePool
    animeSeen.push(currentAnime);

    // Getting anime image
    animeImage.src = currentAnime.images.jpg.large_image_url;
    animeImage.alt = "What Anime Is This?";

    // Getting decoy anime choices
    while(decoys.length < 3){ 
        decoyIndex = Math.floor(Math.random() * animePool.length);
        if(animePool[decoyIndex].title === currentAnime.title || decoys.includes(animePool[decoyIndex])) {
            continue;
        }
        decoys.push(animePool[decoyIndex]);
    }

    choiceBoxes = decoys;
    choiceBoxes.push(currentAnime);
    choiceBoxes.sort(() => Math.random() - 0.5);

    choices.innerHTML = ""; // clearing choices div
    // creating buttons
    for(let i = 0; i < 4; i++) {
        choiceButton = document.createElement("button");
        choiceButton.textContent = choiceBoxes[i].title;
        choiceButton.addEventListener("click", () => {
            document.querySelectorAll("#choices button").forEach(btn => btn.disabled = true);
            clearInterval(timerInterval);
            if(choiceBoxes[i].title === currentAnime.title) {
                feedback.textContent = "Correct!";
                score += 100;
                scoreDisplay.textContent = `Score : ${score}`;
                loadAnimeTimeout = setTimeout(loadAnime, 1500);
            }
            else {
                loseLife("wrong");
            }
            
        })
        choices.appendChild(choiceButton);
    }

    timeLeft = 10;
    timerDisplay.textContent = `Time Left: ${timeLeft}`;
    timerInterval = setInterval(() => {
        timeLeft--;
        timerDisplay.textContent = `Time Left: ${timeLeft}`;
        if(timeLeft === 0) {
            clearInterval(timerInterval);
            loseLife();
        }
    }, 1000);
    // Input area
    feedback.textContent = "";
}

function loseLife(reason = "times up") {
    if(!gameActive) return;
    lives--;
    if(reason === "wrong") {
        feedback.textContent = `Wrong! It was ${currentAnime.title}!`;
    }
    else {
        feedback.textContent = `Time's up! It was ${currentAnime.title}!`;
    }
    
    if(lives === 0) {
        gameOver();
    }
    else {
        livesDisplay.textContent = `Lives: ${"❤️".repeat(lives)}`;
        loadAnimeTimeout = setTimeout(loadAnime, 1500);
    }
}

playAgainButton.addEventListener("click", () => {
    clearInterval(timerInterval);
    clearTimeout(loadAnimeTimeout);
    gameActive = false;
    lives = 3;
    score = 0;
    timeLeft = 10;
    timerInterval = null;
    animeSeen = [];
    animePool = [];
    livesDisplay.textContent = "Lives left: ❤️❤️❤️";
    scoreDisplay.textContent = "Score: 0";
    timerDisplay.textContent = "Time Left: 10";
    gameOverScreen.classList.add("hidden");
    gameScreen.classList.remove("hidden");
    startCountdown();
});

function gameOver() {
    gameActive = false;
    clearInterval(timerInterval);
    gameScreen.classList.add("hidden");
    gameOverScreen.classList.remove("hidden");
    finalScore.textContent = `Final Score: ${score}`;
    finalName.textContent = `Well played, ${playerName}`;
    saveScore();
    showLeaderboard();
}

function saveScore() {
    const playerScores = JSON.parse(localStorage.getItem("scores")) || [];
    playerScores.push({ name: playerName, score: score });
    playerScores.sort((a, b) => b.score - a.score);
    localStorage.setItem("scores", JSON.stringify(playerScores));
}

function showLeaderboard() {
    const playerScores = JSON.parse(localStorage.getItem("scores")) || [];
    leaderboardList.innerHTML = ""; // clears child elements
    for(let i = 0; i < 10; i++) {
        if(!playerScores[i]) break;
        let playerScore = document.createElement('li');
        playerScore.textContent = `${playerScores[i].name} - ${playerScores[i].score}`;
        leaderboardList.appendChild(playerScore);
    }
}