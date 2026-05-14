const REVIEWS_API_URL = "https://localhost:7241/api/reviews";

const reviewsList = document.getElementById("reviewsList");
const reviewsCount = document.getElementById("reviewsCount");
const reviewsSortSelect = document.getElementById("reviewsSortSelect");

const reviewYearFromInput = document.getElementById("reviewYearFromInput");
const reviewYearToInput = document.getElementById("reviewYearToInput");
const applyReviewFiltersBtn = document.getElementById("applyReviewFiltersBtn");
const resetReviewFiltersBtn = document.getElementById("resetReviewFiltersBtn");

let reviews = [];

let currentType = "all";
let currentGenres = [];
let currentRating = "all";
let currentYearFrom = 1950;
let currentYearTo = 2026;
let currentSort = "date";

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

function getPosterUrl(review) {
    const fallbackPoster = "../images/no-poster.jpg";
    const poster = review.animePosterUrl;

    if (!poster || poster.trim() === "") {
        return fallbackPoster;
    }

    if (poster.startsWith("http")) return poster;
    if (poster.startsWith("../")) return poster;
    if (poster.startsWith("images/")) return `../${poster}`;

    return poster;
}

function getAnimeTitle(review) {
    return review.animeTitleRu || review.animeTitleOriginal || "Без названия";
}

function getReviewGenres(review) {
    if (Array.isArray(review.genres)) return review.genres;

    if (typeof review.genre === "string") {
        return [review.genre];
    }

    if (typeof review.genres === "string") {
        return review.genres.split(",").map(genre => genre.trim());
    }

    return [];
}

function getFilteredReviews() {
    return reviews.filter(review => {
        const typeMatches =
            currentType === "all" ||
            String(review.animeType || "").toLowerCase().includes(currentType.toLowerCase());

        const reviewGenres = getReviewGenres(review);

        const genreMatches =
            currentGenres.length === 0 ||
            currentGenres.some(selectedGenre =>
                reviewGenres.some(reviewGenre =>
                    reviewGenre.toLowerCase() === selectedGenre.toLowerCase()
                )
            );

        const ratingMatches =
            currentRating === "all" ||
            Number(review.score || 0) >= Number(currentRating);

        const year = Number(review.animeReleaseYear || 0);

        const yearMatches =
            !year ||
            (year >= currentYearFrom && year <= currentYearTo);

        return typeMatches && genreMatches && ratingMatches && yearMatches;
    });
}

function getSortedReviews(list) {
    const sorted = [...list];

    if (currentSort === "date") {
        sorted.sort((a, b) => new Date(b.createdAt || 0) - new Date(a.createdAt || 0));
    }

    if (currentSort === "score") {
        sorted.sort((a, b) => Number(b.score || 0) - Number(a.score || 0));
    }

    if (currentSort === "title") {
        sorted.sort((a, b) => getAnimeTitle(a).localeCompare(getAnimeTitle(b), "ru"));
    }

    return sorted;
}

function renderReviews() {
    const filtered = getFilteredReviews();
    const sorted = getSortedReviews(filtered);

    if (!reviews.length) {
        reviewsCount.textContent = "Отзывов пока нет";
        reviewsList.innerHTML = `
            <div class="empty-state glass">
                <h2>Отзывов пока нет</h2>
                <p>Отзывы появятся после того, как пользователи начнут их оставлять.</p>
            </div>
        `;
        return;
    }

    if (!sorted.length) {
        reviewsCount.textContent = "По выбранным фильтрам ничего не найдено";
        reviewsList.innerHTML = `
            <div class="empty-state glass">
                <h2>Ничего не найдено</h2>
                <p>Попробуйте изменить фильтры.</p>
            </div>
        `;
        return;
    }

    reviewsCount.textContent = `Найдено: ${sorted.length}`;

    reviewsList.innerHTML = sorted.map(review => {
        const title = getAnimeTitle(review);
        const poster = getPosterUrl(review);
        const date = review.createdAt
            ? new Date(review.createdAt).toLocaleDateString("ru-RU")
            : "—";

        return `
            <article class="review-feed-card glass" data-anime-id="${review.animeId}">
                <img
                    src="${poster}"
                    alt="${title}"
                    onerror="this.onerror=null; this.src='../images/no-poster.jpg';"
                >

                <div class="review-feed-body">
                    <div class="review-feed-top">
                        <div>
                            <h3>${title}</h3>
                            <p>${review.animeTitleOriginal || ""}</p>
                        </div>

                        <div class="review-feed-score">★ ${review.score}/10</div>
                    </div>

                    <div class="review-feed-meta">
                        <span>Автор: ${review.userNickname || "Пользователь"}</span>
                        <span>•</span>
                        <span>${date}</span>
                        <span>•</span>
                        <span>${review.animeReleaseYear || "—"}</span>
                    </div>

                    <p class="review-feed-text">${review.text || ""}</p>
                </div>
            </article>
        `;
    }).join("");
}

async function loadReviews() {
    try {
        reviewsList.innerHTML = "<p>Загрузка отзывов...</p>";

        const response = await fetch(REVIEWS_API_URL);

        if (!response.ok) {
            throw new Error("Не удалось загрузить отзывы");
        }

        reviews = await response.json();
        renderReviews();
    } catch (error) {
        reviewsCount.textContent = "Ошибка загрузки";
        reviewsList.innerHTML = `<p class="error-text">${error.message}</p>`;
    }
}

function setupReviewFilters() {
    document.querySelectorAll('input[name="reviewType"]').forEach(input => {
        input.addEventListener("change", () => {
            const checkedTypes = Array.from(document.querySelectorAll('input[name="reviewType"]:checked'))
                .map(item => item.value);

            currentType = checkedTypes.length > 0 ? checkedTypes[0] : "all";
        });
    });

    document.querySelectorAll('input[name="reviewGenre"]').forEach(input => {
        input.addEventListener("change", () => {
            currentGenres = Array.from(document.querySelectorAll('input[name="reviewGenre"]:checked'))
                .map(item => item.value);
        });
    });

    document.querySelectorAll(".filter-chip").forEach(button => {
        button.addEventListener("click", () => {
            document.querySelectorAll(".filter-chip").forEach(item => {
                item.classList.remove("active");
            });

            button.classList.add("active");
            currentRating = button.dataset.rating;
        });
    });

    if (reviewsSortSelect) {
        reviewsSortSelect.addEventListener("change", () => {
            currentSort = reviewsSortSelect.value;
            renderReviews();
        });
    }

    if (applyReviewFiltersBtn) {
        applyReviewFiltersBtn.addEventListener("click", () => {
            currentYearFrom = Number(reviewYearFromInput?.value || 1950);
            currentYearTo = Number(reviewYearToInput?.value || 2026);

            renderReviews();
        });
    }

    if (resetReviewFiltersBtn) {
        resetReviewFiltersBtn.addEventListener("click", () => {
            currentType = "all";
            currentGenres = [];
            currentRating = "all";
            currentYearFrom = 1950;
            currentYearTo = 2026;
            currentSort = "date";

            document.querySelectorAll('input[name="reviewType"]').forEach(input => {
                input.checked = input.value === "TV Сериал";
            });

            document.querySelectorAll('input[name="reviewGenre"]').forEach(input => {
                input.checked = false;
            });

            document.querySelectorAll(".filter-chip").forEach(button => {
                button.classList.remove("active");
            });

            if (reviewYearFromInput) reviewYearFromInput.value = "1950";
            if (reviewYearToInput) reviewYearToInput.value = "2026";
            if (reviewsSortSelect) reviewsSortSelect.value = "date";

            renderReviews();
        });
    }
}

function setupReviewCardClicks() {
    reviewsList.addEventListener("click", event => {
        const card = event.target.closest(".review-feed-card");

        if (!card) return;

        window.location.href = `anime.html?id=${card.dataset.animeId}`;
    });
}

setupProfileButton();
setupReviewFilters();
setupReviewCardClicks();
loadReviews();