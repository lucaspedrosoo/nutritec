document.addEventListener('DOMContentLoaded', async function () {
    if (typeof window.syncAuthFromSupabase === 'function') {
        try {
            await window.syncAuthFromSupabase();
        } catch (error) {
            console.error('Falha ao sincronizar autenticação:', error);
        }
    }

    if (typeof window.setupProfileMenu === 'function') {
        window.setupProfileMenu();
    }

    if (typeof window.setupLoginPage === 'function') {
        window.setupLoginPage();
    }

    if (typeof window.setupProfilePage === 'function') {
        window.setupProfilePage();
    }
});
