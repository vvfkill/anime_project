const CATALOG_API_URL = "https://localhost:7241/api/anime";

const catalogGrid = document.getElementById("catalogGrid");
const catalogCount = document.getElementById("catalogCount");
const catalogSearchInput = document.getElementById("catalogSearchInput");
const catalogYearFromInput = document.getElementById("catalogYearFromInput");
const catalogYearToInput = document.getElementById("catalogYearToInput");
const catalogSortSelect = document.getElementById("catalogSortSelect");

const applyCatalogFiltersBtn = document.getElementById("applyCatalogFiltersBtn");
const resetCatalogFiltersBtn = document.getElementById("resetCatalogFiltersBtn");
const prevPageBtn = document.getElementById("prevPageBtn");
const nextPageBtn = document.getElementById("nextPageBtn");
const pageInfo = document.getElementById("pageInfo");

let currentPage = 1;
let currentPageSize = 12;
let currentSearch = "";
let currentYearFrom = "";
let currentYearTo = "";
let currentRating = "";
let currentSort = "default";
let totalPages = 1;
let currentItems = [];

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
            window.location.href = "../pages/login.html";
            return;
        }

        window.location.href = "profile.html";
    });
}

function getPosterUrl(anime) {
    const fallbackPoster = "../images/no-poster.jpg";

    if (!anime.posterUrl || anime.posterUrl.trim() === "") {
        return fallbackPoster;
    }

    if (anime.posterUrl.startsWith("http")) {
        return anime.posterUrl;
    }

    if (anime.posterUrl.startsWith("../")) {
        return anime.posterUrl;
    }

    if (anime.posterUrl.startsWith("images/")) {
        return `../${anime.posterUrl}`;
    }

    return anime.posterUrl;
}

function buildCatalogUrl() {
    const params = new URLSearchParams();

    params.set("page", currentPage);
    params.set("pageSize", currentPageSize);

    if (currentSearch) {
        params.set("search", currentSearch);
    }

    if (currentYearFrom && currentYearTo && currentYearFrom === currentYearTo) {
    params.set("year", currentYearFrom);
    }

    if (currentRating) {
        params.set("minRating", currentRating);
    }

    return `${CATALOG_API_URL}?${params.toString()}`;
}

async function loadCatalog() {
    try {
        catalogGrid.innerHTML = "<p>Загрузка каталога...</p>";

        const response = await fetch(buildCatalogUrl());

        if (!response.ok) {
            throw new Error("Не удалось загрузить каталог");
        }

        const data = await response.json();

        currentItems = data.items || [];
        totalPages = data.totalPages || 1;

        renderCatalog();
        updatePagination(data);
    } catch (error) {
        catalogCount.textContent = "Ошибка загрузки";
        catalogGrid.innerHTML = `<p class="error-text">${error.message}</p>`;
    }
}

function getSortedItems() {
    const items = [...currentItems];

    if (currentSort === "rating") {
        items.sort((a, b) => Number(b.averageRating || 0) - Number(a.averageRating || 0));
    }

    if (currentSort === "title") {
        items.sort((a, b) => {
            const titleA = a.titleRu || a.titleOriginal || "";
            const titleB = b.titleRu || b.titleOriginal || "";

            return titleA.localeCompare(titleB, "ru");
        });
    }

    return items;
}

function renderCatalog() {
    const items = getSortedItems();

    if (!items.length) {
        catalogCount.textContent = "Ничего не найдено";
        catalogGrid.innerHTML = `
            <div class="empty-state glass">
                <h2>Аниме не найдено</h2>
                <p>Попробуйте изменить поиск или фильтры.</p>
            </div>
        `;
        return;
    }

    catalogGrid.innerHTML = items.map(anime => {
        const title = anime.titleRu || anime.titleOriginal || "Без названия";
        const poster = getPosterUrl(anime);

        return `
            <a class="catalog-card glass" href="anime.html?id=${anime.animeId}">
                <img
                    src="${poster}"
                    alt="${title}"
                    onerror="this.onerror=null; this.src='../images/no-poster.jpg';"
                >

                <div class="catalog-card-body">
                    <h3>${title}</h3>
                    <p>${anime.titleOriginal || ""}</p>

                    <div class="catalog-card-meta">
                        <span>★ ${anime.averageRating ?? "—"}</span>
                    </div>
                </div>
            </a>
        `;
    }).join("");
}

function updatePagination(data) {
    const totalCount = data.totalCount || 0;

    catalogCount.textContent = `Найдено: ${totalCount}`;
    pageInfo.textContent = `Страница ${currentPage} из ${totalPages || 1}`;

    prevPageBtn.disabled = currentPage <= 1;
    nextPageBtn.disabled = currentPage >= totalPages;
}

function applyFilters() {
    currentPage = 1;
    currentSearch = catalogSearchInput.value.trim();
    currentYearFrom = catalogYearFromInput.value.trim();
    currentYearTo = catalogYearToInput.value.trim();
    currentPageSize = 12;
    loadCatalog();
}

function resetFilters() {
    currentPage = 1;
    currentSearch = "";
    currentYearFrom = "";
    currentYearTo = "";
    currentPageSize = 12;
    currentRating = "";
    currentSort = "default";
    

    catalogSearchInput.value = "";
    catalogYearFromInput.value = "1950";
    catalogYearToInput.value = "2026";
    catalogSortSelect.value = "default";

    document.querySelectorAll(".filter-chip").forEach(button => {
        button.classList.remove("active");
    });

    loadCatalog();
}

function setupCatalogEvents() {
    applyCatalogFiltersBtn.addEventListener("click", applyFilters);
    resetCatalogFiltersBtn.addEventListener("click", resetFilters);

    catalogSearchInput.addEventListener("keydown", event => {
        if (event.key === "Enter") {
            applyFilters();
        }
    });

    catalogYearInput.addEventListener("keydown", event => {
        if (event.key === "Enter") {
            applyFilters();
        }
    });

    document.querySelectorAll(".filter-chip").forEach(button => {
        button.addEventListener("click", () => {
            document.querySelectorAll(".catalog-rating-chip").forEach(item => {
                item.classList.remove("active");
            });

            button.classList.add("active");
            currentRating = button.dataset.rating;
        });
    });

    catalogSortSelect.addEventListener("change", () => {
        currentSort = catalogSortSelect.value;
        renderCatalog();
    });

    prevPageBtn.addEventListener("click", () => {
        if (currentPage <= 1) return;

        currentPage--;
        loadCatalog();
    });

    nextPageBtn.addEventListener("click", () => {
        if (currentPage >= totalPages) return;

        currentPage++;
        loadCatalog();
    });
}

setupProfileButton();
setupCatalogEvents();
loadCatalog();