FROM ollama/ollama:latest

RUN ollama pull mistral

EXPOSE 11434

CMD ["ollama", "serve"]
