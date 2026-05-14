const USERS_URL = "https://localhost:7241/api/users";

const userListGrid = document.getElementById("userListGrid");
const listCount = document.getElementById("listCount");
const listUserName = document.getElementById("listUserName");
const listUserSubtext = document.getElementById("listUserSubtext");
const listAvatar = document.getElementById("listAvatar");
const applyListFiltersBtn = document.getElementById("applyListFiltersBtn");
const resetListFiltersBtn = document.getElementById("resetListFiltersBtn");

const listYearFromInput = document.getElementById("listYearFromInput");
const listYearToInput = document.getElementById("listYearToInput");

const totalCount = document.getElementById("totalCount");
const watchingCount = document.getElementById("watchingCount");
const completedCount = document.getElementById("completedCount");
const plannedCount = document.getElementById("plannedCount");
const droppedCount = document.getElementById("droppedCount");

const LIST_STATUSES = [
    "Смотрю",
    "Запланировано",
    "Просмотрено",
    "Брошено",
    "Отложено",
    "Пересматриваю"
];

let userList = [];
let currentStatus = "all";
let currentType = "all";
let currentGenres = [];
let currentRating = "all";
let currentYearFrom = 1950;
let currentYearTo = 2026;
let currentSort = "updated";

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
        window.location.href = "../pages/login.html";
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
            window.location.href = "../pages/login.html";
            return;
        }

        window.location.href = "profile.html";
    });
}

function escapeHtml(value) {
    return String(value ?? "")
        .replaceAll("&", "&amp;")
        .replaceAll("<", "&lt;")
        .replaceAll(">", "&gt;")
        .replaceAll('"', "&quot;")
        .replaceAll("'", "&#039;");
}

function getAnimeTitle(item) {
    return item.titleRu || item.title || item.titleOriginal || "Без названия";
}

function getAnimePoster(item) {
    return getPosterUrl(item.posterUrl);
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

function getStatusClass(status) {
    if (status === "Смотрю") return "status-watching";
    if (status === "Запланировано") return "status-planned";
    if (status === "Просмотрено") return "status-completed";
    if (status === "Брошено") return "status-dropped";
    if (status === "Отложено") return "status-paused";
    if (status === "Пересматриваю") return "status-rewatching";

    return "";
}

function setupUserInfo() {
    const user = getCurrentUser();
    const name = user?.nickname || user?.email || "Пользователь";

    if (listUserName) listUserName.textContent = name;
    if (listUserSubtext) listUserSubtext.textContent = "Личный трекер просмотра";
    if (listAvatar) listAvatar.textContent = name.trim().charAt(0).toUpperCase() || "A";
}

function getItemGenres(item) {
    if (Array.isArray(item.genres)) return item.genres;

    if (typeof item.genre === "string") {
        return [item.genre];
    }

    if (typeof item.genres === "string") {
        return item.genres.split(",").map(genre => genre.trim());
    }

    return [];
}

function getFilteredList() {
    return userList
        .filter(item => {
            const statusMatches =
                currentStatus === "all" ||
                item.status === currentStatus;

            const typeMatches =
                currentType === "all" ||
                String(item.type || "").toLowerCase().includes(currentType.toLowerCase());

            const itemGenres = getItemGenres(item);

            const genreMatches =
                currentGenres.length === 0 ||
                currentGenres.some(selectedGenre =>
                    itemGenres.some(itemGenre =>
                        itemGenre.toLowerCase() === selectedGenre.toLowerCase()
                    )
                );

            const ratingMatches =
                currentRating === "all" ||
                Number(item.averageRating || 0) >= Number(currentRating);

            const year = Number(item.releaseYear || 0);

            const yearMatches =
                !year ||
                (year >= currentYearFrom && year <= currentYearTo);

            return statusMatches && typeMatches && genreMatches && ratingMatches && yearMatches;
        })
        .sort((a, b) => {
            if (currentSort === "title") {
                return getAnimeTitle(a).localeCompare(getAnimeTitle(b), "ru");
            }

            if (currentSort === "rating") {
                return Number(b.averageRating || 0) - Number(a.averageRating || 0);
            }

            if (currentSort === "score") {
                return Number(b.score || 0) - Number(a.score || 0);
            }

            if (currentSort === "year") {
                return Number(b.releaseYear || 0) - Number(a.releaseYear || 0);
            }

            return new Date(b.updatedAt || 0) - new Date(a.updatedAt || 0);
        });
}

function updateStats() {
    if (totalCount) totalCount.textContent = userList.length;
    if (watchingCount) watchingCount.textContent = userList.filter(item => item.status === "Смотрю").length;
    if (completedCount) completedCount.textContent = userList.filter(item => item.status === "Просмотрено").length;
    if (plannedCount) plannedCount.textContent = userList.filter(item => item.status === "Запланировано").length;
    if (droppedCount) droppedCount.textContent = userList.filter(item => item.status === "Брошено").length;
}

function createStatusOptions(selectedStatus) {
    return LIST_STATUSES.map(status => `
        <option value="${escapeHtml(status)}" ${status === selectedStatus ? "selected" : ""}>
            ${escapeHtml(status)}
        </option>
    `).join("");
}

function renderUserList() {
    const filteredList = getFilteredList();
    updateStats();

    if (!userList.length) {
        listCount.textContent = "В списке пока нет аниме";
        userListGrid.innerHTML = `
            <div class="empty-state glass">
                <h2>Список пока пуст</h2>
                <p>Откройте страницу аниме и добавьте его в личный список.</p>
                <a class="primary-btn" href="index.html">Перейти к каталогу</a>
            </div>
        `;
        return;
    }

    if (!filteredList.length) {
        listCount.textContent = "По выбранным условиям ничего не найдено";
        userListGrid.innerHTML = `
            <div class="empty-state glass">
                <h2>Ничего не найдено</h2>
                <p>Попробуйте другой статус или поиск.</p>
            </div>
        `;
        return;
    }

    listCount.textContent = `Показано: ${filteredList.length} из ${userList.length}`;

    userListGrid.innerHTML = filteredList.map(item => {
        const fallbackPoster = "../images/no-poster.jpg";
        const poster = getAnimePoster(item);
        const title = getAnimeTitle(item);
        const original = item.titleOriginal && item.titleOriginal !== title
            ? item.titleOriginal
            : "";

        const statusClass = getStatusClass(item.status);
        const score = item.score ?? "—";
        const rating = item.averageRating ?? "—";

        return `
            <article class="tracking-row glass" data-anime-id="${item.animeId}">
                <div class="tracking-anime-main">
                    <img
                        src="${escapeHtml(poster)}"
                        alt="${escapeHtml(title)}"
                        onerror="this.onerror=null; this.src='${fallbackPoster}';"
                    >

                    <div class="tracking-anime-text">
                        <h3>${escapeHtml(title)}</h3>
                        <p>${escapeHtml(original)}</p>

                        <div class="tracking-meta">
                            <span>${item.releaseYear || "—"}</span>
                            <span>•</span>
                            <span>${escapeHtml(item.type || "TV Сериал")}</span>
                            <span>•</span>
                            <span>${item.episodesTotal || "—"} серий</span>
                        </div>
                    </div>
                </div>

                <div class="tracking-row-status">
                    <span class="status-badge ${statusClass}">${escapeHtml(item.status)}</span>
                    <select class="tracking-status-select" data-anime-id="${item.animeId}">
                        ${createStatusOptions(item.status)}
                    </select>
                </div>

                <div class="tracking-row-info">
                    <span>Рейтинг</span>
                    <strong>★ ${rating}</strong>
                </div>

                <div class="tracking-row-info">
                    <span>Моя оценка</span>
                    <strong>${score}</strong>
                </div>

                <div class="tracking-row-actions">
                    <button type="button" class="edit-list-btn" data-anime-id="${item.animeId}">
                        Изменить
                    </button>

                    <button type="button" class="remove-list-btn" data-anime-id="${item.animeId}">
                        Удалить
                    </button>
                </div>
            </article>
        `;
    }).join("");
}

async function loadUserList() {
    if (!requireAuth()) return;

    const userId = getCurrentUserId();

    try {
        const response = await fetch(`${USERS_URL}/${userId}/list`);

        if (!response.ok) {
            throw new Error("Не удалось загрузить личный список");
        }

        userList = await response.json();
        renderUserList();
    } catch (error) {
        listCount.textContent = "Ошибка загрузки";
        userListGrid.innerHTML = `<p class="error-text">${escapeHtml(error.message)}</p>`;
    }
}

async function updateListStatus(animeId, status) {
    const userId = getCurrentUserId();
    const item = userList.find(listItem => Number(listItem.animeId) === Number(animeId));

    if (!userId || !item) return;

    try {
        const response = await fetch(`${USERS_URL}/${userId}/list/${animeId}`, {
            method: "PUT",
            headers: {
                "Content-Type": "application/json"
            },
            body: JSON.stringify({
                status,
                score: item.score ?? null
            })
        });

        const data = await response.json().catch(() => null);

        if (!response.ok) {
            throw new Error(data?.message || "Не удалось обновить статус");
        }

        item.status = status;
        item.updatedAt = new Date().toISOString();
        renderUserList();
    } catch (error) {
        alert(error.message || "Ошибка обновления статуса");
        renderUserList();
    }
}

async function removeFromList(animeId) {
    const userId = getCurrentUserId();

    if (!userId) return;

    const confirmed = confirm("Удалить аниме из списка?");
    if (!confirmed) return;

    try {
        const response = await fetch(`${USERS_URL}/${userId}/list/${animeId}`, {
            method: "DELETE"
        });

        const data = await response.json().catch(() => null);

        if (!response.ok) {
            throw new Error(data?.message || "Не удалось удалить аниме из списка");
        }

        userList = userList.filter(item => Number(item.animeId) !== Number(animeId));
        renderUserList();
    } catch (error) {
        alert(error.message || "Ошибка удаления из списка");
    }
}

function syncStatusControls(status) {
    document.querySelectorAll(".tracking-tab").forEach(button => {
        button.classList.toggle("active", button.dataset.status === status);
    });

    document.querySelectorAll(".status-radio").forEach(input => {
        input.checked = input.value === status;
    });
}

function setCurrentStatus(status) {
    currentStatus = status;
    syncStatusControls(status);
    renderUserList();
}

function setupListEvents() {
    document.querySelectorAll(".tracking-tab").forEach(button => {
        button.addEventListener("click", () => {
            setCurrentStatus(button.dataset.status);
        });
    });
    document.querySelectorAll('input[name="listType"]').forEach(input => {
    input.addEventListener("change", () => {
        const checkedTypes = Array.from(document.querySelectorAll('input[name="listType"]:checked'))
            .map(item => item.value);

        currentType = checkedTypes.length > 0 ? checkedTypes[0] : "all";
    });
});

document.querySelectorAll('input[name="listGenre"]').forEach(input => {
    input.addEventListener("change", () => {
        currentGenres = Array.from(document.querySelectorAll('input[name="listGenre"]:checked'))
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

if (applyListFiltersBtn) {
    applyListFiltersBtn.addEventListener("click", () => {
        currentYearFrom = Number(listYearFromInput?.value || 1950);
        currentYearTo = Number(listYearToInput?.value || 2026);

        renderUserList();
    });
}

if (resetListFiltersBtn) {
    resetListFiltersBtn.addEventListener("click", () => {
        currentStatus = "all";
        currentType = "all";
        currentGenres = [];
        currentRating = "all";
        currentYearFrom = 1950;
        currentYearTo = 2026;
        currentSort = "updated";

        document.querySelectorAll('input[name="listType"]').forEach(input => {
            input.checked = input.value === "TV Сериал";
        });

        document.querySelectorAll('input[name="listGenre"]').forEach(input => {
            input.checked = false;
        });

        document.querySelectorAll(".filter-chip").forEach(button => {
            button.classList.remove("active");
        });

        if (listYearFromInput) listYearFromInput.value = "1950";
        if (listYearToInput) listYearToInput.value = "2026";

        syncStatusControls("all");
        renderUserList();
    });
}

    userListGrid.addEventListener("change", event => {
        const select = event.target.closest(".tracking-status-select");

        if (!select) return;

        updateListStatus(select.dataset.animeId, select.value);
    });

    userListGrid.addEventListener("click", event => {
        const removeButton = event.target.closest(".remove-list-btn");
        const editButton = event.target.closest(".edit-list-btn");
        const row = event.target.closest(".tracking-row");

        if (removeButton) {
            removeFromList(removeButton.dataset.animeId);
            return;
        }

        if (editButton) {
            const select = row?.querySelector(".tracking-status-select");
            if (select) select.focus();
            return;
        }

        if (row && !event.target.closest("select") && !event.target.closest("button")) {
            window.location.href = `../pages/anime.html?id=${row.dataset.animeId}`;
        }
    });
}

setupProfileButton();
setupUserInfo();
setupListEvents();
loadUserList();