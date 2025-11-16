import {
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  Dimensions,
  Platform,
} from "react-native";
import React, { useState, useEffect } from "react";
import { useRouter } from "expo-router";
import { VideoView, useVideoPlayer } from "expo-video";
import Footer from "../../components/Footer";
import Button from "../../components/Button";
import Ionicons from "@expo/vector-icons/Ionicons";
import { useTracking } from "../../stores/useTracking";
import { usePeopleApi } from "../hooks/usePeopleApi";
import { Detections, Match } from "../interfaces/detections";

export default function SearchPerson() {
  const router = useRouter();
  const screenWidth = Dimensions.get("window").width;
  const videoHeight = (screenWidth - 48) * 0.6;
  const {
    selectedVideoId,
    selectedPersonId,
    clearSelection,
    canStartTracking,
    startTracking,
    isTrackingMode,
    tracker,
    isProcessingVideo,
    setProcessingVideo,
  } = useTracking();
  const { search } = usePeopleApi();
  const [videoData, setVideoData] = useState<Detections["video"] | null>(null);
  const [personData, setPersonData] = useState<Detections["person"] | null>(
    null
  );
  const [matches, setMatches] = useState<Detections["matches"]>([]);
  const [currentTime, setCurrentTime] = useState(0);
  const [selectedDetection, setSelectedDetection] = useState<Match | null>(
    null
  );
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [videoError, setVideoError] = useState<string | null>(null);
  const [videoDebugInfo, setVideoDebugInfo] = useState<string>("");
  const [htmlVideoRef, setHtmlVideoRef] = useState<HTMLVideoElement | null>(
    null
  );
  const [bboxMode, setBboxMode] = useState<
    "auto" | "xywh" | "xyxy" | "normalized_xywh" | "normalized_xyxy"
  >("auto");
  const [actualVideoDimensions, setActualVideoDimensions] = useState<{
    width: number;
    height: number;
  } | null>(null);

  const player = useVideoPlayer(videoData?.path || "", (player: any) => {
    player.loop = false;

    if (Platform.OS === "web") {
      player.muted = false;
      player.crossorigin = "anonymous";
    }

    player.addListener("statusChange", (status: any) => {
      console.log("Video status changed:", status);
      setVideoDebugInfo(`Status: ${JSON.stringify(status)}`);

      if (status.error) {
        console.error("Video error:", status.error);
        setVideoError(`Video Error: ${status.error}`);
      }

      if (status.isLoaded && player.duration && videoData) {
        console.log("Video loaded successfully. Duration:", player.duration);
        setVideoError(null);
        setVideoData((prev) =>
          prev ? { ...prev, duration: player.duration } : null
        );

        if (matches.length > 0) {
          setTimeout(() => {
            try {
              player.play();
              console.log("Auto-starting video playback");
            } catch (playError) {
              console.error("Error auto-playing video:", playError);
              setVideoError(`Playback Error: ${playError}`);
            }
          }, 500);
        }
      }
    });

    player.addListener("error", (error: any) => {
      console.error("Video player error:", error);
      setVideoError(`Player Error: ${error.message || error}`);
    });
  });

  useEffect(() => {
    if (!selectedVideoId || !selectedPersonId) {
      setError("No video or person selected. Please go back and select both.");
      setLoading(false);
    } else {
      setLoading(false);
      setError(null);
    }
  }, [selectedVideoId, selectedPersonId]);

  const startDetection = async () => {
    if (!selectedVideoId || !selectedPersonId) {
      setError("No video or person selected. Please go back and select both.");
      return;
    }

    try {
      setLoading(true);
      setError(null);
      setProcessingVideo(true);

      console.log(
        `Starting AI analysis for person ${selectedPersonId} in video ${selectedVideoId}`
      );

      const searchResult = await search(
        Number(selectedPersonId),
        Number(selectedVideoId)
      );
      if (!searchResult) {
        throw new Error("No search results found");
      }

      console.log("Video path from API:", searchResult.video.path);
      const videoPath = searchResult.video.path;

      let processedVideoPath = videoPath;
      if (Platform.OS === "web") {
        if (videoPath.startsWith("/")) {
          processedVideoPath = `http://localhost:3000${videoPath}`;
          console.log("Auto-converted to localhost:3000:", processedVideoPath);
        }
      }

      setVideoError(null);
      setVideoDebugInfo(`Loading video: ${processedVideoPath}`);

      setVideoData({
        id: searchResult.video.id,
        path: processedVideoPath,
      });

      setPersonData({
        id: searchResult.person.id,
        name: searchResult.person.name,
      });

      setMatches(searchResult.matches || []);

      console.log(
        `Loaded ${searchResult.matches?.length || 0} matches for ${
          searchResult.person.name
        }`
      );
      setLoading(false);
      setProcessingVideo(false);
    } catch (err: any) {
      console.error("Error loading search results:", err);
      setError(err.message || "Failed to load search results");
      setLoading(false);
      setProcessingVideo(false);
    }
  };

  const jumpToTimestamp = (timestamp: number) => {
    try {
      if (Platform.OS === "web" && htmlVideoRef) {
        htmlVideoRef.currentTime = timestamp;
        setCurrentTime(timestamp);
        console.log(`Jumping to timestamp: ${timestamp}s (HTML5)`);
      } else if (player) {
        player.currentTime = timestamp;
        setCurrentTime(timestamp);
        console.log(`Jumping to timestamp: ${timestamp}s (Expo)`);
      }
    } catch (error) {
      console.error("Error seeking video:", error);
    }
  };

  const handlePlayPause = () => {
    try {
      if (Platform.OS === "web" && htmlVideoRef) {
        if (htmlVideoRef.paused) {
          htmlVideoRef.play();
          console.log("Playing HTML5 video");
        } else {
          htmlVideoRef.pause();
          console.log("Pausing HTML5 video");
        }
      } else if (player) {
        if (player.playing) {
          player.pause();
        } else {
          player.play();
        }
      }
    } catch (error) {
      console.error("Error controlling video playback:", error);
    }
  };

  useEffect(() => {
    const interval = setInterval(() => {
      if (Platform.OS === "web" && htmlVideoRef) {
        setCurrentTime(htmlVideoRef.currentTime);
      } else if (player && player.currentTime !== undefined) {
        setCurrentTime(player.currentTime);
      }
    }, 100);

    return () => clearInterval(interval);
  }, [player, htmlVideoRef]);

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = Math.floor(seconds % 60);
    return `${mins}:${secs.toString().padStart(2, "0")}`;
  };

  useEffect(() => {
    if (matches.length > 0) {
      const currentDetection = matches.find(
        (match: Match) => Math.abs(match.timestamp - currentTime) < 0.1
      );

      // Only show detection if within tight time range - no fallback from start
      const finalDetection = currentDetection || null;

      if (finalDetection) {
        const bbox = finalDetection.bbox;
        console.log(`🎯 Detection check at ${currentTime.toFixed(2)}s:`, {
          exactMatch: !!currentDetection,
          usedTimestamp: finalDetection.timestamp,
          timeDifference: Math.abs(
            finalDetection.timestamp - currentTime
          ).toFixed(3),
          rawBbox: bbox,
          bboxType: typeof bbox,
          bboxLength: Array.isArray(bbox) ? bbox.length : "not array",

          backendFormat_XYWH: {
            description: "Backend format: [x, y, width, height] in pixels",
            left: `${(bbox[0] / 1920) * 100}%`,
            top: `${(bbox[1] / 1080) * 100}%`,
            width: `${(bbox[2] / 1920) * 100}%`,
            height: `${(bbox[3] / 1080) * 100}%`,
          },
          videoElement:
            Platform.OS === "web" && htmlVideoRef
              ? {
                  videoWidth: htmlVideoRef.videoWidth || "unknown",
                  videoHeight: htmlVideoRef.videoHeight || "unknown",
                  displayWidth: htmlVideoRef.clientWidth || "unknown",
                  displayHeight: htmlVideoRef.clientHeight || "unknown",
                }
              : "not web or no ref",

          totalMatches: matches.length,
        });
      }

      setSelectedDetection(finalDetection || null);
    } else {
      setSelectedDetection(null);
    }
  }, [currentTime, matches]);

  const handleStartLiveTracking = () => {
    if (canStartTracking) {
      startTracking();
      router.push("/(user)/liveTracking");
    }
  };

  const handleGoToVideoList = () => {
    router.push("/(user)/videoList");
  };

  const handleBack = () => {
    setProcessingVideo(false);
    clearSelection();
    router.back();
  };

  useEffect(() => {
    return () => {
      setProcessingVideo(false);
    };
  }, [setProcessingVideo]);

  return (
    <>
      <ScrollView
        contentContainerStyle={{
          paddingHorizontal: 24,
          paddingTop: 24,
          paddingBottom: 160,
          flexGrow: 1,
        }}
        keyboardShouldPersistTaps="handled"
      >
        <View className="flex flex-col gap-4 mb-2">
          <View className="flex flex-row justify-start items-center w-full pl-2 mb-4">
            <TouchableOpacity className="flex" onPress={handleBack}>
              <Text className="text-lg text-darker font-semibold">Back</Text>
            </TouchableOpacity>
          </View>
          <View className="flex justify-center items-center w-full mb-4">
            <Text className="text-darker text-center font-semibold">
              Search Results
            </Text>
          </View>

          {loading && (
            <View className="flex justify-center items-center py-16">
              <View className="bg-blue-50 border border-blue-200 rounded-lg p-6 w-full">
                <View className="flex items-center mb-4">
                  <View className="w-12 h-12 mb-4">
                    <Ionicons name="analytics" size={48} color="#3B82F6" />
                  </View>
                  <Text className="text-blue-800 text-lg font-semibold text-center">
                    🤖 AI Processing Video
                  </Text>
                </View>
                <Text className="text-blue-700 text-center text-sm leading-5 mb-4">
                  Our AI worker is analyzing the video and searching for person
                  matches. This may take a few moments...
                </Text>
                <View className="p-3 bg-blue-100 rounded-lg">
                  <Text className="text-blue-600 text-xs text-center">
                    💡 Tip: The video will auto-play when analysis is complete
                  </Text>
                </View>
              </View>
            </View>
          )}

          {!loading &&
            !error &&
            selectedVideoId &&
            selectedPersonId &&
            !videoData && (
              <View className="flex justify-center items-center py-16">
                <View className="bg-green-50 border border-green-200 rounded-lg p-6 w-full">
                  <View className="flex items-center mb-4">
                    <Ionicons name="play-circle" size={48} color="#059669" />
                    <Text className="text-green-800 text-lg font-semibold text-center mt-2">
                      Ready to Start Detection
                    </Text>
                  </View>
                  <Text className="text-green-700 text-center text-sm mb-4">
                    Video and person are selected. Click the button below to
                    start AI analysis.
                  </Text>
                  <TouchableOpacity
                    onPress={startDetection}
                    disabled={isProcessingVideo}
                    className="bg-green-600 px-6 py-3 rounded-lg"
                  >
                    <View className="flex-row items-center justify-center">
                      <Ionicons name="search" className="text-xl text-darker" />
                      <Text className="text-darker font-semibold ml-2">
                        Start AI Detection
                      </Text>
                    </View>
                  </TouchableOpacity>
                </View>
              </View>
            )}

          {error && (
            <View>
              <View className="bg-yellow-50 border border-yellow-200 p-4 rounded-lg mb-4">
                <Text className="text-yellow-800 font-semibold">Notice:</Text>
                <Text className="text-yellow-700">{error}</Text>
              </View>

              <View className="flex flex-col gap-4">
                <Text className="text-darker text-center text-lg font-semibold">
                  Choose an option:
                </Text>

                <View className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                  <Text className="text-blue-800 font-semibold mb-2">
                    📹 Select Video & Person
                  </Text>
                  <Text className="text-blue-700 text-sm mb-3">
                    Go back to select both a video and person for search
                    tracking.
                  </Text>
                  <View className="flex-row gap-2">
                    <TouchableOpacity
                      onPress={handleGoToVideoList}
                      className="flex-1 bg-blue-100 border border-blue-300 rounded-lg p-3"
                    >
                      <View className="flex-row items-center justify-center">
                        <Ionicons name="videocam" size={20} color="#3B82F6" />
                        <Text className="text-blue-800 font-semibold ml-2">
                          Select Again
                        </Text>
                      </View>
                    </TouchableOpacity>
                    {selectedVideoId && selectedPersonId && (
                      <TouchableOpacity
                        onPress={startDetection}
                        disabled={isProcessingVideo}
                        className="flex-1 bg-green-600 rounded-lg p-3"
                      >
                        <View className="flex-row items-center justify-center">
                          <Ionicons name="search" size={16} color="white" />
                          <Text className="text-white font-semibold ml-1 text-sm">
                            Try Again
                          </Text>
                        </View>
                      </TouchableOpacity>
                    )}
                  </View>
                </View>

                <View className="bg-red-50 border border-red-200 rounded-lg p-4">
                  <Text className="text-red-800 font-semibold mb-2">
                    🔴 Live Feed Tracking
                  </Text>
                  <Text className="text-red-700 text-sm mb-3">
                    Connect to a live camera feed for real-time tracking. You
                    can select a person after connecting.
                  </Text>
                  <Button
                    content="Start Live Tracking"
                    onPress={handleStartLiveTracking}
                  />
                </View>

                {isTrackingMode && (
                  <View className="bg-green-50 border border-green-200 rounded-lg p-4">
                    <View className="flex-row items-center">
                      <View
                        className={`w-3 h-3 rounded-full mr-2 ${
                          tracker.status.connected
                            ? "bg-green-500"
                            : tracker.status.connecting
                            ? "bg-yellow-500"
                            : "bg-red-500"
                        }`}
                      />
                      <Text className="text-green-800 font-semibold">
                        Live Tracking:{" "}
                        {tracker.status.connected
                          ? "Connected"
                          : tracker.status.connecting
                          ? "Connecting..."
                          : "Disconnected"}
                      </Text>
                    </View>
                  </View>
                )}
              </View>
            </View>
          )}

          {!loading && !error && videoData && personData && (
            <>
              {Platform.OS === "web" && videoDebugInfo && (
                <View className="bg-gray-100 border border-gray-300 rounded-lg p-3 mb-4">
                  <Text className="text-gray-700 text-xs font-mono">
                    Debug: {videoDebugInfo}
                  </Text>
                  <Text className="text-gray-600 text-xs mt-1">
                    Video Path: {videoData.path}
                  </Text>
                </View>
              )}

              {videoError && (
                <View className="bg-red-50 border border-red-200 rounded-lg p-3 mb-4">
                  <Text className="text-red-700 text-sm font-semibold">
                    Video Loading Issue:
                  </Text>
                  <Text className="text-red-600 text-xs mt-1">
                    {videoError}
                  </Text>

                  {(videoError.includes("CORS") ||
                    videoError.includes("safety check")) && (
                    <View className="bg-yellow-100 border border-yellow-300 rounded p-2 mt-2">
                      <Text className="text-yellow-800 text-xs font-semibold mb-1">
                        💡 CORS Issue Solution:
                      </Text>
                      <Text className="text-yellow-700 text-xs">
                        1. Make sure your backend serves videos with proper CORS
                        headers{"\n"}
                        2. Or run your backend on the same port as this app
                        {"\n"}
                        3. Click "Try Alt URL" to test with localhost:3000
                      </Text>
                    </View>
                  )}
                  <View className="flex-row flex-wrap gap-2 mt-2">
                    <TouchableOpacity
                      onPress={() => {
                        setVideoError(null);
                        console.log("Retrying video load...");
                      }}
                      className="bg-red-600 px-3 py-2 rounded"
                    >
                      <Text className="text-white text-xs font-semibold">
                        Retry
                      </Text>
                    </TouchableOpacity>

                    {Platform.OS === "web" && (
                      <>
                        <TouchableOpacity
                          onPress={() => {
                            console.log("Testing video URL:", videoData.path);
                            window.open(videoData.path, "_blank");
                          }}
                          className="bg-blue-600 px-3 py-2 rounded"
                        >
                          <Text className="text-white text-xs font-semibold">
                            Test URL
                          </Text>
                        </TouchableOpacity>

                        <TouchableOpacity
                          onPress={() => {
                            // Try alternative URL with localhost:3000
                            const originalPath = videoData.path.replace(
                              window.location.origin,
                              ""
                            );
                            const altUrl = `http://localhost:3000${originalPath}`;
                            console.log("Trying alternative URL:", altUrl);
                            setVideoData((prev) =>
                              prev ? { ...prev, path: altUrl } : null
                            );
                            setVideoError(null);
                          }}
                          className="bg-green-600 px-3 py-2 rounded"
                        >
                          <Text className="text-white text-xs font-semibold">
                            Try Alt URL
                          </Text>
                        </TouchableOpacity>

                        <TouchableOpacity
                          onPress={() => {
                            navigator.clipboard.writeText(videoData.path);
                            console.log("Copied to clipboard:", videoData.path);
                          }}
                          className="bg-purple-600 px-3 py-2 rounded"
                        >
                          <Text className="text-white text-xs font-semibold">
                            Copy URL
                          </Text>
                        </TouchableOpacity>
                      </>
                    )}
                  </View>
                </View>
              )}

              <View
                className="bg-black rounded-lg overflow-hidden relative"
                style={{
                  height: videoHeight,
                  zIndex: 1,
                }}
              >
                {Platform.OS === "web" ? (
                  <video
                    ref={(ref) => setHtmlVideoRef(ref)}
                    src={videoData.path}
                    style={{
                      width: "100%",
                      height: "100%",
                      objectFit: "cover",
                      position: "relative",
                      zIndex: 0,
                    }}
                    controls
                    crossOrigin="anonymous"
                    preload="metadata"
                    onError={(e) => {
                      console.error("HTML5 video error:", e);
                      const videoElement = e.target as HTMLVideoElement;
                      const error = videoElement.error;
                      let errorMessage = "Unknown error";

                      if (error) {
                        switch (error.code) {
                          case 1:
                            errorMessage = "Video loading aborted";
                            break;
                          case 2:
                            errorMessage = "Network error while loading video";
                            break;
                          case 3:
                            errorMessage =
                              "Video format not supported or corrupted";
                            break;
                          case 4:
                            errorMessage =
                              "Video source not available (CORS/Security issue)";
                            break;
                          default:
                            errorMessage = error.message || "Unknown error";
                        }
                      }

                      setVideoError(`HTML5 Video Error: ${errorMessage}`);
                      console.log("Error details:", {
                        code: error?.code,
                        message: error?.message,
                      });
                    }}
                    onLoadedData={() => {
                      console.log("HTML5 video loaded successfully");
                      setVideoError(null);

                      if (htmlVideoRef) {
                        const videoWidth = htmlVideoRef.videoWidth;
                        const videoHeight = htmlVideoRef.videoHeight;
                        setActualVideoDimensions({
                          width: videoWidth,
                          height: videoHeight,
                        });
                        console.log("📐 Detected video dimensions:", {
                          videoWidth,
                          videoHeight,
                        });
                      }
                    }}
                    onTimeUpdate={() => {
                      if (htmlVideoRef) {
                        setCurrentTime(htmlVideoRef.currentTime);
                      }
                    }}
                  />
                ) : (
                  <VideoView
                    style={{ width: "100%", height: "100%" }}
                    player={player}
                    allowsFullscreen
                    allowsPictureInPicture
                  />
                )}

                {selectedDetection && (
                  <>
                    {/* Debug bbox values */}
                    {(() => {
                      const bbox = selectedDetection.bbox;
                      console.log("🎯 EXACT BBOX:", bbox);
                      console.log(
                        "BBOX[0]:",
                        bbox[0],
                        "BBOX[1]:",
                        bbox[1],
                        "BBOX[2]:",
                        bbox[2],
                        "BBOX[3]:",
                        bbox[3]
                      );
                      return null;
                    })()}

                    {(() => {
                      const bbox = selectedDetection.bbox;

                      // Backend processing resolution (from coordinate_info)
                      const backendWidth = 480;
                      const backendHeight = 848;

                      // Current displayed video size
                      const displayWidth = screenWidth - 48; // Account for padding
                      const displayHeight = videoHeight; // (screenWidth - 48) * 0.6

                      // Convert XYXY to position and dimensions in backend coordinates
                      const x1_backend = bbox[0]; // left
                      const y1_backend = bbox[1]; // top
                      const x2_backend = bbox[2]; // right
                      const y2_backend = bbox[3]; // bottom

                      const width_backend = x2_backend - x1_backend;
                      const height_backend = y2_backend - y1_backend;

                      const scaleX = displayWidth / backendWidth;
                      const scaleY = displayHeight / backendHeight;

                      const x1_display = x1_backend * scaleX;
                      const y1_display = y1_backend * scaleY;
                      const width_display = width_backend * scaleX;
                      const height_display = height_backend * scaleY;

                      console.log("🎯 SCALED BBOX SOLUTION:", {
                        rawBbox: bbox,
                        backendSize: `${backendWidth}x${backendHeight}`,
                        displaySize: `${displayWidth}x${displayHeight}`,
                        scaling: {
                          scaleX: scaleX.toFixed(3),
                          scaleY: scaleY.toFixed(3),
                        },
                        backendCoords: {
                          x1_backend,
                          y1_backend,
                          width_backend,
                          height_backend,
                        },
                        displayCoords: {
                          x1: x1_display.toFixed(1),
                          y1: y1_display.toFixed(1),
                          width: width_display.toFixed(1),
                          height: height_display.toFixed(1),
                        },
                        percentages: {
                          left: `${((x1_display / displayWidth) * 100).toFixed(
                            1
                          )}%`,
                          top: `${((y1_display / displayHeight) * 100).toFixed(
                            1
                          )}%`,
                          width: `${(
                            (width_display / displayWidth) *
                            100
                          ).toFixed(1)}%`,
                          height: `${(
                            (height_display / displayHeight) *
                            100
                          ).toFixed(1)}%`,
                        },
                      });

                      return (
                        <View
                          style={{
                            position: "absolute",
                            left: `${(x1_display / displayWidth) * 100}%`,
                            top: `${(y1_display / displayHeight) * 100}%`,
                            width: `${(width_display / displayWidth) * 100}%`,
                            height: `${
                              (height_display / displayHeight) * 100
                            }%`,
                            borderWidth: 3,
                            borderColor: "#FF0000",
                            backgroundColor: "rgba(255, 0, 0, 0.1)",
                            zIndex: 70,
                            pointerEvents: "none",
                            minWidth: 30,
                            minHeight: 30,
                          }}
                        >
                          <View
                            style={{
                              position: "absolute",
                              top: -28,
                              left: 0,
                              backgroundColor: "#FF0000",
                              paddingHorizontal: 8,
                              paddingVertical: 4,
                              borderRadius: 3,
                              minWidth: 40,
                            }}
                          >
                            <Text
                              style={{
                                color: "white",
                                fontSize: 12,
                                fontWeight: "bold",
                              }}
                            >
                              {personData.name}
                            </Text>
                          </View>
                        </View>
                      );
                    })()}
                  </>
                )}

                {selectedDetection && (
                  <>
                    <View
                      className="absolute top-4 left-4 bg-red-500/90 px-3 py-2 rounded-lg"
                      style={{ zIndex: 20, pointerEvents: "none" }}
                    >
                      <Text className="text-white text-xs font-bold">
                        🔴 DETECTION ACTIVE
                      </Text>
                    </View>

                    <View
                      style={{
                        position: "absolute",
                        top: 10,
                        right: 10,
                        backgroundColor: "rgba(0, 0, 0, 0.9)",
                        padding: 8,
                        borderRadius: 4,
                        zIndex: 100,
                        maxWidth: 250,
                      }}
                    >
                      <Text
                        style={{
                          color: "#FFD700",
                          fontSize: 10,
                          fontWeight: "bold",
                        }}
                      >
                        BBOX DEBUG: {JSON.stringify(selectedDetection.bbox)}
                      </Text>
                      <Text
                        style={{
                          color: "white",
                          fontSize: 10,
                          fontFamily: "monospace",
                        }}
                      >
                        Dims:{" "}
                        {actualVideoDimensions
                          ? `${actualVideoDimensions.width}x${actualVideoDimensions.height}`
                          : "unknown"}{" "}
                        | Time: {currentTime.toFixed(2)}s
                      </Text>
                      <Text
                        style={{
                          color: "#00FF00",
                          fontSize: 10,
                          fontFamily: "monospace",
                        }}
                      >
                        Detection: {selectedDetection.timestamp.toFixed(2)}s
                      </Text>
                      <Text
                        style={{
                          color: "#FF6600",
                          fontSize: 10,
                          fontFamily: "monospace",
                        }}
                      >
                        Δ:{" "}
                        {Math.abs(
                          selectedDetection.timestamp - currentTime
                        ).toFixed(3)}
                        s
                      </Text>
                      <TouchableOpacity
                        style={{
                          backgroundColor: "#FF6600",
                          padding: 4,
                          borderRadius: 2,
                          marginTop: 4,
                        }}
                        onPress={() => {
                          console.log(
                            "🔄 Manual sync to detection timestamp:",
                            selectedDetection.timestamp
                          );
                          jumpToTimestamp(selectedDetection.timestamp);
                        }}
                      >
                        <Text
                          style={{
                            color: "white",
                            fontSize: 8,
                            fontWeight: "bold",
                          }}
                        >
                          SYNC
                        </Text>
                      </TouchableOpacity>
                    </View>
                  </>
                )}

                <View
                  className="absolute bottom-0 left-0 right-0 bg-black/90 p-4"
                  style={{ zIndex: 25 }}
                >
                  {selectedDetection && (
                    <View
                      className="bg-red-500/20 border border-red-500/50 rounded-lg p-2 mb-3"
                      style={{ zIndex: 30, pointerEvents: "none" }}
                    >
                      <Text className="text-red-200 text-xs text-center">
                        {personData.name} detected at{" "}
                        {formatTime(selectedDetection.timestamp)}
                      </Text>
                    </View>
                  )}

                  <View className="flex-row justify-between items-center">
                    <TouchableOpacity onPress={handlePlayPause}>
                      <Ionicons
                        name={
                          Platform.OS === "web" && htmlVideoRef
                            ? htmlVideoRef.paused
                              ? "play"
                              : "pause"
                            : player?.playing
                            ? "pause"
                            : "play"
                        }
                        size={24}
                        color="white"
                      />
                    </TouchableOpacity>

                    <View className="flex-1 mx-4">
                      <View className="h-1 bg-gray-600 rounded-full">
                        <View
                          className="h-1 bg-white rounded-full"
                          style={{
                            width: `${
                              Platform.OS === "web" &&
                              htmlVideoRef &&
                              htmlVideoRef.duration
                                ? (currentTime / htmlVideoRef.duration) * 100
                                : player?.duration
                                ? (currentTime / player.duration) * 100
                                : 0
                            }%`,
                          }}
                        />
                        {matches.map((match: Match, idx: number) => (
                          <View
                            key={idx}
                            className="absolute top-0 w-1 h-1 bg-red-400 rounded-full"
                            style={{
                              left: `${
                                Platform.OS === "web" &&
                                htmlVideoRef &&
                                htmlVideoRef.duration
                                  ? (match.timestamp / htmlVideoRef.duration) *
                                    100
                                  : player?.duration
                                  ? (match.timestamp / player.duration) * 100
                                  : 0
                              }%`,
                            }}
                          />
                        ))}
                      </View>
                    </View>

                    <Text className="text-white text-sm">
                      {formatTime(currentTime)} /{" "}
                      {formatTime(
                        Platform.OS === "web" &&
                          htmlVideoRef &&
                          htmlVideoRef.duration
                          ? htmlVideoRef.duration
                          : player?.duration || 0
                      )}
                    </Text>
                  </View>
                </View>
              </View>

              <View className="bg-green-50 border border-green-200 rounded-lg p-4">
                <View className="flex-row items-center mb-2">
                  <Ionicons name="checkmark-circle" size={24} color="#059669" />
                  <Text className="text-green-800 text-lg font-semibold ml-2">
                    Tracking: {personData.name}
                  </Text>
                </View>
                <Text className="text-green-700 mb-2">
                  🎯 Found {matches.length} detection
                  {matches.length !== 1 ? "s" : ""} in this video
                </Text>
                {matches.length > 0 && (
                  <View className="bg-green-100 border border-green-300 rounded p-2">
                    <Text className="text-green-600 text-sm">
                      ▶️ Video will auto-play and show bounding boxes at
                      detection timestamps
                    </Text>
                  </View>
                )}
              </View>

              <View className="bg-semilight border border-semidark rounded-lg p-4">
                <Text className="text-darker text-lg font-semibold mb-3">
                  Detection Timeline
                </Text>
                {matches.map((match: Match, index: number) => (
                  <TouchableOpacity
                    key={index}
                    onPress={() => jumpToTimestamp(match.timestamp)}
                    className={`flex-row justify-between items-center p-3 mb-2 rounded-lg ${
                      selectedDetection?.timestamp === match.timestamp
                        ? "bg-blue-100 border border-blue-300"
                        : "bg-white border border-gray-200"
                    }`}
                  >
                    <View className="flex-row items-center">
                      <Ionicons name="person" size={20} color="#666" />
                      <Text className="ml-2 text-darker font-medium">
                        Detection {index + 1}
                      </Text>
                    </View>
                    <View className="items-end">
                      <Text className="text-darker font-semibold">
                        {formatTime(match.timestamp)}
                      </Text>
                      <Text className="text-semidark text-sm">
                        {(() => {
                          const displayWidth = screenWidth - 48;
                          const displayHeight = (screenWidth - 48) * 0.6;
                          const scaleX = displayWidth / 480;
                          const scaleY = displayHeight / 848;

                          const width_backend = match.bbox[2] - match.bbox[0];
                          const height_backend = match.bbox[3] - match.bbox[1];
                          const width_display = Math.round(
                            width_backend * scaleX
                          );
                          const height_display = Math.round(
                            height_backend * scaleY
                          );

                          return `${width_display}×${height_display}px`;
                        })()}
                      </Text>
                    </View>
                  </TouchableOpacity>
                ))}
              </View>
            </>
          )}
        </View>
      </ScrollView>
      <Footer />
    </>
  );
}
