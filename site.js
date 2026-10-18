/* site.js - shared behavior for every CarbonCount page.

   What this file adds to each page:
   - Mobile navigation (hamburger button) and a "skip to content" link
   - Dark mode toggle and a site search box in the nav bar
   - Accessibility panel: text size, high contrast, underlined links,
     reduce motion (stops the cloud animation), readable font, text spacing,
     and Read Aloud (text-to-speech) controls
   - A share button in the footer and a back-to-top button
   - A Help Chat that answers common questions about the app

   All preferences are saved in this browser only (localStorage).
   The Help Chat is a keyword-matching FAQ helper that runs entirely on this
   page. It does not use AI and does not send anything to a server. */

(function () {
    'use strict';

    /* ---------- Storage helpers (never break the page if storage is blocked) ---------- */
    function load(key, fallback) {
        try {
            var v = localStorage.getItem(key);
            return v === null ? fallback : v;
        } catch (e) { return fallback; }
    }
    function save(key, value) {
        try { localStorage.setItem(key, value); } catch (e) { /* ignore */ }
    }

    var body = document.body;
    var navToggle = document.getElementById('nav-toggle');
    var navMenu = document.getElementById('nav-menu');
    var main = document.querySelector('main');

    /* ---------- Mobile navigation ---------- */
    if (navToggle && navMenu) {
        navToggle.addEventListener('click', function () {
            var isOpen = navMenu.classList.toggle('open');
            navToggle.setAttribute('aria-expanded', String(isOpen));
        });
    }

    /* ---------- Skip link for keyboard and screen-reader users ---------- */
    if (main) {
        if (!main.id) main.id = 'main-content';
        main.setAttribute('tabindex', '-1');
        var skip = document.createElement('a');
        skip.className = 'skip-link';
        skip.href = '#' + main.id;
        skip.textContent = 'Skip to main content';
        body.insertBefore(skip, body.firstChild);
    }

    /* ---------- Dark mode ---------- */
    function applyTheme(isDark) {
        body.classList.toggle('dark', isDark);
        var btn = document.getElementById('theme-btn');
        if (btn) {
            btn.textContent = isDark ? '☀️' : '🌙';
            btn.setAttribute('aria-label', isDark ? 'Switch to light mode' : 'Switch to dark mode');
            btn.setAttribute('aria-pressed', String(isDark));
        }
    }
    if (navMenu) {
        var themeBtn = document.createElement('button');
        themeBtn.id = 'theme-btn';
        themeBtn.type = 'button';
        themeBtn.className = 'nav-icon-btn';
        themeBtn.addEventListener('click', function () {
            var next = !body.classList.contains('dark');
            save('cc-theme', next ? 'dark' : 'light');
            applyTheme(next);
        });
        navMenu.appendChild(themeBtn);
    }

    /* ---------- Site search (jumps to the matching page) ---------- */
    var SITE_PAGES = [
        { title: 'Home', url: 'index.html', desc: 'Overview, travel mode comparison, UN goals', words: 'home overview start sdg goals compare' },
        { title: 'About', url: 'about.html', desc: 'What the app does, the problem it solves, FAQ', words: 'about problem faq privacy accessibility climate data how numbers work' },
        { title: 'Profile', url: 'profile.html', desc: 'Your bio, accessibility needs, preferences, badges', words: 'profile bio needs preferences badges points level streak settings' },
        { title: 'Daily Log', url: 'log.html', desc: 'Log trips, weekly trend, goal, barrier report, CSV export', words: 'log trips footprint carbon co2 weekly goal streak barrier report export csv voice' },
        { title: 'Route Planner', url: 'route.html', desc: 'Compare driving, cycling, walking and transit routes', words: 'route planner map directions navigation qr drive bike walk transit' }
    ];

    if (navMenu) {
        var wrap = document.createElement('div');
        wrap.className = 'search-wrap';
        var input = document.createElement('input');
        input.type = 'search';
        input.id = 'search-input';
        input.placeholder = 'Search site…';
        input.setAttribute('aria-label', 'Search this site');
        var results = document.createElement('div');
        results.id = 'search-results';
        results.hidden = true;
        wrap.appendChild(input);
        wrap.appendChild(results);
        navMenu.appendChild(wrap);

        input.addEventListener('input', function () {
            var q = input.value.trim().toLowerCase();
            results.innerHTML = '';
            if (!q) { results.hidden = true; return; }
            var hits = SITE_PAGES.filter(function (p) {
                return (p.title + ' ' + p.desc + ' ' + p.words).toLowerCase().indexOf(q) !== -1;
            });
            if (!hits.length) {
                var none = document.createElement('span');
                none.className = 'search-desc';
                none.style.padding = '8px 12px';
                none.textContent = 'No matches. Try "log", "route", or "privacy".';
                results.appendChild(none);
            }
            hits.forEach(function (p) {
                var a = document.createElement('a');
                a.href = p.url;
                a.textContent = p.title;
                var d = document.createElement('span');
                d.className = 'search-desc';
                d.textContent = p.desc;
                a.appendChild(d);
                results.appendChild(a);
            });
            results.hidden = false;
        });
        document.addEventListener('click', function (e) {
            if (!wrap.contains(e.target)) results.hidden = true;
        });
    }

    /* ---------- Footer: share button ---------- */
    var footer = document.querySelector('footer');
    if (footer) {
        var extras = document.createElement('div');
        extras.className = 'footer-extras';
        var shareBtn = document.createElement('button');
        shareBtn.id = 'share-btn';
        shareBtn.type = 'button';
        shareBtn.textContent = '🔗 Share CarbonCount';
        shareBtn.addEventListener('click', function () {
            var data = { title: document.title, text: 'Check out CarbonCount, a travel carbon tracker that takes accessibility seriously.', url: location.href };
            if (navigator.share) {
                navigator.share(data).catch(function () { /* user cancelled */ });
            } else if (navigator.clipboard && navigator.clipboard.writeText) {
                navigator.clipboard.writeText(location.href).then(function () {
                    shareBtn.textContent = '✅ Link copied';
                    setTimeout(function () { shareBtn.textContent = '🔗 Share CarbonCount'; }, 2000);
                });
            }
        });
        extras.appendChild(shareBtn);
        footer.insertBefore(extras, footer.firstChild);
    }

    /* ---------- Back-to-top button ---------- */
    var topBtn = document.createElement('button');
    topBtn.id = 'back-top';
    topBtn.type = 'button';
    topBtn.setAttribute('aria-label', 'Back to top');
    topBtn.textContent = '↑';
    topBtn.hidden = true;
    topBtn.addEventListener('click', function () {
        var reduce = body.classList.contains('reduce-motion');
        window.scrollTo({ top: 0, behavior: reduce ? 'auto' : 'smooth' });
    });
    body.appendChild(topBtn);
    window.addEventListener('scroll', function () {
        topBtn.hidden = window.scrollY < 400;
    });

    /* ---------- Accessibility panel ---------- */
    var fab = document.createElement('button');
    fab.id = 'a11y-fab';
    fab.type = 'button';
    fab.setAttribute('aria-label', 'Open accessibility settings');
    fab.setAttribute('aria-expanded', 'false');
    fab.setAttribute('aria-controls', 'a11y-panel');
    fab.textContent = '♿';

    var panel = document.createElement('div');
    panel.id = 'a11y-panel';
    panel.hidden = true;
    panel.setAttribute('role', 'dialog');
    panel.setAttribute('aria-label', 'Accessibility settings');
    var ttsSupported = 'speechSynthesis' in window && 'SpeechSynthesisUtterance' in window;
    panel.innerHTML =
        '<h4>Accessibility</h4>' +
        (ttsSupported
            ? '<div class="a11y-row"><span>Read aloud</span>' +
                '<div class="a11y-btn-group tts-grid">' +
                '<button type="button" id="tts-play">▶ Page</button>' +
                '<button type="button" id="tts-selection">Selection</button>' +
                '<button type="button" id="tts-pause">⏸ Pause</button>' +
                '<button type="button" id="tts-stop">■ Stop</button>' +
                '</div>' +
                '<label for="tts-rate" style="margin-top:8px;font-size:0.82rem;">Speed</label>' +
                '<select id="tts-rate">' +
                '<option value="0.8">Slower</option>' +
                '<option value="1" selected>Normal</option>' +
                '<option value="1.25">Faster</option>' +
                '</select>' +
                '<p id="tts-status" role="status" aria-live="polite"></p></div>'
            : '<div class="a11y-row"><span>Read aloud is not supported in this browser.</span></div>') +
        '<div class="a11y-row"><span>Text size</span>' +
        '<div class="a11y-btn-group">' +
        '<button type="button" data-font="md">A</button>' +
        '<button type="button" data-font="lg">A+</button>' +
        '<button type="button" data-font="xl">A++</button>' +
        '</div></div>' +
        '<div class="a11y-row"><label><input type="checkbox" id="opt-contrast"> High contrast</label></div>' +
        '<div class="a11y-row"><label><input type="checkbox" id="opt-motion"> Reduce motion (stop clouds)</label></div>' +
        '<div class="a11y-row"><label><input type="checkbox" id="opt-underline"> Underline links</label></div>' +
        '<div class="a11y-row"><label><input type="checkbox" id="opt-readable"> Readable font</label></div>' +
        '<div class="a11y-row"><label><input type="checkbox" id="opt-spacing"> Extra text spacing</label></div>' +
        '<button type="button" id="a11y-reset" class="btn secondary">Reset to defaults</button>';

    body.appendChild(fab);
    body.appendChild(panel);

    function setPanel(open) {
        panel.hidden = !open;
        fab.setAttribute('aria-expanded', String(open));
    }
    fab.addEventListener('click', function () {
        setPanel(panel.hidden);
        if (!panel.hidden) setChat(false);
    });

    function applyFontSize(size) {
        body.classList.remove('font-lg', 'font-xl');
        if (size === 'lg') body.classList.add('font-lg');
        if (size === 'xl') body.classList.add('font-xl');
        var btns = panel.querySelectorAll('[data-font]');
        for (var i = 0; i < btns.length; i++) {
            btns[i].classList.toggle('active', btns[i].getAttribute('data-font') === size);
        }
    }

    // Each checkbox option: checkbox id, body class, and storage key.
    var OPTIONS = [
        { id: 'opt-contrast', cls: 'high-contrast', key: 'cc-contrast' },
        { id: 'opt-motion', cls: 'reduce-motion', key: 'cc-motion' },
        { id: 'opt-underline', cls: 'underline-links', key: 'cc-underline' },
        { id: 'opt-readable', cls: 'readable-font', key: 'cc-readable' },
        { id: 'opt-spacing', cls: 'text-spacing', key: 'cc-spacing' }
    ];
    function applyOption(opt, on) {
        body.classList.toggle(opt.cls, on);
        document.getElementById(opt.id).checked = on;
    }
    OPTIONS.forEach(function (opt) {
        document.getElementById(opt.id).addEventListener('change', function (e) {
            save(opt.key, e.target.checked ? 'on' : 'off');
            applyOption(opt, e.target.checked);
        });
    });

    panel.addEventListener('click', function (e) {
        var sizeBtn = e.target.closest('[data-font]');
        if (sizeBtn) {
            var size = sizeBtn.getAttribute('data-font');
            save('cc-font', size);
            applyFontSize(size);
        }
        if (e.target.id === 'a11y-reset') {
            save('cc-font', 'md');
            applyFontSize('md');
            OPTIONS.forEach(function (opt) {
                save(opt.key, 'off');
                applyOption(opt, false);
            });
            stopReading();
        }
    });

    /* ---------- Read Aloud (text-to-speech) ----------
     Speaks one short chunk at a time and starts the next chunk when the
     last one ends. Long single utterances get cut off in some browsers, and
     calling cancel() right before speak() can make Chrome go silent, so
     there is a short delay after cancel. */
    var ttsToken = 0;
    var ttsPaused = false;
    var ttsVoice = null;
    var lastSelection = '';

    function ttsStatus(msg) {
        var el = document.getElementById('tts-status');
        if (el) el.textContent = msg || '';
    }

    function chooseVoice() {
        if (!ttsSupported) return;
        var voices = speechSynthesis.getVoices() || [];
        var lang = (document.documentElement.lang || 'en').slice(0, 2).toLowerCase();
        var match = voices.filter(function (v) { return v.lang && v.lang.toLowerCase().indexOf(lang) === 0; });
        ttsVoice = match.filter(function (v) { return v.default; })[0] ||
               match.filter(function (v) { return v.localService; })[0] ||
               match[0] || null;
    }

    function currentRate() {
        var sel = document.getElementById('tts-rate');
        return sel ? parseFloat(sel.value) || 1 : 1;
    }

    function setPauseLabel() {
        var b = document.getElementById('tts-pause');
        if (b) b.textContent = ttsPaused ? '▶ Resume' : '⏸ Pause';
    }

    function stopReading() {
        if (!ttsSupported) return;
        ttsToken++;
        ttsPaused = false;
        setPauseLabel();
        speechSynthesis.cancel();
        ttsStatus('');
    }

    function splitForSpeech(text) {
        var sentences = text.replace(/\s+/g, ' ').trim().match(/[^.!?]+[.!?]+["')\]]*|[^.!?]+$/g) || [];
        var out = [];
        sentences.forEach(function (s) {
            s = s.trim();
            while (s.length > 200) {
                var cut = s.lastIndexOf(',', 200);
                if (cut < 80) cut = s.lastIndexOf(' ', 200);
                if (cut < 1) cut = 200;
                out.push(s.slice(0, cut + 1).trim());
                s = s.slice(cut + 1).trim();
            }
            if (s) out.push(s);
        });
        return out;
    }

    function speakNext(chunks, i, token, onFirstStart) {
        if (token !== ttsToken) return;
        if (i >= chunks.length) { ttsStatus('Finished reading.'); return; }
        var u = new SpeechSynthesisUtterance(chunks[i]);
        u.rate = currentRate();
        u.lang = document.documentElement.lang || 'en-US';
        if (ttsVoice) {
            try { u.voice = ttsVoice; u.lang = ttsVoice.lang; } catch (e) { /* fall back to the default voice */ }
        }
        u.onstart = function () {
            if (i === 0 && onFirstStart) onFirstStart();
            if (token === ttsToken) ttsStatus('Reading… (' + (i + 1) + ' of ' + chunks.length + ')');
        };
        u.onend = function () { speakNext(chunks, i + 1, token, onFirstStart); };
        u.onerror = function (e) {
            if (e.error === 'canceled' || e.error === 'interrupted') return;
            if (token === ttsToken) ttsStatus('Audio problem (' + (e.error || 'unknown') + '). Try reloading the page.');
        };
        window.ccUtterance = u; // keep a reference so the browser does not discard it mid-speech
        speechSynthesis.speak(u);
    }

    function speakText(text) {
        if (!ttsSupported) return;
        var chunks = splitForSpeech(text);
        if (!chunks.length) { ttsStatus('There is nothing to read here.'); return; }
        var token = ++ttsToken;
        ttsPaused = false;
        setPauseLabel();
        speechSynthesis.cancel();
        ttsStatus('Starting…');
        setTimeout(function () {
            if (token !== ttsToken) return;
            try { speechSynthesis.resume(); } catch (e) { /* ignore */ }
            chooseVoice();
            var started = false;
            var guard = setTimeout(function () {
                if (!started && token === ttsToken) {
                    ttsStatus('No sound started. Check your volume, and that this device has a text-to-speech voice (Chrome, Edge and Safari work best).');
                }
            }, 3000);
            speakNext(chunks, 0, token, function () { started = true; clearTimeout(guard); });
        }, 150);
    }

    function readableText(root) {
        var clone = root.cloneNode(true);
        var junk = clone.querySelectorAll('script, style, svg, [hidden], [aria-hidden="true"], #route-map, .leaflet-container, canvas');
        for (var i = 0; i < junk.length; i++) junk[i].parentNode.removeChild(junk[i]);
        return clone.textContent || '';
    }

    function readPage() {
        if (main) speakText(readableText(main));
    }

    if (ttsSupported) {
        chooseVoice();
        if (speechSynthesis.addEventListener) speechSynthesis.addEventListener('voiceschanged', chooseVoice);

        // Remember the last text the visitor highlighted, because clicking a button can clear it.
        document.addEventListener('selectionchange', function () {
            var t = window.getSelection ? window.getSelection().toString().trim() : '';
            if (t) lastSelection = t;
        });

        document.getElementById('tts-play').addEventListener('click', readPage);
        document.getElementById('tts-selection').addEventListener('click', function () {
            if (lastSelection) {
                speakText(lastSelection);
            } else {
                ttsStatus('Highlight some text on the page first, then press Selection.');
            }
        });
        document.getElementById('tts-pause').addEventListener('click', function () {
            if (!speechSynthesis.speaking && !speechSynthesis.pending) return;
            if (ttsPaused) { speechSynthesis.resume(); } else { speechSynthesis.pause(); }
            ttsPaused = !ttsPaused;
            setPauseLabel();
        });
        document.getElementById('tts-stop').addEventListener('click', stopReading);
        window.addEventListener('beforeunload', stopReading);

        // Quick 🔊 button in the nav bar: start or stop reading the page.
        if (navMenu) {
            var listenBtn = document.createElement('button');
            listenBtn.type = 'button';
            listenBtn.className = 'nav-icon-btn';
            listenBtn.id = 'listen-btn';
            listenBtn.textContent = '🔊';
            listenBtn.setAttribute('aria-label', 'Read this page aloud');
            listenBtn.addEventListener('click', function () {
                if (speechSynthesis.speaking || speechSynthesis.pending) { stopReading(); } else { readPage(); }
            });
            navMenu.insertBefore(listenBtn, navMenu.querySelector('.search-wrap'));
        }
    }

    /* ---------- Gentle fade-in for cards as they scroll into view ---------- */
    if ('IntersectionObserver' in window) {
        var revealEls = document.querySelectorAll('main .card, main .tip-banner, main .log-form, main .status-card');
        var io = new IntersectionObserver(function (entries) {
            entries.forEach(function (en) {
                if (en.isIntersecting) { en.target.classList.add('in'); io.unobserve(en.target); }
            });
        }, { threshold: 0.08 });
        for (var r = 0; r < revealEls.length; r++) {
            revealEls[r].classList.add('reveal');
            io.observe(revealEls[r]);
        }
    }

    /* ---------- Help Chat (keyword FAQ helper, not AI) ---------- */
    var HELP = [
        { keys: ['hello', 'hi ', 'hey', 'help', 'start'], a: 'Hi! I can answer questions about how CarbonCount works. Try one of the buttons below, or type a question like "how do you calculate CO2?"' },
        { keys: ['what is', 'what does', 'about', 'purpose', 'carboncount'], a: 'CarbonCount is a free web app that estimates the carbon footprint of how you travel and lets you flag trips where an accessibility barrier pushed you toward a higher-carbon choice.', link: ['about.html', 'Read more on the About page'] },
        { keys: ['log', 'add trip', 'record', 'track'], a: 'Open the Daily Log, choose how you traveled, describe the trip (you can tap the mic and speak it), enter the miles, and press Log Activity. Your totals, weekly trend, and streak update right away.', link: ['log.html', 'Go to the Daily Log'] },
        { keys: ['co2', 'carbon', 'calculate', 'formula', 'emission', 'factor', 'accurate', 'estimate'], a: 'Each estimate is miles multiplied by a factor for your travel mode: driving about 0.89 lbs CO₂ per mile (EPA), transit about 0.45 (FTA), accessible routing about 0.10, and walking or biking 0. They are national averages, so treat them as directional rather than exact.', link: ['route.html', 'See the full formula and sources'] },
        { keys: ['barrier', 'elevator', 'ramp', 'paratransit', 'forced'], a: 'When you log a trip, check the barrier box if something like a broken elevator, missing ramp, or unreliable paratransit pushed you toward a higher-carbon option, and note what it was. The Accessibility Barrier Report then counts those trips over the last 7 days.', link: ['log.html', 'Open the Daily Log'] },
        { keys: ['route', 'direction', 'map', 'navigate', 'navigation', 'gps', 'qr', 'planner'], a: 'In the Route Planner, enter a start and destination (or use your location). It compares driving, cycling, walking, and an estimated transit option, shows them on a map, recommends the lowest-carbon realistic choice, and offers turn-by-turn directions, live navigation, and a QR code to open the route on your phone.', link: ['route.html', 'Open the Route Planner'] },
        { keys: ['private', 'privacy', 'data', 'safe', 'server', 'store', 'share my'], a: 'Your entries, bio, and settings are stored only in this browser. Nothing is uploaded to a server. The Route Planner does send the places you type to free OpenStreetMap services so it can find routes.', link: ['about.html#faq', 'Read the FAQ'] },
        { keys: ['sync', 'device', 'phone', 'account', 'lost', 'reset'], a: 'Not yet. Because data lives in your browser, switching devices or clearing browser data starts you fresh. You can download your trips first with Export as CSV on the Daily Log page.' },
        { keys: ['export', 'csv', 'download', 'spreadsheet'], a: 'On the Daily Log page, press Export as CSV to download all of your logged trips as a spreadsheet file.', link: ['log.html', 'Go to the Daily Log'] },
        { keys: ['profile', 'bio', 'needs', 'preferences', 'badge', 'point', 'level', 'xp'], a: 'The Profile page lets you save a short bio, optional accessibility and mobility needs, and your preferred travel modes. Every field is optional. You also earn points, levels, and badges as you log trips.', link: ['profile.html', 'Open your Profile'] },
        { keys: ['streak', 'goal', 'weekly', 'trend'], a: 'Your streak grows each day you log at least one trip. On the Daily Log page you can also set a weekly CO₂ goal and see a seven-day chart of how you are tracking.', link: ['log.html', 'Open the Daily Log'] },
        { keys: ['read aloud', 'speech', 'speak', 'listen', 'audio', 'screen reader', 'text to speech', 'tts'], a: 'Press the ♿ button, then use Read aloud to hear the whole page or just the text you have selected. You can change the speed too. In the Daily Log, the 🎤 button lets you speak a trip description instead of typing.' },
        { keys: ['accessib', 'contrast', 'font', 'text size', 'bigger', 'larger', 'motion', 'cloud', 'animation', 'dark', 'night', 'underline', 'dyslexia', 'readable'], a: 'Press the ♿ button for text size, high contrast, underlined links, a readable font, extra text spacing, reduce motion (stops the cloud animation), and read aloud. The 🌙 button in the menu switches dark mode.' },
        { keys: ['sdg', 'un ', 'united nations', 'goals'], a: 'CarbonCount lines up with six UN Sustainable Development Goals: good health, affordable and clean energy, reduced inequalities, sustainable cities, responsible consumption, and climate action.', link: ['index.html', 'See them on the Home page'] },
        { keys: ['who', 'made', 'built', 'creator', 'student'], a: 'CarbonCount is a student-built project.' },
        { keys: ['thanks', 'thank you', 'thx'], a: 'You are welcome! Ask me anything else about the app.' }
    ];
    var CHIPS = ['How do I log a trip?', 'How is CO₂ calculated?', 'What is the barrier report?', 'Is my data private?', 'Accessibility options'];

    var chatFab = document.createElement('button');
    chatFab.id = 'chat-fab';
    chatFab.type = 'button';
    chatFab.setAttribute('aria-label', 'Open help chat');
    chatFab.setAttribute('aria-expanded', 'false');
    chatFab.setAttribute('aria-controls', 'chat-panel');
    chatFab.textContent = '💬';

    var chat = document.createElement('div');
    chat.id = 'chat-panel';
    chat.hidden = true;
    chat.setAttribute('role', 'dialog');
    chat.setAttribute('aria-label', 'CarbonCount help chat');
    chat.innerHTML =
        '<div class="chat-head"><strong>CarbonCount Help</strong>' +
        '<span class="chat-sub">Answers common questions. Not an AI.</span></div>' +
        '<div id="chat-log" role="log" aria-live="polite"></div>' +
        '<div id="chat-chips"></div>' +
        '<div id="chat-form">' +
        '<input type="text" id="chat-input" placeholder="Ask a question…" aria-label="Type your question" autocomplete="off">' +
        '<button type="button" id="chat-send">Send</button></div>';
    body.appendChild(chatFab);
    body.appendChild(chat);

    var chatLog = document.getElementById('chat-log');
    var chatInput = document.getElementById('chat-input');
    var greeted = false;

    function setChat(open) {
        chat.hidden = !open;
        chatFab.setAttribute('aria-expanded', String(open));
        if (open) {
            if (!greeted) { greeted = true; botSay(HELP[0].a); }
            chatInput.focus();
        }
    }
    chatFab.addEventListener('click', function () {
        setChat(chat.hidden);
        if (!chat.hidden) setPanel(false);
    });

    function addMsg(who, text, link) {
        var div = document.createElement('div');
        div.className = 'chat-msg ' + who;
        div.appendChild(document.createTextNode(text)); // text only, never HTML
        if (link) {
            div.appendChild(document.createElement('br'));
            var a = document.createElement('a');
            a.href = link[0];
            a.textContent = link[1] + ' →';
            div.appendChild(a);
        }
        chatLog.appendChild(div);
        chatLog.scrollTop = chatLog.scrollHeight;
    }

    function botSay(text, link) { addMsg('bot', text, link); }

    function answer(question) {
        var q = ' ' + question.toLowerCase() + ' ';
        var best = null, bestScore = 0;
        HELP.forEach(function (entry) {
            var score = 0;
            entry.keys.forEach(function (k) { if (q.indexOf(k) !== -1) score += k.length > 4 ? 2 : 1; });
            if (score > bestScore) { bestScore = score; best = entry; }
        });
        if (best) {
            botSay(best.a, best.link);
        } else {
            botSay('I am not sure about that one. I can help with logging trips, how CO₂ is calculated, the barrier report, the Route Planner, privacy, your Profile, and accessibility options. Try one of the buttons below.');
        }
    }

    function ask(text) {
        var t = text.trim();
        if (!t) return;
        addMsg('user', t);
        chatInput.value = '';
        setTimeout(function () { answer(t); }, 250);
    }

    var chipBox = document.getElementById('chat-chips');
    CHIPS.forEach(function (label) {
        var b = document.createElement('button');
        b.type = 'button';
        b.className = 'chat-chip';
        b.textContent = label;
        b.addEventListener('click', function () { ask(label); });
        chipBox.appendChild(b);
    });
    document.getElementById('chat-send').addEventListener('click', function () { ask(chatInput.value); });
    chatInput.addEventListener('keydown', function (e) {
        if (e.key === 'Enter') { e.preventDefault(); ask(chatInput.value); }
    });

    document.addEventListener('keydown', function (e) {
        if (e.key !== 'Escape') return;
        if (!panel.hidden) { setPanel(false); fab.focus(); }
        if (!chat.hidden) { setChat(false); chatFab.focus(); }
    });

    /* ---------- Apply saved preferences on every page load ---------- */
    applyTheme(load('cc-theme', 'light') === 'dark');
    applyFontSize(load('cc-font', 'md'));
    var osReducedMotion = window.matchMedia && window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    OPTIONS.forEach(function (opt) {
        var saved = load(opt.key, null);
        var on = saved === null ? (opt.key === 'cc-motion' && osReducedMotion) : saved === 'on';
        applyOption(opt, on);
    });
})();
