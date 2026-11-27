# Frontend QA

## Alcance

La automatización de QA se ejecuta en `.github/workflows/frontend-ci.yml` para cada push, pull request y ejecución manual. El workflow instala dependencias con `npm ci`, ejecuta cada comprobación y publica el resultado de cada paso en el resumen de GitHub Actions.

| Comprobación | Comando | Cobertura |
| --- | --- | --- |
| Lint | `npm run lint` | Reglas ESLint de la aplicación y las pruebas |
| Unitarias y componentes | `npm run test:run` | Autenticación, rutas protegidas, reservas, `useFetch` y panel administrativo |
| Build de producción | `npm run build` | Compilación de Vite |
| E2E | `npm run test:e2e` | Administración de disponibilidad/servicios, creación de reservas, control de acceso y confirmación por el barbero |

Las pruebas E2E usan Selenium WebDriver con Chrome headless y una API local simulada. Selenium Manager resuelve el ChromeDriver compatible durante la ejecución; no se requieren secretos ni servicios externos de la aplicación.

## Última verificación local

Fecha: 2026-11-27

| Comprobación | Resultado |
| --- | --- |
| `npm run lint` | Aprobado |
| `npm run test:run` | Aprobado: 14 pruebas en 6 archivos |
| `npm run build` | Aprobado |
| `npm run test:e2e` | Aprobado: 3 flujos en Chrome |
| `git diff --check` | Aprobado |

El estado actualizado de cada ejecución de CI se publica en el resumen del workflow y prevalece sobre estos resultados locales registrados.
