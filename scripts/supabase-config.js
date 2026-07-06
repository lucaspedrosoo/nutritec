const PROFILE_STORAGE_KEY = 'nutritec-auth-state';
const AUTH_USER_ID_KEY = 'nutritec-auth-user-id';
const AUTH_EMAIL_KEY = 'nutritec-auth-email';
const PROFILE_DATA_KEY = 'nutritec-profile-data';
const BODY_METRICS_KEY = 'nutritec-body-metrics';
const SUPABASE_URL = 'https://hkxtbqhbohtuqtpeleys.supabase.co';
const SUPABASE_ANON_KEY = 'sb_publishable_00N4hoDp3-ex8TcNCucs_A_HkzbmMqz';

let supabaseClient = null;

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
    return localStorage.getItem(PROFILE_STORAGE_KEY) === 'logged-in';
}

function getAuthEmail() {
    return localStorage.getItem(AUTH_EMAIL_KEY) || '';
}

function getAuthUserId() {
    return localStorage.getItem(AUTH_USER_ID_KEY) || '';
}

function getProfileStorageKey(userId) {
    const resolvedUserId = userId || getAuthUserId() || getAuthEmail() || 'anonymous';
    return `${PROFILE_DATA_KEY}:${resolvedUserId}`;
}

function getBodyMetricsStorageKey(userId) {
    const resolvedUserId = userId || getAuthUserId() || getAuthEmail() || 'anonymous';
    return `${BODY_METRICS_KEY}:${resolvedUserId}`;
}

function setAuthState(isLoggedIn) {
    localStorage.setItem(PROFILE_STORAGE_KEY, isLoggedIn ? 'logged-in' : 'logged-out');

    if (typeof window.renderProfileMenu === 'function') {
        window.renderProfileMenu();
    }
}

function setAuthSession(userId, email) {
    if (userId) {
        localStorage.setItem(AUTH_USER_ID_KEY, userId);
    }

    localStorage.setItem(AUTH_EMAIL_KEY, email);
    setAuthState(true);
}

function clearAuthSession() {
    localStorage.removeItem(AUTH_USER_ID_KEY);
    localStorage.removeItem(AUTH_EMAIL_KEY);
    setAuthState(false);
}

function getStoredBodyMetrics(userId) {
    const rawMetrics = localStorage.getItem(getBodyMetricsStorageKey(userId));

    if (!rawMetrics) {
        return null;
    }

    try {
        return JSON.parse(rawMetrics);
    } catch (error) {
        return null;
    }
}

function getStoredProfileData(userId) {
    const rawProfileData = localStorage.getItem(getProfileStorageKey(userId));

    if (!rawProfileData) {
        return null;
    }

    try {
        return JSON.parse(rawProfileData);
    } catch (error) {
        return null;
    }
}

function saveProfileData(profileData, userId) {
    localStorage.setItem(getProfileStorageKey(userId), JSON.stringify(profileData));
}

function saveBodyMetricsCache(bodyMetrics, userId) {
    localStorage.setItem(getBodyMetricsStorageKey(userId), JSON.stringify(bodyMetrics));
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
        localStorage.setItem(AUTH_USER_ID_KEY, data.session.user?.id || '');
        localStorage.setItem(AUTH_EMAIL_KEY, sessionEmail);
        setAuthState(true);
    }
}

window.isSupabaseConfigured = isSupabaseConfigured;
window.getSupabaseClient = getSupabaseClient;
window.getAuthState = getAuthState;
window.getAuthEmail = getAuthEmail;
window.getAuthUserId = getAuthUserId;
window.getProfileStorageKey = getProfileStorageKey;
window.getBodyMetricsStorageKey = getBodyMetricsStorageKey;
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
