/**
 * client/src/lib/telegram-safe.ts
 *
 * Этот файл предоставляет безопасные обёртки для работы с Telegram API.
 * Он включает функции для проверки доступности API, безопасного вызова функций,
 * обработки событий и разворачивания окна Telegram WebApp.
 * Также в нём добавлен глобальный обработчик ошибок, который подавляет ошибки,
 * связанные с отсутствием TelegramGameProxy.
 */

// Если объект TelegramGameProxy не определён, создаём заглушку.
if (typeof window !== 'undefined' && !window.TelegramGameProxy) {
  window.TelegramGameProxy = {
    receiveEvent: () => {
      console.warn('Заглушка: TelegramGameProxy.receiveEvent вызвана, но объект не определён.');
    }
  };
}

// Глобальный обработчик ошибок для подавления ошибок, связанных с TelegramGameProxy
if (typeof window !== 'undefined') {
  window.addEventListener('error', (event) => {
    if (event.error && event.error.message && event.error.message.includes('TelegramGameProxy')) {
      event.preventDefault();
      console.warn('Заглушена ошибка TelegramGameProxy:', event.error);
      return false;
    }
  });
}

/**
 * Проверяет, доступен ли Telegram API.
 */
export function isTelegramAvailable(): boolean {
  return typeof window !== 'undefined' &&
         (window.Telegram !== undefined || window.TelegramGameProxy !== undefined);
}

/**
 * Безопасно вызывает функцию, только если Telegram API доступен.
 * @param callback Функция для вызова.
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
 * Безопасно обрабатывает события изменения размера окна.
 * @param callback Функция обработки изменения размера.
 * @returns Функция для удаления слушателя события.
 */
export function safeHandleResize(callback: (event: UIEvent) => void): () => void {
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

/**
 * Безопасно разворачивает окно Telegram WebApp.
 */
export function safeExpandTelegramWebApp(): void {
  if (window.Telegram?.WebApp) {
    try {
      window.Telegram.WebApp.expand();
      console.log('Telegram WebApp успешно развернут');
    } catch (error) {
      console.error('Ошибка при разворачивании Telegram WebApp:', error);
    }
  } else {
    console.log('Telegram WebApp недоступен');
  }
}

