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
      receiveEvent: (eventName: string, eventData: string) => void;
    };
  }
}

export function initTelegram() {
  // Инициализация WebApp только если он доступен
  if (window.Telegram?.WebApp) {
    window.Telegram.WebApp.ready();
    window.Telegram.WebApp.expand();
  }
}