document.addEventListener("DOMContentLoaded", () => {
    const guestLinks = document.querySelectorAll('[data-auth="guest"]');
    const memberLinks = document.querySelectorAll('[data-auth="member"]');
    const logoutLinks = document.querySelectorAll('[data-auth-action="logout"]');

    function updateNavbar() {
        const token = localStorage.getItem("token");

        guestLinks.forEach((link) => {
            link.style.display = token ? "none" : "";
        });

        memberLinks.forEach((link) => {
            link.style.display = token ? "" : "none";
        });
    }

    logoutLinks.forEach((link) => {
        link.addEventListener("click", (event) => {
            event.preventDefault();
            localStorage.removeItem("token");
            updateNavbar();
            window.location.href = "login.html";
        });
    });

    updateNavbar();
});
