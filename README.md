# Symphony Rebuild Tracker

## Deploy en Vercel (una sola vez)

```bash
# 1. Instala Vercel CLI si no lo tenés
npm i -g vercel

# 2. Desde esta carpeta:
vercel

# 3. En el dashboard de Vercel:
#    Storage → Create → KV Database → conectar al proyecto
#    (Vercel inyecta KV_REST_API_URL y KV_REST_API_TOKEN automáticamente)

# 4. Re-deploy para que tome las env vars del KV:
vercel --prod
```

## Dev local (sin KV)

```bash
npm install
npm run dev
# Abre http://localhost:5173
# El estado se guarda en localStorage mientras no hay KV
```

## Dev local (con KV)

```bash
# Instala Vercel CLI y logueate
vercel link          # vincula al proyecto de Vercel
vercel env pull      # baja las env vars del KV al .env.local
vercel dev           # inicia dev server con API functions
```

## Agregar / quitar / editar ítems

Editar `src/data/modules.json` directamente. El JSON tiene esta forma:

```json
{
  "modules": [
    {
      "id": "mi-modulo",
      "name": "Nombre visible",
      "category": "Inventory",
      "items": [
        {
          "id": "mi-modulo-item-1",
          "name": "Descripción del ítem",
          "complexity": 3,
          "done": false,
          "owner": "",
          "notes": ""
        }
      ]
    }
  ]
}
```

**Importante**: los `id` deben ser únicos. Nunca cambies un `id` existente (el estado del KV usa esos ids como clave).

### Categorías disponibles
`Inventory`, `Workforce`, `Assurance`, `Reports`, `Admin`, `Automation`, `Fulfillment`, `Cross-cutting`

### Escala de complejidad
| Valor | Categoría | Tiempo estimado |
|---|---|---|
| 1 | Trivial | ~0.5-1 día |
| 2 | Estándar | ~1-2 días |
| 3 | Complejo | ~3-5 días |
| 5 | Especializado | ~1-2 semanas |
| 8 | Subsistema | ~2-4 semanas |
