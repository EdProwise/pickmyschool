
export async function withRetry<T>(
  operation: () => Promise<T>,
  maxRetries: number = 5,
  delayMs: number = 2000
): Promise<T> {
  let lastError: any;
  
  for (let attempt = 1; attempt <= maxRetries; attempt++) {
    try {
      return await operation();
    } catch (error: any) {
      lastError = error;
      
      const checkRetryable = (err: any): boolean => {
        if (!err) return false;
        const message = err.message?.toLowerCase() || '';
        const code = err.code || '';
        
        return (
          message.includes('timeout') || 
          message.includes('fetch failed') ||
          message.includes('socket') ||
          message.includes('econnreset') ||
          message.includes('terminated') ||
          message.includes('connecttimeouterror') ||
          message.includes('und_err') ||
          code === 'UND_ERR_CONNECT_TIMEOUT' ||
          code === 'UND_ERR_SOCKET' ||
          code === 'ECONNRESET' ||
          checkRetryable(err.cause)
        );
      };

      const isRetryable = checkRetryable(error);
      
      if (!isRetryable || attempt === maxRetries) {
        throw error;
      }
      
      console.warn(`Database operation failed (attempt ${attempt}/${maxRetries}). Retrying in ${delayMs * attempt}ms...`, error.message);
      if (error.cause) {
        console.warn('Cause:', error.cause.message || error.cause);
      }
      
      await new Promise(resolve => setTimeout(resolve, delayMs * attempt));
    }
  }
  throw lastError;
}
