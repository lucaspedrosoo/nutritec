async function fetchLatestBodyMetrics(userId) {
    const client = window.getSupabaseClient();

    if (!client || !userId) {
        return null;
    }

    const { data, error } = await client
        .from('body_metrics')
        .select('*')
        .eq('user_id', userId)
        .order('created_at', { ascending: false })
        .limit(1);

    if (error || !data || data.length === 0) {
        return null;
    }

    return data[0];
}

async function saveBodyMetricsToSupabase(userId, payload) {
    const client = window.getSupabaseClient();

    if (!client || !userId) {
        return {
            success: false,
            error: { message: 'Cliente Supabase indisponível ou usuário sem sessão ativa.' }
        };
    }

    const existing = await fetchLatestBodyMetrics(userId);

    if (existing) {
        let updateQuery = client
            .from('body_metrics')
            .update(payload)
            .eq('user_id', userId);

        if (existing.id !== undefined && existing.id !== null) {
            updateQuery = updateQuery.eq('id', existing.id);
        }

        const { error } = await updateQuery;

        return { success: !error, error: error };
    }

    const { error } = await client
        .from('body_metrics')
        .insert([payload]);

    return { success: !error, error: error };
}

async function setupProfilePage() {
    const profileSummary = document.getElementById('profile-summary');
    const emailField = document.getElementById('profile-email');
    const metricsContainer = document.getElementById('profile-metrics');
    const logoutLink = document.getElementById('profile-logout-link');
    const toggleProfileDataButton = document.getElementById('profile-data-toggle');
    const profileFormSection = document.getElementById('profile-form-section');
    const profileForm = document.getElementById('profile-data-form');
    const profileFeedback = document.getElementById('profile-form-feedback');
    const clearButton = document.getElementById('profile-data-clear');
    const closeButton = document.getElementById('profile-data-close');
    const client = window.getSupabaseClient();
    let currentUserId = null;
    let metrics = null;
    let profileData = null;

    if (!profileSummary || !emailField || !metricsContainer) {
        return;
    }

    if (!window.getAuthState()) {
        window.location.href = 'login.html';
        return;
    }

    if (client) {
        const user = await window.getSupabaseUser();

        if (!user) {
            window.clearAuthSession();
            window.location.href = 'login.html';
            return;
        }

        currentUserId = user.id;
        localStorage.setItem('nutritec-auth-email', user.email || '');
        localStorage.setItem('nutritec-auth-user-id', user.id || '');
        window.setAuthState(true);

        metrics = window.getStoredBodyMetrics(currentUserId);
        profileData = window.getStoredProfileData(currentUserId);

        const dbMetrics = await fetchLatestBodyMetrics(currentUserId);

        if (dbMetrics) {
            metrics = {
                peso: Number(dbMetrics.peso),
                altura: Number(dbMetrics.altura),
                imc: Number(dbMetrics.imc),
                classificacao: dbMetrics.classificacao,
                dataAtualizacao: dbMetrics.created_at
            };

            profileData = {
                peso: dbMetrics.peso ? String(dbMetrics.peso) : '',
                altura: dbMetrics.altura ? String(dbMetrics.altura) : '',
                cintura: dbMetrics.cintura ? String(dbMetrics.cintura) : '',
                quadril: dbMetrics.quadril ? String(dbMetrics.quadril) : '',
                objetivo: dbMetrics.objetivo || '',
                atividade: dbMetrics.atividade || '',
                ultimaAtualizacao: dbMetrics.created_at || ''
            };

            window.saveProfileData(profileData, currentUserId);
            window.saveBodyMetricsCache(metrics, currentUserId);
        }
    } else {
        const fallbackUserKey = window.getAuthUserId ? window.getAuthUserId() : '';
        metrics = window.getStoredBodyMetrics(fallbackUserKey);
        profileData = window.getStoredProfileData(fallbackUserKey);
    }

    const email = window.getAuthEmail();
    const displayEmail = email || 'usuário autenticado';

    const weightInput = document.getElementById('profile-weight');
    const heightInput = document.getElementById('profile-height');
    const waistInput = document.getElementById('profile-waist');
    const hipInput = document.getElementById('profile-hip');
    const goalInput = document.getElementById('profile-goal');
    const activityInput = document.getElementById('profile-activity');

    function renderMetricsCards() {
        const weightText = metrics && metrics.peso ? `${Number(metrics.peso).toFixed(1)} kg` : '--';
        const heightText = metrics && metrics.altura ? `${Number(metrics.altura).toFixed(2)} m` : '--';
        const bmiText = metrics && metrics.imc ? Number(metrics.imc).toFixed(1) : '--';
        const classText = metrics && metrics.classificacao ? metrics.classificacao : 'Sem cálculo recente';
        const updatedText = metrics && metrics.dataAtualizacao ? new Date(metrics.dataAtualizacao).toLocaleString('pt-BR') : 'Sem atualização recente';

        let idealWeightText = '--';
        let deltaText = '--';

        if (metrics && metrics.altura) {
            const alturaNum = Number(metrics.altura);
            const pesoNum = Number(metrics.peso);
            const pesoMinimo = 18.5 * (alturaNum * alturaNum);
            const pesoMaximo = 24.9 * (alturaNum * alturaNum);
            idealWeightText = `${pesoMinimo.toFixed(1)} kg - ${pesoMaximo.toFixed(1)} kg`;

            if (metrics.peso) {
                const pesoIdealMedio = ((pesoMinimo + pesoMaximo) / 2);
                const diferenca = Math.abs(pesoNum - pesoIdealMedio);
                const direcao = pesoNum > pesoIdealMedio ? 'acima' : 'abaixo';
                deltaText = `${diferenca.toFixed(1)} kg ${direcao} da faixa média ideal`;
            }
        }

        metricsContainer.innerHTML = `
            <article class="profile-metric-card">
                <span class="profile-metric-label">Peso atual</span>
                <strong>${weightText}</strong>
            </article>
            <article class="profile-metric-card">
                <span class="profile-metric-label">Altura atual</span>
                <strong>${heightText}</strong>
            </article>
            <article class="profile-metric-card">
                <span class="profile-metric-label">IMC</span>
                <strong>${bmiText}</strong>
            </article>
            <article class="profile-metric-card">
                <span class="profile-metric-label">Classificação</span>
                <strong>${classText}</strong>
            </article>
            <article class="profile-metric-card profile-metric-wide">
                <span class="profile-metric-label">Última atualização</span>
                <strong>${updatedText}</strong>
            </article>
            <article class="profile-metric-card">
                <span class="profile-metric-label">Faixa ideal de peso</span>
                <strong>${idealWeightText}</strong>
            </article>
            <article class="profile-metric-card">
                <span class="profile-metric-label">Distância da meta</span>
                <strong>${deltaText}</strong>
            </article>
        `;
    }

    function syncProfileFormVisibility() {
        if (!toggleProfileDataButton || !profileFormSection) {
            return;
        }

        const isOpen = !profileFormSection.classList.contains('hidden');
        toggleProfileDataButton.textContent = isOpen ? 'Fechar dados' : (profileData ? 'Editar dados' : 'Cadastrar dados');
    }

    function openProfileForm() {
        if (!profileFormSection) {
            return;
        }

        profileFormSection.classList.remove('hidden');
        syncProfileFormVisibility();

        if (weightInput) {
            setTimeout(function () {
                weightInput.focus();
            }, 50);
        }
    }

    function closeProfileForm() {
        if (!profileFormSection) {
            return;
        }

        profileFormSection.classList.add('hidden');
        syncProfileFormVisibility();
    }

    if (profileData) {
        if (weightInput) weightInput.value = profileData.peso || '';
        if (heightInput) heightInput.value = profileData.altura || '';
        if (waistInput) waistInput.value = profileData.cintura || '';
        if (hipInput) hipInput.value = profileData.quadril || '';
        if (goalInput) goalInput.value = profileData.objetivo || '';
        if (activityInput) activityInput.value = profileData.atividade || '';
    }

    if (toggleProfileDataButton) {
        toggleProfileDataButton.addEventListener('click', function () {
            if (!profileFormSection) {
                return;
            }

            if (profileFormSection.classList.contains('hidden')) {
                openProfileForm();
            } else {
                closeProfileForm();
            }
        });
    }

    if (closeButton) {
        closeButton.addEventListener('click', function () {
            closeProfileForm();
        });
    }

    if (profileForm) {
        profileForm.addEventListener('submit', async function (event) {
            event.preventDefault();

            const pesoNumero = weightInput ? Number(weightInput.value) : 0;
            const alturaNumero = heightInput ? Number(heightInput.value) : 0;
            const formData = {
                peso: weightInput ? weightInput.value.trim() : '',
                altura: heightInput ? heightInput.value.trim() : '',
                cintura: waistInput ? waistInput.value.trim() : '',
                quadril: hipInput ? hipInput.value.trim() : '',
                objetivo: goalInput ? goalInput.value : '',
                atividade: activityInput ? activityInput.value : '',
                ultimaAtualizacao: new Date().toISOString()
            };

            if (!formData.peso || !formData.altura || !formData.cintura || !formData.quadril || !formData.objetivo || !formData.atividade) {
                if (profileFeedback) {
                    profileFeedback.textContent = 'Preencha todos os dados corporais para salvar o perfil.';
                    profileFeedback.classList.remove('hidden');
                }
                return;
            }

            if (pesoNumero <= 0 || alturaNumero <= 0) {
                if (profileFeedback) {
                    profileFeedback.textContent = 'Peso e altura devem ser maiores que zero.';
                    profileFeedback.classList.remove('hidden');
                }
                return;
            }

            const imcDetails = window.calculateImcDetails(pesoNumero, alturaNumero);
            const payload = {
                user_id: currentUserId,
                peso: pesoNumero,
                altura: alturaNumero,
                cintura: Number(formData.cintura),
                quadril: Number(formData.quadril),
                imc: imcDetails.imc,
                classificacao: imcDetails.classificacao,
                objetivo: formData.objetivo,
                atividade: formData.atividade,
                created_at: new Date().toISOString()
            };

            if (client && currentUserId) {
                const saveResult = await saveBodyMetricsToSupabase(currentUserId, payload);

                if (!saveResult.success) {
                    const dbMessage = saveResult.error && saveResult.error.message
                        ? saveResult.error.message
                        : 'Erro desconhecido ao salvar.';

                    const dbHint = saveResult.error && saveResult.error.hint
                        ? ` Dica: ${saveResult.error.hint}`
                        : '';

                    console.error('Erro Supabase ao salvar body_metrics:', saveResult.error);

                    if (profileFeedback) {
                        profileFeedback.textContent = `Não foi possível salvar no Supabase: ${dbMessage}${dbHint}`;
                        profileFeedback.classList.remove('hidden');
                    }
                    return;
                }
            }

            profileData = formData;
            window.saveProfileData(formData, currentUserId);

            metrics = {
                peso: pesoNumero,
                altura: alturaNumero,
                imc: imcDetails.imc,
                classificacao: imcDetails.classificacao,
                dataAtualizacao: new Date().toISOString()
            };
            window.saveBodyMetricsCache(metrics, currentUserId);

            if (profileFeedback) {
                profileFeedback.textContent = client && currentUserId
                    ? 'Dados corporais salvos no Supabase com sucesso.'
                    : 'Dados corporais salvos localmente com sucesso.';
                profileFeedback.classList.remove('hidden');
            }

            syncProfileFormVisibility();
            renderMetricsCards();
        });
    }

    if (clearButton) {
        clearButton.addEventListener('click', function () {
            if (weightInput) weightInput.value = '';
            if (heightInput) heightInput.value = '';
            if (waistInput) waistInput.value = '';
            if (hipInput) hipInput.value = '';
            if (goalInput) goalInput.value = '';
            if (activityInput) activityInput.value = '';

            if (profileFeedback) {
                profileFeedback.textContent = 'Campos limpos. Você pode preencher novamente.';
                profileFeedback.classList.remove('hidden');
            }
        });
    }

    emailField.textContent = displayEmail;
    profileSummary.textContent = 'Aqui você acompanha o resumo corporal e pode editar suas informações de forma simples e intuitiva.';
    renderMetricsCards();

    if (logoutLink) {
        logoutLink.addEventListener('click', function (event) {
            event.preventDefault();

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
        });
    }

    syncProfileFormVisibility();
}

window.fetchLatestBodyMetrics = fetchLatestBodyMetrics;
window.saveBodyMetricsToSupabase = saveBodyMetricsToSupabase;
window.setupProfilePage = setupProfilePage;
