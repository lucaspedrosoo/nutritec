function filtrarReceitas(categoria) {
    const botoes = document.querySelectorAll('.btn-filter');
    botoes.forEach(btn => btn.classList.remove('active'));

    if (window.event && window.event.currentTarget) {
        window.event.currentTarget.classList.add('active');
    }

    const cards = document.querySelectorAll('.item-receita');
    cards.forEach(card => {
        if (categoria === 'todos' || card.getAttribute('data-cat') === categoria) {
            card.style.display = 'block';
        } else {
            card.style.display = 'none';
        }
    });
}

function filtrarExercicios(categoria) {
    const botoes = document.querySelectorAll('.btn-filter-ex');
    botoes.forEach(btn => btn.classList.remove('active'));

    if (window.event && window.event.currentTarget) {
        window.event.currentTarget.classList.add('active');
    }

    const cards = document.querySelectorAll('.item-exercicio');
    cards.forEach(card => {
        if (categoria === 'todos' || card.getAttribute('data-cat') === categoria) {
            card.style.display = 'block';
        } else {
            card.style.display = 'none';
        }
    });
}

function renderProfileMenu() {
    const isLoggedIn = window.getAuthState();
    const dropdown = document.getElementById('profile-dropdown');
    const actionButton = document.getElementById('profile-auth-action');
    const buttonLabel = document.getElementById('profile-button-label');
    const profileLink = document.querySelector('[data-action="perfil"]');

    if (!dropdown || !actionButton || !buttonLabel || !profileLink) {
        return;
    }

    actionButton.textContent = isLoggedIn ? 'Sair' : 'Entrar';
    buttonLabel.textContent = isLoggedIn ? 'Minha Conta' : 'Conta';
    profileLink.setAttribute('href', isLoggedIn ? 'profile.html' : 'login.html');
}

function toggleProfileMenu(forceOpen) {
    const dropdown = document.getElementById('profile-dropdown');
    const toggleButton = document.getElementById('profile-toggle');

    if (!dropdown || !toggleButton) {
        return;
    }

    const shouldOpen = typeof forceOpen === 'boolean' ? forceOpen : dropdown.classList.contains('hidden');
    dropdown.classList.toggle('hidden', !shouldOpen);
    toggleButton.setAttribute('aria-expanded', String(shouldOpen));
}

function setupProfileMenu() {
    const toggleButton = document.getElementById('profile-toggle');
    const authAction = document.getElementById('profile-auth-action');
    const profileLink = document.querySelector('[data-action="perfil"]');

    if (!toggleButton || !authAction || !profileLink) {
        return;
    }

    toggleButton.addEventListener('click', function (event) {
        event.stopPropagation();
        toggleProfileMenu();
    });

    authAction.addEventListener('click', function (event) {
        event.preventDefault();
        const isLoggedIn = window.getAuthState();

        if (isLoggedIn) {
            const client = window.getSupabaseClient();

            if (client) {
                client.auth.signOut().finally(function () {
                    window.clearAuthSession();
                    window.location.href = 'login.html';
                });
                return;
            }

            window.clearAuthSession();
            window.location.href = 'login.html';
            return;
        }

        window.location.href = 'login.html';
    });

    profileLink.addEventListener('click', function (event) {
        event.preventDefault();
        if (window.getAuthState()) {
            window.location.href = 'profile.html';
        } else {
            window.location.href = 'login.html';
        }
    });

    document.addEventListener('click', function (event) {
        const profileMenu = document.querySelector('.profile-menu');

        if (profileMenu && !profileMenu.contains(event.target)) {
            toggleProfileMenu(false);
        }
    });

    document.addEventListener('keydown', function (event) {
        if (event.key === 'Escape') {
            toggleProfileMenu(false);
        }
    });

    renderProfileMenu();
}

window.filtrarReceitas = filtrarReceitas;
window.filtrarExercicios = filtrarExercicios;
window.renderProfileMenu = renderProfileMenu;
window.toggleProfileMenu = toggleProfileMenu;
window.setupProfileMenu = setupProfileMenu;
