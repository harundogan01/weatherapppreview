# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Commands

- `netlify dev` — full local dev (Vite on 5173 proxied through Netlify on **8888**, with serverless functions). Use this when touching anything that calls the weather API; plain `npm run dev` serves the UI but `/.netlify/functions/*` requests will 404.
- `npm run dev` — Vite dev server only.
- `npm run build` / `npm run preview` — production build to `dist/` and preview it.

There is no test runner, linter, or formatter configured.

## Architecture

Vue 3 (`<script setup>`) + Vuetify 3 SPA built with Vite, deployed on Netlify. JavaScript only (no TypeScript).

**API key proxy.** The browser never talks to weatherapi.com directly. All requests go to `/.netlify/functions/get-weather` ([netlify/functions/get-weather.cjs](netlify/functions/get-weather.cjs)), which reads `WEATHER_API_KEY` from the environment (`.env` locally, Netlify env vars in production; `.env` is git-ignored) and forwards to `https://api.weatherapi.com/v1/<endpoint>`. Query params: `endpoint` (required — `forecast.json` or `search.json`), `q`, `days` (defaults to 3). The function file must stay `.cjs` because `package.json` sets `"type": "module"`.

**Component tree.** `main.js` registers Vuetify (all components/directives) → `App.vue` → `layouts/MainLayout.vue` (Header + MainSection). `Footer.vue` exists but is not mounted. Nearly all app logic lives in [src/layouts/MainSection.vue](src/layouts/MainSection.vue).

**Data flow in MainSection.vue:**
- On mount, `getUserLocation()` with no argument waits on the `ready` promise from [src/composables/useGeoLocation.js](src/composables/useGeoLocation.js) (resolves with `{ lat, lng }` on first geolocation fix) and fetches `forecast.json` for those coordinates.
- Pressing Enter in the autocomplete calls `getSearchedData()` → `search.json`, filling `search_results`.
- Choosing a result triggers the `getSelectedData` computed, which calls `getUserLocation("lat,lon")`. Note: this computed has side effects and only runs because it is bound as a fake prop (`:getSelectedData`) on `v-autocomplete`; removing that binding breaks location selection.
- Responses are mapped into `items_one` / `items_two` (current-conditions lists) and `forecast` (3-day tab). The mapping code is duplicated in both branches of `getUserLocation` — change both when altering displayed fields.

**Theming.** Light/dark is driven by `prefers-color-scheme` via a `matchMedia` listener in MainSection, passed down as `:theme` props rather than via Vuetify's global theme.

Icons come from `@mdi/font` (`mdi-*` names); dates are formatted with `moment`.
