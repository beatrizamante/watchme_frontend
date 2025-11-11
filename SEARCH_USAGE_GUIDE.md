# Person Search in Videos - Usage Guide

## How to Use the Video Person Search Feature

### 1. **Setup Process**
1. Navigate to **Video List** (`/(user)/videoList`)
2. Select a video by double-clicking on it
3. Choose "Find" from the action modal
4. This will take you to **People List** (`/(user)/peopleList`)
5. Select a person you want to track
6. Choose your tracking method:
   - **🔴 Live Feed Tracking (WebSocket)**: Real-time tracking from live camera feed
   - **📹 Search in Uploaded Video**: Search for person in uploaded video files

### 2. **Two Different Tracking Methods**

#### 🔴 **Live Feed Tracking (WebSocket)**
- **Purpose**: Real-time person detection from live camera feed
- **Endpoint**: `/ws/video-track?videoId={videoId}&personId={personId}`
- **Use Case**: Security monitoring, live surveillance
- **Requirements**:
  - User needs to connect a live video source (camera)
  - WebSocket connection for real-time data
  - Continuous video stream processing

#### 📹 **Uploaded Video Search**
- **Purpose**: Find person in already uploaded video files
- **Endpoint**: `/person/find?id={personId}&videoId={videoId}`
- **Use Case**: Analysis of recorded footage
- **Requirements**:
  - Video must be uploaded first
  - Backend processes video for person detection
  - Returns timestamped detection results

### 3. **Current Implementation Status**

#### ✅ **What Works Now:**
- Video selection and navigation flow
- Person selection interface
- Video player integration with expo-video
- Automatic video duration detection
- **REAL API Integration**: Now uses `/person/find` endpoint for uploaded video search
- Timeline jumping functionality
- Bounding box overlay on video
- WebSocket integration for live tracking (endpoint updated to `/ws/video-track`)

#### 🚧 **What Needs Backend Implementation:**
- **Video Processing**: Backend needs to process uploaded videos and detect persons
- **WebSocket Live Feed**: Backend needs to handle live video streams via WebSocket
- **Detection Storage**: Store detection results in database with timestamps and bounding boxes

### 3. **Technical Details**

#### **Video Duration Detection:**
```tsx
// Video duration is automatically detected when video loads
const player = useVideoPlayer(videoData?.path || "", (player: any) => {
  player.loop = false;

  // Auto-detect video duration when loaded
  player.addListener('statusChange', (status: any) => {
    if (status.isLoaded && player.duration && videoData) {
      setVideoData(prev => prev ? { ...prev, duration: player.duration } : null);
    }
  });
});
```

#### **Current Data Flow:**
1. **Video Selection** → `useTracking` store holds `selectedVideoId`
2. **Person Selection** → `useTracking` store holds `selectedPersonId`
3. **Search Page** → Fetches video/person data and displays results
4. **Mock Detections** → Currently shows 3 sample detections at different timestamps

### 4. **What You Need to Implement on Backend**

#### **API Endpoint Needed:**
```
GET /api/videos/{videoId}/person-detections/{personId}
```

**Response Format:**
```json
{
  "videoId": 123,
  "personId": 456,
  "detections": [
    {
      "timestamp": 10.5,
      "bbox": {
        "x": 100,
        "y": 50,
        "width": 150,
        "height": 200
      }
    }
  ]
}
```

#### **✅ API Integration Completed:**

The `searchPerson.tsx` now uses the real API:

```tsx
// Real API integration - IMPLEMENTED
const searchResult = await searchPerson(Number(selectedPersonId), selectedVideoId);

// Convert matches to PersonDetection format
const detections: PersonDetection[] = searchResult.matches.map((match: any) => ({
  timestamp: match.timestamp || 0,
  bbox: {
    x: match.bbox?.x || 0,
    y: match.bbox?.y || 0,
    width: match.bbox?.width || 100,
    height: match.bbox?.height || 100,
  }
}));
```

**Expected Backend Response Format:**
```json
{
  "person": { "id": "123", "name": "John Doe", ... },
  "video": { "id": "456", "path": "/videos/file.mp4", ... },
  "matches": [
    {
      "timestamp": 10.5,
      "bbox": { "x": 100, "y": 50, "width": 150, "height": 200 }
    }
  ]
}
```

### 5. **Testing the Current Implementation**

1. **Start the app**: `npm run start`
2. **Go to Video List**: Navigate to user section → Video List
3. **Select any video**: Double-click on a video card
4. **Choose "Find"**: From the action modal
5. **Select a person**: Choose any person from the list
6. **Choose tracking method**:
   - **📹 Search in Video**: Uses `/person/find` API (for uploaded videos)
   - **🔴 Live Tracking**: Uses `/ws/video-track` WebSocket (for live feeds)
7. **View Results**: You'll see:
   - Video player with your selected video
   - **Real detection data from API** (if backend is processing videos)
   - Clickable timeline entries that jump to timestamps
   - Bounding box overlay when at detection timestamps

### 6. **Key Features Working**

- ✅ **Video Path Loading**: Videos load from your `video.path`
- ✅ **Duration Detection**: Automatically detects video duration
- ✅ **Timeline Navigation**: Click detections to jump to timestamps
- ✅ **Bounding Box Overlay**: Shows person location in video
- ✅ **Play/Pause Controls**: Full video playback controls
- ✅ **Progress Bar**: Visual progress indicator
- ✅ **Error Handling**: Proper error states and loading indicators

### 7. **Next Steps for Full Implementation**

1. **Backend Video Processing**:
   - Process uploaded videos with person detection AI
   - Store detection results in database
   - Create API endpoint to retrieve detections

2. **Frontend Integration**:
   - Replace mock function with real API call
   - Add error handling for API failures
   - Implement caching for better performance

3. **Enhanced Features**:
   - Multiple person detection in same video
   - Confidence scores for detections
   - Export/share search results
   - Video annotation tools

The foundation is solid! The UI, navigation, video player, and data flow are all working. You just need to connect it to your backend person detection system.
