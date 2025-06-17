// Skrypt diagnostyczny dla przycisku "Dodaj aplikację"
console.log('🔍 Uruchamiam diagnozę przycisku "Dodaj aplikację"...');

// Funkcja diagnostyczna
function diagnoseAddAppButton() {
    console.log('=== DIAGNOZA PRZYCISKU DODAJ APLIKACJĘ ===');

    // 1. Sprawdź status uwierzytelnienia
    const user = window.auth?.currentUser;
    console.log('Status uwierzytelnienia:', user ? `Zalogowany: ${user.email}` : 'Nie zalogowany');

    // 2. Sprawdź widoczność sekcji
    const loadingOverlay = document.getElementById('loadingOverlay');
    const landingPage = document.getElementById('landingPage');
    const mainContent = document.getElementById('mainContent');

    console.log('Widoczność sekcji:');
    console.log('- Loading overlay:', loadingOverlay ? getComputedStyle(loadingOverlay).display : 'nie znaleziono');
    console.log('- Landing page:', landingPage ? getComputedStyle(landingPage).display : 'nie znaleziono');
    console.log('- Main content:', mainContent ? getComputedStyle(mainContent).display : 'nie znaleziono');

    // 3. Sprawdź przycisk "Dodaj aplikację"
    const addBtn = document.getElementById('openAddAppModal');
    console.log('Przycisk "Dodaj aplikację":');
    console.log('- Element:', addBtn ? 'znaleziony' : 'NIE ZNALEZIONY');
    if (addBtn) {
        console.log('- Widoczny:', getComputedStyle(addBtn).display !== 'none');
        console.log('- Onclick handler:', addBtn.onclick ? 'ustawiony' : 'BRAK');
        console.log('- Parent widoczny:', addBtn.parentElement ? getComputedStyle(addBtn.parentElement).display : 'brak parent');
    }

    // 4. Sprawdź modal
    const modal = document.getElementById('addAppModal');
    console.log('Modal dodawania:');
    console.log('- Element:', modal ? 'znaleziony' : 'NIE ZNALEZIONY');
    if (modal) {
        console.log('- Display:', getComputedStyle(modal).display);
        console.log('- Classes:', modal.className);
    }

    console.log('=== KONIEC DIAGNOZY ===');

    // Zwróć wyniki
    return {
        userLoggedIn: !!user,
        loadingVisible: loadingOverlay ? getComputedStyle(loadingOverlay).display !== 'none' : false,
        mainContentVisible: mainContent ? getComputedStyle(mainContent).display !== 'none' : false,
        addButtonExists: !!addBtn,
        addButtonVisible: addBtn ? getComputedStyle(addBtn).display !== 'none' : false,
        modalExists: !!modal
    };
}

// Funkcja naprawcza
function fixAddAppButton() {
    console.log('=== NAPRAWIANIE PRZYCISKU DODAJ APLIKACJĘ ===');

    // 1. Ukryj loading overlay jeśli blokuje
    const loadingOverlay = document.getElementById('loadingOverlay');
    if (loadingOverlay && getComputedStyle(loadingOverlay).display !== 'none') {
        console.log('Ukrywanie loading overlay...');
        loadingOverlay.style.display = 'none';
    }

    // 2. Pokaż główną treść jeśli użytkownik jest zalogowany
    const user = window.auth?.currentUser;
    if (user) {
        console.log('Użytkownik zalogowany - pokazuję główną treść...');
        const landingPage = document.getElementById('landingPage');
        const mainContent = document.getElementById('mainContent');

        if (landingPage) landingPage.style.display = 'none';
        if (mainContent) {
            mainContent.style.display = 'block';
            mainContent.style.opacity = '1';
        }
    } else {
        console.log('Użytkownik niezalogowany - pokazuję stronę powitalną...');
        const landingPage = document.getElementById('landingPage');
        const mainContent = document.getElementById('mainContent');

        if (mainContent) mainContent.style.display = 'none';
        if (landingPage) {
            landingPage.style.display = 'block';
            landingPage.style.opacity = '1';
        }
    }

    // 3. Sprawdź i napraw przycisk
    const addBtn = document.getElementById('openAddAppModal');
    if (addBtn && !addBtn.onclick) {
        console.log('Dodaję handler do przycisku...');
        addBtn.onclick = function () {
            console.log('Przycisk kliknięty!');
            if (window.auth?.currentUser) {
                if (typeof openAddAppModal === 'function') {
                    openAddAppModal();
                } else {
                    console.error('Funkcja openAddAppModal nie istnieje!');
                    // Fallback - otwórz bezpośrednio modal
                    const modal = document.getElementById('addAppModal');
                    if (modal) {
                        modal.classList.add('active');
                    }
                }
            } else {
                alert('Musisz być zalogowany, aby dodać aplikację. Kliknij "Zaloguj" w prawym górnym rogu.');
            }
        };
    }

    console.log('=== NAPRAWIONO ===');

    // Uruchom ponowną diagnozę
    setTimeout(() => {
        diagnoseAddAppButton();
    }, 500);
}

// Uruchom diagnozę po załadowaniu strony
if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', () => {
        setTimeout(diagnoseAddAppButton, 1000);
    });
} else {
    setTimeout(diagnoseAddAppButton, 1000);
}

// Udostępnij funkcje globalnie
window.diagnoseAddAppButton = diagnoseAddAppButton;
window.fixAddAppButton = fixAddAppButton;
