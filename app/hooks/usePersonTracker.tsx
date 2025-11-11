import { useState, useEffect, useRef, useCallback } from "react";
import { config } from "../../config";

export interface TrackingData {
  personId: number;
  personName: string;
  timestamp: number;
  boundingBox: {
    x: number;
    y: number;
    width: number;
    height: number;
  };
  confidence: number;
}

export interface WebSocketStatus {
  connected: boolean;
  connecting: boolean;
  error: string | null;
  lastMessage: TrackingData | null;
}

export const usePersonTracker = () => {
  const [status, setStatus] = useState<WebSocketStatus>({
    connected: false,
    connecting: false,
    error: null,
    lastMessage: null,
  });

  const [trackingHistory, setTrackingHistory] = useState<TrackingData[]>([]);
  const ws = useRef<WebSocket | null>(null);
  const reconnectTimeoutRef = useRef<NodeJS.Timeout>();
  const [selectedPersonId, setSelectedPersonId] = useState<string | null>(null);

  const connect = useCallback(
    (personId: string) => {
      if (ws.current?.readyState === WebSocket.OPEN) {
        disconnect();
      }

      setStatus((prev) => ({ ...prev, connecting: true, error: null }));
      setSelectedPersonId(personId);

      try {
        const wsUrl = `${config.http.baseUrl.replace(
          "http",
          "ws"
        )}/ws/video-track?personId=${personId}`;
        ws.current = new WebSocket(wsUrl);

        ws.current.onopen = () => {
          console.log("WebSocket connected for person tracking");
          setStatus((prev) => ({
            ...prev,
            connected: true,
            connecting: false,
            error: null,
          }));
        };

        ws.current.onmessage = (event) => {
          try {
            const data: TrackingData = JSON.parse(event.data);
            console.log("Received tracking data:", data);

            setStatus((prev) => ({ ...prev, lastMessage: data }));
            setTrackingHistory((prev) => [...prev, data].slice(-100));
          } catch (error) {
            console.error("Error parsing WebSocket message:", error);
          }
        };

        ws.current.onclose = (event) => {
          console.log("WebSocket closed:", event.code, event.reason);
          setStatus((prev) => ({
            ...prev,
            connected: false,
            connecting: false,
          }));

          if (event.code !== 1000 && selectedPersonId) {
            reconnectTimeoutRef.current = setTimeout(() => {
              connect(selectedPersonId);
            }, 3000);
          }
        };

        ws.current.onerror = (error) => {
          console.error("WebSocket error:", error);
          setStatus((prev) => ({
            ...prev,
            error: "Connection failed",
            connecting: false,
          }));
        };
      } catch (error) {
        setStatus((prev) => ({
          ...prev,
          error: `Failed to connect: ${error}`,
          connecting: false,
        }));
      }
    },
    [selectedPersonId]
  );

  const disconnect = useCallback(() => {
    if (reconnectTimeoutRef.current) {
      clearTimeout(reconnectTimeoutRef.current);
    }

    if (ws.current) {
      ws.current.close(1000, "Manual disconnect");
      ws.current = null;
    }

    setStatus({
      connected: false,
      connecting: false,
      error: null,
      lastMessage: null,
    });
    setSelectedPersonId(null);
    setTrackingHistory([]);
  }, []);

  const sendCommand = useCallback((command: any) => {
    if (ws.current?.readyState === WebSocket.OPEN) {
      ws.current.send(JSON.stringify(command));
    }
  }, []);

  useEffect(() => {
    return () => {
      disconnect();
    };
  }, [disconnect]);

  return {
    status,
    trackingHistory,
    selectedPersonId,
    connect,
    disconnect,
    sendCommand,
    clearHistory: () => setTrackingHistory([]),
  };
};
