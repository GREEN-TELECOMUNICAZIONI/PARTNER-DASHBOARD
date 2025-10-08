# Configurazione Filtri Servizi TWT

Il sistema di verifica copertura permette di filtrare i servizi in base a **provider**, **tecnologia** e **varianti** per mostrare solo i servizi desiderati.

## Configurazione

La configurazione avviene tramite variabili d'ambiente nel file `.env`:

```env
# Solo provider TIM
TWT_PROVIDER_FILTER=10

# Solo tecnologie FTTC e FTTH
TWT_TECHNOLOGY_FILTER=FTTC,FTTH

# Escludi varianti "Lite"
TWT_EXCLUDE_VARIANTS=Lite
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

---

## 🔧 Filtro Tecnologia (TWT_TECHNOLOGY_FILTER)

### Descrizione
Filtra i servizi in base alla tecnologia presente nel nome del servizio (`ServiceName`).

### Configurazione
```env
TWT_TECHNOLOGY_FILTER=FTTC,FTTH
```

### Tecnologie Disponibili

| Tecnologia | Esempi di Servizi              |
|------------|--------------------------------|
| FTTC       | FTTCab, FTTCab EVDSL          |
| FTTH       | FTTH, FTTH VULA               |
| ETH        | ETH Asimmetrica, ETH Simmetrica |

### Esempi

#### Solo FTTH
```env
TWT_TECHNOLOGY_FILTER=FTTH
```
**Risultato:** Mostra solo servizi FTTH (fibra fino a casa)

#### FTTC + FTTH
```env
TWT_TECHNOLOGY_FILTER=FTTC,FTTH
```
**Risultato:** Mostra servizi in fibra (FTTC e FTTH), esclude ETH, ecc.

#### Tutte le tecnologie
```env
TWT_TECHNOLOGY_FILTER=
```
**Risultato:** Nessun filtro tecnologico, mostra tutti i servizi

### Note
- Il matching è **case-insensitive** (FTTC = fttc)
- Il filtro cerca la stringa nel campo `ServiceName` dell'API TWT
- Valori multipli separati da virgola (AND logic)

---

## ✅ Inclusione Varianti (TWT_INCLUDE_VARIANTS)

### Descrizione
**Mostra SOLO** servizi il cui nome contiene specifiche parole chiave. Se impostato, tutti gli altri servizi vengono esclusi.

### Configurazione
```env
TWT_INCLUDE_VARIANTS=EVDSL
```

### Varianti Disponibili

| Variante | Descrizione | Esempi Servizi Inclusi |
|----------|-------------|------------------------|
| EVDSL    | Enhanced VDSL | FTTCab EVDSL |
| VULA     | Virtual Unbundled Local Access | FTTH VULA |
| Lite     | Versioni economiche | FTTH Lite, FTTCab Lite |
| Asimmetrica | ETH asimmetrica | ETH Asimmetrica |
| Simmetrica | ETH simmetrica | ETH Simmetrica |
| Dedicata | Fibra dedicata | Fibra Dedicata |

### Esempi

#### Solo EVDSL
```env
TWT_INCLUDE_VARIANTS=EVDSL
```
**Risultato:** Mostra SOLO "FTTCab EVDSL" (se disponibile e TIM)

#### Solo EVDSL o VULA
```env
TWT_INCLUDE_VARIANTS=EVDSL,VULA
```
**Risultato:** Mostra solo servizi con "EVDSL" o "VULA" nel nome

#### Tutte le varianti (default)
```env
TWT_INCLUDE_VARIANTS=
```
**Risultato:** Nessun filtro di inclusione, tutte le varianti ammesse

### Note
- Il matching è **case-sensitive** (EVDSL ≠ evdsl)
- Il filtro cerca substring nel campo `ServiceName`
- Valori multipli separati da virgola (OR logic: includi se contiene almeno una keyword)
- **Comportamento whitelist**: se configurato, SOLO i servizi matching vengono mostrati

---

## 🚫 Esclusione Varianti (TWT_EXCLUDE_VARIANTS)

### Descrizione
Esclude servizi il cui nome contiene specifiche parole chiave. Ha **priorità su INCLUDE**.

### Configurazione
```env
TWT_EXCLUDE_VARIANTS=Lite
```

### Varianti Disponibili

| Variante | Descrizione | Esempi Servizi Esclusi |
|----------|-------------|------------------------|
| Lite     | Versioni economiche | FTTH Lite, FTTCab Lite |
| VULA     | Virtual Unbundled Local Access | FTTH VULA |
| EVDSL    | Enhanced VDSL | FTTCab EVDSL |
| Asimmetrica | ETH asimmetrica | ETH Asimmetrica |
| Simmetrica | ETH simmetrica | ETH Simmetrica |
| Dedicata | Fibra dedicata | Fibra Dedicata |

### Esempi

#### Escludi Lite
```env
TWT_EXCLUDE_VARIANTS=Lite
```
**Risultato:** Esclude "FTTH Lite", "FTTCab Lite", ecc.

#### Escludi Lite + VULA
```env
TWT_EXCLUDE_VARIANTS=Lite,VULA
```
**Risultato:** Esclude varianti Lite e VULA

#### Nessuna esclusione
```env
TWT_EXCLUDE_VARIANTS=
```
**Risultato:** Nessuna esclusione applicata

### Note
- Il matching è **case-sensitive** (Lite ≠ lite)
- Il filtro cerca substring nel campo `ServiceName`
- Valori multipli separati da virgola (OR logic: escludi se contiene qualsiasi keyword)
- **EXCLUDE ha priorità su INCLUDE**: se un servizio matcha entrambi, viene escluso

---

## 📋 Comportamento Complessivo dei Filtri

I filtri vengono applicati all'endpoint `/api/coverage/services` con questa logica sequenziale:

1. ✅ Mantiene solo servizi con `StatusCoverage = true`
2. ✅ Mantiene solo servizi con `Selectable = true`
3. ✅ **Provider Filter**: Se `TWT_PROVIDER_FILTER` è impostato, mantiene solo servizi con almeno un provider nella lista
4. ✅ **Technology Filter**: Se `TWT_TECHNOLOGY_FILTER` è impostato, mantiene solo servizi il cui nome contiene una delle tecnologie specificate
5. ✅ **Include Variants**: Se `TWT_INCLUDE_VARIANTS` è impostato, mantiene SOLO servizi il cui nome contiene almeno una delle keyword (whitelist)
6. ✅ **Exclude Variants**: Se `TWT_EXCLUDE_VARIANTS` è impostato, esclude servizi il cui nome contiene una delle keyword specificate (blacklist)

**Tutti i filtri vengono applicati in sequenza (AND logic)**

### Priorità EXCLUDE > INCLUDE

Se un servizio matcha sia `TWT_INCLUDE_VARIANTS` che `TWT_EXCLUDE_VARIANTS`, viene **escluso**.

**Esempio:**
```env
TWT_INCLUDE_VARIANTS=FTTH  # Includi solo servizi con "FTTH"
TWT_EXCLUDE_VARIANTS=Lite  # Escludi servizi con "Lite"
```
- ✅ "FTTH" → Passa (contiene FTTH, non Lite)
- ❌ "FTTH Lite" → Escluso (contiene FTTH ma anche Lite - EXCLUDE vince)
- ❌ "FTTCab" → Escluso (non contiene FTTH)

## 📊 Esempi Pratici

### Esempio 1: Configurazione Predefinita (TIM + FTTC/FTTH, no Lite)

**Configurazione `.env`:**
```env
TWT_PROVIDER_FILTER=10
TWT_TECHNOLOGY_FILTER=FTTC,FTTH
TWT_EXCLUDE_VARIANTS=Lite
```

**Servizi API TWT (11 totali):**
- ETH Asimmetrica (TIM) ❌ → Non FTTC/FTTH
- ETH Simmetrica (TIM) ❌ → Non FTTC/FTTH
- **FTTH (TIM) ✅** → Provider TIM + tecnologia FTTH + no Lite
- FTTH Lite (Altri) ❌ → Contiene "Lite"
- FTTCab (Fastweb) ❌ → Provider non TIM
- FTTCab EVDSL (TIM) ✅ → Provider TIM + tecnologia FTTC (in "FTTCab") + no Lite
- FTTH VULA (Fastweb) ❌ → Provider non TIM
- Fibra Dedicata (vari) ❌ → Non FTTC/FTTH

**Output API:**
```json
{
  "success": true,
  "data": [
    {
      "serviceId": "21",
      "name": "FTTH",
      "maxSpeed": "2500M",
      "technology": "Centrale",
      "connectionElement": "TORINO S. RITA"
    }
  ]
}
```
**Risultato:** 1 servizio su 11 (solo FTTH di TIM per quell'indirizzo specifico)

---

### Esempio 2: Solo FTTH, Tutti i Provider

**Configurazione `.env`:**
```env
TWT_PROVIDER_FILTER=
TWT_TECHNOLOGY_FILTER=FTTH
TWT_EXCLUDE_VARIANTS=Lite
```

**Output API:**
```json
{
  "success": true,
  "data": [
    {
      "name": "FTTH",
      "maxSpeed": "2500M"
    },
    {
      "name": "FTTH VULA",
      "maxSpeed": "2500M"
    }
  ]
}
```
**Risultato:** FTTH di TIM + FTTH VULA di Fastweb (esclusa FTTH Lite)

---

### Esempio 3: Tutti i Servizi TIM

**Configurazione `.env`:**
```env
TWT_PROVIDER_FILTER=10
TWT_TECHNOLOGY_FILTER=
TWT_EXCLUDE_VARIANTS=
```

**Risultato:** Tutti i servizi TIM disponibili (ETH, FTTH, FTTCab EVDSL, Fibra Dedicata, ecc.)

## Note

- Il filtro viene letto all'avvio del backend nel costruttore di `CoverageController`
- Per applicare modifiche è necessario riavviare il backend
- Valori non numerici o non validi vengono ignorati
- La configurazione è case-sensitive e richiede IDs numerici separati da virgola
