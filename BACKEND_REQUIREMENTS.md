# Backend Implementation Requirements

## 1. WebSocket Live Tracking

### Endpoint: `/ws/video-track`
- **Purpose**: Real-time person detection from live camera feeds
- **Connection**: WebSocket connection with query parameters
- **URL**: `ws://localhost:3333/ws/video-track?personId={personId}`

### Expected Flow:
1. Frontend connects to WebSocket with person ID only
2. User connects their live camera feed to the backend
3. Backend processes live video stream for person detection
4. Backend sends real-time detection data to frontend

### WebSocket Message Format:
```json
{
  "personId": 123,
  "personName": "John Doe",
  "timestamp": 45.2,
  "boundingBox": {
    "x": 100,
    "y": 50,
    "width": 150,
    "height": 200
  },
  "confidence": 0.95
}
```

## 2. Uploaded Video Search

### Endpoint: `/person/find` ✅ (Already exists)
- **Method**: GET
- **URL**: `/person/find?id={personId}&videoId={videoId}`
- **Purpose**: Find person in uploaded video files

### Current Response Format:
```json
{
  "person": {
    "id": "123",
    "name": "John Doe",
    "user_id": "456",
    "embedding": "..."
  },
  "video": {
    "id": "789",
    "path": "/videos/video.mp4",
    "duration": 120,
    "user_id": "456"
  },
  "matches": [
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

## 3. Required Backend Processing

### For Uploaded Videos:
1. **Video Upload Processing**:
   - When a video is uploaded via `/video` endpoint
   - Extract frames at regular intervals
   - Run person detection AI on each frame
   - Store detection results in database with timestamps

2. **Database Schema** (suggestion):
```sql
-- Table for storing person detections in videos
CREATE TABLE person_detections (
  id SERIAL PRIMARY KEY,
  video_id INTEGER REFERENCES videos(id),
  person_id INTEGER REFERENCES persons(id),
  timestamp DECIMAL(10,2), -- Time in seconds
  bbox_x INTEGER,
  bbox_y INTEGER,
  bbox_width INTEGER,
  bbox_height INTEGER,
  confidence DECIMAL(3,2),
  created_at TIMESTAMP DEFAULT NOW()
);
```

### For Live Tracking:
1. **WebSocket Handler**:
   - Accept WebSocket connections at `/ws/video-track`
   - Maintain connection per client
   - Process incoming live video frames
   - Send detection results in real-time

2. **Live Video Processing**:
   - Accept live video stream (WebRTC, RTMP, or other protocol)
   - Run person detection AI on live frames
   - Match detected persons against known embeddings
   - Send results via WebSocket

## 4. AI/ML Integration

### Person Detection Pipeline:
1. **Frame Extraction**: Extract frames from video
2. **Face/Person Detection**: Use AI model (YOLO, OpenCV, etc.)
3. **Feature Extraction**: Extract facial/person embeddings
4. **Similarity Matching**: Compare with stored person embeddings
5. **Bounding Box**: Calculate person location in frame

### Recommended Tools:
- **OpenCV**: For video processing
- **YOLO**: For person detection
- **Face Recognition Libraries**: For embedding extraction
- **TensorFlow/PyTorch**: For AI model inference

## 5. Frontend Integration Status

### ✅ Completed:
- WebSocket client connection to `/ws/video-track`
- API integration with `/person/find` endpoint
- Real-time detection display
- Video player with timeline jumping
- Bounding box overlays
- Error handling and loading states

### 🔧 Frontend Changes Made:
1. Updated WebSocket endpoint from `/ws/tracker-person` to `/ws/video-track`
2. Replaced mock data with real API call to `/person/find`
3. Added proper error handling for API responses
4. Enhanced UI to explain difference between live tracking and uploaded video search

### 📱 Ready to Test:
- Upload a video via the video management page
- Select the video and a person for tracking
- Choose "Search in Video" to test the `/person/find` API
- The frontend will display detection results if your backend returns them

## 6. Testing Checklist

### For Uploaded Video Search:
- [ ] Upload a video file
- [ ] Backend processes video and stores detections
- [ ] API `/person/find` returns detection results
- [ ] Frontend displays timeline and bounding boxes

### For Live WebSocket Tracking:
- [ ] WebSocket connection established at `/ws/video-track`
- [ ] Live video feed connected to backend
- [ ] Real-time detection results sent via WebSocket
- [ ] Frontend displays live detection updates

The frontend is ready! Just need the backend video processing and WebSocket implementation.
