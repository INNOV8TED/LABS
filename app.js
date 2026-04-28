document.addEventListener('DOMContentLoaded', () => {
    const mainContainer = document.getElementById('main-container');
    const objectBox = document.getElementById('object-box');
    const projectBtns = document.querySelectorAll('.project-btn');
    const exitBtn = document.getElementById('exit-btn');
    const videoLabel = document.getElementById('video-label');
    const liveLogicOverlay = document.getElementById('live-logic');
    
    let logicInterval = null;
    let initialBounds = null;

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
                            <div class="status-row">
                                <div class="status-cell label">MOVES</div>
                                <div class="status-cell value">Dolly, Pan, Tilt, Orbital, Handheld</div>
                            </div>
                        </div>
                    </div>
                </div>
            `
        },
        collage: {
            theme: 'collage-theme',
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
                                <div class="status-cell label">SOURCE</div>
                                <div class="status-cell value">Archival, Editorial, and R&D Datasets</div>
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

    const mainDisplay = document.getElementById('main-display');

    // Expand state
    projectBtns.forEach(btn => {
        btn.addEventListener('mouseover', () => {
            if (mainContainer.classList.contains('is-expanded')) return;
            const project = btn.getAttribute('data-project');
            const data = projectData[project];
            if (data) {
                mainDisplay.innerHTML = data.content;
                document.body.classList.add(data.theme);
            }
        });

        btn.addEventListener('mouseout', () => {
            if (mainContainer.classList.contains('is-expanded')) return;
            mainDisplay.innerHTML = defaultMission;
            document.body.classList.remove('acam-theme', 'collage-theme');
        });

        btn.addEventListener('click', () => {
            const project = btn.getAttribute('data-project');
            const projectCode = project.toUpperCase();
            videoLabel.textContent = `${projectCode} // LIVE_FEED`;
            
            // Lock the theme and content
            document.body.classList.remove('acam-theme', 'collage-theme');
            document.body.classList.add(`${project}-theme`);
            mainDisplay.innerHTML = projectData[project].content;

            // 1. Capture initial position
            initialBounds = objectBox.getBoundingClientRect();

            // 2. Set objectBox to fixed at current position
            objectBox.style.top = `${initialBounds.top}px`;
            objectBox.style.left = `${initialBounds.left}px`;
            objectBox.style.width = `${initialBounds.width}px`;
            objectBox.style.height = `${initialBounds.height}px`;
            objectBox.classList.add('zoomed');

            // 3. Trigger zoom in the next frame
            requestAnimationFrame(() => {
                requestAnimationFrame(() => {
                    mainContainer.classList.add('is-expanded');
                    objectBox.style.top = '0';
                    objectBox.style.left = '0';
                    objectBox.style.width = '100vw';
                    objectBox.style.height = '100vh';
                    startLiveLogic(project);
                });
            });
        });
    });

    // Collapse state
    const collapse = () => {
        if (!initialBounds) return;

        // 1. Return to initial bounds
        objectBox.style.top = `${initialBounds.top}px`;
        objectBox.style.left = `${initialBounds.left}px`;
        objectBox.style.width = `${initialBounds.width}px`;
        objectBox.style.height = `${initialBounds.height}px`;
        mainContainer.classList.remove('is-expanded');
        stopLiveLogic();

        // 2. Remove fixed positioning after transition
        setTimeout(() => {
            objectBox.classList.remove('zoomed');
            document.body.classList.remove('acam-theme', 'collage-theme');
            mainDisplay.innerHTML = defaultMission; // Revert to default
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

    // Live Logic Generation
    function generateMockLog(project) {
        const timestamp = new Date().toISOString().substring(11, 23);
        const hex = Math.floor(Math.random() * 0xffffff).toString(16).padStart(6, '0').toUpperCase();
        
        const projectActions = {
            acam: ['LENS_SYNC', 'DOF_CALC', 'SHUTTER_LOCK', 'TRACK_ACTIVE', 'GRID_RENDER'],
            collage: ['ASSET_MAP', 'CHRONO_PARSE', 'TEXTURE_SYNC', 'INDEX_LOAD', 'DENSITY_CALC']
        };

        const actions = projectActions[project] || ['INIT', 'FETCH', 'AWAIT', 'SYNC'];
        const action = actions[Math.floor(Math.random() * actions.length)];
        return `[${timestamp}] ${action} :: 0x${hex} OK`;
    }

    function startLiveLogic(project) {
        if (logicInterval) return;
        liveLogicOverlay.textContent = '';
        
        let logs = [];
        const maxLogs = 30;

        logicInterval = setInterval(() => {
            logs.push(generateMockLog(project));
            if (logs.length > maxLogs) {
                logs.shift();
            }
            liveLogicOverlay.textContent = logs.join('\n');
            liveLogicOverlay.scrollTop = liveLogicOverlay.scrollHeight;
        }, 150);
    }

    function stopLiveLogic() {
        if (logicInterval) {
            clearInterval(logicInterval);
            logicInterval = null;
        }
    }
});
