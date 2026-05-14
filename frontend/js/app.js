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

    profileBtn.addEventListener("click", (event) => {
        const user = getCurrentUser();

        if (!user) {
            event.preventDefault();
            window.location.href = "login.html";
            return;
        }

        window.location.href = "profile.html";
    });
}

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

    if (posterUrl.startsWith("images/")) {
        return `../${posterUrl}`;
    }

    return posterUrl;
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
    return anime.titleRu || anime.titleOriginal || "Без названия";
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
                    <p><strong>Оригинальное:</strong> ${anime.titleOriginal || "—"}</p>
                    <p><strong>Рейтинг:</strong> ${anime.averageRating ?? "—"}</p>
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
            popularAnimeContainer.innerHTML = `<p class="empty-text">Загрузка популярного...</p>`;
        }

        if (newAnimeContainer) {
            newAnimeContainer.innerHTML = `<p class="empty-text">Загрузка новинок...</p>`;
        }

        if (searchResultsContainer) {
            searchResultsContainer.innerHTML = "";
        }

        const data = await fetchAnime("", 1, 50);
        const items = data.items || [];

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
            popularAnimeContainer.innerHTML = `<p class="empty-text">Ошибка загрузки: ${error.message}</p>`;
        }

        if (newAnimeContainer) {
            newAnimeContainer.innerHTML = `<p class="empty-text">Ошибка загрузки: ${error.message}</p>`;
        }
    }
}

async function searchAnime() {
    if (!searchInput || !searchResultsContainer) return;

    const search = searchInput.value.trim();

    if (!search) {
        searchResultsContainer.innerHTML = "";
        return;
    }

    try {
        searchResultsContainer.innerHTML = `<p class="empty-text">Поиск...</p>`;

        const data = await fetchAnime(search, 1, 12);
        const items = data.items || [];

        renderSection(
            searchResultsContainer,
            items,
            "По вашему запросу ничего не найдено."
        );
    } catch (error) {
        searchResultsContainer.innerHTML = `<p class="empty-text">Ошибка поиска: ${error.message}</p>`;
    }
}

function setupSearch() {
    if (searchButton) {
        searchButton.addEventListener("click", searchAnime);
    }

    if (searchInput) {
        searchInput.addEventListener("keydown", event => {
            if (event.key === "Enter") {
                searchAnime();
            }
        });

        searchInput.addEventListener("input", () => {
            if (!searchInput.value.trim() && searchResultsContainer) {
                searchResultsContainer.innerHTML = "";
            }
        });
    }
}

function setupSliders() {
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
}

function setupSeeAllButtons() {
    document.querySelectorAll(".see-all-btn").forEach(button => {
        button.addEventListener("click", () => {
            window.location.href = "catalog.html";
        });
    });
}

function setupHeroButtons() {
    const primaryHeroBtn = document.querySelector(".hero .primary-btn");
    const secondaryHeroBtn = document.querySelector(".hero .secondary-btn");

    if (primaryHeroBtn) {
        primaryHeroBtn.addEventListener("click", () => {
            window.location.href = "catalog.html";
        });
    }

    if (secondaryHeroBtn) {
        secondaryHeroBtn.addEventListener("click", () => {
            const user = getCurrentUser();

            if (!user) {
                window.location.href = "login.html";
                return;
            }

            window.location.href = "list.html";
        });
    }
}

setupProfileButton();
setupSearch();
setupSliders();
setupSeeAllButtons();
setupHeroButtons();
loadHomePage();