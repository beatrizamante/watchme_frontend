import React, { createContext, useContext, useState, ReactNode } from "react";
import { usePersonTracker } from "../app/hooks/usePersonTracker";

interface TrackingContextType {
  selectedVideoId: number | null;
  selectedPersonId: string | null;
  setSelectedVideo: (id: number) => void;
  setSelectedPerson: (id: string) => void;
  clearSelection: () => void;
  isTrackingMode: boolean;
  setTrackingMode: (enabled: boolean) => void;
  tracker: ReturnType<typeof usePersonTracker>;
  canStartTracking: boolean;
  startTracking: () => void;
  isProcessingVideo: boolean;
  setProcessingVideo: (processing: boolean) => void;
}

const TrackingContext = createContext<TrackingContextType | null>(null);

export const TrackingProvider: React.FC<{ children: ReactNode }> = ({
  children,
}) => {
  const [selectedVideoId, setSelectedVideoId] = useState<number | null>(null);
  const [selectedPersonId, setSelectedPersonId] = useState<string | null>(null);
  const [isTrackingMode, setIsTrackingMode] = useState(false);
  const [isProcessingVideo, setIsProcessingVideo] = useState(false);

  const tracker = usePersonTracker();

  const setSelectedVideo = (id: number) => {
    setSelectedVideoId(id);
    setSelectedPersonId(null);
  };

  const setSelectedPerson = (id: string) => {
    setSelectedPersonId(id);
  };

  const clearSelection = () => {
    setSelectedVideoId(null);
    setSelectedPersonId(null);
    setIsTrackingMode(false);
    tracker.disconnect();
  };

  const canStartTracking =
    selectedVideoId !== null && selectedPersonId !== null && !isProcessingVideo;

  const startTracking = () => {
    if (canStartTracking) {
      tracker.connect(selectedPersonId!);
      setIsTrackingMode(true);
    }
  };

  const value: TrackingContextType = {
    selectedVideoId,
    selectedPersonId,
    setSelectedVideo,
    setSelectedPerson,
    clearSelection,
    isTrackingMode,
    setTrackingMode: setIsTrackingMode,
    tracker,
    canStartTracking,
    startTracking,
    isProcessingVideo,
    setProcessingVideo: setIsProcessingVideo,
  };

  return (
    <TrackingContext.Provider value={value}>
      {children}
    </TrackingContext.Provider>
  );
};

export const useTracking = (): TrackingContextType => {
  const context = useContext(TrackingContext);
  if (!context) {
    throw new Error("useTracking must be used within a TrackingProvider");
  }
  return context;
};
