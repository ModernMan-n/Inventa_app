# Inventa — Генератор этикеток

Небольшое приложение на React + TypeScript + Vite для генерации этикеток со штрихкодами из Excel-файлов.

Ключевые команды (в корне проекта):

- `npm run dev` — запуск в режиме разработки (Vite).
- `npm run build` — сборка (выполняет `tsc -b` и `vite build`).
- `npm run preview` — просмотр собранного билда.
- `npm run lint` — запуск ESLint по коду.

Структура (важные файлы):

- `src/` — исходники приложения (компоненты, хуки, utils).
- `src/components/CustomSelect.tsx` — простой селект.
- `src/hooks/useLabels.ts` — основная логика обработки файлов (хуки).
- `src/utils/barcode.ts` — генерация штрихкодов с помощью `jsbarcode`.

Рекомендации:

- Убрать конфликтный текст в README (сделано).
- Добавить CI для проверки `lint` и сборки на PR (добавлен workflow `.github/workflows/ci.yml`).
- Добавить тесты (vitest или jest) и покрыть хук `useLabels` и утилиты.
- Включить проверку типов (`strict`) и настроить ESLint с type-aware правилами.

Если нужно, могу добавить пример теста и поднять базовый CI с тестами.

---

Файл CI: [.github/workflows/ci.yml](.github/workflows/ci.yml)
Файл package: [package.json](package.json)
