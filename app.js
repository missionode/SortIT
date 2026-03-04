/**
 * SortIT: Autonomous Waste Sorting Camera
 * Core Application Logic
 */

class SortIT {
    constructor() {
        this.video = document.getElementById('videoSource');
        this.canvas = document.getElementById('mainCanvas');
        this.ctx = this.canvas.getContext('2d', { alpha: false });
        this.loader = document.getElementById('initialLoader');
        this.ui = document.getElementById('uiOverlay');
        
        this.ghostingEnabled = true;
        this.model = null;
        this.predictions = [];
        this.isModelLoaded = false;
        
        // Categories considered "waste" for this project
        this.WASTE_LABELS = [
            'bottle', 'cup', 'wine glass', 'fork', 'knife', 'spoon', 
            'bowl', 'banana', 'apple', 'sandwich', 'orange', 'broccoli', 
            'carrot', 'hot dog', 'pizza', 'donut', 'cake'
        ];

        this.init();
    }

    async init() {
        console.log('SortIT: Initializing...');
        
        // 1. Register Service Worker for PWA
        this.registerServiceWorker();
        
        // 2. Setup Camera
        try {
            await this.setupCamera();
            this.resizeCanvas();
            window.addEventListener('resize', () => this.resizeCanvas());
            
            // 3. Load ML Model
            await this.loadModel();
            
            // 4. Start Render Loop
            this.startRenderLoop();
            
            // 5. Hide Loader & Show UI
            this.loader.classList.add('hidden');
            this.ui.classList.add('visible');
            
            console.log('SortIT: System Ready.');
        } catch (error) {
            console.error('SortIT: Initialization failed', error);
            alert('Camera access and model loading are required for SortIT.');
        }

        // 6. Setup UI Listeners
        this.setupEventListeners();
    }

    async loadModel() {
        console.log('SortIT: Loading model...');
        try {
            // Use 'lite_mobilenet_v2' for the <10MB requirement
            this.model = await cocoSsd.load({ base: 'lite_mobilenet_v2' });
            this.isModelLoaded = true;
            
            const statusIndicator = document.getElementById('modelStatus');
            statusIndicator.innerText = 'Vision System Active';
            statusIndicator.classList.remove('loading');
            statusIndicator.classList.add('active');
            
            console.log('SortIT: Model loaded successfully.');
        } catch (err) {
            console.error('SortIT: Error loading model', err);
            throw err;
        }
    }

    registerServiceWorker() {
        if ('serviceWorker' in navigator) {
            navigator.serviceWorker.register('./sw.js')
                .then(() => console.log('SortIT: Service Worker Registered'))
                .catch(err => console.error('SortIT: SW Registration failed', err));
        }
    }

    async setupCamera() {
        const constraints = {
            video: {
                facingMode: 'environment',
                width: { ideal: 1280 },
                height: { ideal: 720 }
            },
            audio: false
        };

        const stream = await navigator.mediaDevices.getUserMedia(constraints);
        this.video.srcObject = stream;

        return new Promise((resolve) => {
            this.video.onloadedmetadata = () => {
                this.video.play();
                resolve();
            };
        });
    }

    resizeCanvas() {
        this.canvas.width = window.innerWidth * window.devicePixelRatio;
        this.canvas.height = window.innerHeight * window.devicePixelRatio;
        this.canvas.style.width = `${window.innerWidth}px`;
        this.canvas.style.height = `${window.innerHeight}px`;
    }

    setupEventListeners() {
        document.getElementById('toggleGhosting').addEventListener('click', () => {
            this.ghostingEnabled = !this.ghostingEnabled;
            const badge = document.getElementById('ghostingMode');
            badge.innerText = `Ghosting: ${this.ghostingEnabled ? 'ON' : 'OFF'}`;
            badge.style.backgroundColor = this.ghostingEnabled ? '#2e7d32' : '#d32f2f';
        });
    }

    async predict() {
        if (this.isModelLoaded) {
            // High confidence threshold for waste to avoid artifacts
            this.predictions = (await this.model.detect(this.video))
                .filter(p => p.score > 0.55);
        }
    }

    startRenderLoop() {
        let frameCount = 0;
        const render = async () => {
            // Run inference every 3rd frame (approx 20fps inference, 60fps render)
            // for maximum smoothness on mobile
            if (frameCount % 3 === 0) {
                await this.predict();
            }
            this.drawFrame();
            frameCount++;
            requestAnimationFrame(render);
        };
        requestAnimationFrame(render);
    }

    drawFrame() {
        const { width, height } = this.canvas;
        const videoWidth = this.video.videoWidth;
        const videoHeight = this.video.videoHeight;

        // Calculate aspect ratio covering
        const vRatio = videoWidth / videoHeight;
        const cRatio = width / height;
        
        let sx, sy, sw, sh;
        
        if (vRatio > cRatio) {
            sh = videoHeight;
            sw = videoHeight * cRatio;
            sx = (videoWidth - sw) / 2;
            sy = 0;
        } else {
            sw = videoWidth;
            sh = videoWidth / cRatio;
            sx = 0;
            sy = (videoHeight - sh) / 2;
        }

        // Draw original video frame
        this.ctx.drawImage(this.video, sx, sy, sw, sh, 0, 0, width, height);

        // Apply Ghosting logic
        if (this.ghostingEnabled && this.predictions.length > 0) {
            this.applyGhosting(sx, sy, sw, sh);
        }
    }

    applyGhosting(sx, sy, sw, sh) {
        const { width, height } = this.canvas;
        const scaleX = width / sw;
        const scaleY = height / sh;

        this.predictions.forEach(prediction => {
            if (this.WASTE_LABELS.includes(prediction.class)) {
                const [pX, pY, pW, pH] = prediction.bbox;

                // Map video coordinates to canvas coordinates
                const canvasX = (pX - sx) * scaleX;
                const canvasY = (pY - sy) * scaleY;
                const canvasW = pW * scaleX;
                const canvasH = pH * scaleY;

                // Apply the "Ghosting" effect
                this.ctx.save();
                
                // 1. Create a clipping path for the detected object
                this.ctx.beginPath();
                this.ctx.rect(canvasX, canvasY, canvasW, canvasH);
                this.ctx.clip();

                // 2. Draw a heavily blurred and brightened version of the video in that spot
                this.ctx.filter = 'blur(50px) brightness(1.2) saturate(0.8)';
                this.ctx.drawImage(this.video, sx, sy, sw, sh, 0, 0, width, height);

                // 3. Optional: Add a subtle white overlay to make it look "ghostly"
                this.ctx.fillStyle = 'rgba(255, 255, 255, 0.1)';
                this.ctx.fillRect(canvasX, canvasY, canvasW, canvasH);

                this.ctx.restore();
            }
        });
    }
}

// Start the app
window.addEventListener('DOMContentLoaded', () => {
    window.sortIT = new SortIT();
});
