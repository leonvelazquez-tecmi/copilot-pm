FROM ollama/ollama:latest

EXPOSE 11434

# Crear script de startup que baja el modelo
RUN echo '#!/bin/bash\nollama serve &\nsleep 10\nollama pull mistral\nwait' > /start.sh && chmod +x /start.sh

CMD ["/start.sh"]
