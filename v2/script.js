document.addEventListener('DOMContentLoaded', () => {
    const EVENTS_DELAY = 21000;
    const MAX_KEYS_PER_GAME_PER_DAY = 10000;

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
        gameSelectLabel: document.getElementById('gameSelectLabel'),
        generateMoreBtn: document.getElementById('generateMoreBtn'),
        downloadQRBtn: document.getElementById('downloadQRBtn'),
        statsContainer: document.getElementById('statsContainer'),
        statsContent: document.getElementById('statsContent'),
        copyPreviousKeysBtn: document.getElementById('copyPreviousKeysBtn'),
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
        const timestamp = Date.now();
        const randomNumbers = Array.from({ length: 19 }, () => Math.floor(Math.random() * 10)).join('');
        return `${timestamp}-${randomNumbers}`;
    };

    const login = async (clientId, appToken) => {
        const response = await fetch('https://api.gamepromo.io/promo/login-client', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({
                appToken,
                clientId,
                clientOrigin: 'deviceid'
            })
        });

        if (!response.ok) {
            throw new Error('Failed to login');
        }

        const data = await response.json();
        return data.clientToken;
    };

    const emulateProgress = async (clientToken, promoId) => {
        const response = await fetch('https://api.gamepromo.io/promo/register-event', {
            method: 'POST',
            headers: {
                'Authorization': `Bearer ${clientToken}`,
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({
                promoId,
                eventId: generateUUID(),
                eventOrigin: 'undefined'
            })
        });

        if (!response.ok) {
            return false;
        }

        const data = await response.json();
        return data.hasCode;
    };

    const generateKey = async (clientToken, promoId) => {
        const response = await fetch('https://api.gamepromo.io/promo/create-code', {
            method: 'POST',
            headers: {
                'Authorization': `Bearer ${clientToken}`,
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({
                promoId
            })
        });

        if (!response.ok) {
            throw new Error('Failed to generate key');
        }

        const data = await response.json();
        return data.promoCode;
    };

    const generateUUID = () => {
        return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, function (c) {
            const r = Math.random() * 16 | 0, v = c === 'x' ? r : (r & 0x3 | 0x8);
            return v.toString(16);
        });
    };

    const sleep = ms => new Promise(resolve => setTimeout(resolve, ms));

    const delayRandom = () => Math.random() / 3 + 1;

    let progress = 0;
    const updateProgress = (increment, message) => {
        progress += increment;
        elements.progressBar.style.width = `${progress}%`;
        elements.progressText.innerText = `${progress}%`;
        elements.progressLog.innerText = message;
    };

    const generateKeyProcess = async (game, keyCount) => {
        const clientId = generateClientId();
        let clientToken;
        try {
            clientToken = await login(clientId, game.appToken);
        } catch (error) {
            alert(`Failed to login: ${error.message}`);
            elements.startBtn.disabled = false;
            return null;
        }

        for (let i = 0; i < 11; i++) {
            await sleep(EVENTS_DELAY * delayRandom());
            const hasCode = await emulateProgress(clientToken, game.promoId);
            updateProgress(7 / keyCount, 'Emulating progress...');
            if (hasCode) {
                break;
            }
        }

        try {
            const key = await generateKey(clientToken, game.promoId);
            updateProgress(30 / keyCount, 'Generating key...');
            return key;
        } catch (error) {
            alert(`Failed to generate key: ${error.message}`);
            return null;
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
        elements.downloadQRBtn.classList.toggle('hidden', isGenerating);
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
                <div class="qr-code" id="qr-${key}"></div>
            </div>`
        ).join('');

        keys.forEach(key => {
            const qr = qrcode(0, 'L');
            qr.addData(key);
            qr.make();
            document.getElementById(`qr-${key}`).innerHTML = qr.createSvgTag({ cellSize: 4, margin: 4 });
        });

        if (keys.length > 1) {
            elements.copyAllBtn.classList.remove('hidden');
            elements.downloadQRBtn.classList.remove('hidden');
        }

        document.querySelectorAll('.copyKeyBtn').forEach(button => {
            button.addEventListener('click', (event) => {
                const key = event.target.getAttribute('data-key');
                copyToClipboard(key);
            });
        });
    };

    const downloadQRCodes = () => {
        const zip = new JSZip();
        const keys = Array.from(document.querySelectorAll('.key-item input')).map(input => input.value);
        
        keys.forEach(key => {
            const qrSvg = document.getElementById(`qr-${key}`).innerHTML;
            zip.file(`${key}.svg`, qrSvg);
        });
        
        zip.generateAsync({type:"blob"}).then(function(content) {
            const link = document.createElement('a');
            link.href = URL.createObjectURL(content);
            link.download = 'qr_codes.zip';
            link.click();
        });
    };

    const updateStats = () => {
        const stats = Object.values(games).map(game => {
            const storageKey = `keys_generated_${game.name}`;
            const storedData = JSON.parse(localStorage.getItem(storageKey));
            return {
                name: game.name,
                count: storedData ? storedData.count : 0
            };
        });

        elements.statsContent.innerHTML = `
            <table>
                <tr>
                    <th>Game</th>
                    <th>Keys Generated Today</th>
                </tr>
                ${stats.map(stat => `
                    <tr>
                        <td>${stat.name}</td>
                        <td>${stat.count}</td>
                    </tr>
                `).join('')}
            </table>
        `;

        elements.statsContainer.classList.remove('hidden');
    };

    const displayPreviousKeys = (keys) => {
        elements.previousKeysList.innerHTML = keys.map(key =>
            `<div class="key-item">
                <input type="text" value="${key}" readonly>
                <button class="copyKeyBtn" data-key="${key}">Copy</button>
            </div>`
        ).join('');

        elements.previousKeysContainer.classList.remove('hidden');

        document.querySelectorAll('#previousKeysList .copyKeyBtn').forEach(button => {
            button.addEventListener('click', (event) => {
                const key = event.target.getAttribute('data-key');
                copyToClipboard(key);
            });
        });
    };

    elements.startBtn.addEventListener('click', async () => {
        const gameChoice = parseInt(elements.gameSelect.value);
        const keyCount = parseInt(elements.keyCountSelect.value);
        const game = games[gameChoice];

        const storageKey = `keys_generated_${game.name}`;
        const storedData = JSON.parse(localStorage.getItem(storageKey));

        if (storedData.count + keyCount > MAX_KEYS_PER_GAME_PER_DAY) {
            alert(`You can generate only ${MAX_KEYS_PER_GAME_PER_DAY - storedData.count} more keys for ${game.name} today.`);
            displayPreviousKeys(storedData.keys);
            return;
        }

        elements.keyCountLabel.innerText = `Number of keys: ${keyCount}`;

        progress = 0;
        updateProgress(0, 'Starting... \nPlease wait It may take up to 1 min to Login');
        updateUI(true);

        const keys = await Promise.all(Array.from({ length: keyCount }, () => generateKeyProcess(game, keyCount)));

        if (keys.length > 0) {
            displayKeys(keys.filter(key => key));
        }

        storedData.count += keys.filter(key => key).length;
        storedData.keys.push(...keys.filter(key => key));
        localStorage.setItem(storageKey, JSON.stringify(storedData));

        updateUI(false);
        updateStats();
    });

    elements.copyAllBtn.addEventListener('click', () => {
        const allKeys = Array.from(document.querySelectorAll('.key-item input')).map(input => input.value).join('\n');
        copyToClipboard(allKeys);
    });

    elements.downloadQRBtn.addEventListener('click', downloadQRCodes);

    elements.generateMoreBtn.addEventListener('click', () => {
        elements.keyContainer.classList.add('hidden');
        elements.formContainer.classList.remove('hidden');
        elements.startBtn.classList.remove('hidden');
    });

    elements.darkModeToggle.addEventListener('click', () => {
        document.body.classList.toggle('dark-mode');
        localStorage.setItem('darkMode', document.body.classList.contains('dark-mode'));
    });

    elements.copyPreviousKeysBtn.addEventListener('click', () => {
        const gameChoice = parseInt(elements.gameSelect.value);
        const game = games[gameChoice];
        const storageKey = `keys_generated_${game.name}`;
        const storedData = JSON.parse(localStorage.getItem(storageKey));

        if (storedData && storedData.keys.length > 0) {
            const allKeys = storedData.keys.join('\n');
            copyToClipboard(allKeys);
        } else {
            alert('No previous keys to copy.');
        }
    });

    if (localStorage.getItem('darkMode') === 'true') {
        document.body.classList.add('dark-mode');
    }

    initializeLocalStorage();
    updateStats();
});
