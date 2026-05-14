const USERS_URL = "https://localhost:7241/api/users";

const userListGrid = document.getElementById("userListGrid");
const listCount = document.getElementById("listCount");
const listUserName = document.getElementById("listUserName");
const listUserSubtext = document.getElementById("listUserSubtext");
const listAvatar = document.getElementById("listAvatar");
const listSearchInput = document.getElementById("listSearchInput");
const listSortSelect = document.getElementById("listSortSelect");
const resetListFiltersBtn = document.getElementById("resetListFiltersBtn");

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
let currentSearch = "";
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

        alert(`Вы вошли как ${user.nickname || user.email || "пользователь"}`);
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
    return item.posterUrl && item.posterUrl.trim() !== ""
        ? item.posterUrl
        : "../images/no-poster.jpg";
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

function getFilteredList() {
    const search = currentSearch.toLowerCase();

    return userList
        .filter(item => currentStatus === "all" || item.status === currentStatus)
        .filter(item => {
            if (!search) return true;

            const title = getAnimeTitle(item).toLowerCase();
            const original = (item.titleOriginal || "").toLowerCase();

            return title.includes(search) || original.includes(search);
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

    document.querySelectorAll(".status-radio").forEach(input => {
        input.addEventListener("change", () => {
            setCurrentStatus(input.value);
        });
    });

    if (listSearchInput) {
        listSearchInput.addEventListener("input", () => {
            currentSearch = listSearchInput.value.trim();
            renderUserList();
        });
    }

    if (listSortSelect) {
        listSortSelect.addEventListener("change", () => {
            currentSort = listSortSelect.value;
            renderUserList();
        });
    }

    if (resetListFiltersBtn) {
        resetListFiltersBtn.addEventListener("click", () => {
            currentSearch = "";
            currentSort = "updated";
            currentStatus = "all";

            if (listSearchInput) listSearchInput.value = "";
            if (listSortSelect) listSortSelect.value = "updated";

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