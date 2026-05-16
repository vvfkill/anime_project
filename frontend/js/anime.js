const ANIME_API_URL = "https://localhost:7241/api/anime";
const USER_LIST_API_URL = "https://localhost:7241/api/userlist";
const BOOKMARKS_API_URL = "https://localhost:7241/api/bookmarks";
const REVIEWS_API_URL = "https://localhost:7241/api/reviews";

const animeDetails = document.getElementById("animeDetails");
const reviewsContainer = document.getElementById("reviewsContainer");
const ratingValue = document.getElementById("ratingValue");
const ratingSubtext = document.getElementById("ratingSubtext");
const descriptionContainer = document.getElementById("descriptionContainer");
const writeReviewBtn = document.getElementById("writeReviewBtn");
const charactersContainer = document.getElementById("charactersContainer");

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

function getCharacterImageUrl(imageUrl) {
    const fallbackImage = "../images/no-poster.jpg";

    if (!imageUrl || String(imageUrl).trim() === "") {
        return fallbackImage;
    }

    if (imageUrl.startsWith("http")) {
        return imageUrl;
    }

    if (imageUrl.startsWith("../")) {
        return imageUrl;
    }

    if (imageUrl.startsWith("/")) {
        return `https://localhost:7241${imageUrl}`;
    }

    if (imageUrl.startsWith("images/")) {
        return `../${imageUrl}`;
    }

    return imageUrl;
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
    const rating = anime.averageRating ?? "—";

    animeDetails.innerHTML = `
        <div class="anime-hero-layout">
            <div class="anime-poster-area">
                <img
                    class="anime-main-poster"
                    src="${poster}"
                    alt="${title}"
                    onerror="this.onerror=null; this.src='${fallbackPoster}';"
                >

                <button type="button" class="trailer-btn">
                    ▶ Смотреть трейлер
                </button>
            </div>

            <div class="anime-info-area">
                <div class="breadcrumbs">
                    <a href="index.html">Главная</a>
                    <span>/</span>
                    <a href="catalog.html">Каталог</a>
                    <span>/</span>
                    <span>${title}</span>
                </div>

                <div class="anime-title-row">
                    <h1>${title}</h1>
                    <button type="button" class="small-favorite-btn">★</button>
                </div>

                <p class="anime-original-name">${anime.titleOriginal || ""}</p>

                <div class="anime-tags-row">
                    <span>${anime.type || "—"}</span>
                    <span>${anime.releaseYear || "—"}</span>
                    <span>${anime.status || "Завершён"}</span>
                    <span class="age-tag">18+</span>
                </div>

                <p class="anime-short-description">
                    ${anime.description || "Описание пока не добавлено."}
                </p>

                <div class="anime-genres-row">
                    ${genres.length
                        ? genres.map(genre => `<span>${genre}</span>`).join("")
                        : `<span>Жанры не указаны</span>`
                    }
                </div>

                <div class="anime-action-row">
                    <div class="custom-list-dropdown" id="listDropdown">
                        <button type="button" class="list-dropdown-main" id="listDropdownBtn">
                            <span class="list-plus">+</span>
                            <span id="listDropdownText">Добавить в мой список</span>
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

                    <button type="button" class="outline-action-btn" id="bookmarkBtn">
                        ♡ В избранное
                    </button>

                    <button type="button" class="outline-action-btn">
                        ☆ Оценить
                    </button>
                </div>
            </div>

            <div class="anime-rating-mini">
                <strong>★ ${rating}</strong>
                <span>Средняя оценка</span>
            </div>

            <aside class="anime-side-info">
                <div class="info-line">
                    <span>Студия:</span>
                    <strong>${anime.studio || "—"}</strong>
                </div>

                <div class="info-line">
                    <span>Режиссёр:</span>
                    <strong>${anime.director || "—"}</strong>
                </div>

                <div class="info-line">
                    <span>Автор оригинала:</span>
                    <strong>${anime.author || "—"}</strong>
                </div>

                <div class="info-line">
                    <span>Эпизоды:</span>
                    <strong>${anime.episodesTotal || "—"}</strong>
                </div>

                <div class="info-line">
                    <span>Длительность:</span>
                    <strong>${anime.duration || "24 мин."}</strong>
                </div>

                <div class="info-line">
                    <span>Статус:</span>
                    <strong>${anime.status || "Завершён"}</strong>
                </div>

                <div class="info-line">
                    <span>Жанр:</span>
                    <strong>${genres.length ? genres.join(", ") : "—"}</strong>
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

function setupAnimeTabs() {
    const tabButtons = document.querySelectorAll(".tab-btn");
    const tabContents = document.querySelectorAll(".tab-content");

    tabButtons.forEach(button => {
        button.addEventListener("click", () => {
            const tabName = button.dataset.tab;

            tabButtons.forEach(item => {
                item.classList.remove("active");
            });

            tabContents.forEach(content => {
                content.classList.remove("active");
            });

            button.classList.add("active");

            const targetTab = document.getElementById(`${tabName}Tab`);

            if (targetTab) {
                targetTab.classList.add("active");
            }
        });
    });
}

function renderDescription(anime) {
    if (!descriptionContainer) return;

    const fullDescription =
        anime.fullDescription ||
        anime.full_description ||
        anime.description ||
        "Описание пока не добавлено.";

    descriptionContainer.innerHTML = `
        <div class="anime-description-block">
            <p>${fullDescription}</p>
        </div>
    `;
}
function renderCharacters(characters) {
    if (!charactersContainer) return;

    if (!characters || characters.length === 0) {
        charactersContainer.innerHTML = `
            <div class="empty-tab-state">
                <p>Информация о персонажах пока не добавлена.</p>
            </div>
        `;
        return;
    }

    charactersContainer.innerHTML = characters.map(character => {
        const image = getCharacterImageUrl(character.imageUrl || character.image_url);
        const name = character.name || "Без имени";
        const originalName = character.nameOriginal || character.name_original || "";
        const roleType = character.roleType || character.role_type || "Персонаж";
        const description = character.description || "Описание персонажа пока не добавлено.";
        const seiyus = character.seiyus || [];

        return `
            <article class="character-card">
                <img
                    src="${image}"
                    alt="${name}"
                    onerror="this.onerror=null; this.src='../images/no-poster.jpg';"
                >

                <div class="character-card-body">
                    <div class="character-card-head">
                        <div>
                            <h3>${name}</h3>
                            <p>${originalName}</p>
                        </div>

                        <span>${roleType}</span>
                    </div>

                    <p class="character-description">
                        ${description}
                    </p>

                    <div class="character-seiyu">
                        <strong>Сэйю:</strong>
                        <span>
                            ${
                                seiyus.length
                                    ? seiyus.map(seiyu => seiyu.name).join(", ")
                                    : "Не указан"
                            }
                        </span>
                    </div>
                </div>
            </article>
        `;
    }).join("");
}

function setupWriteReviewButton() {
    if (!writeReviewBtn) return;

    writeReviewBtn.addEventListener("click", () => {
        const user = getCurrentUser();

        if (!user) {
            alert("Сначала войдите в аккаунт");
            window.location.href = "login.html";
            return;
        }

        alert("Форма написания отзыва будет добавлена следующим шагом.");
    });
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
        renderDescription(currentAnime);
        renderCharacters(currentAnime.characters);
        renderRating(currentAnime);

        const reviews = await fetchReviewsByAnime(animeId);
        renderReviews(reviews);

        setupWriteReviewButton();
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

setupAnimeTabs();
loadAnimePage();