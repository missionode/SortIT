# SortIT: Autonomous Waste Sorting Camera - Project Plan

## Overview
SortIT is a minimalist, browser-based Progressive Web App (PWA) designed to identify waste in a real-time camera feed and "ghost" it (making it invisible or blending it into the background). The project emphasizes privacy, low resource usage (<10MB model), and high performance without relying on external LLMs or server-side processing.

## Technical Strategy

### 1. The "Ghosting" Effect
Instead of a simple blur, "ghosting" will be achieved by:
- **Sampling:** When an object is detected, we sample the pixels immediately surrounding its bounding box.
- **In-filling:** We fill the bounding box area with a combination of:
    - A high-radius Gaussian blur of the original content (to maintain color consistency).
    - An overlay of the average background color sampled from the "safe" (non-waste) zones.
    - *Advanced Goal:* Use basic temporal averaging to "patch" the hole using previous frames where the object wasn't present (if the camera is static).

### 2. Machine Learning (The Brain)
- **Engine:** TensorFlow.js (TF.js) with WebGL/WebGPU acceleration.
- **Model Architecture:** YOLOv8n (Nano) or MobileNetV2-SSD.
- **Quantization:** INT8 quantization to keep the model size under 5MB.
- **Dataset:** Initial tests with COCO (bottles, cups, etc.), moving to a custom waste dataset (TACO) if needed.

### 3. PWA & Offline Support
- **Service Workers:** For caching the model and app assets to ensure 100% offline functionality.
- **Manifest:** To allow "Add to Home Screen" on mobile and desktop.
- **Responsive Design:** A centered, "one section at a time" view that adapts to any screen size.

### 4. Minimalist UI
- **Canvas-First:** The camera feed occupies the full screen.
- **Interaction:** Tap/Click to toggle "Ghosting" mode or cycle through detected categories.
- **Feedback:** Small, unobtrusive icons to indicate model status (loading, active, error).

---

## Technical Constraints
- **Model Size:** Must remain < 10MB total (weights + graph).
- **Languages:** Strictly HTML5, CSS3, and Vanilla JavaScript.
- **Libraries:** Only essential ML runtimes (Tensorflow.js). No heavy UI frameworks.
- **Environment:** Must run in any modern web browser (Chrome, Safari, Firefox).
