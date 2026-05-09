let playerName = "";
let currentAnime = null;
let animeNameList = [];

const startScreen = document.getElementById("start-screen");
const gameScreen = document.getElementById("game-screen");
const nameInput = document.getElementById("name-input");
const startButton = document.getElementById("start-button");
const playerNameDisplay = document.getElementById("player-name");
const animeImage = document.getElementById("anime-image");
const guessInput = document.getElementById("guess-input");
const submitButton = document.getElementById("submit-button");
const feedback = document.getElementById("feedback");
const dropdown = document.getElementById("dropdown");

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

    fetchAnimeList();
    setTimeout(loadAnime, 1000);
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

    // Getting anime image
    animeImage.src = currentAnime.images.jpg.large_image_url;
    animeImage.alt = "What Anime Is This?";

    // Input area
    guessInput.value = "";
    feedback.textContent = "";
}

async function fetchAnimeList() {
    const pages = 3;
    // Creating an array of the fetch calls, one for each page
    const requests = Array.from({ length: pages }, (_, i) =>
        fetch(`https://api.jikan.moe/v4/top/anime?page=${i + 1}&limit=20`)
    );

    // Firing all calls
    const responses = await Promise.all(requests);
    // Parsing all responses to JS objects
    const dataArray = await Promise.all(responses.map(r => r.json()));
    // Flattens the pages from an array of arrays into one array
    // and extracts only the anime titles to create a array of strings
    animeNameList = dataArray.flatMap(d => d.data.map(anime => anime.title));
}

function showDropdown(matches) {
    dropdown.innerHTML = "";

    matches.slice(0, 10).forEach(title => {
        const li = document.createElement("li");
        li.textContent = title;
        li.addEventListener("click", () => {
            guessInput.value = title;
            dropdown.innerHTML = "";
        });
        dropdown.appendChild(li);
    })
}

guessInput.addEventListener("input", () => {
    const query = guessInput.value.trim();

    if (query === "") {
        dropdown.innerHTML = "";
        return;
    }

    const matches = animeNameList.filter(title =>
        title.toLowerCase().includes(query.toLowerCase())
    );

    showDropdown(matches);
})






