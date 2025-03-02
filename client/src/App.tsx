
import { useEffect } from 'react';
import { Switch, Route } from "wouter";
import { QueryClientProvider } from "@tanstack/react-query";
import { queryClient } from "./lib/queryClient";
import { isTelegramAvailable, initTelegram, sendTelegramEvent } from './lib/telegram';

// Компонент для обработки событий полного экрана
function FullscreenHandler() {
  useEffect(() => {
    const handleFullscreenChange = () => {
      const isFullscreen = document.fullscreenElement !== null;
      // Безопасно отправляем событие в Telegram
      sendTelegramEvent(isFullscreen ? 'fullscreen_enter' : 'fullscreen_exit');
    };

    // Обработчики для различных событий полного экрана
    document.addEventListener('fullscreenchange', handleFullscreenChange);
    document.addEventListener('webkitfullscreenchange', handleFullscreenChange);
    document.addEventListener('mozfullscreenchange', handleFullscreenChange);
    document.addEventListener('MSFullscreenChange', handleFullscreenChange);

    return () => {
      document.removeEventListener('fullscreenchange', handleFullscreenChange);
      document.removeEventListener('webkitfullscreenchange', handleFullscreenChange);
      document.removeEventListener('mozfullscreenchange', handleFullscreenChange);
      document.removeEventListener('MSFullscreenChange', handleFullscreenChange);
    };
  }, []);

  return null; // Этот компонент не рендерит никакого UI
}

// Компонент для инициализации Telegram
function TelegramInitializer() {
  useEffect(() => {
    if (isTelegramAvailable()) {
      initTelegram();
      console.log('Telegram успешно инициализирован');
    } else {
      console.log('Telegram недоступен в текущем контексте');
    }
  }, []);

  return null;
}

function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <TelegramInitializer />
      <FullscreenHandler />
      <Switch>
        <Route path="/">
          {/* Ваши маршруты */}
        </Route>
      </Switch>
    </QueryClientProvider>
  );
}

export default App;
export { FullscreenHandler, TelegramInitializer };


import { useEffect } from 'react';
import { isTelegramGameProxyAvailable, sendTelegramEvent } from './lib/telegram';

// Компонент для обработки событий полного экрана
function FullscreenHandler() {
  useEffect(() => {
    const handleFullscreenChange = () => {
      const isFullscreen = document.fullscreenElement !== null;
      // Безопасно отправляем событие в Telegram
      sendTelegramEvent(isFullscreen ? 'fullscreen_enter' : 'fullscreen_exit');
    };

    // Обработчики для различных событий полного экрана
    document.addEventListener('fullscreenchange', handleFullscreenChange);
    document.addEventListener('webkitfullscreenchange', handleFullscreenChange);
    document.addEventListener('mozfullscreenchange', handleFullscreenChange);
    document.addEventListener('MSFullscreenChange', handleFullscreenChange);

    return () => {
      document.removeEventListener('fullscreenchange', handleFullscreenChange);
      document.removeEventListener('webkitfullscreenchange', handleFullscreenChange);
      document.removeEventListener('mozfullscreenchange', handleFullscreenChange);
      document.removeEventListener('MSFullscreenChange', handleFullscreenChange);
    };
  }, []);

  return null; // Этот компонент не рендерит никакого UI
}

// Экспортируем компонент для использования в главном приложении
export { FullscreenHandler };

import { Switch, Route } from "wouter";
import { queryClient } from "./lib/queryClient";
import { QueryClientProvider } from "@tanstack/react-query";
import { Toaster } from "@/components/ui/toaster";
import NotFound from "@/pages/not-found";
import Home from "@/pages/home";

function Router() {
  return (
    <Switch>
      <Route path="/" component={Home} />
      <Route component={NotFound} />
    </Switch>
  );
}

function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <Router />
      <Toaster />
    </QueryClientProvider>
  );
}

export default App;
