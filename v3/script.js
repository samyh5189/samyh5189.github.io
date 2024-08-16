/* Base styles */
:root {
    --primary-color: #4a90e2;
    --primary-color-dark: #3a7bc8;
    --background-color: #f4f4f4;
    --text-color: #333;
    --container-bg: #ffffff;
    --border-color: #ddd;
    --success-color: #4caf50;
    --focus-color: rgba(74, 144, 226, 0.5);
}

body {
    font-family: 'Poppins', sans-serif;
    line-height: 1.6;
    color: var(--text-color);
    background-color: var(--background-color);
    margin: 0;
    padding: 0;
    transition: background-color 0.3s ease, color 0.3s ease;
}

.container {
    max-width: 800px;
    margin: 0 auto;
    padding: 20px;
    background-color: var(--container-bg);
    box-shadow: 0 0 10px rgba(0,0,0,0.1);
    border-radius: 8px;
    transition: background-color 0.3s ease, box-shadow 0.3s ease;
}

/* Logo styles */
.logo-container {
    text-align: center;
    margin-bottom: 20px;
}

.logo {
    width: 100px;
    height: auto;
    animation: pulse 2s infinite;
}

@keyframes pulse {
    0%, 100% { transform: scale(1); }
    50% { transform: scale(1.1); }
}

/* Typography */
.main-title {
    text-align: center;
    color: var(--primary-color);
    margin-bottom: 30px;
}

/* Form styles */
.form-container {
    display: flex;
    flex-direction: column;
    gap: 20px;
    margin-bottom: 30px;
}

.form-group {
    display: flex;
    flex-direction: column;
    margin-bottom: 15px;
}

.label-text {
    margin-bottom: 5px;
    font-weight: 600;
}

.select-style, .btn-generate, .btn-copy, .btn-generate-more {
    padding: 10px;
    border-radius: 4px;
    border: 1px solid var(--border-color);
    font-size: 16px;
    transition: all 0.3s ease;
}

.select-style:focus, .key-item input:focus {
    outline: none;
    border-color: var(--primary-color);
    box-shadow: 0 0 5px var(--focus-color);
}

/* Button styles */
.btn-generate, .btn-copy, .btn-generate-more, .copyKeyBtn {
    background-color: var(--primary-color);
    color: white;
    border: none;
    cursor: pointer;
    position: relative;
    overflow: hidden;
    text-transform: uppercase;
    letter-spacing: 0.5px;
    font-weight: 600;
}

.btn-generate:hover, .btn-copy:hover, .btn-generate-more:hover, .copyKeyBtn:hover {
    background-color: var(--primary-color-dark);
    transform: translateY(-2px);
    box-shadow: 0 4px 6px rgba(0,0,0,0.1);
}

.btn-generate:active, .btn-copy:active, .btn-generate-more:active, .copyKeyBtn:active {
    transform: translateY(0);
    box-shadow: none;
}

/* Progress bar styles */
.progress-bar-container {
    width: 100%;
    height: 20px;
    background-color: var(--border-color);
    border-radius: 10px;
    overflow: hidden;
    margin-bottom: 10px;
}

.progress-bar {
    width: 0;
    height: 100%;
    background-color: var(--success-color);
    transition: width 0.3s ease;
}

.progress-text, .progress-log {
    text-align: center;
    margin-bottom: 10px;
}

/* Key list styles */
.keys-list {
    display: flex;
    flex-direction: column;
    gap: 10px;
    margin-bottom: 20px;
}

.key-item {
    display: flex;
    gap: 10px;
}

.key-item input {
    flex-grow: 1;
    padding: 5px;
    border: 1px solid var(--border-color);
    border-radius: 4px;
    transition: all 0.3s ease;
}

/* Video container styles */
.video-container {
    margin-top: 30px;
    width: 100%;
    max-width: 800px;
    margin-left: auto;
    margin-right: auto;
}

.video-wrapper {
    position: relative;
    width: 100%;
    padding-bottom: 56.25%; /* 16:9 aspect ratio */
    height: 0;
    overflow: hidden;
}

.video-wrapper iframe {
    position: absolute;
    top: 0;
    left: 0;
    width: 100%;
    height: 100%;
}

/* Footer styles */
.footer {
    text-align: center;
    margin-top: 30px;
    padding-top: 20px;
    border-top: 1px solid var(--border-color);
}

/* Utility classes */
.hidden {
    display: none;
}

.copy-status {
    text-align: center;
    color: var(--success-color);
    margin-top: 10px;
}

/* Dark mode styles */
body.dark-mode {
    --background-color: #1a1a1a;
    --text-color: #f0f0f0;
    --container-bg: #2a2a2a;
    --primary-color: #60a5fa;
    --primary-color-dark: #3b82f6;
    --border-color: #4a4a4a;
    --focus-color: rgba(96, 165, 250, 0.5);
}

body.dark-mode .container {
    box-shadow: 0 0 10px rgba(255,255,255,0.1);
}

body.dark-mode .select-style,
body.dark-mode .key-item input {
    background-color: #3a3a3a;
}

/* Dark mode toggle button */
.dark-mode-toggle {
    position: fixed;
    top: 20px;
    right: 20px;
    background: none;
    border: none;
    cursor: pointer;
    padding: 0;
    z-index: 1000;
}

.dark-mode-toggle svg {
    width: 24px;
    height: 24px;
    color: var(--primary-color);
    transition: color 0.3s ease;
}

body.dark-mode .dark-mode-toggle svg {
    color: var(--primary-color);
}

/* Custom scrollbar */
::-webkit-scrollbar {
    width: 10px;
}

::-webkit-scrollbar-track {
    background: var(--background-color);
}

::-webkit-scrollbar-thumb {
    background: var(--border-color);
    border-radius: 5px;
}

::-webkit-scrollbar-thumb:hover {
    background: var(--text-color);
}

/* Responsive design */
@media (max-width: 600px) {
    .container {
        padding: 15px;
    }

    .main-title {
        font-size: 24px;
    }

    .form-group,
    .key-item {
        flex-direction: column;
    }

    .select-style,
    .btn-generate,
    .btn-copy,
    .btn-generate-more,
    .key-item input,
    .copyKeyBtn {
        width: 100%;
        margin-bottom: 10px;
    }

    .video-container {
        width: 100%;
        padding: 0 15px;
        box-sizing: border-box;
    }

    .video-wrapper {
        padding-bottom: 75%; /* 4:3 aspect ratio for smaller screens */
    }
}

@media (max-width: 400px) {
    .main-title {
        font-size: 20px;
    }

    .logo {
        width: 80px;
    }

    .btn-generate, .btn-copy, .btn-generate-more, .copyKeyBtn {
        font-size: 14px;
    }
}

/* Accessibility improvements */
.btn-generate:focus,
.btn-copy:focus,
.btn-generate-more:focus,
.copyKeyBtn:focus,
.select-style:focus {
    outline: 2px solid var(--primary-color);
    outline-offset: 2px;
}
