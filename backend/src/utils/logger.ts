// ===== UTILITY FUNCTIONS =====
export const logger = {
  info: (message: string, context?: object) => {
    console.log(JSON.stringify({ level: 'info', message, ...context, timestamp: new Date().toISOString() }));
  },
  error: (message: string, error?: any, context?: object) => {
    console.error(JSON.stringify({ level: 'error', message, error: error?.toString(), ...context, timestamp: new Date().toISOString() }));
  }
};