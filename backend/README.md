

## Få tilgang til språkmodeller via AWS Bedrock
- Logg inn i aws og gå til Amazon Bedrock
- Trykk på playgrounds --> Bedrock configurations nederst til venstre --> Model access
  - For chat/text: Claude 3 sonnet --> Available to request --> Request model access
  - For image: SDXL 1.0 --> Available to request --> Request model access
- Det tar noen minutter før man får tilgang til disse
  - Open in playground

## Kjør språkmodellene med ollama
Nå skal vi kjøre de store språkmodellene (LLM) lokalt. For å kjøre de lokalt brukes ollama, og vi skal benytte oss av open source modeller som **llama2** og **LLaVA**.
### Llama 2
Llama2 er en autoregressiv modell som er basert på transformer arkitekturen. Modellen er utviklet av Meta, og er trent for å generere tekst basert på input prompts. 
### LLaVA
LLaVa er også basert på transformer arkitekturen, og bruker et multimodalt design. Dette betyr at modellen kan håndtere inputs fra både tekst og bilder. Den består typisk av to deler: en vision encoder som prosesserer bilder med et convolutional neural network, og en språkmodell som bruker transformer for å prosessere tekst.
### Kjør ollama i terminal
- `brew install ollama`
- `ollama serve`. La den kjøre i egen terminal.
  - (control+C for å avslutte)
- Åpne ny terminal med `ollama run <llama2 eller llava>`  
  - Send tekst input for å chatte med modellen, eller send filstien til et bilde som input for å sende inn bilde
  - (`/exit` for å avslutte)

## Kjør lokalt med ollama 

1. Ha `ollama serve` kjørende i en terminal
2. Kjør `fastapi dev main.py` i annen terminal