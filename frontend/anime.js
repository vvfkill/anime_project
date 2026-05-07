const API_URL = "https://localhost:7241/api/anime";
const REVIEWS_URL = "https://localhost:7241/api/anime";
const BOOKMARKS_URL = "https://localhost:7241/api/bookmarks";

const animeDetails = document.getElementById("animeDetails");
const reviewsContainer = document.getElementById("reviewsContainer");
const ratingValue = document.getElementById("ratingValue");
const ratingSubtext = document.getElementById("ratingSubtext");

function getAnimeIdFromUrl() {
    const params = new URLSearchParams(window.location.search);
    return params.get("id");
}

function getCurrentUser() {
    const user = localStorage.getItem("authUser");
    return user ? JSON.parse(user) : null;
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

function renderAnimeTop(anime) {
    const fallbackPoster = "images/no-poster.jpg";
    const poster =
        anime.posterUrl && anime.posterUrl.trim() !== ""
            ? anime.posterUrl
            : fallbackPoster;

    animeDetails.innerHTML = `
        <div class="anime-top-layout">
            <div class="anime-poster-column">
                <img 
                    class="anime-big-poster" 
                    src="${poster}" 
                    alt="${anime.titleOriginal || anime.titleRu || "Anime poster"}"
                    onerror="this.onerror=null; this.src='${fallbackPoster}';"
                >
                <button class="primary-btn wide-btn">Смотреть трейлер</button>
            </div>

            <div class="anime-main-info">
                <div class="breadcrumbs">
                    <a href="index.html">Главная</a>
                    <span>/</span>
                    <span>${anime.titleRu || anime.titleOriginal}</span>
                </div>

                <h1>${anime.titleRu || anime.titleOriginal}</h1>
                <h3 class="original-subtitle">${anime.titleOriginal || ""}</h3>

                <div class="meta-pills">
                    <span class="pill">Год: ${anime.releaseYear ?? "—"}</span>
                    <span class="pill">Эпизоды: ${anime.episodesTotal ?? "—"}</span>
                    <span class="pill">Рейтинг: ${anime.averageRating ?? "—"}</span>
                </div>

                <p class="anime-main-description">
                    ${anime.description || "Описание отсутствует."}
                </p>

                <div class="meta-pills">
                    ${(anime.genres || []).map(g => `<span class="pill">${g}</span>`).join("")}
                    ${(anime.tags || []).map(t => `<span class="pill secondary">${t}</span>`).join("")}
                </div>

                <div class="action-buttons">
                    <button id="addToListBtn" class="primary-btn">Добавить в мой список</button>
                    <button id="addToBookmarksBtn" class="secondary-btn">В избранное</button>
                    <button id="rateAnimeBtn" class="secondary-btn">Оценить</button>
                </div>
            </div>

            <div class="anime-side-info glass">
                <h3>Информация</h3>
                <div class="info-line"><span>Студии:</span><span>${anime.studios?.join(", ") || "Нет данных"}</span></div>
                <div class="info-line"><span>Жанры:</span><span>${anime.genres?.join(", ") || "Нет данных"}</span></div>
                <div class="info-line"><span>Теги:</span><span>${anime.tags?.join(", ") || "Нет данных"}</span></div>
                <div class="info-line"><span>Год:</span><span>${anime.releaseYear ?? "—"}</span></div>
                <div class="info-line"><span>Эпизоды:</span><span>${anime.episodesTotal ?? "—"}</span></div>
            </div>
        </div>
    `;

    ratingValue.textContent = anime.averageRating ?? "—";
    ratingSubtext.textContent = anime.averageRating ? "Средний рейтинг" : "Оценок пока нет";

    setupAnimeActionButtons(anime);
}

function setupAnimeActionButtons(anime) {
    const addToListBtn = document.getElementById("addToListBtn");
    const addToBookmarksBtn = document.getElementById("addToBookmarksBtn");
    const rateAnimeBtn = document.getElementById("rateAnimeBtn");

    if (addToListBtn) {
        addToListBtn.addEventListener("click", () => {
            if (!requireAuth()) return;

            alert(`Аниме "${anime.titleRu || anime.titleOriginal}" можно добавлять в список. Следующим шагом подключим POST в API.`);
        });
    }

   if (addToBookmarksBtn) {
    const animeId = getAnimeIdFromUrl();

    checkBookmarkStatus(animeId).then(isBookmarked => {
        if (isBookmarked) {
            addToBookmarksBtn.textContent = "В закладках";
            addToBookmarksBtn.disabled = true;
        }
    });

    addToBookmarksBtn.addEventListener("click", async () => {
        if (!requireAuth()) return;

        await addToBookmarks(animeId);
    });
}

    if (rateAnimeBtn) {
        rateAnimeBtn.addEventListener("click", () => {
            if (!requireAuth()) return;

            alert(`Для "${anime.titleRu || anime.titleOriginal}" можно будет ставить оценку. Следующим шагом подключим форму и API.`);
        });
    }
}

function getCurrentUserId() {
    const user = getCurrentUser();

    if (!user) return null;

    return user.userId || user.user_id || user.id;
}

function renderReviews(reviews) {
    if (!reviews || reviews.length === 0) {
        reviewsContainer.innerHTML = "<p>Отзывов пока нет.</p>";
        return;
    }

    reviewsContainer.innerHTML = reviews.map(review => `
        <div class="review-card glass">
            <div class="review-top">
                <div>
                    <div class="review-user">${review.userNickname}</div>
                    <div class="review-score">Оценка: ${review.score}/10</div>
                </div>
            </div>
            <p class="review-text">${review.text}</p>
        </div>
    `).join("");
}

async function loadAnimeDetails() {
    const animeId = getAnimeIdFromUrl();

    if (!animeId) {
        animeDetails.innerHTML = "<p>Аниме не найдено.</p>";
        return;
    }

    try {
        const response = await fetch(`${API_URL}/${animeId}`);
        if (!response.ok) throw new Error("Не удалось загрузить аниме");

        const anime = await response.json();
        renderAnimeTop(anime);
    } catch (error) {
        animeDetails.innerHTML = `<p>Ошибка: ${error.message}</p>`;
    }
}

async function loadReviews() {
    const animeId = getAnimeIdFromUrl();

    if (!animeId) {
        reviewsContainer.innerHTML = "<p>Аниме не найдено.</p>";
        return;
    }

    try {
        const response = await fetch(`${REVIEWS_URL}/${animeId}/reviews`);
        if (!response.ok) throw new Error("Не удалось загрузить отзывы");

        const reviews = await response.json();
        renderReviews(reviews);
    } catch (error) {
        reviewsContainer.innerHTML = `<p>Ошибка: ${error.message}</p>`;
    }
}

async function checkBookmarkStatus(animeId) {
    const userId = getCurrentUserId();

    if (!userId || !animeId) return false;

    try {
        const response = await fetch(`${BOOKMARKS_URL}/check?userId=${userId}&animeId=${animeId}`);

        if (!response.ok) return false;

        const data = await response.json();
        return data.isBookmarked;
    } catch (error) {
        console.error("Ошибка проверки закладки:", error);
        return false;
    }
}

async function addToBookmarks(animeId) {
    const userId = getCurrentUserId();

    if (!userId) {
        alert("Сначала войдите в аккаунт");
        window.location.href = "login.html";
        return;
    }

    try {
        const response = await fetch(BOOKMARKS_URL, {
            method: "POST",
            headers: {
                "Content-Type": "application/json"
            },
            body: JSON.stringify({
                userId: userId,
                animeId: Number(animeId)
            })
        });

        const data = await response.json();

        if (!response.ok) {
            alert(data.message || "Не удалось добавить в закладки");
            return;
        }

        alert(data.message || "Аниме добавлено в закладки");

        const btn = document.getElementById("addToBookmarksBtn");
        if (btn) {
            btn.textContent = "В закладках";
            btn.disabled = true;
        }
    } catch (error) {
        console.error("Ошибка добавления в закладки:", error);
        alert("Ошибка соединения с сервером");
    }
}

setupProfileButton();
loadAnimeDetails();
loadReviews();