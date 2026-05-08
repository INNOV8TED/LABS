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
                    preloadTransitions(); // Start preloading others after main is ready
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
                v.muted = true; // Preload muted to avoid policy issues
                v.playsInline = true;
                v.style.display = "none";
                document.body.appendChild(v);
                preloadedVideos[src] = v;
            }
        });
    }

    // Mouse Movement for Tooltips
    window.addEventListener("mousemove", (e) => {
        if (currentTooltip) {
            const x = e.clientX;
            const y = e.clientY;
            currentTooltip.style.left = `${x}px`;
            currentTooltip.style.top = `${y}px`;
        }
    });

    // Interaction handling
    hitboxes.forEach(hitbox => {
        hitbox.addEventListener("mouseenter", () => {
            const app = hitbox.dataset.app;
            if (tooltips[app]) {
                currentTooltip = tooltips[app];
                currentTooltip.classList.add("active");
                videoContainer.classList.add("blurred");
            }
        });

        hitbox.addEventListener("mouseleave", () => {
            if (currentTooltip) {
                currentTooltip.classList.remove("active");
                currentTooltip = null;
                videoContainer.classList.remove("blurred");
            }
        });

        hitbox.addEventListener("click", () => {
            triggerTransition(hitbox.dataset.app, hitbox.dataset.url);
        });
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
        if (!zoomVideo) return; // Fallback if not preloaded yet

        // 1. Hide UI and tooltips
        uiOverlay.classList.add("hidden");
        if (currentTooltip) currentTooltip.classList.remove("active");
        videoContainer.classList.remove("blurred");

        // 2. Play zoom video
        zoomContainer.innerHTML = "";
        zoomVideo.style.display = "block";
        zoomVideo.muted = isMuted;
        zoomContainer.appendChild(zoomVideo);
        zoomVideo.currentTime = 0;
        zoomVideo.play();

        // 3. Fade to black near the end of video
        setTimeout(() => {
            blackout.classList.add("active");
        }, 1500);

        // 4. Open URL
        setTimeout(() => {
            window.open(url, "_blank");
            
            // Optional: Reset state after a delay if user returns
            setTimeout(() => {
                blackout.classList.remove("active");
                uiOverlay.classList.remove("hidden");
                zoomVideo.style.display = "none";
                document.body.appendChild(zoomVideo); // Move back to body for preloading
                zoomContainer.innerHTML = "";
            }, 2000);
        }, 2500);
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
