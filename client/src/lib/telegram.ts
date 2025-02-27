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
    window.TelegramGameProxy.receiveEvent(eventName, eventData);
  }
}
