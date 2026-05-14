const BOOKMARKS_URL = "https://localhost:7241/api/bookmarks";

const bookmarksGrid = document.getElementById("bookmarksGrid");
const bookmarksCount = document.getElementById("bookmarksCount");
const sortSelect = document.getElementById("sortSelect");
const ratingFilterSelect = document.getElementById("ratingFilterSelect");
const applyFiltersBtn = document.getElementById("applyFiltersBtn");
const resetFiltersBtn = document.getElementById("resetFiltersBtn");

let bookmarks = [];

let currentType = "all";
let currentGenre = "all";
let currentRating = "all";
let currentSort = "date";

function getCurrentUser() {
    const user = localStorage.getItem("authUser");
    return user ? JSON.parse(user) : null;
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

function getBookmarkTitle(item) {
    return item.titleRu || item.titleOriginal || "Без названия";
}

function getBookmarkGenres(item) {
    if (Array.isArray(item.genres)) return item.genres;
    if (typeof item.genre === "string") return [item.genre];
    if (typeof item.genres === "string") return item.genres.split(",").map(g => g.trim());

    return [];
}

function getFilteredBookmarks() {
    return bookmarks.filter(item => {
        const typeMatches =
            currentType === "all" ||
            String(item.type || "").toLowerCase().includes(currentType.toLowerCase());

        const itemGenres = getBookmarkGenres(item);
        const genreMatches =
            currentGenre === "all" ||
            itemGenres.some(g => g.toLowerCase() === currentGenre.toLowerCase());

        const ratingMatches =
            currentRating === "all" ||
            Number(item.averageRating || 0) >= Number(currentRating);

        return typeMatches && genreMatches && ratingMatches;
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
        const fallbackPoster = "images/no-poster.jpg";
        const poster =
            item.posterUrl && item.posterUrl.trim() !== ""
                ? item.posterUrl
                : fallbackPoster;

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

function setupFilters() {
    document.querySelectorAll('input[name="bookmarkType"]').forEach(input => {
        input.addEventListener("change", () => {
            currentType = input.value;
        });
    });

    document.querySelectorAll('input[name="bookmarkGenre"]').forEach(input => {
        input.addEventListener("change", () => {
            currentGenre = input.value;
        });
    });

    if (ratingFilterSelect) {
        ratingFilterSelect.addEventListener("change", () => {
            currentRating = ratingFilterSelect.value;
        });
    }

    if (sortSelect) {
        sortSelect.addEventListener("change", () => {
            currentSort = sortSelect.value;
            applyCurrentView();
        });
    }

    if (applyFiltersBtn) {
        applyFiltersBtn.addEventListener("click", () => {
            applyCurrentView();
        });
    }

    if (resetFiltersBtn) {
        resetFiltersBtn.addEventListener("click", () => {
            currentType = "all";
            currentGenre = "all";
            currentRating = "all";
            currentSort = "date";

            const typeAll = document.querySelector('input[name="bookmarkType"][value="all"]');
            const genreAll = document.querySelector('input[name="bookmarkGenre"][value="all"]');

            if (typeAll) typeAll.checked = true;
            if (genreAll) genreAll.checked = true;
            if (ratingFilterSelect) ratingFilterSelect.value = "all";
            if (sortSelect) sortSelect.value = "date";

            applyCurrentView();
        });
    }
}

setupProfileButton();
setupFilters();
loadBookmarks();