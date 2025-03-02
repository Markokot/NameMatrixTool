
declare global {
  interface Window {
    Telegram: {
      WebApp: {
        ready: () => void;
        expand: () => void;
        MainButton: {
          show: () => void;
          hide: () => void;
          setText: (text: string) => void;
          onClick: (fn: () => void) => void;
        };
      };
    };
    TelegramGameProxy?: {
      receiveEvent: (eventName: string, eventData?: any) => void;
    };
  }
}

export function initTelegram() {
  // Инициализация WebApp только если он доступен в контексте Telegram
  if (window.Telegram?.WebApp) {
    window.Telegram.WebApp.ready();
    // Оборачиваем вызов expand в try-catch, чтобы избежать ошибок
    try {
      window.Telegram.WebApp.expand();
    } catch (error) {
      console.log('Не удалось развернуть WebApp:', error);
    }
  }
}

/**
 * Безопасно отправляет событие в TelegramGameProxy
 * @param eventName Название события
 * @param eventData Данные события (опционально)
 */
export function sendTelegramEvent(eventName: string, eventData?: any): void {
  if (window.TelegramGameProxy && typeof window.TelegramGameProxy.receiveEvent === 'function') {
    try {
      window.TelegramGameProxy.receiveEvent(eventName, eventData);
    } catch (error) {
      console.error('Ошибка при отправке события в TelegramGameProxy:', error);
    }
  } else {
    console.log('TelegramGameProxy не доступен или не имеет метода receiveEvent', { eventName, eventData });
  }
}
/**
 * Утилита для безопасной работы с Telegram Game API
 */

// Проверяем, доступен ли Telegram Game API
export const isTelegramGameProxyAvailable = (): boolean => {
  return typeof window !== 'undefined' && 
         window.TelegramGameProxy !== undefined;
};

// Безопасная функция отправки событий в Telegram
export const sendTelegramEvent = (eventName: string, eventData?: any): void => {
  if (isTelegramGameProxyAvailable()) {
    try {
      window.TelegramGameProxy.receiveEvent(eventName, eventData);
    } catch (error) {
      console.warn('Error sending event to Telegram Game Proxy:', error);
    }
  }
};

// Объявляем типы для TypeScript
declare global {
  interface Window {
    TelegramGameProxy?: {
      receiveEvent: (eventName: string, eventData?: any) => void;
      [key: string]: any;
    };
  }
}
