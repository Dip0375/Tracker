// AWS-style Time Range Selector
class TimeRangeSelector {
    constructor() {
        this.currentMode = 'relative';
        this.currentRange = '5m';
        this.init();
    }

    init() {
        this.setupTabSwitching();
        this.setupRelativeButtons();
        this.setupAbsoluteInputs();
        this.setDefaultTime();
    }

    setupTabSwitching() {
        const tabs = document.querySelectorAll('.time-tab');
        tabs.forEach(tab => {
            tab.addEventListener('click', () => {
                const tabType = tab.dataset.tab;
                this.switchTab(tabType);
            });
        });
    }

    switchTab(tabType) {
        // Update tab appearance
        document.querySelectorAll('.time-tab').forEach(tab => {
            tab.classList.remove('active');
        });
        document.querySelector(`[data-tab="${tabType}"]`).classList.add('active');

        // Show/hide options
        const relativeOptions = document.getElementById('relative-options');
        const absoluteOptions = document.getElementById('absolute-options');

        if (tabType === 'relative') {
            relativeOptions.style.display = 'flex';
            absoluteOptions.style.display = 'none';
            this.currentMode = 'relative';
        } else {
            relativeOptions.style.display = 'none';
            absoluteOptions.style.display = 'block';
            this.currentMode = 'absolute';
        }
    }

    setupRelativeButtons() {
        const buttons = document.querySelectorAll('.timeframe-btn');
        buttons.forEach(button => {
            button.addEventListener('click', () => {
                // Remove active class from all buttons
                buttons.forEach(btn => btn.classList.remove('active'));
                // Add active class to clicked button
                button.classList.add('active');
                
                this.currentRange = button.dataset.timeframe;
                this.applyTimeRange();
            });
        });
    }

    setupAbsoluteInputs() {
        const applyBtn = document.getElementById('apply-absolute-time');
        if (applyBtn) {
            applyBtn.addEventListener('click', () => {
                this.applyAbsoluteRange();
            });
        }
    }

    setDefaultTime() {
        const now = new Date();
        const startTime = new Date(now.getTime() - (24 * 60 * 60 * 1000)); // 24 hours ago
        
        const startInput = document.getElementById('absolute-start-time');
        const endInput = document.getElementById('absolute-end-time');
        
        if (startInput && endInput) {
            startInput.value = this.formatDateTimeLocal(startTime);
            endInput.value = this.formatDateTimeLocal(now);
        }
    }

    formatDateTimeLocal(date) {
        const year = date.getFullYear();
        const month = String(date.getMonth() + 1).padStart(2, '0');
        const day = String(date.getDate()).padStart(2, '0');
        const hours = String(date.getHours()).padStart(2, '0');
        const minutes = String(date.getMinutes()).padStart(2, '0');
        
        return `${year}-${month}-${day}T${hours}:${minutes}`;
    }

    applyTimeRange() {
        if (this.currentMode === 'relative') {
            const range = this.parseRelativeRange(this.currentRange);
            console.log('Applied relative time range:', range);
            
            // Trigger dashboard update
            if (window.dashboardManager) {
                window.dashboardManager.updateTimeRange(range);
            }
        }
    }

    applyAbsoluteRange() {
        const startInput = document.getElementById('absolute-start-time');
        const endInput = document.getElementById('absolute-end-time');
        
        if (startInput && endInput && startInput.value && endInput.value) {
            const startTime = new Date(startInput.value);
            const endTime = new Date(endInput.value);
            
            if (startTime >= endTime) {
                alert('Start time must be before end time');
                return;
            }
            
            const range = {
                type: 'absolute',
                start: startTime,
                end: endTime
            };
            
            console.log('Applied absolute time range:', range);
            
            // Trigger dashboard update
            if (window.dashboardManager) {
                window.dashboardManager.updateTimeRange(range);
            }
        } else {
            alert('Please select both start and end times');
        }
    }

    parseRelativeRange(rangeStr) {
        const now = new Date();
        let startTime;
        
        const value = parseInt(rangeStr);
        const unit = rangeStr.replace(value.toString(), '');
        
        switch (unit) {
            case 'm': // minutes
                startTime = new Date(now.getTime() - (value * 60 * 1000));
                break;
            case 'h': // hours
                startTime = new Date(now.getTime() - (value * 60 * 60 * 1000));
                break;
            case 'd': // days
                startTime = new Date(now.getTime() - (value * 24 * 60 * 60 * 1000));
                break;
            case 'w': // weeks
                startTime = new Date(now.getTime() - (value * 7 * 24 * 60 * 60 * 1000));
                break;
            case 'M': // months
                startTime = new Date(now);
                startTime.setMonth(startTime.getMonth() - value);
                break;
            default:
                startTime = new Date(now.getTime() - (5 * 60 * 1000)); // Default 5 minutes
        }
        
        return {
            type: 'relative',
            start: startTime,
            end: now,
            range: rangeStr
        };
    }

    getCurrentRange() {
        if (this.currentMode === 'relative') {
            return this.parseRelativeRange(this.currentRange);
        } else {
            const startInput = document.getElementById('absolute-start-time');
            const endInput = document.getElementById('absolute-end-time');
            
            if (startInput && endInput && startInput.value && endInput.value) {
                return {
                    type: 'absolute',
                    start: new Date(startInput.value),
                    end: new Date(endInput.value)
                };
            }
        }
        
        return this.parseRelativeRange('5m'); // Default fallback
    }
}

// Initialize time range selector when DOM is loaded
document.addEventListener('DOMContentLoaded', () => {
    window.timeRangeSelector = new TimeRangeSelector();
});