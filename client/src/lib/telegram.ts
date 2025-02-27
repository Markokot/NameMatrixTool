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
  if (window.Telegram) {
    window.Telegram.WebApp.ready();
    window.Telegram.WebApp.expand();
  }
}
