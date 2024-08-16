document.addEventListener('DOMContentLoaded', () => {
    const EVENTS_DELAY = 21000;
    const MAX_KEYS_PER_GAME_PER_DAY = 100000;

    const games = {
        1: {
            name: 'Riding Extreme 3D',
            appToken: 'd28721be-fd2d-4b45-869e-9f253b554e50',
            promoId: '43e35910-c168-4634-ad4f-52fd764a843f',
        },
        2: {
            name: 'Chain Cube 2048',
            appToken: 'd1690a07-3780-4068-810f-9b5bbf2931b2',
            promoId: 'b4170868-cef0-424f-8eb9-be0622e8e8e3',
        },
        3: {
            name: 'My Clone Army',
            appToken: '74ee0b5b-775e-4bee-974f-63e7f4d5bacb',
            promoId: 'fe693b26-b342-4159-8808-15e3ff7f8767',
        },
        4: {
            name: 'Train Miner',
            appToken: '82647f43-3f87-402d-88dd-09a90025313f',
            promoId: 'c4480ac7-e178-4973-8061-9ed5b2e17954',
        },
        5: {
            name: 'MergeAway',
            appToken: '8d1cc2ad-e097-4b86-90ef-7a27e19fb833',
            promoId: 'dc128d28-c45b-411c-98ff-ac7726fbaea4',
        },
        6: {
            name: 'Twerk Race 3D',
            appToken: '61308365-9d16-4040-8bb0-2f4a4c69074c',
            promoId: '61308365-9d16-4040-8bb0-2f4a4c69074c'
        }
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
        previousKeysList: document.getElementById('previousKeysList'),
        darkModeToggle: document.getElementById('darkModeToggle'),
        gameSelectLabel: document.getElementById('gameSelectLabel')
    };

    const initializeLocalStorage = () => {
        const now = new Date().toISOString().split('T')[0];
        Object.values(games).forEach(game => {
            const storageKey = `keys_generated_${game.name}`;
            const storedData = JSON.parse(localStorage.getItem(storageKey));
            if (!storedData || storedData.date !== now) {
                localStorage.setItem(storageKey, JSON.stringify({ date: now, count: 0, keys: [] }));
            }
        });
    };

    const generateClientId = () => {
        return `${Date.now()}-${crypto.randomUUID()}`;
    };

    const login = async (clientId, appToken) => {
        try {
            const response = await fetch('https://api.gamepromo.io/promo/login-client', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ appToken, clientId, clientOrigin: 'deviceid' })
            });

            if (!response.ok) throw new Error('Login failed');

            const data = await response.json();
            return data.clientToken;
        } catch (error) {
            console.error('Login error:', error);
            throw error;
        }
    };

    const emulateProgress = async (clientToken, promoId) => {
        try {
            const response = await fetch('https://api.gamepromo.io/promo/register-event', {
                method: 'POST',
                headers: {
                    'Authorization': `Bearer ${clientToken}`,
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({
                    promoId,
                    eventId: crypto.randomUUID(),
                    eventOrigin: 'undefined'
                })
            });

            if (!response.ok) throw new Error('Progress emulation failed');

            const data = await response.json();
            return data.hasCode;
        } catch (error) {
            console.error('Progress emulation error:', error);
            return false;
        }
    };

    const generateKey = async (clientToken, promoId) => {
        try {
            const response = await fetch('https://api.gamepromo.io/promo/create-code', {
                method: 'POST',
                headers: {
                    'Authorization': `Bearer ${clientToken}`,
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({ promoId })
            });

            if (!response.ok) throw new Error('Key generation failed');

            const data = await response.json();
            return data.promoCode;
        } catch (error) {
            console.error('Key generation error:', error);
            throw error;
        }
    };

    const sleep = ms => new Promise(resolve => setTimeout(resolve, ms));

    const delayRandom = () => Math.random() / 3 + 1;

    const updateProgress = (progress, message) => {
        elements.progressBar.style.width = `${progress}%`;
        elements.progressText.innerText = `${progress}%`;
        elements.progressLog.innerText = message;
    };

    const generateKeyProcess = async (game) => {
        const clientId = generateClientId();
        let clientToken;
        try {
            clientToken = await login(clientId, game.appToken);
        } catch (error) {
            throw new Error(`Failed to login: ${error.message}`);
        }

        for (let i = 0; i < 11; i++) {
            await sleep(EVENTS_DELAY * delayRandom());
            const hasCode = await emulateProgress(clientToken, game.promoId);
            if (hasCode) break;
        }

        try {
            return await generateKey(clientToken, game.promoId);
        } catch (error) {
            throw new Error(`Failed to generate key: ${error.message}`);
        }
    };

    const updateUI = (isGenerating) => {
        elements.progressContainer.classList.toggle('hidden', !isGenerating);
        elements.keyContainer.classList.toggle('hidden', isGenerating);
        elements.generatedKeysTitle.classList.toggle('hidden', isGenerating);
        elements.keyCountSelect.classList.toggle('hidden', isGenerating);
        elements.gameSelect.classList.toggle('hidden', isGenerating);
        elements.startBtn.classList.toggle('hidden', isGenerating);
        elements.copyAllBtn.classList.toggle('hidden', isGenerating);
        elements.startBtn.disabled = isGenerating;
        elements.gameSelectLabel.classList.toggle('hidden', isGenerating);
    };

    const copyToClipboard = (text) => {
        navigator.clipboard.writeText(text).then(() => {
            elements.copyStatus.innerText = 'Copied!';
            elements.copyStatus.classList.remove('hidden');
            setTimeout(() => {
                elements.copyStatus.classList.add('hidden');
            }, 2000);
        }).catch(err => {
            console.error('Could not copy text: ', err);
        });
    };

    const displayKeys = (keys) => {
        elements.keysList.innerHTML = keys.map(key => 
            `<div class="key-item">
                <input type="text" value="${key}" readonly>
                <button class="copyKeyBtn" data-key="${key}">Copy Key</button>
            </div>`
        ).join('');

        if (keys.length > 1) {
            elements.copyAllBtn.classList.remove('hidden');
        }

        document.querySelectorAll('.copyKeyBtn').forEach(button => {
            button.addEventListener('click', (event) => {
                const key = event.target.getAttribute('data-key');
                copyToClipboard(key);
            });
        });
    };

    const handleStartButtonClick = async () => {
        const gameChoice = parseInt(elements.gameSelect.value);
        const keyCount = parseInt(elements.keyCountSelect.value);
        const game = games[gameChoice];

        const storageKey = `keys_generated_${game.name}`;
        const storedData = JSON.parse(localStorage.getItem(storageKey));

        if (storedData.count + keyCount > MAX_KEYS_PER_GAME_PER_DAY) {
            alert(`You can generate only ${MAX_KEYS_PER_GAME_PER_DAY - storedData.count} more keys for ${game.name} today.`);
            elements.previousKeysList.innerHTML = storedData.keys.map(key =>
                `<div class="key-item">
                    <input type="text" value="${key}" readonly>
                </div>`
            ).join('');
            elements.previousKeysContainer.classList.remove('hidden');
            return;
        }

        elements.keyCountLabel.innerText = `Number of keys: ${keyCount}`;
        updateUI(true);
        updateProgress(0, 'Starting... \nPlease wait. It may take up to 1 min to Login');

        try {
            const keys = await Promise.all(Array.from({ length: keyCount }, () => generateKeyProcess(game)));
            displayKeys(keys.filter(Boolean));

            storedData.count += keys.filter(Boolean).length;
            storedData.keys.push(...keys.filter(Boolean));
            localStorage.setItem(storageKey, JSON.stringify(storedData));
        } catch (error) {
            alert(error.message);
        } finally {
            updateUI(false);
        }
    };

    elements.startBtn.addEventListener('click', handleStartButtonClick);

    elements.copyAllBtn.addEventListener('click', () => {
        const allKeys = Array.from(document.querySelectorAll('.key-item input')).map(input => input.value).join('\n');
        copyToClipboard(allKeys);
    });

    // Dark mode toggle functionality
    elements.darkModeToggle.addEventListener('click', () => {
        document.body.classList.toggle('dark-mode');
        localStorage.setItem('darkMode', document.body.classList.contains('dark-mode'));
    });

    // Check for saved dark mode preference
    if (localStorage.getItem('darkMode') === 'true') {
        document.body.classList.add('dark-mode');
    }

    initializeLocalStorage();
});
