document.addEventListener('DOMContentLoaded', function() {
            // DOM Elements
            const startBtn = document.getElementById('start-test');
            const pingValue = document.querySelector('#ping-test .test-value');
            const downloadValue = document.querySelector('#download-test .test-value');
            const uploadValue = document.querySelector('#upload-test .test-value');
            const progressBar = document.getElementById('progress-bar');
            const statusEl = document.getElementById('status');
            const pingCard = document.getElementById('ping-test');
            const downloadCard = document.getElementById('download-test');
            const uploadCard = document.getElementById('upload-test');
            const themeToggle = document.getElementById('theme-toggle');

            // Test configuration
            const testFiles = {
                small: 'https://httpbin.org/bytes/100000', // ~100KB
                medium: 'https://httpbin.org/bytes/500000', // ~500KB
                large: 'https://httpbin.org/bytes/1000000' // ~1MB
            };

            // Theme management
            themeToggle.addEventListener('click', toggleTheme);
            function toggleTheme() {
                const currentTheme = document.documentElement.getAttribute('data-theme');
                if (currentTheme === 'dark') {
                    document.documentElement.removeAttribute('data-theme');
                    themeToggle.textContent = '🌙';
                } else {
                    document.documentElement.setAttribute('data-theme', 'dark');
                    themeToggle.textContent = '☀️';
                }
            }

            // Start test handler
            startBtn.addEventListener('click', startTest);

            async function startTest() {
                if (startBtn.disabled) return;
                
                startBtn.disabled = true;
                resetResults();
                
                try {
                    // Test ping first
                    updateStatus("Testing ping...", true);
                    activateCard(pingCard);
                    const ping = await testPing();
                    updateValue(pingValue, ping);
                    updateProgress(10);
                    
                    // Then test download speed
                    updateStatus("Testing download speed...", true);
                    deactivateCard(pingCard);
                    activateCard(downloadCard);
                    const downloadSpeed = await testDownloadSpeed();
                    updateValue(downloadValue, downloadSpeed.toFixed(2));
                    updateProgress(50);
                    
                    // Finally test upload speed
                    updateStatus("Testing upload speed...", true);
                    deactivateCard(downloadCard);
                    activateCard(uploadCard);
                    const uploadSpeed = await testUploadSpeed();
                    updateValue(uploadValue, uploadSpeed.toFixed(2));
                    updateProgress(100);
                    
                    // Celebrate completion!
                    updateStatus("Test completed! Your connection looks great!", false);
                    createConfetti();
                    setTimeout(() => {
                        updateStatus("Ready for another test", false);
                    }, 3000);
                } catch (error) {
                    console.error("Speed test error:", error);
                    updateStatus("Error: " + error.message, false);
                } finally {
                    deactivateCard(uploadCard);
                    startBtn.disabled = false;
                }
            }

            // Helper functions
            function resetResults() {
                pingValue.textContent = '--';
                downloadValue.textContent = '--';
                uploadValue.textContent = '--';
                updateProgress(0);
            }

            function updateProgress(percent) {
                progressBar.style.width = percent + '%';
            }

            function updateStatus(message, isActive) {
                statusEl.textContent = message;
                if (isActive) {
                    statusEl.classList.add('active');
                } else {
                    statusEl.classList.remove('active');
                }
            }

            function updateValue(element, value) {
                element.classList.add('animate__animated', 'animate__pulse');
                element.textContent = value;
                element.addEventListener('animationend', () => {
                    element.classList.remove('animate__animated', 'animate__pulse');
                });
            }

            function activateCard(card) {
                card.classList.add('active');
                card.classList.add('animate__animated', 'animate__pulse');
                card.addEventListener('animationend', () => {
                    card.classList.remove('animate__animated', 'animate__pulse');
                });
            }

            function deactivateCard(card) {
                card.classList.remove('active');
            }

            function createConfetti() {
                const colors = ['#4361ee', '#4895ef', '#4cc9f0', '#f72585', '#7209b7'];
                for (let i = 0; i < 50; i++) {
                    const confetti = document.createElement('div');
                    confetti.className = 'confetti';
                    confetti.style.left = Math.random() * 100 + 'vw';
                    confetti.style.backgroundColor = colors[Math.floor(Math.random() * colors.length)];
                    confetti.style.opacity = '1';
                    document.body.appendChild(confetti);
                    
                    const animation = confetti.animate([
                        { transform: 'translateY(0) rotate(0deg)', opacity: 1 },
                        { transform: `translateY(${window.innerHeight}px) rotate(${Math.random() * 360}deg)`, opacity: 0 }
                    ], {
                        duration: 1000 + Math.random() * 2000,
                        easing: 'cubic-bezier(0.1, 0.8, 0.3, 1)'
                    });
                    
                    animation.onfinish = () => confetti.remove();
                }
            }

            // Test functions
            async function testPing() {
                const start = performance.now();
                await fetch('https://httpbin.org/get', {
                    method: 'HEAD',
                    cache: 'no-store',
                    mode: 'no-cors'
                });
                const end = performance.now();
                return Math.round(end - start);
            }

            async function testDownloadSpeed() {
                const start = performance.now();
                const response = await fetch(testFiles.large + '?nocache=' + Math.random(), {
                    cache: 'no-store'
                });
                await response.blob();
                const end = performance.now();
                
                // Calculate speed in Mbps
                const duration = (end - start) / 1000;
                const bitsLoaded = 1000000 * 8;
                return (bitsLoaded / duration) / 1000000;
            }

            async function testUploadSpeed() {
                const blob = new Blob([new Uint8Array(1000000)], { type: 'application/octet-stream' });
                const formData = new FormData();
                formData.append('file', blob, 'test.bin');
                
                const start = performance.now();
                await fetch('https://httpbin.org/post', {
                    method: 'POST',
                    body: formData,
                    mode: 'no-cors'
                });
                const end = performance.now();
                
                const duration = (end - start) / 1000;
                const bitsLoaded = 1000000 * 8;
                return (bitsLoaded / duration) / 1000000;
            }
        });