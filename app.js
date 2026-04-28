document.addEventListener('DOMContentLoaded', () => {
    const mainContainer = document.getElementById('main-container');
    const objectBox = document.getElementById('object-box');
    const projectBtns = document.querySelectorAll('.project-btn');
    const exitBtn = document.getElementById('exit-btn');
    const videoLabel = document.getElementById('video-label');
    const liveLogicOverlay = document.getElementById('live-logic');
    const slideDisplay = document.getElementById('slide-display');
    const openAppLink = document.getElementById('open-app-link');
    const mainDisplay = document.getElementById('main-display');

    let initialBounds = null;
    let slideshowInterval = null;
    let textDecoderInterval = null;
    let currentSlideIndex = 0;

    const defaultMission = `
        <div class="workbench-top">
            <h3>[ CMD ] // MISSION_STATEMENT</h3>
            <p class="quote">"I BUILD FOR THE WORKFLOWS THAT DON'T EXIST YET."</p>
            <div class="mission-text">
                <p>IN-NO-V8 LABS is a private R&D environment for digital content workflows. After 16 years of delivering content for HBO, Intel, and global festivals, I identified a recurring bottleneck: the gap between human creative intent and machine-learning randomness.</p>
            </div>
        </div>
        <div class="workbench-bottom">
            <div class="system-status">
                <h3>[ LOG ] // SYSTEM_STATUS</h3>
                <div class="status-table">
                    <div class="status-row">
                        <div class="status-cell label">PROJ_01</div>
                        <div class="status-cell value">A-CAM: "Director’s interface for cinematic AI. Precise shot logic for pro consistency."</div>
                    </div>
                    <div class="status-row">
                        <div class="status-cell label">PROJ_02</div>
                        <div class="status-cell value">Collage Machine: "Procedural asset arrangement for high-speed editorial curation."</div>
                    </div>
                </div>
            </div>
        </div>
    `;

    const projectData = {
        acam: {
            theme: 'acam-theme',
            accent: 'var(--accent-acam)',
            appUrl: 'https://a-cam.in-no-v8.com/',
            slides: [
                'acam_slide_1.png',
                'acam_slide_2.png',
                'acam_slide_3.png',
                'acam_logo_full.png'
            ],
            aboutText: `A-CAM translates traditional cinematography into AI-native workflows. By abstracting lens choice, movement, and lighting into a director's interface, it removes the 'randomness' of diffusion models.\n\nDeveloped for high-end production environments, the tool bridges the gap between creative intent and procedural randomness. It allows directors to maintain absolute visual consistency across generative sequences using proprietary shot-logic mapping.`,
            content: `
                <div class="workbench-top">
                    <h3>[ CMD ] // A-CAM_CORE</h3>
                    <p class="quote" style="color: var(--accent-acam)">"CINEMATIC LOGIC FOR THE MACHINE AGE."</p>
                    <div class="mission-text">
                        <p>A-CAM translates traditional cinematography into AI-native workflows. By abstracting lens choice, movement, and lighting into a director's interface, it removes the 'randomness' of diffusion models.</p>
                    </div>
                </div>
                <div class="workbench-bottom">
                    <div class="system-status">
                        <h3>[ LOG ] // CAPABILITIES</h3>
                        <div class="status-table">
                            <div class="status-row">
                                <div class="status-cell label">ENGINE</div>
                                <div class="status-cell value">Proprietary Shot-Logic Interpreter</div>
                            </div>
                            <div class="status-row">
                                <div class="status-cell label">LENSES</div>
                                <div class="status-cell value">14mm Ultra-Wide to 200mm Telephoto</div>
                            </div>
                        </div>
                    </div>
                </div>
            `
        },
        collage: {
            theme: 'collage-theme',
            accent: 'var(--accent-collage)',
            appUrl: 'https://collage.in-no-v8.com/',
            slides: [
                'collage_preview.png'
            ],
            aboutText: `COLLAGE MACHINE is a high-speed editorial engine for archival media. It uses procedural arrangement to identify visual patterns across massive datasets, enabling instant curation of disparate assets.\n\nIt enables creators to source and serialize high-density visual information with zero latency, utilizing non-linear chronological mapping to build complex editorial sequences in seconds.`,
            content: `
                <div class="workbench-top">
                    <h3>[ CMD ] // COLLAGE_LOGIC</h3>
                    <p class="quote">"PROCEDURAL CURATION AT SCALE."</p>
                    <div class="mission-text">
                        <p>COLLAGE MACHINE is a high-speed editorial engine for archival media. It uses procedural arrangement to identify visual patterns across massive datasets, enabling instant curation of disparate assets.</p>
                    </div>
                </div>
                <div class="workbench-bottom">
                    <div class="system-status">
                        <h3>[ LOG ] // CAPABILITIES</h3>
                        <div class="status-table">
                            <div class="status-row">
                                <div class="status-cell label">DENSITY</div>
                                <div class="status-cell value">High-Speed Asset Serialization</div>
                            </div>
                            <div class="status-row">
                                <div class="status-cell label">LOGIC</div>
                                <div class="status-cell value">Non-Linear Chronological Mapping</div>
                            </div>
                        </div>
                    </div>
                </div>
            `
        }
    };

    // Text Decoder Effect
    function startTextDecoder(text) {
        if (textDecoderInterval) clearInterval(textDecoderInterval);
        liveLogicOverlay.textContent = '';
        let i = 0;
        const chars = "0123456789ABCDEF!@#$%^&*()_+";
        
        textDecoderInterval = setInterval(() => {
            if (i < text.length) {
                const randomPart = chars[Math.floor(Math.random() * chars.length)];
                liveLogicOverlay.textContent = text.substring(0, i) + randomPart;
                if (i % 2 === 0) i++; // Speed it up slightly
            } else {
                liveLogicOverlay.textContent = text;
                clearInterval(textDecoderInterval);
            }
            liveLogicOverlay.scrollTop = liveLogicOverlay.scrollHeight;
        }, 10);
    }

    // Slideshow Logic
    function startSlideshow(project) {
        if (slideshowInterval) clearInterval(slideshowInterval);
        const data = projectData[project];
        if (!data || !data.slides.length) return;

        currentSlideIndex = 0;
        const updateSlide = () => {
            slideDisplay.style.backgroundImage = `url('${data.slides[currentSlideIndex]}')`;
            currentSlideIndex = (currentSlideIndex + 1) % data.slides.length;
        };

        updateSlide();
        slideshowInterval = setInterval(updateSlide, 3000);
    }

    // Hover logic for directory
    projectBtns.forEach(btn => {
        btn.addEventListener('mouseover', () => {
            if (mainContainer.classList.contains('is-expanded')) return;
            const project = btn.getAttribute('data-project');
            const data = projectData[project];
            
            if (data) {
                mainDisplay.innerHTML = data.content;
                document.body.classList.add(data.theme);
                objectBox.classList.add('has-preview', `${project}-preview`);
            }
        });

        btn.addEventListener('mouseout', () => {
            if (mainContainer.classList.contains('is-expanded')) return;
            mainDisplay.innerHTML = defaultMission;
            document.body.classList.remove('acam-theme', 'collage-theme');
            objectBox.classList.remove('has-preview', 'acam-preview', 'collage-preview');
        });

        btn.addEventListener('click', () => {
            const project = btn.getAttribute('data-project');
            const data = projectData[project];
            
            // Set App Link
            openAppLink.href = data.appUrl;
            videoLabel.textContent = `${project.toUpperCase()} // LIVE_SIGNAL_ACTIVE`;
            videoLabel.style.borderColor = data.accent;

            // Transition
            initialBounds = objectBox.getBoundingClientRect();
            objectBox.style.top = `${initialBounds.top}px`;
            objectBox.style.left = `${initialBounds.left}px`;
            objectBox.style.width = `${initialBounds.width}px`;
            objectBox.style.height = `${initialBounds.height}px`;
            objectBox.classList.add('zoomed');

            requestAnimationFrame(() => {
                requestAnimationFrame(() => {
                    mainContainer.classList.add('is-expanded');
                    objectBox.style.top = '0';
                    objectBox.style.left = '0';
                    objectBox.style.width = '100vw';
                    objectBox.style.height = '100vh';
                    
                    startSlideshow(project);
                    startTextDecoder(data.aboutText);
                });
            });
        });
    });

    const collapse = () => {
        if (!initialBounds) return;

        objectBox.style.top = `${initialBounds.top}px`;
        objectBox.style.left = `${initialBounds.left}px`;
        objectBox.style.width = `${initialBounds.width}px`;
        objectBox.style.height = `${initialBounds.height}px`;
        mainContainer.classList.remove('is-expanded');

        if (slideshowInterval) clearInterval(slideshowInterval);
        if (textDecoderInterval) clearInterval(textDecoderInterval);

        setTimeout(() => {
            objectBox.classList.remove('zoomed');
            document.body.classList.remove('acam-theme', 'collage-theme');
            objectBox.classList.remove('has-preview', 'acam-preview', 'collage-preview');
            mainDisplay.innerHTML = defaultMission;
            objectBox.style.top = '';
            objectBox.style.left = '';
            objectBox.style.width = '';
            objectBox.style.height = '';
            initialBounds = null;
        }, 700);
    };

    exitBtn.addEventListener('click', (e) => {
        e.stopPropagation();
        collapse();
    });

    document.addEventListener('keydown', (e) => {
        if (e.key === 'Escape' && objectBox.classList.contains('zoomed')) {
            collapse();
        }
    });
});
