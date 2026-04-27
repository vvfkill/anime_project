const API_BASE = "https://localhost:7241/api/users";

document.addEventListener("DOMContentLoaded", () => {
    const tabLogin = document.getElementById("tabLogin");
    const tabRegister = document.getElementById("tabRegister");

    const loginForm = document.getElementById("loginForm");
    const registerForm = document.getElementById("registerForm");

    const authTitle = document.getElementById("authTitle");
    const authSubtitle = document.getElementById("authSubtitle");

    const authMessage = document.getElementById("authMessage");

    const loginPassword = document.getElementById("loginPassword");
    const registerPassword = document.getElementById("registerPassword");

    const loginTogglePassword = document.getElementById("loginTogglePassword");
    const registerTogglePassword = document.getElementById("registerTogglePassword");

    function showMessage(text, type = "error") {
        if (!authMessage) return;

        authMessage.textContent = text;
        authMessage.className = `auth-message ${type}`;
        authMessage.style.display = "block";
    }

    function clearMessage() {
        if (!authMessage) return;

        authMessage.textContent = "";
        authMessage.className = "auth-message";
        authMessage.style.display = "none";
    }

    function switchToLogin() {
        clearMessage();

        tabLogin.classList.add("active");
        tabRegister.classList.remove("active");

        loginForm.classList.remove("hidden");
        registerForm.classList.add("hidden");

        if (authTitle) authTitle.textContent = "Вход в аккаунт";
        if (authSubtitle) authSubtitle.textContent = "Добро пожаловать обратно. Продолжите отслеживать любимое аниме.";
    }

    function switchToRegister() {
        clearMessage();

        tabRegister.classList.add("active");
        tabLogin.classList.remove("active");

        registerForm.classList.remove("hidden");
        loginForm.classList.add("hidden");

        if (authTitle) authTitle.textContent = "Регистрация";
        if (authSubtitle) authSubtitle.textContent = "Создайте аккаунт и начните вести свой аниме-список.";
    }

    function togglePasswordVisibility(input) {
        if (!input) return;

        input.type = input.type === "password" ? "text" : "password";
    }

    async function handleLogin(event) {
        event.preventDefault();
        clearMessage();

        const email = document.getElementById("loginEmail")?.value.trim();
        const password = document.getElementById("loginPassword")?.value.trim();

        if (!email || !password) {
            showMessage("Заполните email и пароль.");
            return;
        }

        try {
            const response = await fetch(`${API_BASE}/login`, {
                method: "POST",
                headers: {
                    "Content-Type": "application/json"
                },
                body: JSON.stringify({
                    email,
                    password
                })
            });

            const text = await response.text();
            let data = null;

            try {
                data = text ? JSON.parse(text) : null;
            } catch {
                data = null;
            }

            if (!response.ok) {
                const errorMessage =
                    data?.message ||
                    data?.title ||
                    "Не удалось выполнить вход.";
                throw new Error(errorMessage);
            }

            localStorage.setItem("authUser", JSON.stringify({
                userId: data.userId,
                nickname: data.nickname
            }));

            showMessage("Вход выполнен успешно.", "success");

            setTimeout(() => {
                window.location.href = "index.html";
            }, 700);
        } catch (error) {
            showMessage(error.message || "Ошибка при входе.");
        }
    }

    async function handleRegister(event) {
        event.preventDefault();
        clearMessage();

        const nickname = document.getElementById("registerNickname")?.value.trim();
        const email = document.getElementById("registerEmail")?.value.trim();
        const phone = document.getElementById("registerPhone")?.value.trim();
        const password = document.getElementById("registerPassword")?.value.trim();

        if (!nickname || !email || !phone || !password) {
            showMessage("Заполните все поля регистрации.");
            return;
        }

        try {
            const response = await fetch(API_BASE, {
                method: "POST",
                headers: {
                    "Content-Type": "application/json"
                },
                body: JSON.stringify({
                    nickname,
                    email,
                    phone,
                    password
                })
            });

            const text = await response.text();
            let data = null;

            try {
                data = text ? JSON.parse(text) : null;
            } catch {
                data = null;
            }

            if (!response.ok) {
                const errorMessage =
                    data?.message ||
                    data?.title ||
                    "Не удалось зарегистрироваться.";
                throw new Error(errorMessage);
            }

            showMessage("Регистрация успешна. Теперь войдите в аккаунт.", "success");
            registerForm.reset();
            switchToLogin();
        } catch (error) {
            showMessage(error.message || "Ошибка при регистрации.");
        }
    }

    if (tabLogin) {
        tabLogin.addEventListener("click", switchToLogin);
    }

    if (tabRegister) {
        tabRegister.addEventListener("click", switchToRegister);
    }

    if (loginForm) {
        loginForm.addEventListener("submit", handleLogin);
    }

    if (registerForm) {
        registerForm.addEventListener("submit", handleRegister);
    }

    if (loginTogglePassword) {
        loginTogglePassword.addEventListener("click", () => togglePasswordVisibility(loginPassword));
    }

    if (registerTogglePassword) {
        registerTogglePassword.addEventListener("click", () => togglePasswordVisibility(registerPassword));
    }

    switchToLogin();
});