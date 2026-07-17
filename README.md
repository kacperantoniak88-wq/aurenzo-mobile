# Aurenzo Mobile

Responsywna strona premium dla sklepu i serwisu urządzeń Apple, inspirowana rytmem luksusowych butików internetowych, ale zaprojektowana od podstaw dla marki Aurenzo Mobile.

## Uruchomienie

W Windows kliknij dwa razy `URUCHOM-STRONE.bat`. Sklep otworzy się pod adresem `http://localhost:8080`.

Możesz też uruchomić lokalny serwer ręcznie:

```bash
python3 -m http.server 8080
```

Następnie otwórz `http://localhost:8080`.

## Panel sprzedawcy

Otwórz `http://localhost:8080/admin.html` albo kliknij „Panel sprzedawcy” w stopce strony. W panelu możesz:

- dodać model wraz z maksymalnie 4 zdjęciami,
- ukryć sprzedany telefon lub ponownie go pokazać,
- usunąć telefon z katalogu,
- wyeksportować i zaimportować katalog wraz ze zdjęciami.

Bez połączenia z GitHubem panel działa jako lokalny podgląd. Po połączeniu zapisuje `data/catalog.json` i zdjęcia bezpośrednio w repozytorium, więc zmiany trafiają na GitHub Pages.

## Publikacja na GitHub Pages

1. Utwórz publiczne repozytorium i wrzuć do jego głównego katalogu zawartość folderu `aurenzo-mobile`.
2. Wejdź w `Settings → Pages`, wybierz `Deploy from a branch`, branch `main` i folder `/ (root)`.
3. Otwórz opublikowany adres zakończony `/admin.html`.
4. Utwórz token fine-grained przypisany wyłącznie do tego repozytorium. W `Repository permissions` ustaw tylko `Contents: Read and write`.
5. Wpisz właściciela repozytorium, jego nazwę, branch i token, a następnie kliknij „Połącz i wczytaj ofertę”.

Od tej chwili dodawanie, ukrywanie i usuwanie ofert wykonuje commit do repozytorium. Odświeżenie GitHub Pages może potrwać około minuty. Token nie jest zapisywany w plikach ani w trwałej pamięci przeglądarki — znika po zamknięciu karty.

Instrukcje GitHub: [publikacja z brancha](https://docs.github.com/en/pages/getting-started-with-github-pages/configuring-a-publishing-source-for-your-github-pages-site) i [token fine-grained](https://docs.github.com/en/authentication/keeping-your-account-and-data-secure/managing-your-personal-access-tokens).

## Co działa

- responsywna nawigacja i menu mobilne,
- filtrowanie kolekcji,
- karty i okno szczegółów urządzenia,
- formularz wstępnej wyceny telefonu,
- formularz zgłoszenia serwisowego,
- FAQ w formie akordeonu,
- panel zarządzania aktualną ofertą,
- animacje wejścia oraz dopracowane stany interakcji.

## Przed publikacją

1. Ustaw aktualną ofertę w panelu sprzedawcy.
2. Uzupełnij dane osoby prowadzącej działalność nierejestrowaną wymagane w sprzedaży internetowej.
3. Dodaj właściwe dokumenty: regulamin, politykę prywatności oraz zasady reklamacji i zwrotów.
4. Podepnij formularze do poczty, CRM albo własnego backendu.
5. Zweryfikuj domenę i znak towarowy Aurenzo Mobile.

Wszystkie zdjęcia wykorzystane w projekcie zostały przygotowane specjalnie dla tej strony. Nazwy Apple i iPhone są użyte informacyjnie; projekt zawiera informację o niezależności sklepu i serwisu.
