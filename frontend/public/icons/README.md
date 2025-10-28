# Bollini AGCOM

Questa directory deve contenere i bollini AGCOM obbligatori per legge per la visualizzazione delle coperture fibra.

## File Richiesti

- **ftth.png** - Bollino per copertura FTTH (Fiber To The Home)
- **fttc.png** - Bollino per copertura FTTC (Fiber To The Cabinet)

## Dimensioni Raccomandate

- Dimensione: 80x80px o 160x160px (per display retina)
- Formato: PNG con trasparenza
- Risoluzione: 72-144 DPI

## Note Importanti

I bollini AGCOM sono obbligatori per legge quando si pubblicizzano servizi di connettività in fibra ottica. Devono essere conformi alle linee guida AGCOM per la trasparenza delle informazioni ai consumatori.

## Download Bollini Ufficiali

I bollini ufficiali possono essere:
1. Richiesti direttamente ad AGCOM
2. Forniti dal provider di servizi di telecomunicazione
3. Scaricati dal sito ufficiale AGCOM (se disponibili)

## Posizionamento nel Widget

Nel componente `WidgetCoverageResults`:
- Il bollino viene mostrato in alto a destra nella card della migliore copertura (80x80px)
- Nelle altre coperture il bollino è ridotto (60x60px)
- Il componente determina automaticamente quale bollino mostrare in base alla tecnologia:
  - Se la tecnologia contiene "FTTH" (case insensitive) -> mostra ftth.png
  - Altrimenti -> mostra fttc.png

## Placeholder Temporaneo

Fino all'inserimento dei bollini ufficiali, il componente mostrerà un'icona placeholder o un errore di caricamento immagine. Si consiglia di inserire i file il prima possibile per garantire la conformità normativa.
