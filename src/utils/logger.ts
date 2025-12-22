// FILE: src/utils/logger.ts

/**
 * Níveis de severidade de log.
 */
type LogLevel = "INFO" | "WARN" | "ERROR" | "DEBUG";

/**
 * Função de log simples e formatada.
 * Ideal para logs no servidor, adicionando timestamps e níveis.
 * * @param level O nível de severidade da mensagem.
 * @param message A mensagem principal a ser logada.
 * @param details (Opcional) Detalhes adicionais, como um objeto de erro.
 */
export const log = (
    level: LogLevel,
    message: string,
    details?: any
) => {
    // 1. Definição do carimbo de data/hora (Timestamp)
    const timestamp = new Date().toISOString()

    // 2. Formatação da mensagem principal
    const logMessage = `[${timestamp}] [${level}] - ${message}`

    // 3. Escolha do console method baseado no nível
    const consoleMethod = 
        level === "ERROR" ? console.error :
            level === "WARN" ? console.warn :
                console.log // INFO ou DEBUG

    // 4. Exibir o log
    if (details) {
        // Se houver detalhes, loga a mensagem e os detalhes no console
        consoleMethod(logMessage, details)
    } else {
        // Se não houver detalhes, loga apenas a mensagem
        consoleMethod(logMessage)
    }

    // Nota: Em um ambiente real, você faria aqui:
    // - Envio para um serviço de monitoramento (e.g., Sentry, DataDog).
    // - Escrita em um arquivo de log (File System).
}

// Exemplo de uso
// log('INFO', 'Servidor inicializado com sucesso.');
// log('ERROR', 'Falha ao conectar ao DB', new Error('Connection refused'));