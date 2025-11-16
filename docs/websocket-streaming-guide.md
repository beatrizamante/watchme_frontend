# WebSocket Camera Streaming - Implementation Guide

## 🎥 How WebSocket Camera Streaming Works

### Architecture Overview
```
📱 Device Camera → 📊 Frame Processing → 🌐 WebSocket → 🤖 AI Backend → 📡 Results Back
```

## Three Main Approaches:

### 1. 🔴 **LIVE CAMERA STREAMING** (Real-time)
**How it works:**
- Device camera captures frames at 2-5 FPS
- Frames converted to Base64 or binary
- Sent via WebSocket to AI backend
- AI processes frames in real-time
- Detection results streamed back immediately
- Bounding boxes drawn over live camera feed

**Pros:** True real-time analysis, immediate feedback
**Cons:** High bandwidth usage, CPU intensive, battery drain

**Use Cases:**
- Security monitoring
- Live event person tracking
- Real-time access control

---

### 2. 📹 **PRE-RECORDED VIDEO ANALYSIS** (Your current approach)
**How it works:**
- User uploads/selects video file
- AI worker processes entire video
- Results returned via API or WebSocket
- UI displays video with detection overlays

**Pros:** Better quality analysis, efficient processing, works offline
**Cons:** No real-time feedback, requires video upload

**Use Cases:**
- Investigation/forensics
- Content analysis
- Post-event analysis

---

### 3. 🔄 **HYBRID: Live + Background Processing**
**How it works:**
- Camera shows live preview to user
- Frames captured and queued for processing
- AI processes frames with slight delay (1-3 seconds)
- Results overlaid on live feed with timestamp matching

**Pros:** Balance of real-time feel + efficient processing
**Cons:** Slight delay, more complex implementation

**Use Cases:**
- Smart surveillance
- Interactive demos
- Real-time monitoring with analysis

---

## 📱 Implementation Details

### Camera Frame Capture Options:

#### A) **Base64 Image Streaming** (Easier)
```javascript
// Capture frame every 500ms
const photo = await cameraRef.current.takePictureAsync({
  quality: 0.3,        // Lower quality = faster transfer
  base64: true,        // Convert to Base64
  skipProcessing: true // Skip camera processing
});

// Send via WebSocket
websocket.send(JSON.stringify({
  type: 'analyze_frame',
  frame: photo.base64,
  timestamp: Date.now(),
  person_id: selectedPersonId
}));
```

#### B) **Binary Stream** (More efficient)
```javascript
// Using expo-camera with video recording
const video = await cameraRef.current.recordAsync({
  quality: Camera.Constants.VideoQuality['480p'],
  maxDuration: 1, // 1 second chunks
});

// Stream video chunks via WebSocket
const chunks = await splitVideoIntoChunks(video.uri);
chunks.forEach(chunk => {
  websocket.send(chunk); // Binary data
});
```

### Backend WebSocket Handler:
```python
# Example Python WebSocket handler
async def handle_camera_stream(websocket, path):
    async for message in websocket:
        data = json.loads(message)

        if data['type'] == 'analyze_frame':
            # Decode base64 frame
            frame_data = base64.b64decode(data['frame'])

            # Run AI detection
            detections = ai_model.detect_person(frame_data, data['person_id'])

            # Send results back
            await websocket.send(json.dumps({
                'type': 'detection_results',
                'timestamp': data['timestamp'],
                'detections': detections,
                'person_id': data['person_id']
            }))
```

## 🔧 Technical Considerations

### Performance Optimization:
1. **Frame Rate:** 2-5 FPS (not 30 FPS) to reduce CPU/bandwidth
2. **Resolution:** 480p or lower for streaming
3. **Compression:** JPEG quality 30-50% for Base64
4. **Batching:** Send multiple frames in single WebSocket message

### Battery & Resources:
- Camera streaming drains battery quickly
- Use lower resolution and frame rates
- Implement smart frame skipping (only send frames when motion detected)
- Allow users to pause/resume streaming

### Network Considerations:
- WebSocket connections can drop on mobile networks
- Implement robust reconnection logic (you already have this!)
- Handle offline scenarios gracefully
- Consider using WebRTC for better streaming (more complex)

## 🚀 Recommended Implementation for Your Project

Based on your current architecture, I recommend the **Hybrid approach**:

1. **Keep your current video analysis** for uploaded videos
2. **Add live camera mode** with WebSocket streaming
3. **Use your existing WebSocket hook** with minor modifications

This gives you both capabilities:
- Users can analyze existing videos (current feature)
- Users can do live monitoring when needed (new feature)

Would you like me to show you how to implement the live camera streaming component using your existing WebSocket infrastructure?
