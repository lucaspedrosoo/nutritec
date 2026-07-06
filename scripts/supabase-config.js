const SUPABASE_URL = 'https://hkxtbqhbohtuqtpeleys.supabase.co';
const SUPABASE_ANON_KEY = 'sb_publishable_00N4hoDp3-ex8TcNCucs_A_HkzbmMqz';

let supabaseClient = null;
let currentSessionUser = null;

function isSupabaseConfigured() {
    return SUPABASE_URL
        && SUPABASE_ANON_KEY
        && !SUPABASE_URL.includes('YOUR-PROJECT-REF')
        && !SUPABASE_ANON_KEY.includes('YOUR_SUPABASE_ANON_KEY');
}

function getSupabaseClient() {
    if (!window.supabase || !isSupabaseConfigured()) {
        return null;
    }

    if (!supabaseClient) {
        supabaseClient = window.supabase.createClient(SUPABASE_URL, SUPABASE_ANON_KEY);
    }

    return supabaseClient;
}

function getAuthState() {
    return Boolean(currentSessionUser);
}

function getAuthEmail() {
    return currentSessionUser?.email || '';
}

function getAuthUserId() {
    return currentSessionUser?.id || '';
}

function setAuthState(isLoggedIn) {
    if (!isLoggedIn) {
        currentSessionUser = null;
    }

    if (typeof window.renderProfileMenu === 'function') {
        window.renderProfileMenu();
    }
}

function setAuthSession(userId, email) {
    currentSessionUser = {
        id: userId || '',
        email: email || ''
    };
    setAuthState(true);
}

function clearAuthSession() {
    currentSessionUser = null;
    setAuthState(false);
}

function getStoredBodyMetrics(userId) {
    return null;
}

function getStoredProfileData(userId) {
    return null;
}

function saveProfileData(profileData, userId) {
    return profileData;
}

function saveBodyMetricsCache(bodyMetrics, userId) {
    return bodyMetrics;
}

function calculateImcDetails(peso, altura) {
    const imc = peso / (altura * altura);

    if (imc < 18.5) {
        return {
            imc: Number(imc.toFixed(1)),
            classificacao: 'Abaixo do Peso Recomendado'
        };
    }

    if (imc < 25) {
        return {
            imc: Number(imc.toFixed(1)),
            classificacao: 'Biotipo Ideal e Saudável'
        };
    }

    if (imc < 30) {
        return {
            imc: Number(imc.toFixed(1)),
            classificacao: 'Indicação de Sobrepeso'
        };
    }

    return {
        imc: Number(imc.toFixed(1)),
        classificacao: 'Alerta de Obesidade'
    };
}

async function getSupabaseUser() {
    const client = getSupabaseClient();

    if (!client) {
        return null;
    }

    const { data, error } = await client.auth.getUser();

    if (error || !data.user) {
        return null;
    }

    return data.user;
}

async function syncAuthFromSupabase() {
    const client = getSupabaseClient();

    if (!client) {
        return;
    }

    const { data, error } = await client.auth.getSession();

    if (error || !data.session) {
        clearAuthSession();
        return;
    }

    const sessionEmail = data.session.user?.email || '';

    if (sessionEmail) {
        setAuthSession(data.session.user?.id || '', sessionEmail);
    }
}

window.isSupabaseConfigured = isSupabaseConfigured;
window.getSupabaseClient = getSupabaseClient;
window.getAuthState = getAuthState;
window.getAuthEmail = getAuthEmail;
window.getAuthUserId = getAuthUserId;
window.setAuthState = setAuthState;
window.setAuthSession = setAuthSession;
window.clearAuthSession = clearAuthSession;
window.getStoredBodyMetrics = getStoredBodyMetrics;
window.getStoredProfileData = getStoredProfileData;
window.saveProfileData = saveProfileData;
window.saveBodyMetricsCache = saveBodyMetricsCache;
window.calculateImcDetails = calculateImcDetails;
window.getSupabaseUser = getSupabaseUser;
window.syncAuthFromSupabase = syncAuthFromSupabase;
