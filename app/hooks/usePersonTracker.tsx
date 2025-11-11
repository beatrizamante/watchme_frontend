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
  const [selectedVideoId, setSelectedVideoId] = useState<number | null>(null);
  const [selectedPersonId, setSelectedPersonId] = useState<string | null>(null);

  const connect = useCallback(
    (videoId: number, personId: string) => {
      if (ws.current?.readyState === WebSocket.OPEN) {
        disconnect();
      }

      setStatus((prev) => ({ ...prev, connecting: true, error: null }));
      setSelectedVideoId(videoId);
      setSelectedPersonId(personId);

      try {
        // Create WebSocket connection to your tracker endpoint
        const wsUrl = `${config.http.baseUrl.replace(
          "http",
          "ws"
        )}/ws/tracker-person?videoId=${videoId}&personId=${personId}`;
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
            setTrackingHistory((prev) => [...prev, data].slice(-100)); // Keep last 100 detections
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

          // Auto-reconnect if not manually closed
          if (event.code !== 1000 && selectedVideoId && selectedPersonId) {
            reconnectTimeoutRef.current = setTimeout(() => {
              connect(selectedVideoId, selectedPersonId);
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
    [selectedVideoId, selectedPersonId]
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
    setSelectedVideoId(null);
    setSelectedPersonId(null);
    setTrackingHistory([]);
  }, []);

  const sendCommand = useCallback((command: any) => {
    if (ws.current?.readyState === WebSocket.OPEN) {
      ws.current.send(JSON.stringify(command));
    }
  }, []);

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      disconnect();
    };
  }, [disconnect]);

  return {
    status,
    trackingHistory,
    selectedVideoId,
    selectedPersonId,
    connect,
    disconnect,
    sendCommand,
    clearHistory: () => setTrackingHistory([]),
  };
};
