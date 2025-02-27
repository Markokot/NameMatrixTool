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