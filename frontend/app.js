const API_URL = "https://localhost:7241/api/anime";

const popularAnimeContainer = document.getElementById("popularAnime");
const newAnimeContainer = document.getElementById("newAnime");
const searchResultsContainer = document.getElementById("searchResults");

const searchInput = document.getElementById("searchInput");
const searchButton = document.getElementById("searchButton");

function getCurrentUser() {
    const user = localStorage.getItem("authUser");
    return user ? JSON.parse(user) : null;
}

function setupProfileButton() {
    const profileBtn = document.querySelector(".profile-btn");

    if (!profileBtn) return;

    profileBtn.addEventListener("click", () => {
        const user = getCurrentUser();

        if (!user) {
            window.location.href = "login.html";
            return;
        }

        alert(`Вы вошли как ${user.nickname || user.email || "пользователь"}`);
    });
}

async function fetchAnime(search = "", page = 1, pageSize = 12) {
    const url = `${API_URL}?page=${page}&pageSize=${pageSize}&search=${encodeURIComponent(search)}`;
    const response = await fetch(url);

    if (!response.ok) {
        throw new Error("Ошибка загрузки аниме");
    }

    return await response.json();
}

function createAnimeCard(anime) {
    const fallbackPoster = "images/no-poster.jpg";
    const poster =
        anime.posterUrl && anime.posterUrl.trim() !== ""
            ? anime.posterUrl
            : fallbackPoster;

    return `
        <a class="anime-card-link" href="anime.html?id=${anime.animeId}">
            <div class="anime-card">
                <img 
                    src="${poster}" 
                    alt="${anime.titleOriginal || anime.titleRu || "Anime poster"}"
                    onerror="this.onerror=null; this.src='${fallbackPoster}';"
                >
                <div class="anime-card-content">
                    <h3>${anime.titleRu || anime.titleOriginal}</h3>
                    <p><strong>Оригинальное:</strong> ${anime.titleOriginal || "—"}</p>
                    <p><strong>Рейтинг:</strong> ${anime.averageRating ?? "—"}</p>
                </div>
            </div>
        </a>
    `;
}

function renderSection(container, items) {
    if (!items || items.length === 0) {
        container.innerHTML = `<p class="empty-text">Ничего не найдено.</p>`;
        return;
    }

    container.innerHTML = items.map(createAnimeCard).join("");
}

async function loadHomePage() {
    try {
        const popularData = await fetchAnime("", 1, 10);
        renderSection(popularAnimeContainer, popularData.items);

        const newData = await fetchAnime("", 1, 10);
        renderSection(newAnimeContainer, newData.items);

        searchResultsContainer.innerHTML = "";
    } catch (error) {
        popularAnimeContainer.innerHTML = `<p class="empty-text">Ошибка загрузки: ${error.message}</p>`;
        newAnimeContainer.innerHTML = `<p class="empty-text">Ошибка загрузки: ${error.message}</p>`;
    }
}

async function searchAnime() {
    const search = searchInput.value.trim();

    if (!search) {
        searchResultsContainer.innerHTML = "";
        return;
    }

    try {
        const data = await fetchAnime(search, 1, 12);
        renderSection(searchResultsContainer, data.items);
    } catch (error) {
        searchResultsContainer.innerHTML = `<p class="empty-text">Ошибка поиска: ${error.message}</p>`;
    }
}

if (searchButton) {
    searchButton.addEventListener("click", searchAnime);
}

if (searchInput) {
    searchInput.addEventListener("keydown", (e) => {
        if (e.key === "Enter") {
            searchAnime();
        }
    });
}

document.querySelectorAll(".slider-arrow").forEach(button => {
    button.addEventListener("click", () => {
        const targetId = button.dataset.target;
        const container = document.getElementById(targetId);
        const direction = button.classList.contains("left") ? -1 : 1;

        if (!container) return;

        container.scrollBy({
            left: direction * 320,
            behavior: "smooth"
        });
    });
});

setupProfileButton();
loadHomePage();