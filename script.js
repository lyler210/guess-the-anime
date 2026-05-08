let playerName = "";
let currentAnime = null;

const startScreen = document.getElementById("start-screen");
const gameScreen = document.getElementById("game-screen");
const nameInput = document.getElementById("name-input");
const startButton = document.getElementById("start-button");
const playerNameDisplay = document.getElementById("player-name");
const animeImage = document.getElementById("anime-image");
const guessInput = document.getElementById("guess-input");
const submitButton = document.getElementById("submit-button");
const feedback = document.getElementById("feedback");

startButton.addEventListener("click", () => {
    playerName = nameInput.value.trim();

    if(playerName === "") {
        alert("Please enter your name!");
        return;
    }

    // hiding start screen and showing game screen
    startScreen.classList.add("hidden");
    gameScreen.classList.remove("hidden");

    playerNameDisplay.textContent = `Good luck, ${ playerName }!`;

    loadAnime();
});

async function loadAnime() {

    const randomPage = Math.floor(Math.random() * 25) + 1;
    // Fetching 20 anime from a random page from the top anime list
    const response = await fetch(`https://api.jikan.moe/v4/top/anime?page=${randomPage}&limit=20`);
    // Parse the raw response into a usable JavaScript object
    const data = await response.json();

    const animeList = data.data;
    const randomIndex = Math.floor(Math.random() * animeList.length);
    currentAnime = animeList[randomIndex];

    animeImage.src = currentAnime.images.jpg.large_image_url;
    animeImage.alt = "What Anime Is This?";

    guessInput.value = "";
    feedback.textContent = "";
}







