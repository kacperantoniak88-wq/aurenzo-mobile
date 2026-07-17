# Aurenzo Mobile — publikacja na GitHub Pages

## 1. Utwórz repozytorium

1. Na GitHubie kliknij `New repository`.
2. Ustaw dowolną nazwę, na przykład `aurenzo-mobile`.
3. Ustaw repozytorium jako `Public`.
4. Wrzuć **zawartość** folderu `aurenzo-mobile` do głównego katalogu repozytorium. Plik `index.html` musi znajdować się w głównym katalogu, a nie w dodatkowym podfolderze.

## 2. Włącz GitHub Pages

1. Otwórz `Settings → Pages`.
2. W sekcji `Build and deployment` wybierz `Deploy from a branch`.
3. Wybierz branch `main`, folder `/ (root)` i kliknij `Save`.
4. Po kilku minutach GitHub pokaże adres strony, na przykład `https://twoj-login.github.io/aurenzo-mobile/`.

## 3. Utwórz bezpieczny token do panelu

1. Wejdź na <https://github.com/settings/personal-access-tokens/new>.
2. Wybierz właściciela repozytorium i ustaw dostęp tylko do repozytorium ze sklepem.
3. W `Repository permissions` znajdź `Contents` i ustaw `Read and write`.
4. Nie dodawaj innych uprawnień, jeśli GitHub ich nie wymaga.
5. Ustaw datę wygaśnięcia i wygeneruj token.
6. Skopiuj token od razu — GitHub nie pokaże go ponownie.

## 4. Połącz panel

1. Otwórz adres strony z dopiskiem `admin.html`, na przykład `https://twoj-login.github.io/aurenzo-mobile/admin.html`.
2. Wpisz login GitHub jako właściciela, nazwę repozytorium, branch `main` i token.
3. Kliknij `Połącz i wczytaj ofertę`.
4. Zielona kropka oznacza aktywne połączenie.

Od tej chwili przycisk `Dodaj do aktualnej oferty` zapisuje zdjęcia w `assets/catalog/`, aktualizuje `data/catalog.json` i wykonuje commit. GitHub Pages zwykle potrzebuje około minuty na pokazanie zmiany klientom.

## Bezpieczeństwo

- Token nie jest wpisany do plików strony i nie trafia do repozytorium.
- Token działa tylko w otwartej karcie i znika po jej zamknięciu.
- Sam publiczny plik `admin.html` nie daje nikomu prawa zapisu bez tokenu.
- Nie wysyłaj tokenu innej osobie. W razie podejrzenia wycieku natychmiast go usuń w ustawieniach GitHuba.

Oficjalne instrukcje: [GitHub Pages](https://docs.github.com/en/pages/getting-started-with-github-pages/configuring-a-publishing-source-for-your-github-pages-site), [tokeny fine-grained](https://docs.github.com/en/authentication/keeping-your-account-and-data-secure/managing-your-personal-access-tokens), [uprawnienia zapisu plików](https://docs.github.com/en/rest/repos/contents).
