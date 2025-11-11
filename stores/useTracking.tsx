import React, { createContext, useContext, useState, ReactNode } from "react";
import { usePersonTracker } from "../app/hooks/usePersonTracker";

interface TrackingContextType {
  // Selection flow
  selectedVideoId: number | null;
  selectedPersonId: string | null;
  setSelectedVideo: (id: number) => void;
  setSelectedPerson: (id: string) => void;
  clearSelection: () => void;

  // Tracking state
  isTrackingMode: boolean;
  setTrackingMode: (enabled: boolean) => void;

  // WebSocket functionality
  tracker: ReturnType<typeof usePersonTracker>;

  // Flow helpers
  canStartTracking: boolean;
  startTracking: () => void;
}

const TrackingContext = createContext<TrackingContextType | null>(null);

export const TrackingProvider: React.FC<{ children: ReactNode }> = ({
  children,
}) => {
  const [selectedVideoId, setSelectedVideoId] = useState<number | null>(null);
  const [selectedPersonId, setSelectedPersonId] = useState<string | null>(null);
  const [isTrackingMode, setIsTrackingMode] = useState(false);

  const tracker = usePersonTracker();

  const setSelectedVideo = (id: number) => {
    setSelectedVideoId(id);
    setSelectedPersonId(null); // Reset person when video changes
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
    selectedVideoId !== null && selectedPersonId !== null;

  const startTracking = () => {
    if (canStartTracking) {
      tracker.connect(selectedVideoId!, selectedPersonId!);
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
