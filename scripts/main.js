document.addEventListener('DOMContentLoaded', function () {
    if (typeof window.setupProfileMenu === 'function') {
        window.setupProfileMenu();
    }

    if (typeof window.setupLoginPage === 'function') {
        window.setupLoginPage();
    }

    if (typeof window.setupProfilePage === 'function') {
        window.setupProfilePage();
    }

    if (typeof window.syncAuthFromSupabase === 'function') {
        window.syncAuthFromSupabase();
    }
});
