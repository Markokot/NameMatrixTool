
/**
 * Безопасная обертка для проверки доступности Telegram API
 */
export function isTelegramAvailable(): boolean {
  return typeof window !== 'undefined' && 
         (window.Telegram !== undefined || window.TelegramGameProxy !== undefined);
}

/**
 * Безопасно вызывает функцию, только если Telegram API доступен
 * @param callback Функция для вызова
 */
export function withTelegram(callback: () => void): void {
  if (isTelegramAvailable()) {
    try {
      callback();
    } catch (error) {
      console.error('Ошибка при вызове Telegram API:', error);
    }
  }
}

/**
 * Безопасно обрабатывает события изменения размера окна
 * @param callback Функция обработки изменения размера
 */
export function safeHandleResize(callback: (event: UIEvent) => void): void {
  const safeCallback = (event: UIEvent) => {
    try {
      callback(event);
    } catch (error) {
      console.error('Ошибка при обработке изменения размера:', error);
    }
  };
  
  window.addEventListener('resize', safeCallback);
  return () => window.removeEventListener('resize', safeCallback);
}
    } catch (error) {
      console.error('Ошибка при вызове Telegram API:', error);
    }
  }
}
