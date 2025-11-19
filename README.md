# Руководство по созданию проекта, похожего на layout-valте

## 1. Что получится в итоге
Мы развернём статический сайт на Vite с поддержкой Twig-шаблонов, SCSS, пост-обработки CSS и оптимизацией изображений. Сборка будет выдавать готовую папку `dist`, которую можно раздавать через Nginx или Docker-контейнер.

## 2. Предварительные требования
1. **Git** — для управления исходным кодом и инициализации репозитория.
2. **Node.js ≥ 22.14** (в комплекте с npm) — Vite и плагины используют современные возможности Node, поэтому нужен актуальный LTS/Current.
3. **Любая IDE/редактор** с поддержкой ESLint и Stylelint (например, VS Code).
4. **Docker (по желанию)** — если хотите разворачивать результат в контейнере.

Проверяем версии:
```powershell
node -v
npm -v
git --version
```

## 3. Создаём новую директорию и репозиторий
```powershell
mkdir layout-valte && cd layout-valte
git init
```

## 4. Инициализация npm-проекта
```powershell
npm init -y
```
Это создаст базовый `package.json`, где позже опишем скрипты и зависимости.

## 5. Устанавливаем основные зависимости
```powershell
npm install --save ^
  @tabler/icons ^
  reseter.css
```
*`@tabler/icons`* — набор SVG-иконок для интерфейсов.  
*`reseter.css`* — облегчённый сброс стилей.

## 6. Устанавливаем инструменты разработки
```powershell
npm install --save-dev ^
  vite ^
  vituum ^
  @vituum/vite-plugin-twig ^
  sass ^
  autoprefixer ^
  vite-plugin-imagemin ^
  vite-plugin-minify ^
  dotenv ^
  minimist
```
- **vite** — основной сборщик/дев-сервер.  
- **vituum** — надстройка над Vite для мультишаблонных проектов.  
- **@vituum/vite-plugin-twig** — подключает рендер Twig-файлов.  
- **sass** — препроцессор для `.scss/.sass`.  
- **autoprefixer** — добавляет вендорные префиксы.  
- **vite-plugin-imagemin / vite-plugin-minify** — оптимизируют изображения и HTML в прод-сборке.  
- **dotenv / minimist** — загрузка ENV и обработка CLI-параметров.

## 7. Настраиваем линтеры
```powershell
npm install --save-dev ^
  eslint ^
  @eslint/js ^
  eslint-config-airbnb-base ^
  eslint-plugin-import ^
  eslint-import-resolver-alias ^
  stylelint ^
  stylelint-scss ^
  stylelint-config-standard-scss ^
  stylelint-config-clean-order
```
- **ESLint** — проверка JS. Airbnb конфиг даёт строгий стиль.  
- **eslint-import-resolver-alias** — корректно работает с алиасами `@`.  
- **Stylelint** и пресеты — следят за порядком свойств и чистотой SCSS.

## 8. Структура каталогов
Создаём типовую структуру:
```
src/
  component/
  data/
  font/
  img/
  js/
  layout/
  sass/
  view/        # Twig-страницы (.twig / .html)
public/
dist/
vite/
```

## 9. Конфигурация Vite
### 9.1 Общие настройки (`vite.config.js`)
Создаём файл и подключаем модули из `vite/` (ниже):
- `envPrefix`, `define` — передаём переменные `APP_*`.
- `plugins` — `vituum()`, `twig()`; в прод режиме добавляем `imagemin`, `htmlmin`, `htmlTransformBase`.
- `resolve.alias` — `@` → `src`.
- `base`, `build` — экспортируем из вспомогательных файлов.
- `server`/`preview` — читаются из CLI-флагов `--host`, `--port`.

### 9.2 `vite/app.js`
Отвечает за:
- загрузку `.env.local` и `.env`;
- определение `APP_IS_DEV`, `APP_MODE`, имени/версии продукта;
- проброс всех переменных, начинающихся с `APP_`.

### 9.3 `vite/build.js`
- Настраивает `outDir`, очистку, шаблоны имён файлов.
- Явно указывает входы: все Twig/HTML из `src/view` и JS из `src/js`.
- В дев-режиме включает `sourcemap`.

### 9.4 `vite/path.js`
- Собирает абсолютные пути к `src`, `dist`, `img`, `sass` и т.д.
- Используется для алиасов и скриптов.

### 9.5 `vite/server.js`
- Порт и host для `vite dev` и `vite preview`, читаются из аргументов командной строки.

## 10. Скрипты в `package.json`
Пример секции:
```jsonc
"scripts": {
  "dev": "vite dev",
  "build": "vite build",
  "prod": "vite build",
  "preview": "vite preview",
  "docs": "vite build --base=/ваш-путь --outDir=./docs",
  "lint:js": "eslint ./",
  "lint:js:fix": "eslint ./ --fix",
  "lint:css": "stylelint ./src/sass/**/*.{sass,scss}",
  "lint:css:fix": "stylelint ./src/sass/**/*.{sass,scss} --fix",
  "backend": "nodemon backend"
}
```
- `dev` — дев-сервер с HMR.
- `build/prod` — прод сборка.
- `preview` — локальный просмотр собранного `dist`.
- `docs` — удобно для GitHub Pages с кастомным `base`.
- `lint:*` — проверка и автопочинка JS/SCSS.
- `backend` — запускает мок-сервер (см. следующий пункт).

## 11. Вспомогательный backend
Создайте `backend.js`:
- Используем `fastify` + `nodemon` для автоперезапуска.
- Настраиваем CORS (`Access-Control-Allow-*`), отдаём JSON.
- Порт по умолчанию 4173.
Назначение — локально эмулировать ответы API, пока нет настоящего бэкенда.

## 12. Конфигурация Docker/Nginx (по желанию)
1. **Dockerfile** с двумя стадиями:
   - `node:20-alpine` — установка пакетов (`npm install --ignore-scripts`), `npm run build`.
   - `nginx:stable-alpine` — копирует `dist` в `/usr/share/nginx/html`, слушает 3000.
2. **nginx.conf** — отдаёт SPA, запрещает кэш, прокидывает `try_files ... /index.html`.
3. Сборка/запуск:
   ```powershell
   docker build -t layout-valte .
   docker run --rm -p 3000:3000 layout-valte
   ```

## 13. Шаги запуска разработки
1. Скопировать `.env` → `.env.local`, настроить `APP_*`.
2. `npm install`
3. `npm run dev`
4. Открыть `http://localhost:5173`

## 14. Сборка и предпросмотр
```powershell
npm run build
npm run preview -- --port 3000
```
`dist/` можно заливать на любой статический хостинг.

## 15. Тесты качества
```powershell
npm run lint:js
npm run lint:css
```
Не игнорируйте предупреждения линтеров — они помогают держать кодовую базу в едином стиле.

---
Теперь у вас есть пошаговый чек-лист: от чистой папки до готового production-бандла, полностью повторяющего архитектуру проекта `layout-valte`.