const API_BASE_URL = "https://localhost:7241/api";

const profileName = document.getElementById("profileName");
const profileEmail = document.getElementById("profileEmail");
const profileDate = document.getElementById("profileDate");
const profileAvatar = document.getElementById("profileAvatar");

const totalListCount = document.getElementById("totalListCount");
const watchingCount = document.getElementById("watchingCount");
const plannedCount = document.getElementById("plannedCount");
const bookmarksCount = document.getElementById("bookmarksCount");
const averageScore = document.getElementById("averageScore");
const reviewsCount = document.getElementById("reviewsCount");

const watchingList = document.getElementById("watchingList");
const profileReviews = document.getElementById("profileReviews");
const profileBookmarks = document.getElementById("profileBookmarks");
const logoutBtn = document.getElementById("logoutBtn");

let currentUser = null;

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
    currentUser = getCurrentUser();

    if (!currentUser) {
        alert("Сначала войдите в аккаунт");
        window.location.href = "login.html";
        return false;
    }

    return true;
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

function formatDate(dateValue) {
    if (!dateValue) return "—";

    return new Date(dateValue).toLocaleDateString("ru-RU");
}

async function fetchJson(url) {
    const response = await fetch(url);

    if (!response.ok) {
        throw new Error("Ошибка загрузки данных");
    }

    return await response.json();
}

async function loadUserInfo(userId) {
    const user = await fetchJson(`${API_BASE_URL}/users/${userId}`);

    const nickname = user.nickname || currentUser.nickname || "Пользователь";
    const email = user.email || currentUser.email || "";

    profileName.textContent = nickname;
    profileEmail.textContent = email ? `@${email}` : "@user";
    profileDate.textContent = `Дата регистрации: ${formatDate(user.registrationDate)}`;
    profileAvatar.textContent = nickname.trim().charAt(0).toUpperCase() || "A";
}

async function loadUserList(userId) {
    const list = await fetchJson(`${API_BASE_URL}/users/${userId}/list`);

    totalListCount.textContent = list.length;
    watchingCount.textContent = list.filter(item => item.status === "Смотрю").length;
    plannedCount.textContent = list.filter(item => item.status === "Запланировано").length;

    const scores = list
        .map(item => item.score)
        .filter(score => score !== null && score !== undefined);

    averageScore.textContent = scores.length
        ? (scores.reduce((sum, score) => sum + Number(score), 0) / scores.length).toFixed(1)
        : "—";

    const watchingItems = list
        .filter(item => item.status === "Смотрю")
        .slice(0, 5);

    renderWatchingList(watchingItems);
}

async function loadBookmarks(userId) {
    const bookmarks = await fetchJson(`${API_BASE_URL}/bookmarks/user/${userId}`);

    bookmarksCount.textContent = bookmarks.length;
    renderBookmarks(bookmarks.slice(0, 6));
}

async function loadReviews(userId) {
    const reviews = await fetchJson(`${API_BASE_URL}/reviews`);

    const userReviews = reviews
        .filter(review => Number(review.userId) === Number(userId))
        .slice(0, 3);

    reviewsCount.textContent = reviews.filter(review => Number(review.userId) === Number(userId)).length;

    renderReviews(userReviews);
}

function renderWatchingList(items) {
    if (!items.length) {
        watchingList.innerHTML = "<p>Сейчас ничего не просматривается.</p>";
        return;
    }

    watchingList.innerHTML = items.map(item => {
        const title = item.titleRu || item.title || item.titleOriginal || "Без названия";
        const poster = getPosterUrl(item.posterUrl);

        return `
            <article class="profile-mini-item" onclick="openAnime(${item.animeId})">
                <img src="${poster}" alt="${title}" onerror="this.onerror=null; this.src='../images/no-poster.jpg';">

                <div>
                    <h3>${title}</h3>
                    <p>${item.episodesTotal || "—"} серий</p>
                    <div class="profile-progress-line">
                        <span></span>
                    </div>
                </div>

                <button type="button">Продолжить</button>
            </article>
        `;
    }).join("");
}

function renderReviews(items) {
    if (!items.length) {
        profileReviews.innerHTML = "<p>Отзывов пока нет.</p>";
        return;
    }

    profileReviews.innerHTML = items.map(review => {
        const title = review.animeTitleRu || review.animeTitleOriginal || "Без названия";

        return `
            <article class="profile-review-item" onclick="openAnime(${review.animeId})">
                <div>
                    <h3>${title} <span>★ ${review.score}</span></h3>
                    <p>${review.text || ""}</p>
                </div>

                <span>${formatDate(review.createdAt)}</span>
            </article>
        `;
    }).join("");
}

function renderBookmarks(items) {
    if (!items.length) {
        profileBookmarks.innerHTML = "<p>Закладок пока нет.</p>";
        return;
    }

    profileBookmarks.innerHTML = items.map(item => {
        const title = item.titleRu || item.titleOriginal || "Без названия";
        const poster = getPosterUrl(item.posterUrl);

        return `
            <article class="profile-bookmark-item" onclick="openAnime(${item.animeId})">
                <img src="${poster}" alt="${title}" onerror="this.onerror=null; this.src='../images/no-poster.jpg';">
                <span>${formatDate(item.createdAt)}</span>
            </article>
        `;
    }).join("");
}

function openAnime(animeId) {
    window.location.href = `anime.html?id=${animeId}`;
}

function setupLogout() {
    if (!logoutBtn) return;

    logoutBtn.addEventListener("click", () => {
        localStorage.removeItem("authUser");
        window.location.href = "login.html";
    });
}

async function initProfilePage() {
    if (!requireAuth()) return;

    const userId = getCurrentUserId();

    try {
        await Promise.all([
            loadUserInfo(userId),
            loadUserList(userId),
            loadBookmarks(userId),
            loadReviews(userId)
        ]);
    } catch (error) {
        console.error(error);
        alert("Не удалось загрузить данные профиля");
    }
}

setupLogout();
initProfilePage();