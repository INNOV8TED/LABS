document.addEventListener("DOMContentLoaded", () => {
    const videoContainer = document.getElementById("video-container");
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
                }, 500);
            };
            videoContainer.appendChild(video);
            video.play().catch(error => {
                console.log("Autoplay blocked or error:", error);
                if (preloader) preloader.classList.add("hidden");
            });
            activeVideo = video;
        }
    }
    hitboxes.forEach(hitbox => {
        hitbox.addEventListener("mouseenter", () => {
            const app = hitbox.dataset.app;
            if (tooltips[app]) {
                tooltips[app].classList.add("active");
            }
        });
        hitbox.addEventListener("mouseleave", () => {
            const app = hitbox.dataset.app;
            if (tooltips[app]) {
                tooltips[app].classList.remove("active");
            }
        });
    });
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
