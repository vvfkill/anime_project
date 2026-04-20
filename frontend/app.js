const API_URL = "https://localhost:7241/api/anime";

const popularAnimeContainer = document.getElementById("popularAnime");
const newAnimeContainer = document.getElementById("newAnime");
const searchResultsContainer = document.getElementById("searchResults");

const searchInput = document.getElementById("searchInput");
const searchButton = document.getElementById("searchButton");

async function fetchAnime(search = "", page = 1, pageSize = 12) {
    const url = `${API_URL}?page=${page}&pageSize=${pageSize}&search=${encodeURIComponent(search)}`;
    const response = await fetch(url);

    if (!response.ok) {
        throw new Error("Ошибка загрузки аниме");
    }

    return await response.json();
}

function createAnimeCard(anime) {
    return `
        <div class="anime-card">
            <img src="${anime.posterUrl || "https://via.placeholder.com/220x300?text=No+Image"}" alt="${anime.titleOriginal}">
            <div class="anime-card-content">
                <h3>${anime.titleRu || anime.titleOriginal}</h3>
                <p><strong>Оригинальное:</strong> ${anime.titleOriginal}</p>
                <p><strong>Рейтинг:</strong> ${anime.averageRating ?? "—"}</p>
            </div>
        </div>
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

        searchResultsContainer.innerHTML = `<p class="empty-text">Введите запрос для поиска.</p>`;
    } catch (error) {
        popularAnimeContainer.innerHTML = `<p class="empty-text">Ошибка загрузки: ${error.message}</p>`;
        newAnimeContainer.innerHTML = `<p class="empty-text">Ошибка загрузки: ${error.message}</p>`;
    }
}

async function searchAnime() {
    const search = searchInput.value.trim();

    if (!search) {
        searchResultsContainer.innerHTML = `<p class="empty-text">Введите запрос для поиска.</p>`;
        return;
    }

    try {
        const data = await fetchAnime(search, 1, 12);
        renderSection(searchResultsContainer, data.items);
    } catch (error) {
        searchResultsContainer.innerHTML = `<p class="empty-text">Ошибка поиска: ${error.message}</p>`;
    }
}

searchButton.addEventListener("click", searchAnime);

searchInput.addEventListener("keydown", (e) => {
    if (e.key === "Enter") {
        searchAnime();
    }
});

loadHomePage();