
// Определяем типы для интерфейса Telegram 
declare global {
  interface Window {
    Telegram?: {
      WebApp?: {
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

// Определяем типы для Telegram событий
export type TelegramEventType = 'user_login' | 'user_logout' | 'category_change' | 'matrix_update' | 'fullscreen_enter' | 'fullscreen_exit';

export interface TelegramEvent {
  type: TelegramEventType;
  userId?: number;
  userName?: string;
  categoryId?: number;
  categoryName?: string;
  details?: string;
}

import { useMutation, useQueryClient } from "@tanstack/react-query";

/**
 * Проверяет доступность Telegram API (WebApp или GameProxy)
 */
export function isTelegramAvailable(): boolean {
  return typeof window !== 'undefined' && 
         (window.Telegram !== undefined || window.TelegramGameProxy !== undefined);
}

/**
 * Проверяет доступность Telegram Game Proxy API
 */
export function isTelegramGameProxyAvailable(): boolean {
  return typeof window !== 'undefined' && 
         window.TelegramGameProxy !== undefined &&
         typeof window.TelegramGameProxy.receiveEvent === 'function';
}

/**
 * Безопасно вызывает функцию, только если Telegram API доступен
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
 * Безопасно разворачивает окно Telegram WebApp
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

/**
 * Инициализирует Telegram WebApp
 */
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
  if (isTelegramGameProxyAvailable()) {
    try {
      window.TelegramGameProxy!.receiveEvent(eventName, eventData);
      console.log(`Событие ${eventName} успешно отправлено в Telegram`, eventData);
    } catch (error) {
      console.error('Ошибка при отправке события в TelegramGameProxy:', error);
    }
  } else {
    console.log('TelegramGameProxy не доступен или не имеет метода receiveEvent', { eventName, eventData });
  }
}

/**
 * Отправляет структурированное событие в Telegram через API
 */
export async function sendTelegramApiEvent(event: TelegramEvent): Promise<void> {
  try {
    const response = await fetch('/api/telegram/webhook', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(event),
    });

    if (!response.ok) {
      const errorData = await response.json();
      console.error('Failed to send Telegram event:', errorData);
      throw new Error(`Failed to send Telegram event: ${errorData.message || 'Unknown error'}`);
    }
  } catch (error) {
    console.error('Error sending Telegram event:', error);
  }
}

// React Hook для отправки Telegram событий через API
export function useSendTelegramEvent() {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: (event: TelegramEvent) => sendTelegramApiEvent(event),
    onSuccess: () => {
      // Можно добавить какое-то действие после успешной отправки события
    },
    onError: (error) => {
      console.error('Error in telegram event mutation:', error);
    }
  });
}

// Вспомогательные функции для разных типов событий
export function sendUserLoginEvent(userId: number, userName: string) {
  return sendTelegramApiEvent({
    type: 'user_login',
    userId,
    userName
  });
}

export function sendUserLogoutEvent(userId: number, userName: string) {
  return sendTelegramApiEvent({
    type: 'user_logout',
    userId,
    userName
  });
}

export function sendCategoryChangeEvent(userId: number, userName: string, categoryId: number, categoryName: string) {
  return sendTelegramApiEvent({
    type: 'category_change',
    userId,
    userName,
    categoryId,
    categoryName
  });
}
