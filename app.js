document.addEventListener('DOMContentLoaded', () => {
    const mainContainer = document.getElementById('main-container');
    const objectBox = document.getElementById('object-box');
    const projectBtns = document.querySelectorAll('.project-btn');
    const exitBtn = document.getElementById('exit-btn');
    const videoLabel = document.getElementById('video-label');
    const liveLogicOverlay = document.getElementById('live-logic');
    
    let logicInterval = null;
    let initialBounds = null;

    // Expand state
    projectBtns.forEach(btn => {
        btn.addEventListener('click', () => {
            const projectCode = btn.getAttribute('data-project').toUpperCase();
            videoLabel.textContent = `${projectCode}_FEED_ACTIVE`;
            
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
                    startLiveLogic();
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
            objectBox.style.top = '';
            objectBox.style.left = '';
            objectBox.style.width = '';
            objectBox.style.height = '';
            initialBounds = null;
        }, 700); // Match CSS transition-zoom duration
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
    function generateMockLog() {
        const timestamp = new Date().toISOString().substring(11, 23);
        const hex = Math.floor(Math.random() * 0xffffff).toString(16).padStart(6, '0').toUpperCase();
        const actions = ['INIT', 'FETCH', 'AWAIT', 'PARSE', 'RENDER', 'SYNC'];
        const action = actions[Math.floor(Math.random() * actions.length)];
        return `[${timestamp}] ${action} :: 0x${hex} OK`;
    }

    function startLiveLogic() {
        if (logicInterval) return;
        liveLogicOverlay.textContent = '';
        
        let logs = [];
        const maxLogs = 30;

        logicInterval = setInterval(() => {
            logs.push(generateMockLog());
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
