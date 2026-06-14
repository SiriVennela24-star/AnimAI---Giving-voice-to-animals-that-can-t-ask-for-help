# 🚨 Problem Statement

Millions of stray and wild animals suffer from injuries, road accidents, abuse, disease outbreaks, starvation, and environmental hazards every year. Unfortunately, rescue operations often rely on manual reporting, delayed assessments, and fragmented communication between citizens, NGOs, and rescue teams.

Current challenges include:

- Lack of real-time animal distress monitoring.
- Delayed rescue response due to manual verification.
- No centralized platform for tracking incidents.
- Difficulty assessing injury severity remotely.
- Limited visibility into animal welfare hotspots.
- Absence of predictive systems for animal distress outbreaks.

As a result, many animals do not receive timely medical attention, reducing their chances of survival and recovery.

---

# 💡 Proposed Solution

AnimAI: Guardian Network is an AI-powered multi-modal animal emergency intelligence platform that automatically detects, assesses, monitors, and prioritizes animal rescue cases using visual, acoustic, and geolocation data.

The platform enables both citizens and rescue officers to report incidents while AI models analyze uploaded images, videos, and audio recordings to determine:

- Injury severity
- Distress levels
- Behavioral abnormalities
- Risk scores
- Rescue priority levels

The system then visualizes incidents on a live dashboard, generates severity heatmaps, predicts future distress hotspots, and assists NGOs and rescue teams in making faster and more informed rescue decisions.

---

# 🛠️ Technology Stack

## Frontend

- React 18
- Vite
- Tailwind CSS
- Framer Motion
- React Leaflet
- Three.js
- React Three Fiber

## Backend

- FastAPI
- Uvicorn
- Python


### 📊 Project Dataset Specifications

AnimAI utilizes a custom-compiled **Multimodal Telemetry Dataset** specifically aggregated and curated to evaluate street emergencies across multiple channels simultaneously:

* **Visual Analytics Component:** * **Composition:** High-resolution image files and streaming video frames covering urban stray animal classes, focused heavily on dogs and cats.
  * **Trauma Target Fields:** Curated samples featuring distinct lacerations, open street wounds, limbs showing structural mobility trauma, and facial muscle tension mapping. Used directly to evaluate the confidence scoring matrices of the **YOLO11** custom pipeline.

* **Acoustic Signal Component:**
  * **Composition:** High-fidelity `.mp3` and `.wav` digital audio waveforms sampled uniformly at 16kHz.
  * **Vocalization Matrix:** Includes specific isolated channels of animal distress—such as high-pitch yelping, aggressive barking, canine crying, and feline screeching markers. Used directly to test the **Librosa** feature extraction layers against urban background interference (traffic noise, sirens, and pedestrian chatter).

## Artificial Intelligence

### Computer Vision

- YOLO11
- OpenCV

### Audio Intelligence

- Librosa
- NumPy

### Natural Language Processing

- Rule-Based NLP Classification

## Database and storage 

- MongoDB Atlas
- Motor (Async MongoDB Driver)
- Cloudinary


## Mapping & Geolocation

- Leaflet
- OpenStreetMap
- Browser Geolocation API

## Deployment

- Vercel
- Render

---

# 🏗️ System Architecture

```mermaid
graph TD

A[Animal Emergency Event]

A --> B1[Rescue Officers]
A --> B2[Public Users]

B1 --> C1[Image / Video / Audio Upload]
B2 --> C2[Text Report + Geolocation]

C1 --> D1[Computer Vision Engine]
C1 --> D2[Audio DSP Engine]

C2 --> D3[NLP Classification Engine]

D1 --> E[Risk Fusion Engine]
D2 --> E
D3 --> E

E --> F[MongoDB Atlas]

F --> G[Operations Dashboard]
F --> H[Interactive Heatmap]
F --> I[Outbreak Prediction Engine]

G --> J[NGO Dispatch Teams]
H --> J
I --> J
```

---

# ✨ Key Features

## 🧠 AI-Powered Injury Detection

Detects:

- Open wounds
- Visible trauma
- Posture abnormalities
- Aggressive behavior
- Fatigue indicators

using computer vision algorithms.

---

## 🎙️ Acoustic Distress Analysis

Analyzes animal vocalizations to identify:

- Pain
- Fear
- Aggression
- Fatigue
- Calm behavior

and estimates distress probability.

---

## 📍 Interactive Rescue Heatmap

Provides:

- Real-time incident visualization
- Severity-based clustering
- Regional distress monitoring
- Geographical hotspot identification

---

## 🚨 Intelligent Risk Scoring

Combines visual and acoustic intelligence into a unified:

- Risk Score
- Severity Level
- Rescue Priority

for better decision-making.

---

## 🌐 Community Reporting Platform

Allows citizens to:

- Report injured animals
- Upload evidence
- Share location details
- Alert rescue organizations instantly

---

## 📊 Operations Dashboard

Centralized command center for:

- Active incidents
- Rescue history
- Live metrics
- Dispatch management
- Incident tracking

---

## 🔮 Outbreak Prediction Engine

Uses historical incident patterns to:

- Predict distress hotspots
- Forecast rescue demand
- Support proactive interventions

---

## ☁️ Cloud-Based Infrastructure

Provides:

- Secure media storage
- Centralized data management
- High scalability
- Global accessibility

---

# 🔄 Workflow

## Step 1: Incident Occurs

An injured or distressed animal is spotted by a citizen or rescue officer.

↓

## Step 2: Data Submission

Users upload:

- Images
- Videos
- Audio clips

or submit a text report with geolocation.

↓

## Step 3: AI Processing

The system processes the uploaded data using:

- YOLO11 Object Detection
- OpenCV Image Analysis
- Librosa Audio Processing
- NLP Classification

↓

## Step 4: Risk Assessment

A multi-modal fusion engine calculates:

- Distress Probability
- Injury Severity
- Final Risk Score
- Operational Status

↓

## Step 5: Data Storage

Results are securely stored in:

- MongoDB Atlas
- Cloudinary

↓

## Step 6: Visualization

Incident information is displayed on:

- Operations Dashboard
- Distress Heatmap
- Monitoring Panels

↓

## Step 7: Rescue Dispatch

NGOs and rescue teams receive actionable insights and prioritize rescue operations based on severity.

↓

## Step 8: Monitoring & Prediction

The system continuously updates incident trends and predicts future high-risk zones.

---

# 🎯 Expected Impact

AnimAI aims to revolutionize animal welfare by combining Artificial Intelligence, Computer Vision, Audio Intelligence, and Geospatial Analytics into a unified rescue intelligence ecosystem.

The platform enables:

- Faster emergency response
- Improved rescue prioritization
- Reduced animal suffering
- Better NGO coordination
- Data-driven animal welfare management
- Predictive rescue planning

By transforming scattered reports into actionable intelligence, AnimAI creates a scalable and intelligent framework capable of saving thousands of animal lives through technology-driven intervention.

# Local Setup Guide

Follow this single, continuous sequence of terminal commands to clone, configure, and boot both the backend and frontend servers within the same terminal session using background workers.

### Prerequisites
Ensure you have **Node.js (v18+)**, **Python (3.10+)**, and **Pip** installed on your system.

---

### Run All Commands Continuously

Copy the relevant script block for your operating system and paste it directly into a single open terminal.

#### 🪟 For Windows (PowerShell)
```powershell
# 1. Setup Backend
cd backend
python -m venv venv
.\venv\Scripts\activate
pip install -r requirements.txt
New-Item -Path .env -ItemType File -Value "MONGO_URI=your_mongodb_atlas_connection_string`nCLOUDINARY_CLOUD_NAME=your_cloudinary_name`nCLOUDINARY_API_KEY=your_cloudinary_key`nCLOUDINARY_API_SECRET=your_cloudinary_secret"
Start-Process powershell -ArgumentList "-NoExit", "-Command", ".\venv\Scripts\activate; uvicorn main:app --reload"

# 2. Setup Frontend
cd ..\frontend
npm install
New-Item -Path .env -ItemType File -Value "VITE_API_URL=[http://127.0.0.1:8000](http://127.0.0.1:8000)"
npm run dev

```






# 👥 Team & Project Metadata

---

### 👤 Team Lead Details
* **Name:** Siri Vennela
* **Education:** 3rd year 6th semester, Methodist College

---

### 🎯 Strategic Theme
* **Primary Track:** **AI for Social Impact**
* **Mission Domain:** Urban Animal Welfare, Multimodal Triage Automation, and Geospatial Emergency Dispatch Networks.

---

### 🔢 Team Capacity
* **Total Team Members:** 1 
* **Team name:** EntangleX
