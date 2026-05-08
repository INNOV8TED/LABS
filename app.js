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
        const videosToPreload = [
            "camzoom.mp4", "camzoomvert.mp4",
            "projzoom.mp4", "projzoomvert.mp4"
        ];
        videosToPreload.forEach(src => {
            if (!preloadedVideos[src]) {
                const v = document.createElement("video");
                v.src = src;
                v.preload = "auto";
                v.muted = true;
                v.playsInline = true;
                v.style.display = "none";
                document.body.appendChild(v);
                preloadedVideos[src] = v;
            }
        });
    }

    window.addEventListener("mousemove", (e) => {
        if (currentTooltip && window.innerWidth > 768) {
            const x = e.clientX;
            const y = e.clientY;
            currentTooltip.style.left = `${x}px`;
            currentTooltip.style.top = `${y}px`;
        }
    });

    hitboxes.forEach(hitbox => {
        hitbox.addEventListener("mouseenter", () => {
            if (window.innerWidth > 768) {
                const app = hitbox.dataset.app;
                if (tooltips[app]) {
                    currentTooltip = tooltips[app];
                    currentTooltip.classList.add("active");
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
                    return;
                }
            }

            // User gesture context starts here
            triggerTransition(app, hitbox.dataset.url);
        });
    });

    window.addEventListener("touchstart", (e) => {
        if (window.innerWidth <= 768) {
            if (!e.target.classList.contains("hitbox")) {
                if (currentTooltip) {
                    currentTooltip.classList.remove("active");
                    currentTooltip = null;
                    activeMobileApp = null;
                }
            }
        }
    });

    function triggerTransition(app, url) {
        const isMobile = window.innerWidth <= 768;
        let zoomSrc = "";
        
        if (app === "acam") {
            zoomSrc = isMobile ? "camzoomvert.mp4" : "camzoom.mp4";
        } else {
            zoomSrc = isMobile ? "projzoomvert.mp4" : "projzoom.mp4";
        }

        const zoomVideo = preloadedVideos[zoomSrc];
        if (!zoomVideo) {
            // Fallback: navigate immediately if video not ready
            window.location.href = url;
            return;
        }

        uiOverlay.classList.add("hidden");
        if (currentTooltip) currentTooltip.classList.remove("active");

        zoomContainer.innerHTML = "";
        zoomVideo.style.display = "block";
        zoomVideo.muted = isMuted;
        zoomContainer.appendChild(zoomVideo);
        zoomVideo.currentTime = 0;
        
        // Play immediately within the gesture handler
        const playPromise = zoomVideo.play();

        setTimeout(() => {
            blackout.classList.add("active");
        }, 2200);

        // Navigate in the same tab to avoid popup blockers
        // This is the most reliable pattern for mobile "portal" transitions
        setTimeout(() => {
            window.location.href = url;
        }, 2800);
    }

    function toggleSound() {
        if (!activeVideo) return;
        isMuted = !isMuted;
        activeVideo.muted = isMuted;
        if (isMuted) {
            iconMuted.classList.remove("hidden");
            iconUnmuted.classList.add("hidden");
            btnText.textContent = "AUDIO.OFF";
        } else {
            iconMuted.classList.add("hidden");
            iconUnmuted.classList.remove("hidden");
            btnText.textContent = "AUDIO.ON";
            activeVideo.play();
        }
    }

    initVideo();

    let resizeTimer;
    window.addEventListener("resize", () => {
        clearTimeout(resizeTimer);
        resizeTimer = setTimeout(() => {
            const wasMobile = activeVideo ? activeVideo.dataset.mobile === "true" : false;
            const isMobileNow = window.innerWidth <= 768;
            if (wasMobile !== isMobileNow) {
                initVideo();
            }
        }, 250);
    });

    soundToggle.addEventListener("click", toggleSound);
});
