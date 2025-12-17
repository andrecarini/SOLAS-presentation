(function() {
    'use strict';

    // ========================================
    // PRESENTATION CONTROLLER
    // ========================================
    const presentation = {
        currentSlide: 1,
        totalSlides: 0,
        slides: [],
        isAnimating: false,
        scrollAccumulator: 0,
        scrollThreshold: 50,
        scrollResetTimer: null,

        init() {
            this.slides = document.querySelectorAll('.slide');
            this.totalSlides = this.slides.length;
            this.createDots();
            this.bindEvents();
            this.updateUI();
        },

        createDots() {
            const dotsContainer = document.getElementById('slideDots');
            for (let i = 1; i <= this.totalSlides; i++) {
                const dot = document.createElement('button');
                dot.className = 'dot' + (i === 1 ? ' active' : '');
                dot.setAttribute('aria-label', `Go to slide ${i}`);
                dot.addEventListener('click', () => this.goToSlide(i));
                dotsContainer.appendChild(dot);
            }
        },

        bindEvents() {
            // Keyboard navigation
            document.addEventListener('keydown', (e) => {
                if (e.key === 'ArrowRight' || e.key === 'ArrowDown' || e.key === ' ') {
                    e.preventDefault();
                    this.nextSlide();
                } else if (e.key === 'ArrowLeft' || e.key === 'ArrowUp') {
                    e.preventDefault();
                    this.prevSlide();
                } else if (e.key === 'Home') {
                    e.preventDefault();
                    this.goToSlide(1);
                } else if (e.key === 'End') {
                    e.preventDefault();
                    this.goToSlide(this.totalSlides);
                }
            });

            // Mouse wheel navigation with accumulator
            document.addEventListener('wheel', (e) => {
                if (this.isAnimating) return;

                // Reset accumulator after 150ms of no scrolling
                clearTimeout(this.scrollResetTimer);
                this.scrollResetTimer = setTimeout(() => {
                    this.scrollAccumulator = 0;
                }, 150);

                // Accumulate scroll delta
                this.scrollAccumulator += e.deltaY;

                // Check if we've crossed the threshold
                if (Math.abs(this.scrollAccumulator) >= this.scrollThreshold) {
                    if (this.scrollAccumulator > 0) {
                        this.nextSlide();
                    } else {
                        this.prevSlide();
                    }
                    this.scrollAccumulator = 0;
                }
            }, { passive: true });

            // Button navigation
            document.getElementById('prevBtn').addEventListener('click', () => this.prevSlide());
            document.getElementById('nextBtn').addEventListener('click', () => this.nextSlide());

            // Touch support
            let touchStartY = 0;
            let touchStartX = 0;

            document.addEventListener('touchstart', (e) => {
                touchStartY = e.touches[0].clientY;
                touchStartX = e.touches[0].clientX;
            }, { passive: true });

            document.addEventListener('touchend', (e) => {
                const touchEndY = e.changedTouches[0].clientY;
                const touchEndX = e.changedTouches[0].clientX;
                const diffY = touchStartY - touchEndY;
                const diffX = touchStartX - touchEndX;

                // Horizontal swipe takes priority
                if (Math.abs(diffX) > Math.abs(diffY) && Math.abs(diffX) > 50) {
                    if (diffX > 0) {
                        this.nextSlide();
                    } else {
                        this.prevSlide();
                    }
                } else if (Math.abs(diffY) > 50) {
                    if (diffY > 0) {
                        this.nextSlide();
                    } else {
                        this.prevSlide();
                    }
                }
            }, { passive: true });
        },

        goToSlide(num) {
            if (num < 1 || num > this.totalSlides || num === this.currentSlide || this.isAnimating) {
                return;
            }

            this.isAnimating = true;
            const direction = num > this.currentSlide ? 1 : -1;

            // Update slide classes
            this.slides.forEach((slide, index) => {
                const slideNum = index + 1;
                slide.classList.remove('active', 'prev');

                if (slideNum === num) {
                    slide.classList.add('active');
                } else if (slideNum < num) {
                    slide.classList.add('prev');
                }
            });

            this.currentSlide = num;
            this.updateUI();

            setTimeout(() => {
                this.isAnimating = false;
            }, 400);
        },

        nextSlide() {
            if (this.currentSlide < this.totalSlides) {
                this.goToSlide(this.currentSlide + 1);
            }
        },

        prevSlide() {
            if (this.currentSlide > 1) {
                this.goToSlide(this.currentSlide - 1);
            }
        },

        updateUI() {
            // Update counter
            document.getElementById('slideCounter').textContent =
                `${this.currentSlide} / ${this.totalSlides}`;

            // Update progress bar
            const progress = ((this.currentSlide - 1) / (this.totalSlides - 1)) * 100;
            document.getElementById('progressBar').style.width = `${progress}%`;

            // Update dots
            const dots = document.querySelectorAll('.dot');
            dots.forEach((dot, index) => {
                dot.classList.toggle('active', index + 1 === this.currentSlide);
            });

            // Update button states
            document.getElementById('prevBtn').style.opacity = this.currentSlide === 1 ? '0.3' : '1';
            document.getElementById('nextBtn').style.opacity = this.currentSlide === this.totalSlides ? '0.3' : '1';

            // Toggle dark slide class for frosted glass UI
            const currentSlideEl = this.slides[this.currentSlide - 1];
            const isDarkSlide = currentSlideEl.classList.contains('slide--title');
            document.querySelector('.presentation').classList.toggle('on-dark-slide', isDarkSlide);
        }
    };

    // ========================================
    // CHART.JS INITIALIZATION
    // ========================================
    function initCharts() {
        // ASR Comparison Chart - Time and VRAM
        const asrCtx = document.getElementById('chartASR');
        if (asrCtx) {
            new Chart(asrCtx, {
                type: 'bar',
                data: {
                    labels: ['Tiny (39M)', 'Small (244M)', 'Large (1.5B)'],
                    datasets: [
                        {
                            label: 'Tempo (s)',
                            data: [89, 152, 382],
                            backgroundColor: 'rgba(37, 99, 235, 0.8)',
                            borderColor: 'rgba(37, 99, 235, 1)',
                            borderWidth: 1,
                            yAxisID: 'y'
                        },
                        {
                            label: 'VRAM (GB)',
                            data: [0.18, 0.82, 4.25],
                            backgroundColor: 'rgba(139, 92, 246, 0.8)',
                            borderColor: 'rgba(139, 92, 246, 1)',
                            borderWidth: 1,
                            yAxisID: 'y1'
                        }
                    ]
                },
                options: {
                    responsive: true,
                    maintainAspectRatio: true,
                    interaction: {
                        mode: 'index',
                        intersect: false
                    },
                    plugins: {
                        title: {
                            display: true,
                            text: 'ASR: Tempo vs VRAM por Modelo',
                            font: { size: 14, weight: '600' },
                            color: '#334155'
                        },
                        legend: {
                            position: 'bottom',
                            labels: { color: '#64748b', font: { size: 11 } }
                        }
                    },
                    scales: {
                        x: {
                            ticks: { color: '#64748b', font: { size: 10 } },
                            grid: { display: false }
                        },
                        y: {
                            type: 'linear',
                            display: true,
                            position: 'left',
                            title: {
                                display: true,
                                text: 'Tempo (s)',
                                color: '#2563eb',
                                font: { size: 11 }
                            },
                            ticks: { color: '#2563eb', font: { size: 10 } },
                            grid: { color: 'rgba(37, 99, 235, 0.1)' }
                        },
                        y1: {
                            type: 'linear',
                            display: true,
                            position: 'right',
                            title: {
                                display: true,
                                text: 'VRAM (GB)',
                                color: '#8b5cf6',
                                font: { size: 11 }
                            },
                            ticks: { color: '#8b5cf6', font: { size: 10 } },
                            grid: { drawOnChartArea: false }
                        }
                    }
                }
            });
        }

        // Quantization VRAM Chart
        const quantCtx = document.getElementById('chartQuantVRAM');
        if (quantCtx) {
            new Chart(quantCtx, {
                type: 'bar',
                data: {
                    labels: ['Qwen 0.5B', 'Qwen 1.5B', 'Phi-3 (3.8B)', 'Mistral (7B)'],
                    datasets: [
                        {
                            label: 'Full Precision',
                            data: [1.0, 3.0, 8.2, 14.1],
                            backgroundColor: 'rgba(37, 99, 235, 0.8)',
                            borderColor: 'rgba(37, 99, 235, 1)',
                            borderWidth: 1
                        },
                        {
                            label: '4-bit NF4',
                            data: [0.6, 1.2, 3.6, 4.6],
                            backgroundColor: 'rgba(34, 197, 94, 0.8)',
                            borderColor: 'rgba(34, 197, 94, 1)',
                            borderWidth: 1
                        }
                    ]
                },
                options: {
                    responsive: true,
                    maintainAspectRatio: true,
                    plugins: {
                        title: {
                            display: true,
                            text: 'Quantização: VRAM (GB)',
                            font: { size: 14, weight: '600' },
                            color: '#334155'
                        },
                        legend: {
                            position: 'bottom',
                            labels: { color: '#64748b', font: { size: 11 } }
                        },
                        annotation: {
                            annotations: {
                                line1: {
                                    type: 'line',
                                    yMin: 16,
                                    yMax: 16,
                                    borderColor: 'rgba(239, 68, 68, 0.7)',
                                    borderWidth: 2,
                                    borderDash: [5, 5],
                                    label: {
                                        display: true,
                                        content: 'Limite T4 (16GB)',
                                        position: 'end'
                                    }
                                }
                            }
                        }
                    },
                    scales: {
                        x: {
                            ticks: { color: '#64748b', font: { size: 10 } },
                            grid: { display: false }
                        },
                        y: {
                            beginAtZero: true,
                            max: 16,
                            title: {
                                display: true,
                                text: 'VRAM (GB)',
                                color: '#334155',
                                font: { size: 11 }
                            },
                            ticks: { color: '#64748b', font: { size: 10 } },
                            grid: { color: 'rgba(100, 116, 139, 0.1)' }
                        }
                    }
                }
            });
        }
    }

    // Initialize on DOM ready
    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', () => {
            presentation.init();
            initCharts();
        });
    } else {
        presentation.init();
        initCharts();
    }
})();
