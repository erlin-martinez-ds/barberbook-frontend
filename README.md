# React + Vite

## Pruebas

Las pruebas unitarias y de componentes usan Vitest, React Testing Library y jsdom:

- `npm test`: ejecutar Vitest en modo watch.
- `npm run test:run`: ejecutar todas las pruebas una vez (útil para CI).

## Pruebas E2E

Los flujos principales del frontend usan Selenium WebDriver con Page Object Model y una API local de prueba:

- Requiere Google Chrome instalado.
- `npm run test:e2e`: inicia la API simulada y Vite, y ejecuta los flujos en Chrome headless.
- Selenium Manager obtiene el ChromeDriver compatible cuando no está instalado.
- La sesión E2E incluye administración de disponibilidad/servicios, creación de reservas y confirmación por el barbero.

This template provides a minimal setup to get React working in Vite with HMR and some ESLint rules.

Currently, two official plugins are available:

- [@vitejs/plugin-react](https://github.com/vitejs/vite-plugin-react/blob/main/packages/plugin-react) uses [Oxc](https://oxc.rs)
- [@vitejs/plugin-react-swc](https://github.com/vitejs/vite-plugin-react/blob/main/packages/plugin-react-swc) uses [SWC](https://swc.rs/)

## React Compiler

The React Compiler is not enabled on this template because of its impact on dev & build performances. To add it, see [this documentation](https://react.dev/learn/react-compiler/installation).

## Expanding the ESLint configuration

If you are developing a production application, we recommend using TypeScript with type-aware lint rules enabled. Check out the [TS template](https://github.com/vitejs/vite/tree/main/packages/create-vite/template-react-ts) for information on how to integrate TypeScript and [`typescript-eslint`](https://typescript-eslint.io) in your project.
