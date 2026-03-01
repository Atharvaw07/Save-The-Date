document.addEventListener('DOMContentLoaded', () => {
    // 1. Fetch site data first
    fetch('site.json')
        .then(response => response.json())
        .then(data => {
            injectSiteData(data);
            initApp();
        })
        .catch(err => {
            console.error('Error loading site data:', err);
            // Fallback initialization if JSON fails
            initApp();
        });

    function injectSiteData(data) {
        // Update Page Title
        if (data.pageTitle) document.title = data.pageTitle;

        // Update Favicon
        const favicon = document.getElementById('favicon');
        if (favicon && data.favicon) {
            favicon.href = data.favicon;
        }

        // Update Media Sources
        const audioSource = document.getElementById('audioSource');
        const videoSource = document.getElementById('videoSource');
        const bgMusic = document.getElementById('bgMusic');
        const curtainVideo = document.getElementById('curtainVideo');

        if (audioSource && data.audioSrc) {
            audioSource.src = data.audioSrc;
            bgMusic.load();
        }
        if (videoSource && data.videoSrc) {
            videoSource.src = data.videoSrc;
            curtainVideo.load();
        }

        // Update Couple Names (Stacked)
        const namesDisplay = document.getElementById('coupleNamesDisplay');
        if (namesDisplay && data.coupleNames) {
            const formattedNames = data.coupleNames.replace(' & ', '<br><span class="ampersand">&</span><br>');
            namesDisplay.innerHTML = formattedNames;
        }

        // Update Wedding Date
        if (data.weddingDate) {
            const dayEl = document.getElementById('weddingDay');
            const monthEl = document.getElementById('weddingMonth');
            const yearEl = document.getElementById('weddingYear');

            if (dayEl) dayEl.textContent = data.weddingDate.day;
            if (monthEl) monthEl.textContent = data.weddingDate.month;
            if (yearEl) yearEl.textContent = data.weddingDate.year;
        }

        // Update Calendar Link
        const calendarLink = document.getElementById('calendarLink');
        if (calendarLink && data.calendar) {
            const baseUrl = "https://calendar.google.com/calendar/render?action=TEMPLATE";
            const url = `${baseUrl}&text=${encodeURIComponent(data.calendar.text)}&dates=${data.calendar.dates}&details=${encodeURIComponent(data.calendar.details)}&location=${encodeURIComponent(data.calendar.location)}`;
            calendarLink.href = url;
        }
    }

    function initApp() {
        const theaterSection = document.getElementById('theaterSection');
        const curtainVideo = document.getElementById('curtainVideo');
        const bgMusic = document.getElementById('bgMusic');
        const audioToggle = document.getElementById('audioToggle');
        const audioIcon = document.getElementById('audioIcon');
        let isMusicPlaying = false;

        // --- Audio Logic ---
        function toggleAudio() {
            if (isMusicPlaying) {
                bgMusic.pause();
                audioIcon.innerHTML = '<path fill="currentColor" d="M16.5 12c0-1.77-1.02-3.29-2.5-4.03v8.05c1.48-.73 2.5-2.25 2.5-4.02zM4 9v6h4l5 5V4L8 9H4z"/>';
            } else {
                bgMusic.play().catch(e => console.log("Audio play blocked:", e));
                audioIcon.innerHTML = '<path fill="currentColor" d="M3 9v6h4l5 5V4L7 9H3zm13.5 3c0-1.77-1.02-3.29-2.5-4.03v8.05c1.48-.73 2.5-2.25 2.5-4.02zM14 3.23v2.06c2.89.86 5 3.54 5 6.71s-2.11 5.85-5 6.71v2.06c4.01-.91 7-4.49 7-8.77s-2.99-7.86-7-8.77z"/>';
            }
            isMusicPlaying = !isMusicPlaying;
        }

        audioToggle.addEventListener('click', (e) => {
            e.stopPropagation();
            toggleAudio();
        });

        // --- Tab Switch / Focus Audio Logic ---
        function handleVisibilityChange() {
            if (document.hidden) {
                bgMusic.pause();
            } else if (isMusicPlaying) {
                bgMusic.play().catch(e => console.log("Audio resume blocked:", e));
            }
        }

        document.addEventListener('visibilitychange', handleVisibilityChange);
        window.addEventListener('blur', () => bgMusic.pause());
        window.addEventListener('focus', () => {
            if (isMusicPlaying) bgMusic.play().catch(e => console.log("Audio focus resume blocked:", e));
        });
        window.addEventListener('beforeunload', () => bgMusic.pause());

        // --- Video Curtain Logic ---
        theaterSection.addEventListener('click', () => {
            if (!theaterSection.classList.contains('playing')) {
                theaterSection.classList.add('playing');
                
                // Play video and music together
                curtainVideo.play();
                if (!isMusicPlaying) {
                    toggleAudio();
                }
            }
        });

        // Track if scrolling has been unlocked
        let scrollingUnlocked = false;

        // Handle mid-video reveal to unlock scrolling
        curtainVideo.addEventListener('timeupdate', () => {
            if (!scrollingUnlocked && curtainVideo.currentTime >= 3.5) {
                scrollingUnlocked = true;
                document.body.classList.add('content-ready');
            }
        });

        // --- Scratch-off Logic ---
        class ScratchHeart {
            constructor(canvasId, containerId, onReveal) {
                this.canvas = document.getElementById(canvasId);
                this.ctx = this.canvas.getContext('2d');
                this.container = document.getElementById(containerId);
                this.onReveal = onReveal;
                this.isDrawing = false;
                this.revealed = false;

                this.width = 160;
                this.height = 142;
                this.canvas.width = this.width;
                this.canvas.height = this.height;

                this.init();
            }

            init() {
                this.createScratchTexture();
                this.canvas.addEventListener('mousedown', (e) => { this.isDrawing = true; this.scratch(e); });
                this.canvas.addEventListener('touchstart', (e) => { this.isDrawing = true; this.scratch(e); }, { passive: false });
                window.addEventListener('mouseup', () => { this.isDrawing = false; });
                window.addEventListener('touchend', () => { this.isDrawing = false; });
                this.canvas.addEventListener('mousemove', (e) => this.scratch(e));
                this.canvas.addEventListener('touchmove', (e) => this.scratch(e), { passive: false });
            }

            createScratchTexture() {
                // Get computed accent colors
                const accentColor = getComputedStyle(document.documentElement).getPropertyValue('--accent').trim();
                const accentDarkColor = getComputedStyle(document.documentElement).getPropertyValue('--accent-dark').trim();
                const borderColor = getComputedStyle(document.documentElement).getPropertyValue('--border-color').trim();

                this.ctx.fillStyle = accentColor;
                this.ctx.fillRect(0, 0, this.width, this.height);

                for (let i = 0; i < 2000; i++) {
                    const x = Math.random() * this.width;
                    const y = Math.random() * this.height;
                    const size = Math.random() * 2 + 1;
                    const colors = [accentColor, accentDarkColor, borderColor];
                    this.ctx.fillStyle = colors[Math.floor(Math.random() * colors.length)];
                    this.ctx.beginPath();
                    this.ctx.arc(x, y, size, 0, Math.PI * 2);
                    this.ctx.fill();
                }
            }

            getMousePos(e) {
                const rect = this.canvas.getBoundingClientRect();
                const clientX = e.touches ? e.touches[0].clientX : e.clientX;
                const clientY = e.touches ? e.touches[0].clientY : e.clientY;
                
                const scaleX = this.canvas.width / rect.width;
                const scaleY = this.canvas.height / rect.height;

                return {
                    x: (clientX - rect.left) * scaleX,
                    y: (clientY - rect.top) * scaleY
                };
            }

            scratch(e) {
                if (!this.isDrawing || this.revealed) return;

                if (e.cancelable && e.type.startsWith('touch')) {
                    e.preventDefault();
                }

                const pos = this.getMousePos(e);
                
                this.ctx.globalCompositeOperation = 'destination-out';
                this.ctx.beginPath();
                this.ctx.arc(pos.x, pos.y, 22, 0, Math.PI * 2);
                this.ctx.fill();

                if (Math.random() > 0.4) this.checkProgress();
            }

            checkProgress() {
                if (this.revealed) return;

                const imageData = this.ctx.getImageData(0, 0, this.width, this.height);
                const pixels = imageData.data;
                let transparentPixels = 0;
                const sampleRate = 16;

                for (let i = 3; i < pixels.length; i += sampleRate) {
                    if (pixels[i] < 128) transparentPixels++;
                }

                const totalPixels = pixels.length / sampleRate;
                const percent = (transparentPixels / totalPixels) * 100;

                if (percent > 45) {
                    this.revealAll();
                }
            }

            revealAll() {
                this.revealed = true;
                this.canvas.style.opacity = '0';
                setTimeout(() => {
                    this.canvas.style.display = 'none';
                    this.onReveal();
                }, 800);
            }
        }

        let revealedHeartsCount = 0;
        const totalHearts = 3;

        function checkAllRevealed() {
            revealedHeartsCount++;
            if (revealedHeartsCount === totalHearts) {
                // Show calendar button
                const calendarBtn = document.getElementById('calendarBtnContainer');
                if (calendarBtn) {
                    setTimeout(() => {
                        calendarBtn.classList.add('visible');
                    }, 1000);
                }

                // Final celebratory sprinkle shower (subtle)
                const colors = ['#b11226', '#caa46a', '#f5e6d3', '#ffffff'];
                const duration = 2000;
                const end = Date.now() + duration;

                (function frame() {
                    confetti({
                        particleCount: 3,
                        angle: 60,
                        spread: 80,
                        origin: { x: 0, y: 0.8 },
                        colors: colors
                    });
                    confetti({
                        particleCount: 3,
                        angle: 120,
                        spread: 80,
                        origin: { x: 1, y: 0.8 },
                        colors: colors
                    });
                    confetti({
                        particleCount: 2,
                        gravity: 0.4,
                        scalar: 1,
                        origin: { y: -0.1 },
                        colors: colors
                    });

                    if (Date.now() < end) requestAnimationFrame(frame);
                }());
            }
        }

        // Pass the callback to each heart
        new ScratchHeart('scratchCanvas1', 'heartContainer1', checkAllRevealed);
        new ScratchHeart('scratchCanvas2', 'heartContainer2', checkAllRevealed);
        new ScratchHeart('scratchCanvas3', 'heartContainer3', checkAllRevealed);
    }
});
