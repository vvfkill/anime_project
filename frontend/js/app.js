const API_URL = "https://localhost:7241/api/anime";

const popularAnimeContainer = document.getElementById("popularAnime");
const newAnimeContainer = document.getElementById("newAnime");

function getPosterUrl(posterUrl) {
    const fallbackPoster = "../images/no-poster.jpg";

    if (!posterUrl || posterUrl.trim() === "") {
        return fallbackPoster;
    }

    if (posterUrl.startsWith("http")) {
        return posterUrl;
    }

    if (posterUrl.startsWith("../")) {
        return posterUrl;
    }

    if (posterUrl.startsWith("/")) {
        return `https://localhost:7241${posterUrl}`;
    }

    if (posterUrl.startsWith("images/")) {
        return `../${posterUrl}`;
    }

    return posterUrl;
}

function getItemsFromResponse(data) {
    if (Array.isArray(data)) return data;
    if (Array.isArray(data.items)) return data.items;
    if (Array.isArray(data.data)) return data.data;
    return [];
}

async function fetchAnime(search = "", page = 1, pageSize = 50) {
    const params = new URLSearchParams();

    params.set("page", page);
    params.set("pageSize", pageSize);

    if (search) {
        params.set("search", search);
    }

    const response = await fetch(`${API_URL}?${params.toString()}`);

    if (!response.ok) {
        throw new Error("Ошибка загрузки аниме");
    }

    return await response.json();
}

function getAnimeTitle(anime) {
    return anime.titleRu || anime.titleOriginal || anime.title || "Без названия";
}

function createAnimeCard(anime) {
    const fallbackPoster = "../images/no-poster.jpg";
    const poster = getPosterUrl(anime.posterUrl);
    const title = getAnimeTitle(anime);

    return `
        <a class="anime-card-link" href="anime.html?id=${anime.animeId}">
            <div class="anime-card">
                <img
                    src="${poster}"
                    alt="${title}"
                    onerror="this.onerror=null; this.src='${fallbackPoster}';"
                >

                <div class="anime-card-content">
                    <h3>${title}</h3>
                    <p class="anime-original-title">${anime.titleOriginal || ""}</p>
                    <p class="anime-card-rating">★ ${anime.averageRating ?? "—"}</p>
                </div>
            </div>
        </a>
    `;
}

function renderSection(container, items, emptyText = "Ничего не найдено.") {
    if (!container) return;

    if (!items || items.length === 0) {
        container.innerHTML = `<p class="empty-text">${emptyText}</p>`;
        return;
    }

    container.innerHTML = items.map(createAnimeCard).join("");
}

function getPopularAnime(items) {
    return [...items]
        .sort((a, b) => Number(b.averageRating || 0) - Number(a.averageRating || 0))
        .slice(0, 10);
}

function getNewAnime(items) {
    return [...items]
        .sort((a, b) => Number(b.releaseYear || 0) - Number(a.releaseYear || 0))
        .slice(0, 10);
}

async function loadHomePage() {
    try {
        if (popularAnimeContainer) {
            popularAnimeContainer.innerHTML = `<p class="empty-text">Загрузка...</p>`;
        }

        if (newAnimeContainer) {
            newAnimeContainer.innerHTML = `<p class="empty-text">Загрузка...</p>`;
        }

        const data = await fetchAnime("", 1, 50);
        const items = getItemsFromResponse(data);

        renderSection(
            popularAnimeContainer,
            getPopularAnime(items),
            "Популярное аниме пока не найдено."
        );

        renderSection(
            newAnimeContainer,
            getNewAnime(items),
            "Новинки пока не найдены."
        );
    } catch (error) {
        if (popularAnimeContainer) {
            popularAnimeContainer.innerHTML = `<p class="empty-text">Ошибка: ${error.message}</p>`;
        }

        if (newAnimeContainer) {
            newAnimeContainer.innerHTML = `<p class="empty-text">Ошибка: ${error.message}</p>`;
        }
    }
}

function setupSeeAllButtons() {
    document.querySelectorAll(".see-all-btn").forEach(button => {
        button.addEventListener("click", () => {
            window.location.href = "catalog.html";
        });
    });
}

setupSeeAllButtons();
loadHomePage();