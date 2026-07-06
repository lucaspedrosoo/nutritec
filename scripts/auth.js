function setupLoginPage() {
    const loginForm = document.getElementById('login-form');
    const signupButton = document.getElementById('signup-button');
    const feedback = document.getElementById('login-feedback');

    if (!loginForm || !feedback) {
        return;
    }

    if (window.getAuthState()) {
        window.location.href = 'index.html';
        return;
    }

    loginForm.addEventListener('submit', function (event) {
        event.preventDefault();

        const emailInput = document.getElementById('login-email');
        const passwordInput = document.getElementById('login-password');
        const email = emailInput ? emailInput.value.trim() : '';
        const password = passwordInput ? passwordInput.value.trim() : '';

        if (!email || !password) {
            feedback.textContent = 'Preencha email e senha para continuar.';
            feedback.classList.remove('hidden');
            return;
        }

        const client = window.getSupabaseClient();

        if (!client) {
            window.setAuthSession('', email);
            feedback.textContent = 'Login local concluído. Redirecionando para a página inicial...';
            feedback.classList.remove('hidden');

            setTimeout(function () {
                window.location.href = 'index.html';
            }, 600);
            return;
        }

        feedback.textContent = 'Entrando com Supabase...';
        feedback.classList.remove('hidden');

        client.auth.signInWithPassword({
            email: email,
            password: password
        }).then(function ({ data, error }) {
            if (error || !data.session) {
                feedback.textContent = error ? error.message : 'Não foi possível autenticar.';
                feedback.classList.remove('hidden');
                return;
            }

            window.setAuthSession(data.session.user?.id || '', data.session.user?.email || email);
            window.setAuthState(true);
            feedback.textContent = 'Login realizado com sucesso. Redirecionando...';
            feedback.classList.remove('hidden');

            setTimeout(function () {
                window.location.href = 'index.html';
            }, 600);
        }).catch(function () {
            feedback.textContent = 'Erro inesperado ao tentar entrar.';
            feedback.classList.remove('hidden');
        });
    });

    if (signupButton) {
        signupButton.addEventListener('click', function () {
            const emailInput = document.getElementById('login-email');
            const passwordInput = document.getElementById('login-password');
            const email = emailInput ? emailInput.value.trim() : '';
            const password = passwordInput ? passwordInput.value.trim() : '';

            if (!email || !password) {
                feedback.textContent = 'Preencha email e senha para cadastrar.';
                feedback.classList.remove('hidden');
                return;
            }

            const client = window.getSupabaseClient();

            if (!client) {
                feedback.textContent = 'Supabase não configurado para cadastro.';
                feedback.classList.remove('hidden');
                return;
            }

            feedback.textContent = 'Cadastrando usuário...';
            feedback.classList.remove('hidden');

            client.auth.signUp({
                email: email,
                password: password
            }).then(function ({ data, error }) {
                if (error) {
                    feedback.textContent = error.message || 'Não foi possível cadastrar.';
                    feedback.classList.remove('hidden');
                    return;
                }

                if (data && data.session) {
                    window.setAuthSession(data.user?.id || '', data.user?.email || email);
                    window.setAuthState(true);
                    feedback.textContent = 'Usuário cadastrado com sucesso. Redirecionando...';
                    feedback.classList.remove('hidden');

                    setTimeout(function () {
                        window.location.href = 'index.html';
                    }, 700);
                    return;
                }

                feedback.textContent = 'Cadastro realizado. Verifique seu email para confirmar a conta.';
                feedback.classList.remove('hidden');
            }).catch(function () {
                feedback.textContent = 'Erro inesperado ao cadastrar usuário.';
                feedback.classList.remove('hidden');
            });
        });
    }
}

window.setupLoginPage = setupLoginPage;
