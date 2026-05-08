document.addEventListener("DOMContentLoaded", () => {
    const videoContainer = document.getElementById("video-container");
    const zoomContainer = document.getElementById("zoom-container");
    const blackout = document.getElementById("blackout");
    const uiOverlay = document.querySelector(".ui-overlay");
    const soundToggle = document.getElementById("sound-toggle");
    const preloader = document.getElementById("preloader");
    const iconUnmuted = document.getElementById("icon-unmuted");
    const iconMuted = document.getElementById("icon-muted");
    const btnText = soundToggle.querySelector(".btn-text");
    const glitchText = document.querySelector(".glitch-text");
    const terminal = document.getElementById("system-terminal");
    
    const hitboxes = document.querySelectorAll(".hitbox");
    const tooltips = {
        acam: document.getElementById("tooltip-acam"),
        collage: document.getElementById("tooltip-collage")
    };
    
    let activeVideo = null;
    let isMuted = true;
    let currentTooltip = null;
    let activeMobileApp = null;
    const preloadedVideos = {};

    // --- AUDIO ENGINE ---
    const AudioEngine = {
        ctx: null,
        hum: null,
        humGain: null,
        
        init() {
            if (this.ctx) return;
            this.ctx = new (window.AudioContext || window.webkitAudioContext)();
            
            // Create Ambient Hum (Low-pass filtered white noise)
            const bufferSize = 2 * this.ctx.sampleRate;
            const noiseBuffer = this.ctx.createBuffer(1, bufferSize, this.ctx.sampleRate);
            const output = noiseBuffer.getChannelData(0);
            for (let i = 0; i < bufferSize; i++) {
                output[i] = Math.random() * 2 - 1;
            }
            
            this.hum = this.ctx.createBufferSource();
            this.hum.buffer = noiseBuffer;
            this.hum.loop = true;
            
            const filter = this.ctx.createBiquadFilter();
            filter.type = "lowpass";
            filter.frequency.value = 150;
            
            this.humGain = this.ctx.createGain();
            this.humGain.gain.value = 0;
            
            this.hum.connect(filter);
            filter.connect(this.humGain);
            this.humGain.connect(this.ctx.destination);
            this.hum.start();
        },
        
        setMute(muted) {
            if (!this.ctx) this.init();
            if (this.ctx.state === "suspended") this.ctx.resume();
            this.humGain.gain.setTargetAtTime(muted ? 0 : 0.05, this.ctx.currentTime, 0.5);
        },
        
        playBlip() {
            if (isMuted || !this.ctx) return;
            const osc = this.ctx.createOscillator();
            const g = this.ctx.createGain();
            osc.type = "square";
            osc.frequency.value = 800;
            g.gain.setValueAtTime(0.02, this.ctx.currentTime);
            g.gain.exponentialRampToValueAtTime(0.0001, this.ctx.currentTime + 0.1);
            osc.connect(g);
            g.connect(this.ctx.destination);
            osc.start();
            osc.stop(this.ctx.currentTime + 0.1);
        },
        
        playWhoosh() {
            if (isMuted || !this.ctx) return;
            const noise = this.ctx.createBufferSource();
            const bufferSize = this.ctx.sampleRate;
            const buffer = this.ctx.createBuffer(1, bufferSize, this.ctx.sampleRate);
            const data = buffer.getChannelData(0);
            for (let i = 0; i < bufferSize; i++) data[i] = Math.random() * 2 - 1;
            noise.buffer = buffer;
            
            const filter = this.ctx.createBiquadFilter();
            filter.type = "lowpass";
            filter.frequency.setValueAtTime(100, this.ctx.currentTime);
            filter.frequency.exponentialRampToValueAtTime(3000, this.ctx.currentTime + 0.5);
            
            const g = this.ctx.createGain();
            g.gain.setValueAtTime(0, this.ctx.currentTime);
            g.gain.linearRampToValueAtTime(0.1, this.ctx.currentTime + 0.1);
            g.gain.exponentialRampToValueAtTime(0.0001, this.ctx.currentTime + 1);
            
            noise.connect(filter);
            filter.connect(g);
            g.connect(this.ctx.destination);
            noise.start();
        }
    };

    // --- TERMINAL LOGIC ---
    const TerminalLogic = {
        logs: [
            "INITIALIZING NEURAL NET...",
            "LOADING WEIGHTS: v4.02",
            "SCANNING INTERFACE...",
            "READY FOR UPLINK",
            "LATENT SPACE MAPPING...",
            "SYNCHRONIZING LABS...",
            "ENCODING CINEMATIC BUFFER",
            "STABILIZING ML PIPELINE",
            "UPDATING R&D NODES...",
            "UPLINK ACTIVE"
        ],
        init() {
            setInterval(() => {
                const line = document.createElement("div");
                line.className = "terminal-line";
                line.textContent = `> ${this.logs[Math.floor(Math.random() * this.logs.length)]}`;
                terminal.appendChild(line);
                if (terminal.children.length > 5) terminal.removeChild(terminal.firstChild);
            }, 3000);
        }
    };

    function initVideo() {
        const isMobile = window.innerWidth <= 768;
        const videoSrc = isMobile ? "labloopvert.mp4" : "labloop.mp4";
        
        if (activeVideo && activeVideo.dataset.mobile !== String(isMobile)) {
            videoContainer.innerHTML = "";
        }

        if (!videoContainer.querySelector("video")) {
            const video = document.createElement("video");
            video.src = videoSrc;
            video.loop = true;
            video.muted = isMuted;
            video.playsInline = true;
            video.setAttribute("webkit-playsinline", "true");
            video.dataset.mobile = isMobile;
            
            video.oncanplaythrough = () => {
                video.classList.add("loaded");
                setTimeout(() => {
                    if (preloader) preloader.classList.add("hidden");
                    preloadTransitions();
                    TerminalLogic.init();
                }, 800);
            };

            videoContainer.appendChild(video);
            video.play().catch(e => {
                if (preloader) preloader.classList.add("hidden");
            });
            
            activeVideo = video;
        }
    }

    function preloadTransitions() {
        const videosToPreload = ["camzoom.mp4", "camzoomvert.mp4", "projzoom.mp4", "projzoomvert.mp4"];
        videosToPreload.forEach(src => {
            if (!preloadedVideos[src]) {
                const v = document.createElement("video");
                v.src = src;
                v.preload = "auto";
                v.muted = true;
                v.playsInline = true;
                v.setAttribute("webkit-playsinline", "true");
                v.style.display = "none";
                document.body.appendChild(v);
                preloadedVideos[src] = v;
            }
        });
    }

    // --- MOUSE MOVE (Parallax & Tooltips) ---
    window.addEventListener("mousemove", (e) => {
        const x = e.clientX;
        const y = e.clientY;

        // Tooltip following
        if (currentTooltip && window.innerWidth > 768) {
            currentTooltip.style.left = `${x}px`;
            currentTooltip.style.top = `${y}px`;
        }

        // Parallax effect
        if (window.innerWidth > 768) {
            const moveX = (x - window.innerWidth / 2) / 50;
            const moveY = (y - window.innerHeight / 2) / 50;
            videoContainer.style.transform = `translate(${moveX}px, ${moveY}px)`;
        }
    });

    hitboxes.forEach(hitbox => {
        hitbox.addEventListener("mouseenter", () => {
            if (window.innerWidth > 768) {
                const app = hitbox.dataset.app;
                if (tooltips[app]) {
                    currentTooltip = tooltips[app];
                    currentTooltip.classList.add("active");
                    AudioEngine.playBlip();
                }
            }
        });

        hitbox.addEventListener("mouseleave", () => {
            if (window.innerWidth > 768) {
                if (currentTooltip) {
                    currentTooltip.classList.remove("active");
                    currentTooltip = null;
                }
            }
        });

        hitbox.addEventListener("click", (e) => {
            const app = hitbox.dataset.app;
            const isMobile = window.innerWidth <= 768;

            if (isMobile) {
                if (activeMobileApp !== app) {
                    e.preventDefault();
                    if (currentTooltip) currentTooltip.classList.remove("active");
                    currentTooltip = tooltips[app];
                    currentTooltip.classList.add("active");
                    currentTooltip.style.left = "50%";
                    currentTooltip.style.top = "50%";
                    activeMobileApp = app;
                    AudioEngine.playBlip();
                    return;
                }
            }
            triggerTransition(app, hitbox.dataset.url);
        });
    });

    function triggerTransition(app, url) {
        const isMobile = window.innerWidth <= 768;
        const zoomSrc = (app === "acam") ? (isMobile ? "camzoomvert.mp4" : "camzoom.mp4") : (isMobile ? "projzoomvert.mp4" : "projzoom.mp4");
        const zoomVideo = preloadedVideos[zoomSrc];
        
        if (!zoomVideo) {
            window.location.href = url;
            return;
        }

        uiOverlay.classList.add("hidden");
        if (currentTooltip) currentTooltip.classList.remove("active");
        AudioEngine.playWhoosh();

        zoomContainer.innerHTML = "";
        zoomVideo.style.display = "block";
        zoomVideo.muted = isMuted;
        zoomVideo.playsInline = true;
        zoomContainer.appendChild(zoomVideo);
        zoomContainer.classList.add("active");
        zoomVideo.currentTime = 0;
        
        const finishTransition = () => {
            blackout.classList.add("active");
            setTimeout(() => { window.location.href = url; }, 600);
        };

        zoomVideo.onended = finishTransition;
        setTimeout(finishTransition, 4000); 
        zoomVideo.play().catch(() => { zoomVideo.muted = true; zoomVideo.play(); });
    }

    function toggleSound() {
        if (!activeVideo) return;
        isMuted = !isMuted;
        activeVideo.muted = isMuted;
        AudioEngine.setMute(isMuted);
        
        if (isMuted) {
            iconMuted.classList.remove("hidden");
            iconUnmuted.classList.add("hidden");
            btnText.textContent = "AUDIO.OFF";
            glitchText.classList.remove("flicker");
        } else {
            iconMuted.classList.add("hidden");
            iconUnmuted.classList.remove("hidden");
            btnText.textContent = "AUDIO.ON";
            glitchText.classList.add("flicker");
            activeVideo.play();
        }
    }

    // Back button handling
    window.addEventListener("pageshow", (e) => {
        if (e.persisted) {
            blackout.classList.remove("active");
            uiOverlay.classList.remove("hidden");
            zoomContainer.classList.remove("active");
            zoomContainer.innerHTML = "";
            if (activeVideo) activeVideo.play();
        }
    });

    initVideo();
    window.addEventListener("resize", () => {
        const wasMobile = activeVideo ? activeVideo.dataset.mobile === "true" : false;
        const isMobileNow = window.innerWidth <= 768;
        if (wasMobile !== isMobileNow) initVideo();
    });
    soundToggle.addEventListener("click", toggleSound);
});
