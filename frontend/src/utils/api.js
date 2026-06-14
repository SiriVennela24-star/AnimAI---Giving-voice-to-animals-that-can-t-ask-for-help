import axios from 'axios';

const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:8000';

export const apiClient = axios.create({
  baseURL: API_BASE_URL,
});

/**
 * Submits the multi-media blobs (audio distress capture and image/video visuals)
 * to the FastAPI triage endpoint.
 *
 * @param {Blob|File} audioBlob - Audio recording file (wav/mp3)
 * @param {Blob|File} mediaBlob - Visual media file (png/jpg/mp4)
 * @param {Function} onProgress - Progress tracking callback (receives percent 0-100)
 */
export const submitRescueTriage = async (audioBlob, mediaBlob, onProgress) => {
  const formData = new FormData();
  
  if (audioBlob) {
    formData.append('audio', audioBlob, audioBlob.name || 'audio_capture.wav');
  }
  
  if (mediaBlob) {
    const isVideo = mediaBlob.type ? mediaBlob.type.startsWith('video/') : mediaBlob.name.endsWith('.mp4');
    const fieldName = isVideo ? 'video' : 'image';
    const fileName = mediaBlob.name || (isVideo ? 'video_capture.mp4' : 'image_capture.png');
    formData.append(fieldName, mediaBlob, fileName);
  }

  // Get dynamic geospatial index
  let latitude = 17.3850;
  let longitude = 78.4867;
  
  try {
    const position = await new Promise((resolve, reject) => {
      navigator.geolocation.getCurrentPosition(resolve, reject, { timeout: 2500 });
    });
    latitude = position.coords.latitude;
    longitude = position.coords.longitude;
  } catch (err) {
    console.warn("Geolocation denied or timed out. Defaulting coordinates to metropolitan cluster.");
  }
  
  formData.append('latitude', latitude.toString());
  formData.append('longitude', longitude.toString());

  const response = await apiClient.post('/api/v1/triage/analyze', formData, {
    headers: {
      'Content-Type': 'multipart/form-data'
    },
    onUploadProgress: (progressEvent) => {
      if (onProgress && progressEvent.total) {
        const percent = Math.round((progressEvent.loaded * 100) / progressEvent.total);
        onProgress(percent);
      }
    }
  });
  
  return response.data;
};

/**
 * Retrieves all historical incidents.
 */
export const fetchIncidents = async () => {
  const response = await apiClient.get('/api/v1/triage/incidents');
  return response.data;
};

/**
 * Submits a new public community incident report.
 */
export const submitCommunityReport = async (reportData) => {
  const response = await apiClient.post('/api/v1/triage/community/report', reportData);
  return response.data;
};

/**
 * Fetches the predictive outbreak data.
 */
export const fetchCrisisPredictions = async () => {
  const response = await apiClient.get('/api/v1/triage/predict/outbreaks');
  return response.data;
};

/**
 * Updates the operational status of a specific incident.
 */
export const updateIncidentStatus = async (incidentId, status) => {
  const response = await apiClient.patch(`/api/v1/triage/incidents/${incidentId}/status`, {
    operational_status: status
  });
  return response.data;
};


