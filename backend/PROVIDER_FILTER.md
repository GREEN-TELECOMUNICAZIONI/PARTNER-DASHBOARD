# Configurazione Filtro Provider

Il sistema di verifica copertura permette di filtrare i servizi in base al provider.

## Configurazione

La configurazione avviene tramite la variabile d'ambiente `TWT_PROVIDER_FILTER` nel file `.env`:

```env
TWT_PROVIDER_FILTER=10
```

## Provider IDs Disponibili

| ID  | Provider         | Descrizione                    |
|-----|------------------|--------------------------------|
| 10  | TIM              | Telecom Italia                 |
| 20  | Fastweb          | Fastweb                        |
| 30  | Altri            | Altri operatori                |
| 160 | FWA EW           | Fixed Wireless Access          |

## Esempi di Configurazione

### 1. Solo TIM (default)
```env
TWT_PROVIDER_FILTER=10
```
**Risultato:** Mostra solo servizi TIM (5 servizi nell'esempio)

### 2. TIM + Fastweb
```env
TWT_PROVIDER_FILTER=10,20
```
**Risultato:** Mostra servizi TIM e Fastweb (~6 servizi)

### 3. Tutti i provider
```env
TWT_PROVIDER_FILTER=
```
**Risultato:** Mostra tutti i servizi disponibili e selezionabili (7 servizi)

### 4. Solo Fastweb
```env
TWT_PROVIDER_FILTER=20
```
**Risultato:** Mostra solo servizi Fastweb

## Come Cambiare Configurazione

1. **Modifica il file `.env`**:
   ```bash
   cd backend
   nano .env
   ```

2. **Cambia il valore di `TWT_PROVIDER_FILTER`**:
   ```env
   TWT_PROVIDER_FILTER=10,20
   ```

3. **Riavvia il backend**:
   ```bash
   npm run start:dev
   ```

4. **Verifica nei log**:
   ```
   [CoverageController] Provider filter active: 10, 20
   ```

## Comportamento del Filtro

Il filtro viene applicato all'endpoint `/api/coverage/services` e:

1. ✅ Mantiene solo servizi con `StatusCoverage = true`
2. ✅ Mantiene solo servizi con `Selectable = true`
3. ✅ Se `TWT_PROVIDER_FILTER` è impostato, mantiene solo servizi con almeno un provider nella lista
4. ✅ Se `TWT_PROVIDER_FILTER` è vuoto, mostra tutti i servizi (disponibili e selezionabili)

## Esempio di Output

### Con filtro TIM (10):
```json
{
  "success": true,
  "data": [
    {
      "name": "FTTH",
      "maxSpeed": "2500M",
      "technology": "Centrale"
    },
    {
      "name": "FTTCab",
      "maxSpeed": "200M",
      "technology": "Armadio"
    }
  ]
}
```

### Senza filtro:
```json
{
  "success": true,
  "data": [
    {
      "name": "FTTH",
      "maxSpeed": "2500M",
      "technology": "Centrale"
    },
    {
      "name": "FTTH VULA",
      "maxSpeed": "1000M",
      "technology": "Centrale"
    },
    {
      "name": "FWA EW",
      "maxSpeed": "100M",
      "technology": "Wireless"
    }
  ]
}
```

## Note

- Il filtro viene letto all'avvio del backend nel costruttore di `CoverageController`
- Per applicare modifiche è necessario riavviare il backend
- Valori non numerici o non validi vengono ignorati
- La configurazione è case-sensitive e richiede IDs numerici separati da virgola
