# RekruTracker - Job Application Tracker

Prosta aplikacja ułatwiająca zarządzanie procesem rekrutacji. Projekt
korzysta z Firebase do przechowywania danych i obsługi logowania.

## 🚨 Status aplikacji

**Data:** 17 czerwca 2025  
**Status logowania Google:** ⚠️ Wymaga konfiguracji Firebase Console

### ✅ Co działa:
- Wszystkie funkcje aplikacji (dodawanie, wyświetlanie, filtry)
- Real-time synchronizacja danych
- Przycisk "Zaloguj" (przekierowanie do login.html)
- Kompletna funkcjonalność bez uwierzytelniania

### ❌ Co wymaga naprawy:
- Logowanie przez Google (błąd `auth/unauthorized-domain`)
- **Rozwiązanie:** [Zobacz instrukcję naprawy](GOOGLE_AUTH_COMPLETE_GUIDE.md)

## Uruchomienie

1. Uruchom lokalny serwer HTTP (np. `python3 -m http.server 8080`)
2. Otwórz `http://localhost:8080/index.html` w przeglądarce
3. **Dla pełnej funkcjonalności:** Skonfiguruj Firebase Console według [instrukcji](GOOGLE_AUTH_COMPLETE_GUIDE.md)

## Funkcje

* **Dodawanie aplikacji** z możliwością załączania zdjęć i walidacją formularza.
* **Real-time synchronizacja** - aplikacje pojawiają się natychmiast bez odświeżania strony.
* **Zaawansowane filtrowanie dat** - możliwość filtrowania według daty aplikowania lub daty aktualnego statusu.
* **Multi-select filtry** - możliwość wyboru wielu opcji jednocześnie dla trybu pracy, rodzaju i umowy.
* **Sortowanie według daty aplikowania** - z priorytetem ulubionych aplikacji.
* **Inteligentne filtry statusów** - szybkie filtrowanie przez kolorowe karty.
* Przeglądanie statystyk i analiz aplikacji.
* Prosty asystent AI pomagający w podsumowaniu danych.
* **Zarządzanie zdjęciami** - dodawanie, usuwanie i podgląd zdjęć aplikacji.
* **System archiwizacji** - możliwość archiwizowania i przywracania aplikacji.

## Bezpieczeństwo

* Dane wprowadzane przez użytkownika są sanitizowane przed wstawieniem do DOM.
* Zdjęcia są wyświetlane w lekkim oknie modalnym z możliwością zamknięcia klawiszem Esc.
* Miniatury wykorzystują `loading="lazy"`, a pliki są wstępnie kompresowane przed zapisem.
* Usunięto logi debugowania zawierające potencjalnie wrażliwe informacje.

Projekt nie posiada jeszcze zautomatyzowanych testów.
