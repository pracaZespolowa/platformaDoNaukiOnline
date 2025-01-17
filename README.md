# Platforma do Nauki Online

Projekt ten jest aplikacją webową stworzoną przy użyciu Create React App, która umożliwia użytkownikom rejestrację, logowanie, zarządzanie kontem, rezerwację terminów oraz komunikację za pomocą czatu.

## Struktura Projektu

## Instalacja

Aby uruchomić projekt lokalnie, wykonaj poniższe kroki:

1. Sklonuj repozytorium:
   ```sh
   git clone https://github.com/pracaZespolowa/platformaDoNaukiOnline
   cd Projekt/src
2. Zainstaluj zależności
   npm install
3. Uruchom frontend:
   npm start
4. Uruchom backend:
   node src/server.js
   Dostępne Skrypty
W katalogu projektu możesz uruchomić:

npm start
Uruchamia aplikację w trybie deweloperskim.
Otwórz http://localhost:3000, aby zobaczyć ją w przeglądarce.

npm test
Uruchamia testy w trybie interaktywnym.
Zobacz sekcję o uruchamianiu testów po więcej informacji.

npm run build
Buduje aplikację do folderu build.
Prawidłowo bundluje React w trybie produkcyjnym i optymalizuje build dla najlepszej wydajności.

npm run eject
Uwaga: jest to operacja jednokierunkowa. Po jej wykonaniu nie można wrócić!

Struktura Kodu

manifest.json
Plik manifestu dla Progressive Web App.

index.js
Główny plik wejściowy aplikacji React.

App.js
Główny komponent aplikacji, który zarządza routingiem i stanem użytkownika.

Login.js
Komponent odpowiedzialny za logowanie użytkownika.

Register.js
Komponent odpowiedzialny za rejestrację nowego użytkownika.

Home.js
Komponent strony głównej, który wyświetla ogłoszenia i powiadomienia.

Chat.js
Komponent czatu, który umożliwia komunikację między użytkownikami.

zarzadzaj.js
Komponent zarządzania kontem użytkownika.

reservations.js
Komponent zarządzania rezerwacjami użytkownika.

server.js
Plik serwera Node.js, który obsługuje backend aplikacji, w tym m.in. rejestrację, logowanie, zarządzanie użytkownikami, ogłoszeniami, rezerwacjami i powiadomieniami.

Stylizacja
Stylizacja aplikacji jest zarządzana przez pliki CSS w katalogu src, takie jak m.in. App.css, Login.css, Register.css, Home.css, Chat.css, Zarzadzaj.css i reservations.css.

Testowanie
Testy są zarządzane przez plik App.test.js oraz konfigurację w setupTests.js.

Autorzy
Projekt został stworzony przez Matusz Sojda, Maciej Mojsa, Tomasz Czyż.

Licencja
Ten projekt jest licencjonowany na podstawie licencji MIT. Zobacz plik LICENSE po więcej informacji.

Ten plik `README.md` zawiera szczegółowe informacje na temat struktury projektu, instalacji, dostępnych skryptów, struktury kodu, stylizacji, testowania oraz autorów i licencji. Możesz dostosować go do swoich potrzeb, dodając dodatkowe informacje lub zmieniając istniejące.

