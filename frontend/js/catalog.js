const CATALOG_API_URL = "https://localhost:7241/api/anime";

const catalogGrid = document.getElementById("catalogGrid");
const catalogCount = document.getElementById("catalogCount");
const catalogSortSelect = document.getElementById("catalogSortSelect");
const applyCatalogFiltersBtn = document.getElementById("applyCatalogFiltersBtn");
const resetCatalogFiltersBtn = document.getElementById("resetCatalogFiltersBtn");
const prevPageBtn = document.getElementById("prevPageBtn");
const nextPageBtn = document.getElementById("nextPageBtn");
const pageInfo = document.getElementById("pageInfo");
const catalogYearFromInput = document.getElementById("catalogYearFromInput");
const catalogYearToInput = document.getElementById("catalogYearToInput");

let catalogItems = [];
let currentPage = 1;
let pageSize = 24;
let totalPages = 1;
let currentSearch = "";
let currentRating = "all";
let currentSort = "default";
let currentYearFrom = 1950;
let currentYearTo = 2026;

function getSearchFromUrl() {
    const params = new URLSearchParams(window.location.search);
    return params.get("search") || "";
}

function getPosterUrl(posterUrl) {
    const fallbackPoster = "../images/no-poster.jpg";

    if (!posterUrl || posterUrl.trim() === "") return fallbackPoster;
    if (posterUrl.startsWith("http")) return posterUrl;
    if (posterUrl.startsWith("../")) return posterUrl;
    if (posterUrl.startsWith("/")) return `https://localhost:7241${posterUrl}`;
    if (posterUrl.startsWith("images/")) return `../${posterUrl}`;

    return posterUrl;
}

function getItemsFromResponse(data) {
    if (Array.isArray(data)) {
        totalPages = 1;
        return data;
    }

    totalPages = data.totalPages || data.pages || 1;

    if (Array.isArray(data.items)) return data.items;
    if (Array.isArray(data.data)) return data.data;

    return [];
}

function getAnimeTitle(anime) {
    return anime.titleRu || anime.titleOriginal || anime.title || "Без названия";
}

function getAnimeGenres(anime) {
    if (Array.isArray(anime.genres)) return anime.genres;
    if (typeof anime.genres === "string") {
        return anime.genres.split(",").map(item => item.trim());
    }
    if (typeof anime.genre === "string") return [anime.genre];

    return [];
}

async function fetchCatalog() {
    const params = new URLSearchParams();

    params.set("page", currentPage);
    params.set("pageSize", pageSize);

    if (currentSearch) {
        params.set("search", currentSearch);
    }

    const response = await fetch(`${CATALOG_API_URL}?${params.toString()}`);

    if (!response.ok) {
        throw new Error("Не удалось загрузить каталог");
    }

    return await response.json();
}

function getSelectedValues(name) {
    return [...document.querySelectorAll(`input[name="${name}"]:checked`)]
        .map(input => input.value);
}

function getFilteredCatalog() {
    const selectedTypes = getSelectedValues("catalogType");
    const selectedGenres = getSelectedValues("catalogGenre");

    return catalogItems.filter(item => {
        const type = String(item.type || "").toLowerCase();
        const genres = getAnimeGenres(item).map(genre => genre.toLowerCase());
        const year = Number(item.releaseYear || 0);
        const rating = Number(item.averageRating || 0);

        const typeMatches =
            selectedTypes.length === 0 ||
            selectedTypes.some(selected => type.includes(selected.toLowerCase()));

        const genreMatches =
            selectedGenres.length === 0 ||
            selectedGenres.some(selected => genres.includes(selected.toLowerCase()));

        const yearMatches = year >= currentYearFrom && year <= currentYearTo;

        const ratingMatches =
            currentRating === "all" ||
            rating >= Number(currentRating);

        return typeMatches && genreMatches && yearMatches && ratingMatches;
    });
}

function getSortedCatalog(list) {
    const sorted = [...list];

    if (currentSort === "rating") {
        sorted.sort((a, b) => Number(b.averageRating || 0) - Number(a.averageRating || 0));
    }

    if (currentSort === "title") {
        sorted.sort((a, b) => getAnimeTitle(a).localeCompare(getAnimeTitle(b), "ru"));
    }

    return sorted;
}

function renderCatalogCard(anime) {
    const fallbackPoster = "../images/no-poster.jpg";
    const poster = getPosterUrl(anime.posterUrl);
    const title = getAnimeTitle(anime);

    return `
        <a class="catalog-card" href="anime.html?id=${anime.animeId}">
            <img
                src="${poster}"
                alt="${title}"
                onerror="this.onerror=null; this.src='${fallbackPoster}';"
            >

            <div class="catalog-card-body">
                <h3>${title}</h3>
                <p>${anime.titleOriginal || ""}</p>

                <div class="catalog-card-meta">
                    <span>${anime.releaseYear || "—"}</span>
                    <span>★ ${anime.averageRating ?? "—"}</span>
                </div>
            </div>
        </a>
    `;
}

function renderCatalog(list) {
    if (!catalogGrid) return;

    if (!list || list.length === 0) {
        catalogGrid.innerHTML = `
            <div class="empty-state glass">
                <h2>Ничего не найдено</h2>
                <p>Попробуйте изменить фильтры или поисковый запрос.</p>
            </div>
        `;

        if (catalogCount) {
            catalogCount.textContent = "Найдено: 0";
        }

        return;
    }

    catalogGrid.innerHTML = list.map(renderCatalogCard).join("");

    if (catalogCount) {
        catalogCount.textContent = `Найдено: ${list.length}`;
    }
}

function updatePagination() {
    if (pageInfo) {
        pageInfo.textContent = `Страница ${currentPage}`;
    }

    if (prevPageBtn) {
        prevPageBtn.disabled = currentPage <= 1;
    }

    if (nextPageBtn) {
        nextPageBtn.disabled = currentPage >= totalPages;
    }
}

function applyCatalogView() {
    const filtered = getFilteredCatalog();
    const sorted = getSortedCatalog(filtered);

    renderCatalog(sorted);
    updatePagination();
}

async function loadCatalog() {
    try {
        if (catalogGrid) {
            catalogGrid.innerHTML = `<p>Загрузка каталога...</p>`;
        }

        const data = await fetchCatalog();
        catalogItems = getItemsFromResponse(data);

        applyCatalogView();
    } catch (error) {
        if (catalogGrid) {
            catalogGrid.innerHTML = `
                <div class="empty-state glass">
                    <h2>Ошибка загрузки</h2>
                    <p>${error.message}</p>
                </div>
            `;
        }

        if (catalogCount) {
            catalogCount.textContent = "Ошибка загрузки данных";
        }
    }
}

function setupCatalogFilters() {
    document.querySelectorAll(".filter-chip").forEach(button => {
        button.addEventListener("click", () => {
            document.querySelectorAll(".filter-chip").forEach(item => {
                item.classList.remove("active");
            });

            button.classList.add("active");
            currentRating = button.dataset.rating;
        });
    });

    if (catalogSortSelect) {
        catalogSortSelect.addEventListener("change", () => {
            currentSort = catalogSortSelect.value;
            applyCatalogView();
        });
    }

    if (applyCatalogFiltersBtn) {
        applyCatalogFiltersBtn.addEventListener("click", () => {
            currentYearFrom = Number(catalogYearFromInput?.value || 1950);
            currentYearTo = Number(catalogYearToInput?.value || 2026);
            applyCatalogView();
        });
    }

    if (resetCatalogFiltersBtn) {
        resetCatalogFiltersBtn.addEventListener("click", () => {
            currentRating = "all";
            currentSort = "default";
            currentYearFrom = 1950;
            currentYearTo = 2026;

            if (catalogYearFromInput) catalogYearFromInput.value = "1950";
            if (catalogYearToInput) catalogYearToInput.value = "2026";
            if (catalogSortSelect) catalogSortSelect.value = "default";

            document.querySelectorAll('input[name="catalogType"]').forEach(input => {
                input.checked = input.value === "TV Сериал";
            });

            document.querySelectorAll('input[name="catalogGenre"]').forEach(input => {
                input.checked = false;
            });

            document.querySelectorAll(".filter-chip").forEach(item => {
                item.classList.remove("active");
            });

            applyCatalogView();
        });
    }

    if (prevPageBtn) {
        prevPageBtn.addEventListener("click", async () => {
            if (currentPage <= 1) return;
            currentPage--;
            await loadCatalog();
        });
    }

    if (nextPageBtn) {
        nextPageBtn.addEventListener("click", async () => {
            if (currentPage >= totalPages) return;
            currentPage++;
            await loadCatalog();
        });
    }
}

currentSearch = getSearchFromUrl();
setupCatalogFilters();
loadCatalog();