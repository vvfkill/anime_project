const BOOKMARKS_URL = "https://localhost:7241/api/bookmarks";

const bookmarksGrid = document.getElementById("bookmarksGrid");
const bookmarksCount = document.getElementById("bookmarksCount");
const sortSelect = document.getElementById("sortSelect");
const applyFiltersBtn = document.getElementById("applyFiltersBtn");
const resetFiltersBtn = document.getElementById("resetFiltersBtn");
const yearFromInput = document.getElementById("yearFromInput");
const yearToInput = document.getElementById("yearToInput");

let bookmarks = [];

let currentType = "all";
let currentGenre = "all";
let currentRating = "all";
let currentSort = "date";
let currentYearFrom = 1950;
let currentYearTo = 2026;

function getCurrentUser() {
    try {
        const user = localStorage.getItem("authUser");
        return user ? JSON.parse(user) : null;
    } catch {
        return null;
    }
}

function getCurrentUserId() {
    const user = getCurrentUser();

    if (!user) return null;

    return user.userId || user.user_id || user.id;
}

function requireAuth() {
    const user = getCurrentUser();

    if (!user) {
        alert("Сначала войдите в аккаунт");
        window.location.href = "login.html";
        return false;
    }

    return true;
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

function getBookmarkTitle(item) {
    return item.titleRu || item.titleOriginal || item.title || "Без названия";
}

function getSelectedValues(name) {
    return [...document.querySelectorAll(`input[name="${name}"]:checked`)]
        .map(input => input.value);
}

function getBookmarkGenres(item) {
    const rawGenres = item.genres || item.Genres || item.genre || item.Genre;

    if (Array.isArray(rawGenres)) {
        return rawGenres.map(genre => {
            if (typeof genre === "string") return genre;
            return genre.name || genre.Name || genre.genreName || "";
        }).filter(Boolean);
    }

    if (typeof rawGenres === "string") {
        return rawGenres.split(",").map(genre => genre.trim()).filter(Boolean);
    }

    return [];
}

function getFilteredBookmarks() {
    const selectedTypes = getSelectedValues("bookmarkType");
    const selectedGenres = getSelectedValues("bookmarkGenre");

    return bookmarks.filter(item => {
        const typeValue = String(item.type || "").toLowerCase();
        const itemGenres = getBookmarkGenres(item).map(genre => genre.toLowerCase());
        const year = Number(item.releaseYear || 0);

        const tabTypeMatches =
            currentType === "all" ||
            typeValue.includes(currentType.toLowerCase());

        const sideTypeMatches =
            selectedTypes.length === 0 ||
            selectedTypes.some(type => typeValue === type.toLowerCase());

        const genreMatches =
            selectedGenres.length === 0 ||
            selectedGenres.some(genre => itemGenres.includes(genre.toLowerCase()));

        const ratingMatches =
            currentRating === "all" ||
            Number(item.averageRating || 0) >= Number(currentRating);

        const yearMatches = year >= currentYearFrom && year <= currentYearTo;

        return tabTypeMatches && sideTypeMatches && genreMatches && ratingMatches && yearMatches;
    });
}

function getSortedBookmarks(list) {
    const sorted = [...list];

    if (currentSort === "rating") {
        sorted.sort((a, b) => Number(b.averageRating || 0) - Number(a.averageRating || 0));
    }

    if (currentSort === "year") {
        sorted.sort((a, b) => Number(b.releaseYear || 0) - Number(a.releaseYear || 0));
    }

    if (currentSort === "date") {
        sorted.sort((a, b) => new Date(b.createdAt || 0) - new Date(a.createdAt || 0));
    }

    if (currentSort === "title") {
        sorted.sort((a, b) => getBookmarkTitle(a).localeCompare(getBookmarkTitle(b), "ru"));
    }

    return sorted;
}

function applyCurrentView() {
    const filtered = getFilteredBookmarks();
    const sorted = getSortedBookmarks(filtered);

    renderBookmarks(sorted);
}

async function loadBookmarks() {
    if (!requireAuth()) return;

    const userId = getCurrentUserId();

    try {
        const response = await fetch(`${BOOKMARKS_URL}/user/${userId}`);

        if (!response.ok) {
            throw new Error("Не удалось загрузить закладки");
        }

        bookmarks = await response.json();
        applyCurrentView();
    } catch (error) {
        bookmarksGrid.innerHTML = `<p>Ошибка: ${error.message}</p>`;
        bookmarksCount.textContent = "Не удалось загрузить данные";
    }
}

function renderBookmarks(list) {
    if (!bookmarks || bookmarks.length === 0) {
        bookmarksCount.textContent = "В закладках пока нет аниме";
        bookmarksGrid.innerHTML = `
            <div class="empty-state glass">
                <h2>Закладок пока нет</h2>
                <p>Откройте страницу аниме и нажмите «В избранное».</p>
                <a class="primary-btn" href="index.html">На главную</a>
            </div>
        `;
        return;
    }

    if (!list || list.length === 0) {
        bookmarksCount.textContent = "По выбранным фильтрам ничего не найдено";
        bookmarksGrid.innerHTML = `
            <div class="empty-state glass">
                <h2>Ничего не найдено</h2>
                <p>Попробуйте изменить фильтры.</p>
            </div>
        `;
        return;
    }

    bookmarksCount.textContent = `Найдено: ${list.length}`;

    bookmarksGrid.innerHTML = list.map(item => {
        const fallbackPoster = "../images/no-poster.jpg";
        const poster = getPosterUrl(item.posterUrl);
        const title = getBookmarkTitle(item);

        return `
            <article class="bookmark-card glass" onclick="openAnime(${item.animeId})">
                <img
                    src="${poster}"
                    alt="${title}"
                    onerror="this.onerror=null; this.src='${fallbackPoster}';"
                >

                <div class="bookmark-info">
                    <div class="bookmark-icon">▮</div>

                    <h3>${title}</h3>
                    <p>${item.titleOriginal || ""}</p>

                    <div class="bookmark-meta">
                        <span>${item.releaseYear || "—"}</span>
                        <span>•</span>
                        <span>${item.type || "—"}</span>
                        <span>•</span>
                        <span>${item.episodesTotal || "—"} серий</span>
                    </div>

                    <div class="bookmark-rating">★ ${item.averageRating ?? "—"}</div>
                </div>
            </article>
        `;
    }).join("");
}

function openAnime(animeId) {
    window.location.href = `anime.html?id=${animeId}`;
}


function setCurrentType(type) {
    currentType = type;

    document.querySelectorAll(".tab-link").forEach(button => {
        button.classList.toggle("active", button.dataset.type === type);
    });

    applyCurrentView();
}

function setupFilters() {
    document.querySelectorAll(".tab-link").forEach(button => {
        button.addEventListener("click", () => {
            setCurrentType(button.dataset.type);
        });
    });

    document.querySelectorAll(".filter-chip").forEach(button => {
        button.addEventListener("click", () => {
            const isActive = button.classList.contains("active");

            document.querySelectorAll(".filter-chip").forEach(item => {
                item.classList.remove("active");
            });

            if (isActive) {
                currentRating = "all";
                return;
            }

            button.classList.add("active");
            currentRating = button.dataset.rating;
        });
    });

    if (sortSelect) {
        sortSelect.addEventListener("change", () => {
            currentSort = sortSelect.value;
            applyCurrentView();
        });
    }

    if (applyFiltersBtn) {
        applyFiltersBtn.addEventListener("click", () => {
            currentYearFrom = Number(yearFromInput?.value || 1950);
            currentYearTo = Number(yearToInput?.value || 2026);

            if (currentYearFrom > currentYearTo) {
                const temp = currentYearFrom;
                currentYearFrom = currentYearTo;
                currentYearTo = temp;

                if (yearFromInput) yearFromInput.value = String(currentYearFrom);
                if (yearToInput) yearToInput.value = String(currentYearTo);
            }

            applyCurrentView();
        });
    }

    if (resetFiltersBtn) {
        resetFiltersBtn.addEventListener("click", () => {
            currentType = "all";
            currentRating = "all";
            currentSort = "date";
            currentYearFrom = 1950;
            currentYearTo = 2026;

            if (yearFromInput) yearFromInput.value = "1950";
            if (yearToInput) yearToInput.value = "2026";
            if (sortSelect) sortSelect.value = "date";

            document.querySelectorAll('input[name="bookmarkType"]').forEach(input => {
                input.checked = false;
            });

            document.querySelectorAll('input[name="bookmarkGenre"]').forEach(input => {
                input.checked = false;
            });

            document.querySelectorAll(".filter-chip").forEach(item => {
                item.classList.remove("active");
            });

            document.querySelectorAll(".tab-link").forEach(button => {
                button.classList.toggle("active", button.dataset.type === "all");
            });

            applyCurrentView();
        });
    }
}

setupFilters();
loadBookmarks();