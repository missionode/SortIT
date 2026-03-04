# SortIT: Project Roadmap & Status

This document tracks the completion of each phase of the SortIT project. Once a phase is marked as **[COMPLETED]**, we move to the next step.

## Phase 1: Foundation & Scaffolding
- [x] Create `index.html` with minimalist structure.
- [x] Implement `styles.css` (Zen theme).
- [x] Set up `manifest.json` and basic Service Worker (`sw.js`).
- [x] Create `app.js` with basic camera permissions logic.
- **Status:** [COMPLETED]

## Phase 2: Video & Canvas Pipeline
- [x] Implement `getUserMedia` to stream camera to a hidden `<video>` element.
- [x] Set up a `<canvas>` to mirror the video at 30-60 FPS.
- [x] Create a "Ghosting" toggle in the UI.
- **Status:** [COMPLETED]

## Phase 3: ML Integration
- [x] Add TensorFlow.js (TF.js) to the project.
- [x] Sourcing and loading a quantized (<5MB) object detection model.
- [x] Implement a function to run inference on canvas frames.
- **Status:** [COMPLETED]

## Phase 4: Identification & Ghosting Logic
- [x] Filter detections to only include "waste" categories.
- [x] Implement the "Ghosting" effect:
    - [x] Calculate bounding boxes.
    - [x] Sample surrounding pixels.
    - [x] Apply blurring/fill to the waste area.
- **Status:** [COMPLETED]

## Phase 5: UI/UX & PWA Finalization
- [x] Add loading indicators for the ML model.
- [x] Refine the minimalist design for mobile/desktop.
- [x] Ensure full offline support via Service Worker.
- [x] Finalize "Add to Home Screen" installability.
- **Status:** [COMPLETED]

## Phase 6: Optimization & Polish
- [ ] Performance profiling (ensuring 30 FPS on average hardware).
- [ ] Model size optimization.
- [ ] Final testing across different browsers and lighting conditions.
- **Status:** [PENDING]

---

**Current Overall Progress:** 90%
**Current Phase:** Phase 6
