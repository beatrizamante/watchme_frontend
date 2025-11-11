import { useState, useEffect, useRef, useCallback } from "react";

interface WebSocketMessage {
  type: "detection" | "status" | "error";
  data: any;
}

interface DetectionData {
  timestamp: number;
  boundingBox: {
    x: number;
    y: number;
    width: number;
    height: number;
  };
  confidence: number;
  personId?: string;
}

interface UseWebSocketProps {
  url: string;
  enabled: boolean;
  selectedPersonId?: string;
  onDetection?: (detection: DetectionData) => void;
  onError?: (error: string) => void;
}

export const useWebSocket = ({
  url,
  enabled,
  selectedPersonId,
  onDetection,
  onError,
}: UseWebSocketProps) => {
  const [isConnected, setIsConnected] = useState(false);
  const [isConnecting, setIsConnecting] = useState(false);
  const [detections, setDetections] = useState<DetectionData[]>([]);
  const [lastDetection, setLastDetection] = useState<DetectionData | null>(
    null
  );
  const wsRef = useRef<WebSocket | null>(null);
  const reconnectTimeoutRef = useRef<NodeJS.Timeout>();
  const maxReconnectAttempts = 5;
  const [reconnectAttempts, setReconnectAttempts] = useState(0);

  const connect = useCallback(() => {
    if (wsRef.current?.readyState === WebSocket.OPEN) {
      return;
    }

    setIsConnecting(true);
    console.log("Connecting to WebSocket:", url);

    try {
      wsRef.current = new WebSocket(url);

      wsRef.current.onopen = () => {
        console.log("WebSocket connected");
        setIsConnected(true);
        setIsConnecting(false);
        setReconnectAttempts(0);

        if (selectedPersonId) {
          wsRef.current?.send(
            JSON.stringify({
              type: "configure",
              personId: selectedPersonId,
              enableDetection: true,
            })
          );
        }
      };

      wsRef.current.onmessage = (event) => {
        try {
          const message: WebSocketMessage = JSON.parse(event.data);

          switch (message.type) {
            case "detection":
              const detection = message.data as DetectionData;
              setLastDetection(detection);
              setDetections((prev) => [...prev.slice(-9), detection]);
              onDetection?.(detection);
              break;

            case "status":
              console.log("WebSocket status:", message.data);
              break;

            case "error":
              console.error("WebSocket error:", message.data);
              onError?.(message.data);
              break;
          }
        } catch (error) {
          console.error("Error parsing WebSocket message:", error);
        }
      };

      wsRef.current.onclose = (event) => {
        console.log("WebSocket disconnected:", event.code, event.reason);
        setIsConnected(false);
        setIsConnecting(false);

        if (
          enabled &&
          event.code !== 1000 &&
          reconnectAttempts < maxReconnectAttempts
        ) {
          const timeout = Math.min(
            1000 * Math.pow(2, reconnectAttempts),
            30000
          );
          console.log(`Reconnecting in ${timeout}ms...`);

          reconnectTimeoutRef.current = setTimeout(() => {
            setReconnectAttempts((prev) => prev + 1);
            connect();
          }, timeout);
        }
      };

      wsRef.current.onerror = (error) => {
        console.error("WebSocket error:", error);
        setIsConnecting(false);
        onError?.("WebSocket connection error");
      };
    } catch (error) {
      console.error("Failed to create WebSocket connection:", error);
      setIsConnecting(false);
      onError?.("Failed to create WebSocket connection");
    }
  }, [url, enabled, selectedPersonId, onDetection, onError, reconnectAttempts]);

  const disconnect = useCallback(() => {
    console.log("Disconnecting WebSocket");

    if (reconnectTimeoutRef.current) {
      clearTimeout(reconnectTimeoutRef.current);
    }

    if (wsRef.current) {
      wsRef.current.close(1000, "Manual disconnect");
      wsRef.current = null;
    }

    setIsConnected(false);
    setIsConnecting(false);
    setReconnectAttempts(0);
    setDetections([]);
    setLastDetection(null);
  }, []);

  const sendMessage = useCallback((message: any) => {
    if (wsRef.current?.readyState === WebSocket.OPEN) {
      wsRef.current.send(JSON.stringify(message));
      return true;
    }
    return false;
  }, []);

  const updatePersonId = useCallback(
    (personId: string) => {
      sendMessage({
        type: "configure",
        personId: personId,
        enableDetection: true,
      });
    },
    [sendMessage]
  );

  useEffect(() => {
    if (enabled && !isConnected && !isConnecting) {
      connect();
    } else if (!enabled && (isConnected || isConnecting)) {
      disconnect();
    }

    return () => {
      if (reconnectTimeoutRef.current) {
        clearTimeout(reconnectTimeoutRef.current);
      }
    };
  }, [enabled, connect, disconnect, isConnected, isConnecting]);

  useEffect(() => {
    return () => {
      disconnect();
    };
  }, [disconnect]);

  return {
    isConnected,
    isConnecting,
    detections,
    lastDetection,
    connect,
    disconnect,
    sendMessage,
    updatePersonId,
    reconnectAttempts,
  };
};
