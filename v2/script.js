document.addEventListener('DOMContentLoaded', () => {
    const EVENTS_DELAY = 18000;
    const API_BASE_URL = 'https://samyh.pythonanywhere.com:8080'; // Replace with your secure API endpoint

    const games = {
        1: { name: 'Riding Extreme 3D' },
        2: { name: 'Chain Cube 2048' },
        3: { name: 'My Clone Army' },
        4: { name: 'Train Miner' },
        5: { name: 'MergeAway' }
    };

    const elements = {
        startBtn: document.getElementById('startBtn'),
        keyCountSelect: document.getElementById('keyCountSelect'),
        keyCountLabel: document.getElementById('keyCountLabel'),
        progressContainer: document.getElementById('progressContainer'),
        progressBar: document.getElementById('progressBar'),
        progressText: document.getElementById('progressText'),
        progressLog: document.getElementById('progressLog'),
        keyContainer: document.getElementById('keyContainer'),
        keysList: document.getElementById('keysList'),
        copyAllBtn: document.getElementById('copyAllBtn'),
        generatedKeysTitle: document.getElementById('generatedKeysTitle'),
        gameSelect: document.getElementById('gameSelect'),
        copyStatus: document.getElementById('copyStatus'),
        previousKeysContainer: document.getElementById('previousKeysContainer'),
        previousKeysList: document.getElementById('previousKeysList')
    };

    const getUserMaxKeys = async (userId, gameName) => {
        try {
            const response = await fetch(`${API_BASE_URL}/get_max_keys?userId=${userId}&gameName=${gameName}`);
            if (!response.ok) throw new Error('Failed to fetch max keys');
            return await response.json();
        } catch (error) {
            console.error('Error fetching max keys:', error);
            throw error;
        }
    };

    const updateKeysGenerated = async (userId, gameName, keysGenerated) => {
        try {
            const response = await fetch(`${API_BASE_URL}/update_keys_generated`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({ userId, gameName, keysGenerated }),
            });
            if (!response.ok) throw new Error('Failed to update keys generated');
            return await response.json();
        } catch (error) {
            console.error('Error updating keys generated:', error);
            throw error;
        }
    };

    const getUserIdFromUrl = () => new URLSearchParams(window.location.search).get('userId');

    const generateClientId = () => {
        const timestamp = Date.now();
        const randomNumbers = Array.from({ length: 19 }, () => Math.floor(Math.random() * 10)).join('');
        return `${timestamp}-${randomNumbers}`;
    };

    const apiRequest = async (endpoint, method, body = null, token = null) => {
        const headers = {
            'Content-Type': 'application/json'
        };
        if (token) headers['Authorization'] = `Bearer ${token}`;
        const options = { method, headers };
        if (body) options.body = JSON.stringify(body);

        const response = await fetch(`${API_BASE_URL}${endpoint}`, options);
        if (!response.ok) throw new Error(`API request failed: ${response.statusText}`);
        return response.json();
    };

    const login = (clientId, appToken) => apiRequest('/login-client', 'POST', { appToken, clientId, clientOrigin: 'deviceid' });

    const emulateProgress = (clientToken, promoId) => apiRequest('/register-event', 'POST', {
        promoId,
        eventId: generateUUID(),
        eventOrigin: 'undefined'
    }, clientToken);

    const generateKey = (clientToken, promoId) => apiRequest('/create-code', 'POST', { promoId }, clientToken);

    const generateUUID = () => 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, c => {
        const r = Math.random() * 16 | 0, v = c === 'x' ? r : (r & 0x3 | 0x8);
        return v.toString(16);
    });

    const sleep = ms => new Promise(resolve => setTimeout(resolve, ms));

    const delayRandom = () => Math.random() / 3 + 1;

    const displayPreviousKeys = (keys) => {
        elements.previousKeysList.innerHTML = keys.map(key =>
            `<div class="key-item">
                <input type="text" value="${key}" readonly>
            </div>`
        ).join('');
        elements.previousKeysContainer.classList.remove('hidden');
    };

    const updateProgress = (progress, message) => {
        elements.progressBar.style.width = `${progress}%`;
        elements.progressText.innerText = `${progress}%`;
        elements.progressLog.innerText = message;
    };

    const generateKeyProcess = async (game, updateProgressCallback) => {
        const clientId = generateClientId();
        let clientToken;
        try {
            const loginData = await login(clientId, game.appToken);
            clientToken = loginData.clientToken;
        } catch (error) {
            throw new Error(`Failed to login: ${error.message}`);
        }

        for (let i = 0; i < 11; i++) {
            await sleep(EVENTS_DELAY * delayRandom());
            const progressData = await emulateProgress(clientToken, game.promoId);
            updateProgressCallback(7, 'Emulating progress...');
            if (progressData.hasCode) break;
        }

        try {
            const keyData = await generateKey(clientToken, game.promoId);
            updateProgressCallback(30, 'Generating key...');
            return keyData.promoCode;
        } catch (error) {
            throw new Error(`Failed to generate key: ${error.message}`);
        }
    };

    const handleStartButtonClick = async () => {
        const gameChoice = parseInt(elements.gameSelect.value);
        const keyCount = parseInt(elements.keyCountSelect.value);
        const game = games[gameChoice];
        const userId = getUserIdFromUrl();

        if (!userId) {
            alert("User ID not found. Please access this page through the Telegram bot.");
            return;
        }

        try {
            const { max_keys, keys_generated } = await getUserMaxKeys(userId, game.name);
            const remainingKeys = max_keys - keys_generated;

            if (remainingKeys <= 0) {
                alert(`You have reached your daily limit for ${game.name}. Please try again tomorrow.`);
                return;
            }

            const keysToGenerate = Math.min(keyCount, remainingKeys);

            if (keysToGenerate < keyCount) {
                alert(`You can only generate ${keysToGenerate} more keys for ${game.name} today.`);
            }

            elements.keyCountLabel.innerText = `Number of keys: ${keysToGenerate}`;
            updateProgress(0, 'Starting... Please wait. It may take up to 1 min to Login');
            elements.progressContainer.classList.remove('hidden');
            elements.keyContainer.classList.add('hidden');
            elements.generatedKeysTitle.classList.add('hidden');
            elements.keysList.innerHTML = '';
            elements.keyCountSelect.classList.add('hidden');
            elements.gameSelect.classList.add('hidden');
            elements.startBtn.classList.add('hidden');
            elements.copyAllBtn.classList.add('hidden');
            elements.startBtn.disabled = true;

            let totalProgress = 0;
            const updateProgressWrapper = (increment, message) => {
                totalProgress += increment;
                updateProgress(totalProgress, message);
            };

            const keys = await Promise.all(Array.from({ length: keysToGenerate }, () => generateKeyProcess(game, updateProgressWrapper)));
            displayGeneratedKeys(keys);

            // Update the keys generated count on the server
            await updateKeysGenerated(userId, game.name, keys_generated + keys.length);

        } catch (error) {
            alert(error.message);
        } finally {
            elements.startBtn.disabled = false;
            elements.keyCountSelect.classList.remove('hidden');
            elements.gameSelect.classList.remove('hidden');
            elements.startBtn.classList.remove('hidden');
        }
    };

    const displayGeneratedKeys = (keys) => {
        if (keys.length > 1) {
            elements.keysList.innerHTML = keys.filter(key => key).map(key =>
                `<div class="key-item">
                    <input type="text" value="${key}" readonly>
                    <button class="copyKeyBtn" data-key="${key}">Copy Key</button>
                </div>`
            ).join('');
            elements.copyAllBtn.classList.remove('hidden');
        } else if (keys.length === 1 && keys[0]) {
            elements.keysList.innerHTML =
                `<div class="key-item">
                    <input type="text" value="${keys[0]}" readonly>
                    <button class="copyKeyBtn" data-key="${keys[0]}">Copy Key</button>
                </div>`;
        }

        elements.keyContainer.classList.remove('hidden');
        elements.generatedKeysTitle.classList.remove('hidden');
        addCopyButtonListeners();
    };

    const addCopyButtonListeners = () => {
        document.querySelectorAll('.copyKeyBtn').forEach(button => {
            button.addEventListener('click', (event) => {
                const key = event.target.getAttribute('data-key');
                navigator.clipboard.writeText(key).then(() => {
                    elements.copyStatus.innerText = `Copied ${key}`;
                    setTimeout(() => {
                        elements.copyStatus.innerText = '';
                    }, 2000);
                }).catch(err => {
                    console.error('Could not copy text: ', err);
                });
            });
        });
    };

    const handleCopyAllButtonClick = () => {
        const allKeys = Array.from(document.querySelectorAll('.key-item input')).map(input => input.value).join('\n');
        navigator.clipboard.writeText(allKeys).then(() => {
            elements.copyStatus.innerText = 'All keys copied';
            setTimeout(() => {
                elements.copyStatus.innerText = '';
            }, 2000);
        }).catch(err => {
            console.error('Could not copy text: ', err);
        });
    };

    elements.startBtn.addEventListener('click', handleStartButtonClick);
    elements.copyAllBtn.addEventListener('click', handleCopyAllButtonClick);
});
