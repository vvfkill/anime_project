const ANIME_API_URL = "https://localhost:7241/api/anime";
const USER_LIST_API_URL = "https://localhost:7241/api/userlist";
const BOOKMARKS_API_URL = "https://localhost:7241/api/bookmarks";
const REVIEWS_API_URL = "https://localhost:7241/api/reviews";

const animeDetails = document.getElementById("animeDetails");
const reviewsContainer = document.getElementById("reviewsContainer");
const ratingValue = document.getElementById("ratingValue");
const ratingSubtext = document.getElementById("ratingSubtext");

let currentAnime = null;

function getAnimeIdFromUrl() {
    const params = new URLSearchParams(window.location.search);
    return params.get("id");
}

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

async function fetchAnimeById(animeId) {
    const response = await fetch(`${ANIME_API_URL}/${animeId}`);

    if (!response.ok) {
        throw new Error("Не удалось загрузить аниме");
    }

    return await response.json();
}

async function fetchReviewsByAnime(animeId) {
    try {
        const response = await fetch(`${REVIEWS_API_URL}/anime/${animeId}`);

        if (!response.ok) return [];

        return await response.json();
    } catch {
        return [];
    }
}

function renderAnimeDetails(anime) {
    if (!animeDetails) return;

    const fallbackPoster = "../images/no-poster.jpg";
    const poster = getPosterUrl(anime.posterUrl);
    const title = getAnimeTitle(anime);
    const genres = getAnimeGenres(anime);

    animeDetails.innerHTML = `
        <div class="anime-top-layout">
            <div class="anime-poster-column">
                <img
                    class="anime-big-poster"
                    src="${poster}"
                    alt="${title}"
                    onerror="this.onerror=null; this.src='${fallbackPoster}';"
                >

                <div class="custom-list-dropdown" id="listDropdown">
                    <button type="button" class="list-dropdown-main" id="listDropdownBtn">
                        <span class="list-plus">+</span>
                        <span id="listDropdownText">Добавить в список</span>
                        <span class="list-arrow">›</span>
                    </button>

                    <div class="list-dropdown-menu">
                        <button type="button" data-status="Просмотрено">Просмотрено</button>
                        <button type="button" data-status="Смотрю">Смотрю</button>
                        <button type="button" data-status="Запланировано">Запланировано</button>
                        <button type="button" data-status="Брошено">Брошено</button>
                        <button type="button" data-status="Отложено">Отложено</button>
                        <button type="button" data-status="Пересматриваю">Пересматриваю</button>
                    </div>
                </div>

                <button type="button" class="secondary-btn wide-btn" id="bookmarkBtn">
                    В избранное
                </button>
            </div>

            <div class="anime-main-info">
                <div class="breadcrumbs">
                    <a href="index.html">Главная</a>
                    <span>/</span>
                    <span>${title}</span>
                </div>

                <h1>${title}</h1>
                <p class="original-subtitle">${anime.titleOriginal || ""}</p>

                <div class="meta-pills">
                    <span class="pill">Год: ${anime.releaseYear || "—"}</span>
                    <span class="pill">Эпизоды: ${anime.episodesTotal || "—"}</span>
                    <span class="pill">Рейтинг: ${anime.averageRating ?? "—"}</span>
                </div>

                <p class="anime-main-description">
                    ${anime.description || "Описание пока не добавлено."}
                </p>

                <div class="meta-pills">
                    ${genres.map(genre => `<span class="pill secondary">${genre}</span>`).join("")}
                </div>
            </div>

            <aside class="anime-side-info">
                <h3>Информация</h3>

                <div class="info-line">
                    <span>Тип</span>
                    <span>${anime.type || "—"}</span>
                </div>

                <div class="info-line">
                    <span>Год выпуска</span>
                    <span>${anime.releaseYear || "—"}</span>
                </div>

                <div class="info-line">
                    <span>Количество серий</span>
                    <span>${anime.episodesTotal || "—"}</span>
                </div>

                <div class="info-line">
                    <span>Жанры</span>
                    <span>${genres.length ? genres.join(", ") : "—"}</span>
                </div>
            </aside>
        </div>
    `;

    setupAnimeActions(anime);
}

function setupAnimeActions(anime) {
    const bookmarkBtn = document.getElementById("bookmarkBtn");
    const dropdown = document.getElementById("listDropdown");
    const dropdownBtn = document.getElementById("listDropdownBtn");
    const dropdownText = document.getElementById("listDropdownText");

    if (dropdownBtn && dropdown) {
        dropdownBtn.addEventListener("click", () => {
            dropdown.classList.toggle("open");
        });
    }

    document.querySelectorAll(".list-dropdown-menu button").forEach(button => {
        button.addEventListener("click", async () => {
            const status = button.dataset.status;

            await addAnimeToList(anime.animeId, status);

            if (dropdownText) {
                dropdownText.textContent = status;
            }

            document.querySelectorAll(".list-dropdown-menu button").forEach(item => {
                item.classList.remove("active");
            });

            button.classList.add("active");

            if (dropdown) {
                dropdown.classList.remove("open");
            }
        });
    });

    if (bookmarkBtn) {
        bookmarkBtn.addEventListener("click", async () => {
            await addAnimeToBookmarks(anime.animeId);
        });
    }

    document.addEventListener("click", event => {
        if (!dropdown) return;

        if (!dropdown.contains(event.target)) {
            dropdown.classList.remove("open");
        }
    });
}

async function addAnimeToList(animeId, status) {
    if (!requireAuth()) return;

    const userId = getCurrentUserId();

    try {
        const response = await fetch(USER_LIST_API_URL, {
            method: "POST",
            headers: {
                "Content-Type": "application/json"
            },
            body: JSON.stringify({
                userId,
                animeId,
                status
            })
        });

        if (!response.ok) {
            throw new Error("Не удалось добавить аниме в список");
        }

        alert(`Аниме добавлено в список: ${status}`);
    } catch (error) {
        alert(error.message);
    }
}

async function addAnimeToBookmarks(animeId) {
    if (!requireAuth()) return;

    const userId = getCurrentUserId();

    try {
        const response = await fetch(BOOKMARKS_API_URL, {
            method: "POST",
            headers: {
                "Content-Type": "application/json"
            },
            body: JSON.stringify({
                userId,
                animeId
            })
        });

        if (!response.ok) {
            throw new Error("Не удалось добавить аниме в закладки");
        }

        alert("Аниме добавлено в закладки");
    } catch (error) {
        alert(error.message);
    }
}

function renderReviews(reviews) {
    if (!reviewsContainer) return;

    if (!reviews || reviews.length === 0) {
        reviewsContainer.innerHTML = `<p>Отзывов пока нет.</p>`;
        return;
    }

    reviewsContainer.innerHTML = reviews.map(review => `
        <article class="review-card">
            <div class="review-user">
                ${review.nickname || review.userName || "Пользователь"}
            </div>

            <div class="review-score">
                Оценка: ★ ${review.score ?? review.rating ?? "—"}
            </div>

            <p class="review-text">
                ${review.text || review.comment || "Текст отзыва отсутствует."}
            </p>
        </article>
    `).join("");
}

function renderRating(anime) {
    if (ratingValue) {
        ratingValue.textContent = anime.averageRating ?? "—";
    }

    if (ratingSubtext) {
        ratingSubtext.textContent = "Средняя оценка";
    }
}

async function loadAnimePage() {
    const animeId = getAnimeIdFromUrl();

    if (!animeId) {
        if (animeDetails) {
            animeDetails.innerHTML = `<p>Аниме не найдено.</p>`;
        }
        return;
    }

    try {
        currentAnime = await fetchAnimeById(animeId);
        renderAnimeDetails(currentAnime);
        renderRating(currentAnime);

        const reviews = await fetchReviewsByAnime(animeId);
        renderReviews(reviews);
    } catch (error) {
        if (animeDetails) {
            animeDetails.innerHTML = `
                <div class="empty-state glass">
                    <h2>Ошибка</h2>
                    <p>${error.message}</p>
                </div>
            `;
        }

        if (reviewsContainer) {
            reviewsContainer.innerHTML = "";
        }
    }
}

loadAnimePage();