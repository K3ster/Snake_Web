# Snake Game with Authentication and Chat

## Opis projektu

Jest to gra w węża napisana w Node.js, która obsługuje:

- Rejestrację i logowanie użytkowników,
- Zapis wyników do bazy danych,
- Wyświetlanie tablicy wyników,
- Czat w czasie rzeczywistym.

Gra działa w przeglądarce i korzysta z backendu stworzonego w Node.js.

## Funkcjonalności

1. **Rejestracja użytkownika:**

   - Użytkownicy mogą tworzyć konta.
   - Hasła są przechowywane w postaci zhashowanej za pomocą bcrypt.

2. **Logowanie użytkownika:**

   - Użytkownicy mogą logować się na swoje konta.
   - Po zalogowaniu użytkownik ma dostęp do gry oraz funkcji zapisu wyników.

3. **Gra w węża:**

   - Klasyczna gra w węża renderowana w elemencie `<canvas>`.
   - Wynik użytkownika może być zapisany po zakończeniu gry.

4. **Tablica wyników:**

   - Wyświetla najlepsze wyniki.
   - Wyniki są sortowane malejąco.

5. **Czat w czasie rzeczywistym:**

   - Użytkownicy mogą rozmawiać na czacie w trakcie gry.

## Technologie użyte w projekcie

1. **Node.js** – Backend.
2. **Express.js** – Serwer aplikacji i routing.
3. **SQLite** – Baza danych do przechowywania użytkowników i wyników.
4. **bcrypt** – Hashowanie haseł.
5. **Socket.IO** – Obsługa komunikacji w czasie rzeczywistym (chat).
6. **HTML, CSS, JavaScript** – Frontend.
7. **Canvas API** – Renderowanie gry w węża.

## Endpointy API

| **Metoda HTTP** | **Endpoint**   | **Opis**                                   | **Uwagi**                                                               |
| --------------- | -------------- | ------------------------------------------ | ----------------------------------------------------------------------- |
| **POST**        | `/register`    | Rejestracja nowego użytkownika.            | Wymaga `username` i `password`. Hasło jest hashowane.                   |
| **POST**        | `/login`       | Logowanie użytkownika.                     | Wymaga `username` i `password`. Ustawia ciasteczko sesyjne.             |
| **POST**        | `/logout`      | Wylogowanie użytkownika.                   | Usuwa ciasteczko sesyjne `username`.                                    |
| **GET**         | `/check-login` | Sprawdzenie statusu logowania użytkownika. | Zwraca nazwę użytkownika z ciasteczka sesyjnego, jeśli jest zalogowany. |
| **POST**        | `/save-score`  | Zapisanie wyniku gry.                      | Wymaga zalogowania. Dane: `score`.                                      |
| **GET**         | `/scores`      | Pobranie listy najlepszych wyników.        | Zwraca maksymalnie 10 wyników, posortowanych malejąco według punktacji. |

## Struktura bazy danych

### Tabela: `users`

| **Kolumna** | **Typ danych** | **Opis**                            | **Uwagi**                    |
| ----------- | -------------- | ----------------------------------- | ---------------------------- |
| `id`        | INTEGER        | Unikalny identyfikator użytkownika. | Klucz główny, autoincrement. |
| `username`  | TEXT           | Nazwa użytkownika.                  | Musi być unikalna.           |
| `password`  | TEXT           | Zhashowane hasło użytkownika.       |                              |

### Tabela: `scores`

| **Kolumna** | **Typ danych** | **Opis**                                    | **Uwagi**                    |
| ----------- | -------------- | ------------------------------------------- | ---------------------------- |
| `id`        | INTEGER        | Unikalny identyfikator wyniku.              | Klucz główny, autoincrement. |
| `name`      | TEXT           | Nazwa użytkownika, do którego należy wynik. |                              |
| `score`     | INTEGER        | Wynik gracza.                               |                              |

## Instalacja

1. Sklonuj repozytorium:
   ```bash
   git clone <URL_repozytorium>
   ```
2. Przejdź do folderu projektu:
   ```bash
   cd <nazwa_folderu>
   ```
3. Zainstaluj zależności:
   ```bash
   npm install
   ```
4. Uruchom serwer:
   ```bash
   npm start
   ```
5. Aplikacja powinna być dostępna pod adresem:
   ```
   http://localhost:3000
   ```

##

