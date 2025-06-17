# RekruTracker - Job Application Tracker

Prosta aplikacja ułatwiająca zarządzanie procesem rekrutacji. Projekt
korzysta z Firebase do przechowywania danych i obsługi logowania.

## Uruchomienie

1. Otwórz pliki `index.html` w przeglądarce.
2. Wymagana jest konfiguracja Firebase – klucze znajdują się w kodzie, ale
   dostęp do danych ograniczają reguły bezpieczeństwa Firestore.
3. Strona główna jest dostępna publicznie. Jeśli usługi Firebase nie wczytają
   się poprawnie, aplikacja wyświetli widok startowy bez konieczności logowania.

## Funkcje

* Dodawanie aplikacji z możliwością załączania zdjęć.
* **Zaawansowane filtrowanie dat** - możliwość filtrowania według daty aplikowania lub daty aktualnego statusu.
* **Sortowanie według daty aplikowania** - z priorytetem ulubionych aplikacji.
* Przeglądanie statystyk i analiz.
* Prosty asystent AI pomagający w podsumowaniu danych.
* **Usuwanie zdjęć** - możliwość usuwania pojedynczych zdjęć z aplikacji.

## Bezpieczeństwo

* Dane wprowadzane przez użytkownika są sanitizowane przed wstawieniem do DOM.
* Zdjęcia są wyświetlane w lekkim oknie modalnym z możliwością zamknięcia klawiszem Esc.
* Miniatury wykorzystują `loading="lazy"`, a pliki są wstępnie kompresowane przed zapisem.
* Usunięto logi debugowania zawierające potencjalnie wrażliwe informacje.

Projekt nie posiada jeszcze zautomatyzowanych testów.
