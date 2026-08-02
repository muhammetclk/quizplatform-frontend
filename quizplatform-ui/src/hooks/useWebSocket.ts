import { useEffect, useRef, useState } from 'react';
import { Client } from '@stomp/stompjs';
import SockJS from 'sockjs-client';
import type { QuizAiResult } from '../types';

export const useWebSocket = (userId: string | null) => {
  const [aiResult, setAiResult] = useState<QuizAiResult | null>(null);
  const [connected, setConnected] = useState(false);
  const clientRef = useRef<Client | null>(null);

  useEffect(() => {
    if (!userId) return;

    const client = new Client({
      webSocketFactory: () => new SockJS('/ws-ai'),
      reconnectDelay: 5000,
      onConnect: () => {
        setConnected(true);
        client.subscribe(`/topic/quiz-result/${userId}`, (message) => {
          const result: QuizAiResult = JSON.parse(message.body);
          setAiResult(result);
        });
      },
      onDisconnect: () => setConnected(false),
    });

    client.activate();
    clientRef.current = client;

    return () => {
      client.deactivate();
    };
  }, [userId]);

  return { aiResult, connected };
};
