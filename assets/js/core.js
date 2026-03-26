const OmniCore = {
    init() {
        this.renderHeader();
        this.renderFooter();
        this.renderSidebar();
        this.setupEvents();
        this.initLogic();
        this.registerSW();
        OmniSEO.init();
        
        // Elite Splash Screen Logic
        setTimeout(() => {
            const loader = document.getElementById('loading-overlay');
            if (loader) loader.classList.add('fade-out');
        }, 1800);

        console.log('OmniToolbox Elite Loaded');
    },

    registerSW() {
        if ('serviceWorker' in navigator) {
            navigator.serviceWorker.register('/sw.js')
                .then(() => console.log('OmniServiceWorker Active 🌐'))
                .catch(err => console.error('SW Registration Failed:', err));
        }
    },

    initLogic() {
        // Track page visit
        const path = window.location.pathname;
        if (path.includes('/tools/') && !path.endsWith('index.html')) {
            const title = document.title.split('|')[0].trim();
            OmniStorage.addHistory(title, path);
        }
        this.renderBreadcrumbs();
    },

    renderBreadcrumbs() {
        const container = document.getElementById('omni-breadcrumbs');
        if (!container) return;
        
        const path = window.location.pathname;
        if (path === '/' || path.endsWith('index.html')) {
            container.parentElement.parentElement.style.display = 'none';
            return;
        }

        const parts = path.split('/').filter(p => p && !p.endsWith('.html'));
        let breadcrumbHTML = `<a href="/index.html">Home</a>`;
        
        let currentPath = '';
        parts.forEach((part, index) => {
            currentPath += `/${part}`;
            const label = part.charAt(0).toUpperCase() + part.slice(1);
            breadcrumbHTML += ` <span class="sep">/</span> <a href="${currentPath}/index.html">${label}</a>`;
        });

        const pageTitle = document.title.split('|')[0].trim();
        breadcrumbHTML += ` <span class="sep">/</span> <span class="current">${pageTitle}</span>`;
        
        container.innerHTML = breadcrumbHTML;
    },

    renderHeader() {
        const header = document.querySelector('header');
        if (!header) return;
        header.innerHTML = `
            <div class="site-header">
                <div class="container flex-between" style="display:flex; justify-content: space-between; align-items: center;">
                    <a href="/index.html" class="logo-text">OmniToolbox</a>
                    <button class="nav-toggle" id="menuToggle">☰</button>
                    <nav class="desktop-nav">
                        <ul style="display:flex; gap: 2rem; list-style:none;">
                            <li><a href="/index.html" style="text-decoration:none; color:var(--text); font-weight:500;">All Tools</a></li>
                            <li><a href="/tools/dev/index.html" style="text-decoration:none; color:var(--text-dim);">Developer</a></li>
                            <li><a href="/tools/seo/index.html" style="text-decoration:none; color:var(--text-dim);">SEO</a></li>
                            <li><a href="/tools/math/index.html" style="text-decoration:none; color:var(--text-dim);">Math</a></li>
                            <li><a href="/tools/text/index.html" style="text-decoration:none; color:var(--text-dim);">Text</a></li>
                        </ul>
                    </nav>
                </div>
            </div>
            <div class="breadcrumbs-container">
                <div class="container">
                    <nav class="breadcrumbs" id="omni-breadcrumbs"></nav>
                </div>
            </div>
            <div id="mobileMenu" class="card" style="display:none; position:fixed; top:70px; left:1.5rem; right:1.5rem; z-index:900; background:var(--glass-heavy);">
                <ul style="list-style:none; display:flex; flex-direction:column; gap:1.5rem; padding: 1rem;">
                    <li><a href="/index.html" style="text-decoration:none; color:var(--text); font-size:1.2rem;">All Tools 🛠️</a></li>
                    <li><a href="/tools/dev/index.html" style="text-decoration:none; color:var(--text); font-size:1.2rem;">Developer Tools 👨‍💻</a></li>
                    <li><a href="/tools/seo/index.html" style="text-decoration:none; color:var(--text); font-size:1.2rem;">SEO Tools 📈</a></li>
                    <li><a href="/tools/math/index.html" style="text-decoration:none; color:var(--text); font-size:1.2rem;">Math Tools 🔢</a></li>
                    <li><a href="/tools/text/index.html" style="text-decoration:none; color:var(--text); font-size:1.2rem;">Text Tools ✍️</a></li>
                </ul>
            </div>
        `;
    },

    renderFooter() {
        const footer = document.querySelector('footer');
        if (!footer) return;
        footer.innerHTML = `
            <div class="container" style="padding: 5rem 0; border-top: 1px solid var(--border); margin-top: 6rem; text-align: center;">
                <h2 class="logo-text" style="font-size: 2rem; margin-bottom: 1rem;">OmniToolbox</h2>
                <p style="color:var(--text-dim); max-width:600px; margin: 0 auto 2rem;">Every tool you see here is processed entirely in your browser. We never see your data, ensuring ultimate privacy and performance.</p>
                <div style="display:flex; justify-content:center; gap:1.5rem; margin-bottom:1.5rem;">
                    <div id="api-status" style="font-size:0.8rem; color:var(--text-dim); display:flex; align-items:center; gap:0.5rem;">
                        <span style="width:8px; height:8px; background:#4ade80; border-radius:50%; display:inline-block;"></span> 
                        Vern API: <span id="status-text">Checking...</span>
                    </div>
                </div>
                <div style="display:flex; justify-content:center; gap:1rem; margin-bottom:2rem; flex-wrap:wrap;">
                    <button class="pill" onclick="OmniStorage.clearAll()">Reset Settings</button>
                    <button class="pill" onclick="OmniData.export()">Export Data 💾</button>
                    <label class="pill" style="cursor:pointer;">Import Data 📂 <input type="file" style="display:none;" onchange="OmniData.import(this)"></label>
                    <button class="pill" onclick="location.href='mailto:support@omnitoolbox.com'">Support</button>
                </div>
                <p style="color:var(--text-dim); font-size:0.9rem;">&copy; 2026 OmniToolbox. Built with precision.</p>
            </div>
        `;
        this.checkAPIStatus();
    },

    async checkAPIStatus() {
        const text = document.getElementById('status-text');
        if (!text) return;
        try {
            const start = Date.now();
            await fetch('https://vern-rest-api.vercel.app/api/chatgpt4?prompt=ping');
            const latency = Date.now() - start;
            text.innerHTML = `Online (${latency}ms)`;
            text.style.color = '#4ade80';
        } catch (e) {
            text.innerHTML = 'Offline';
            text.style.color = '#f87171';
        }
    },

    renderSidebar() {
        const sidebar = document.querySelector('aside');
        if (!sidebar) return;
        
        const history = OmniStorage.getHistory();
        const historyHTML = history.length > 0 ? `
            <div class="card" style="margin-bottom: 2rem; background: var(--glass-heavy);">
                <h3 style="margin-bottom: 1.2rem; font-size: 1rem; color:var(--primary);">🕒 Recent Tools</h3>
                <ul style="list-style:none; display:flex; flex-direction:column; gap:0.8rem;">
                    ${history.map(item => `<li><a href="${item.path}" style="color:var(--text-dim); text-decoration:none; font-size:0.9rem; transition:0.3s;" onmouseover="this.style.color='#fff'" onmouseout="this.style.color='var(--text-dim)'">${item.title}</a></li>`).join('')}
                </ul>
            </div>
        ` : '';

        sidebar.innerHTML = `
            ${historyHTML}
            <div class="card" style="margin-bottom: 2rem; background: var(--glass-heavy);">
                <h3 style="margin-bottom: 1.5rem; font-size: 1.1rem; color:var(--primary);">🚀 Quick Links</h3>
                <ul style="list-style:none; display:flex; flex-direction:column; gap:1rem;">
                    <li><a href="/tools/text/case-converter.html" style="color:var(--text); text-decoration:none; display:flex; align-items:center; gap:0.5rem;"><span style="color:var(--primary);">#</span> Case Converter 🔠</a></li>
                    <li><a href="/tools/text/word-counter.html" style="color:var(--text); text-decoration:none; display:flex; align-items:center; gap:0.5rem;"><span style="color:var(--primary);">#</span> Word Counter 🔢</a></li>
                    <li><a href="/tools/math/age-calculator.html" style="color:var(--text); text-decoration:none; display:flex; align-items:center; gap:0.5rem;"><span style="color:var(--primary);">#</span> Age Calculator 📅</a></li>
                    <li><a href="/tools/dev/password-gen.html" style="color:var(--text); text-decoration:none; display:flex; align-items:center; gap:0.5rem;"><span style="color:var(--primary);">#</span> Password Gen 🔑</a></li>
                </ul>
            </div>
            <div class="ad-placeholder" style="height:350px; border-style: solid;">
                 <div style="text-align:center;">
                    <div style="font-size:1.5rem; opacity:0.1; margin-bottom:1rem;">AD SLOT</div>
                    <div style="font-size:0.7rem;">Sidebar Advertisement</div>
                 </div>
            </div>
        `;
    },

    setupEvents() {
        const toggle = document.getElementById('menuToggle');
        const menu = document.getElementById('mobileMenu');
        if(toggle && menu) {
            toggle.onclick = (e) => {
                e.stopPropagation();
                const isHidden = menu.style.display === 'none';
                menu.style.display = isHidden ? 'block' : 'none';
                toggle.textContent = isHidden ? '✕' : '☰';
            };
            document.addEventListener('click', (e) => {
                if(!menu.contains(e.target) && e.target !== toggle) {
                    menu.style.display = 'none';
                    toggle.textContent = '☰';
                }
            });
        }
    }
};

const OmniStorage = {
    addHistory(title, path) {
        let history = this.getHistory();
        history = history.filter(h => h.path !== path);
        history.unshift({ title, path });
        if (history.length > 5) history.pop();
        localStorage.setItem('omni_history', JSON.stringify(history));
    },
    getHistory() {
        return JSON.parse(localStorage.getItem('omni_history') || '[]');
    },
    toggleFavorite(id) {
        let favs = JSON.parse(localStorage.getItem('omni_favs') || '[]');
        if (favs.includes(id)) favs = favs.filter(f => f !== id);
        else favs.push(id);
        localStorage.setItem('omni_favs', JSON.stringify(favs));
    },
    clearAll() {
        localStorage.clear();
        location.reload();
    }
};

const OmniAPI = {
    async fetch(url, options = {}) {
        try {
            const response = await fetch(url, options);
            if (!response.ok) throw new Error(`API Error: ${response.status}`);
            return await response.json();
        } catch (e) {
            console.error('OmniAPI Failure:', e);
            throw e;
        }
    }
};

const OmniUI = {
    showToast(message, type = 'info') {
        const toast = document.createElement('div');
        toast.className = `toast ${type}`;
        toast.innerHTML = message;
        document.body.appendChild(toast);
        setTimeout(() => toast.classList.add('show'), 10);
        setTimeout(() => {
            toast.classList.remove('show');
            setTimeout(() => toast.remove(), 300);
        }, 3000);
    },

    async copyToClipboard(text, btn) {
        try {
            await navigator.clipboard.writeText(text);
            const original = btn.innerHTML;
            btn.innerHTML = 'Copied! ✅';
            btn.classList.add('btn-success');
            this.showToast('Copied to clipboard!');
            setTimeout(() => {
                btn.innerHTML = original;
                btn.classList.remove('btn-success');
            }, 2000);
        } catch (err) {
            this.showToast('Failed to copy.', 'error');
        }
    },

    randomTool() {
        const tools = document.querySelectorAll('.tool-link');
        if (tools.length === 0) return;
        const random = tools[Math.floor(Math.random() * tools.length)];
        random.style.outline = '2px solid var(--primary)';
        random.scrollIntoView({ behavior: 'smooth', block: 'center' });
        this.showToast(`Try this: ${random.textContent.trim()}! ✨`);
        setTimeout(() => random.style.outline = 'none', 2000);
    }
};

const OmniVoice = {
    start(targetId) {
        const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
        if (!SpeechRecognition) {
            OmniUI.showToast('Voice search not supported in this browser.', 'error');
            return;
        }
        const recognition = new SpeechRecognition();
        recognition.onstart = () => OmniUI.showToast('Listening... 🎤');
        recognition.onresult = (event) => {
            const transcript = event.results[0][0].transcript;
            const input = document.getElementById(targetId);
            if (input) {
                input.value = transcript;
                input.dispatchEvent(new Event('input'));
                input.dispatchEvent(new Event('keyup'));
            }
        };
        recognition.start();
    }
};

const OmniData = {
    export() {
        const data = {
            favs: JSON.parse(localStorage.getItem('omni_favs') || '[]'),
            history: JSON.parse(localStorage.getItem('omni_history') || '[]')
        };
        const blob = new Blob([JSON.stringify(data)], { type: 'application/json' });
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = `omnitoolbox-profile-${new Date().toISOString().split('T')[0]}.json`;
        a.click();
        OmniUI.showToast('Profile exported successfully! 💾');
    },
    import(input) {
        const file = input.files[0];
        if (!file) return;
        const reader = new FileReader();
        reader.onload = (e) => {
            try {
                const data = JSON.parse(e.target.result);
                if (data.favs) localStorage.setItem('omni_favs', JSON.stringify(data.favs));
                if (data.history) localStorage.setItem('omni_history', JSON.stringify(data.history));
                OmniUI.showToast('Profile imported! Reloading...', 'success');
                setTimeout(() => location.reload(), 1500);
            } catch (err) {
                OmniUI.showToast('Invalid profile file.', 'error');
            }
        };
        reader.readAsText(file);
    }
};

const OmniSEO = {
    init() {
        if (!document.querySelector('meta[name="description"]')) {
            const meta = document.createElement('meta');
            meta.name = "description";
            meta.content = document.title + " - Professional browser-based utility by OmniToolbox.";
            document.head.appendChild(meta);
        }
        // Favicon Injection
        if (!document.querySelector('link[rel="icon"]')) {
            const favicon = document.createElement('link');
            favicon.rel = 'icon';
            favicon.href = 'https://cdn-icons-png.flaticon.com/512/2092/2092040.png';
            document.head.appendChild(favicon);
        }
        // Apple Touch Icon
        if (!document.querySelector('link[rel="apple-touch-icon"]')) {
            const appleIcon = document.createElement('link');
            appleIcon.rel = 'apple-touch-icon';
            appleIcon.href = 'https://cdn-icons-png.flaticon.com/512/2092/2092040.png';
            document.head.appendChild(appleIcon);
        }
        // Inject JSON-LD
        const script = document.createElement('script');
        script.type = 'application/ld+json';
        script.text = JSON.stringify({
            "@context": "https://schema.org",
            "@type": "SoftwareApplication",
            "name": document.title.split('|')[0].trim(),
            "applicationCategory": "MultimediaApplication",
            "operatingSystem": "Web"
        });
        document.head.appendChild(script);
    }
};

document.addEventListener('DOMContentLoaded', () => OmniCore.init());
