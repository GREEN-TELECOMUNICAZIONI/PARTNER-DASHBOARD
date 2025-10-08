# Requirements Document

## Introduction

Questa feature implementa una dashboard web per la gestione della copertura xDSL e dei contratti, integrando le API di TWT per verificare la disponibilità del servizio. La dashboard offre due funzionalità principali: verifica della copertura tramite ricerca indirizzo con autocomplete geografico e gestione di nuovi contratti. L'applicazione sarà sviluppata con NestJS per il backend, con un'interfaccia responsive e intuitiva che utilizza Leaflet/OpenStreetMap per la selezione degli indirizzi e filtra i risultati per il provider TIM (provider ID: 10).

## Requirements

### Requirement 1: Dashboard principale con selezione funzionalità

**User Story:** Come utente, voglio accedere a una dashboard principale dove posso scegliere tra "Verifica Copertura" e "Nuovo Contratto", così da poter navigare facilmente tra le diverse funzionalità del sistema.

#### Acceptance Criteria

1. WHEN l'utente accede alla dashboard THEN il sistema SHALL mostrare due opzioni chiaramente visibili: "Verifica Copertura" e "Nuovo Contratto"
2. WHEN l'utente clicca su "Verifica Copertura" THEN il sistema SHALL navigare alla sezione di verifica copertura
3. WHEN l'utente clicca su "Nuovo Contratto" THEN il sistema SHALL navigare alla sezione di gestione contratti
4. WHEN la dashboard viene visualizzata su dispositivi mobili, tablet o desktop THEN il sistema SHALL adattare il layout in modo responsive mantenendo l'usabilità

### Requirement 2: Ricerca indirizzo con autocomplete geografico

**User Story:** Come utente, voglio inserire un indirizzo utilizzando un sistema di autocomplete geografico basato su Leaflet/OpenStreetMap, così da poter selezionare facilmente e accuratamente la posizione per cui verificare la copertura.

#### Acceptance Criteria

1. WHEN l'utente accede alla sezione "Verifica Copertura" THEN il sistema SHALL mostrare un campo di input per l'indirizzo con funzionalità di autocomplete
2. WHEN l'utente inizia a digitare un indirizzo THEN il sistema SHALL interrogare il servizio di geocoding di OpenStreetMap/Nominatim e mostrare suggerimenti in tempo reale
3. WHEN l'utente seleziona un indirizzo dai suggerimenti THEN il sistema SHALL popolare il campo con l'indirizzo completo e salvare le coordinate geografiche (latitudine, longitudine)
4. WHEN l'autocomplete restituisce risultati THEN il sistema SHALL mostrare almeno: via, numero civico, città, CAP e provincia
5. IF l'utente digita meno di 3 caratteri THEN il sistema SHALL NOT effettuare chiamate di autocomplete
6. WHEN si verifica un errore nella chiamata al servizio di geocoding THEN il sistema SHALL mostrare un messaggio di errore user-friendly

### Requirement 3: Integrazione API TWT per verifica copertura

**User Story:** Come utente, voglio verificare la copertura xDSL per un indirizzo specifico utilizzando le API di TWT, così da sapere quali servizi sono disponibili per quella località.

#### Acceptance Criteria

1. WHEN l'utente ha selezionato un indirizzo valido e clicca su "Verifica Copertura" THEN il sistema SHALL chiamare l'API di TWT per verificare la copertura xDSL
2. WHEN viene effettuata la chiamata API THEN il sistema SHALL inviare le credenziali di autenticazione corrette come specificato nella documentazione TWT API xDSL rev.21
3. WHEN viene effettuata la chiamata API THEN il sistema SHALL includere i parametri dell'indirizzo (via, numero civico, città, CAP, provincia) nel formato richiesto da TWT
4. WHEN l'API TWT restituisce i risultati THEN il sistema SHALL filtrare solo le offerte del provider TIM (provider ID: 10)
5. IF l'API TWT restituisce un errore o timeout THEN il sistema SHALL gestire l'errore e mostrare un messaggio appropriato all'utente
6. WHEN la chiamata API è in corso THEN il sistema SHALL mostrare uno spinner di caricamento
7. WHEN l'API restituisce risultati filtrati per TIM THEN il sistema SHALL mostrare le informazioni di copertura disponibili (tecnologia, velocità download/upload, disponibilità)

### Requirement 4: Visualizzazione risultati copertura

**User Story:** Come utente, voglio visualizzare i risultati della verifica copertura in modo chiaro e comprensibile, così da poter valutare le opzioni disponibili per l'indirizzo selezionato.

#### Acceptance Criteria

1. WHEN l'API TWT restituisce risultati positivi THEN il sistema SHALL mostrare una lista delle tecnologie disponibili (ADSL, FTTC, FTTH, ecc.)
2. WHEN vengono mostrati i risultati THEN il sistema SHALL visualizzare per ogni tecnologia: tipo di connessione, velocità massima download, velocità massima upload, stato di disponibilità
3. IF non ci sono risultati per il provider TIM THEN il sistema SHALL mostrare un messaggio "Nessuna copertura disponibile per TIM in questa zona"
4. WHEN vengono mostrati i risultati THEN il sistema SHALL presentarli in un formato responsive e facilmente leggibile su tutti i dispositivi
5. WHEN l'utente visualizza i risultati THEN il sistema SHALL permettere di effettuare una nuova ricerca senza ricaricare la pagina

### Requirement 5: Gestione stato e feedback utente

**User Story:** Come utente, voglio ricevere feedback visivo chiaro durante le operazioni asincrone (ricerca indirizzo, chiamata API), così da sapere che il sistema sta elaborando la mia richiesta.

#### Acceptance Criteria

1. WHEN viene effettuata una chiamata API a TWT THEN il sistema SHALL mostrare uno spinner di caricamento con un messaggio descrittivo
2. WHEN la chiamata API è in corso THEN il sistema SHALL disabilitare il pulsante di verifica per prevenire chiamate multiple
3. WHEN la chiamata API si completa con successo THEN il sistema SHALL nascondere lo spinner e mostrare i risultati
4. WHEN si verifica un timeout nella chiamata API (oltre 30 secondi) THEN il sistema SHALL interrompere la richiesta e mostrare un messaggio di errore
5. WHEN si verifica un errore di rete THEN il sistema SHALL mostrare un messaggio di errore specifico con suggerimenti per risolvere il problema

### Requirement 6: Backend NestJS con architettura modulare

**User Story:** Come sviluppatore, voglio un backend NestJS ben strutturato e modulare, così da poter mantenere e estendere facilmente il sistema.

#### Acceptance Criteria

1. WHEN il backend viene sviluppato THEN il sistema SHALL utilizzare NestJS come framework principale
2. WHEN viene implementata l'integrazione TWT THEN il sistema SHALL creare un modulo dedicato per le chiamate API TWT
3. WHEN viene implementato il geocoding THEN il sistema SHALL creare un servizio separato per le chiamate a OpenStreetMap/Nominatim
4. WHEN vengono gestite le configurazioni THEN il sistema SHALL utilizzare il ConfigModule di NestJS per gestire variabili d'ambiente (credenziali API, URL endpoint, timeout)
5. WHEN vengono implementati gli endpoint REST THEN il sistema SHALL seguire le best practice RESTful (GET per ricerche, POST per operazioni, gestione errori HTTP appropriata)
6. WHEN viene gestita la validazione input THEN il sistema SHALL utilizzare class-validator e class-transformer per validare i DTO
7. WHEN vengono effettuate chiamate HTTP esterne THEN il sistema SHALL utilizzare HttpModule di NestJS con gestione timeout e retry

### Requirement 7: Sezione Nuovo Contratto (placeholder)

**User Story:** Come utente, voglio accedere a una sezione "Nuovo Contratto" dalla dashboard, così da poter gestire la creazione di nuovi contratti in futuro.

#### Acceptance Criteria

1. WHEN l'utente clicca su "Nuovo Contratto" dalla dashboard THEN il sistema SHALL navigare a una pagina dedicata
2. WHEN la pagina "Nuovo Contratto" viene caricata THEN il sistema SHALL mostrare un messaggio placeholder indicando che la funzionalità sarà implementata in futuro
3. WHEN l'utente è nella sezione "Nuovo Contratto" THEN il sistema SHALL fornire un modo per tornare alla dashboard principale

### Requirement 8: Sicurezza e gestione credenziali

**User Story:** Come amministratore di sistema, voglio che le credenziali API e le informazioni sensibili siano gestite in modo sicuro, così da proteggere l'accesso alle API di TWT.

#### Acceptance Criteria

1. WHEN vengono configurate le credenziali API TWT THEN il sistema SHALL memorizzarle in variabili d'ambiente e non nel codice sorgente
2. WHEN vengono effettuate chiamate API a TWT THEN il sistema SHALL utilizzare HTTPS per tutte le comunicazioni
3. WHEN vengono loggati errori o informazioni THEN il sistema SHALL NOT includere credenziali o token nei log
4. IF le credenziali API non sono configurate THEN il sistema SHALL impedire l'avvio dell'applicazione e mostrare un errore chiaro
