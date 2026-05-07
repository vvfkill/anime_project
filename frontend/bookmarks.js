const BOOKMARKS_URL = "https://localhost:7241/api/bookmarks";

const bookmarksGrid = document.getElementById("bookmarksGrid");
const bookmarksCount = document.getElementById("bookmarksCount");
const sortSelect = document.getElementById("sortSelect");

let bookmarks = [];

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

async function loadBookmarks() {
    if (!requireAuth()) return;

    const userId = getCurrentUserId();

    try {
        const response = await fetch(`${BOOKMARKS_URL}/user/${userId}`);

        if (!response.ok) {
            throw new Error("Не удалось загрузить закладки");
        }

        bookmarks = await response.json();
        renderBookmarks(bookmarks);
    } catch (error) {
        bookmarksGrid.innerHTML = `<p>Ошибка: ${error.message}</p>`;
        bookmarksCount.textContent = "Не удалось загрузить данные";
    }
}

function renderBookmarks(list) {
    if (!list || list.length === 0) {
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

    bookmarksCount.textContent = `Найдено: ${list.length}`;

    bookmarksGrid.innerHTML = list.map(item => {
        const fallbackPoster = "images/no-poster.jpg";
        const poster =
            item.posterUrl && item.posterUrl.trim() !== ""
                ? item.posterUrl
                : fallbackPoster;

        return `
            <article class="bookmark-card glass" onclick="openAnime(${item.animeId})">
                <img 
                    src="${poster}" 
                    alt="${item.titleRu || item.titleOriginal || "anime"}"
                    onerror="this.onerror=null; this.src='${fallbackPoster}';"
                >

                <div class="bookmark-info">
                    <div class="bookmark-icon">▮</div>

                    <h3>${item.titleRu || item.titleOriginal || "Без названия"}</h3>
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

function sortBookmarks(type) {
    const sorted = [...bookmarks];

    if (type === "rating") {
        sorted.sort((a, b) => (b.averageRating || 0) - (a.averageRating || 0));
    }

    if (type === "year") {
        sorted.sort((a, b) => (b.releaseYear || 0) - (a.releaseYear || 0));
    }

    if (type === "date") {
        sorted.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));
    }

    renderBookmarks(sorted);
}

if (sortSelect) {
    sortSelect.addEventListener("change", () => {
        sortBookmarks(sortSelect.value);
    });
}

setupProfileButton();
loadBookmarks();