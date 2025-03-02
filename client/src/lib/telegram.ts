
// Файл для взаимодействия с Telegram API
import { useMutation, useQueryClient } from "@tanstack/react-query";

// Определяем типы для Telegram событий
export type TelegramEventType = 'user_login' | 'user_logout' | 'category_change' | 'matrix_update';

export interface TelegramEvent {
  type: TelegramEventType;
  userId?: number;
  userName?: string;
  categoryId?: number;
  categoryName?: string;
  details?: string;
}

// Функция для отправки событий в Telegram
export async function sendTelegramEvent(event: TelegramEvent): Promise<void> {
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
    // Возможно, здесь стоит добавить какую-то обработку ошибок
  }
}

// React Hook для отправки Telegram событий
export function useSendTelegramEvent() {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: (event: TelegramEvent) => sendTelegramEvent(event),
    onSuccess: () => {
      // Можно добавить какое-то действие после успешной отправки события
      // Например, обновить какие-то данные
      // queryClient.invalidateQueries({ queryKey: ['someData'] });
    },
    onError: (error) => {
      console.error('Error in telegram event mutation:', error);
      // Можно добавить обработку ошибок, например показать уведомление
    }
  });
}

// Вспомогательные функции для разных типов событий
export function sendUserLoginEvent(userId: number, userName: string) {
  return sendTelegramEvent({
    type: 'user_login',
    userId,
    userName
  });
}

export function sendUserLogoutEvent(userId: number, userName: string) {
  return sendTelegramEvent({
    type: 'user_logout',
    userId,
    userName
  });
}

export function sendCategoryChangeEvent(userId: number, userName: string, categoryId: number, categoryName: string) {
  return sendTelegramEvent({
    type: 'category_change',
    userId,
    userName,
    categoryId,
    categoryName
  });
}

export function sendMatrixUpdateEvent(userId: number, userName: string, details: string) {
  return sendTelegramEvent({
    type: 'matrix_update',
    userId,
    userName,
    details
  });
}
