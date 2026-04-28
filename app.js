document.addEventListener('DOMContentLoaded', () => {
    const mainContainer = document.getElementById('main-container');
    const projectBtns = document.querySelectorAll('.project-btn');
    const exitBtn = document.getElementById('exit-btn');
    const videoLabel = document.getElementById('video-label');
    const liveLogicOverlay = document.getElementById('live-logic');
    
    let logicInterval = null;

    // Expand state
    projectBtns.forEach(btn => {
        btn.addEventListener('click', () => {
            const projectCode = btn.getAttribute('data-project').toUpperCase();
            videoLabel.textContent = `${projectCode}_FEED_ACTIVE`;
            mainContainer.classList.add('is-expanded');
            startLiveLogic();
        });
    });

    // Collapse state
    const collapse = () => {
        mainContainer.classList.remove('is-expanded');
        stopLiveLogic();
    };

    exitBtn.addEventListener('click', collapse);

    document.addEventListener('keydown', (e) => {
        if (e.key === 'Escape' && mainContainer.classList.contains('is-expanded')) {
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
        const maxLogs = 30; // Keep only a certain number of lines

        logicInterval = setInterval(() => {
            logs.push(generateMockLog());
            if (logs.length > maxLogs) {
                logs.shift();
            }
            liveLogicOverlay.textContent = logs.join('\n');
            // Auto scroll to bottom theoretically, but it's hidden overflow
            liveLogicOverlay.scrollTop = liveLogicOverlay.scrollHeight;
        }, 150); // new log every 150ms
    }

    function stopLiveLogic() {
        if (logicInterval) {
            clearInterval(logicInterval);
            logicInterval = null;
        }
    }
});
