// ── URL PARAMS ──────────────────────────────────────────────────────────────
const urlParams = new URLSearchParams(window.location.search);
const bookId = urlParams.get('id');
if (!bookId) window.location.href = 'index.html';

let currentChallenge = null;

// ── LOCALSTORAGE HELPERS ────────────────────────────────────────────────────
function lsKey(suffix) { return `squircle_book_${bookId}_${suffix}`; }

function getSavedPage() {
    return parseInt(localStorage.getItem(lsKey('page'))) || null;
}

function saveCurrentPage(page) {
    localStorage.setItem(lsKey('page'), page);
    localStorage.setItem(lsKey('last_visit'), new Date().toISOString());
    updateSaveUI(page);
    // flash badge
    const badge = document.getElementById('savedBadge');
    badge.classList.add('show');
    setTimeout(() => badge.classList.remove('show'), 2000);
}

function updateSaveUI(page) {
    const label = document.getElementById('savedPageLabel');
    const metaSP = document.getElementById('metaSavedPage');
    const metaLV = document.getElementById('metaLastVisit');
    const raw = localStorage.getItem(lsKey('last_visit'));

    if (page) {
        const pg = `Page ${page}`;
        if (label) label.textContent = pg;
        if (metaSP) metaSP.textContent = pg;
    }
    if (raw) {
        const d = new Date(raw);
        const fmt = d.toLocaleDateString('it-IT', {day:'2-digit',month:'2-digit',year:'numeric'});
        if (metaLV) metaLV.textContent = fmt;
    }
}

// ── HTML ESCAPE ─────────────────────────────────────────────────────────────
function esc(v) {
    return String(v || '').replace(/&/g,'&amp;').replace(/</g,'&lt;')
        .replace(/>/g,'&gt;').replace(/"/g,'&quot;').replace(/'/g,'&#039;');
}

function formatDate(v) {
    return new Date(v).toLocaleDateString('it-IT',{day:'2-digit',month:'2-digit',year:'numeric'});
}

// ── STATUS ──────────────────────────────────────────────────────────────────
function setStatus(text, type='neutral') {
    const map = {'neutral':'pill--neutral','success':'pill--success','danger':'pill--danger'};
    ['heroStatus','metaStatus'].forEach(id => {
        const el = document.getElementById(id);
        if (!el) return;
        el.textContent = text;
        el.className = `status-pill ${map[type] || 'pill--neutral'}`;
    });
}

// ── GATEKEEPER ──────────────────────────────────────────────────────────────
async function initGatekeeper() {
    try {
        const res = await fetch('/api/challenge');
        if (!res.ok) throw new Error();
        currentChallenge = await res.json();
        document.getElementById('gateChallengeText').textContent = currentChallenge.question;
        document.getElementById('gateSubmitBtn').addEventListener('click', verifyGate);
        document.getElementById('gateAnswer').addEventListener('keypress', e => { if(e.key==='Enter') verifyGate(); });
    } catch {
        document.getElementById('gateChallengeText').textContent = 'Unable to load security check.';
    }
}

async function verifyGate() {
    const val = parseInt(document.getElementById('gateAnswer').value);
    if (isNaN(val)) { showGateErr(true); return; }
    let ok = false;
    const parts = currentChallenge.question.split('+').map(n => parseInt(n.trim()));
    if (parts.length === 2 && !isNaN(parts[0]) && !isNaN(parts[1])) {
        ok = val === parts[0] + parts[1];
    } else {
        try { ok = val === Function('"use strict";return(' + currentChallenge.question + ')')(); } catch {}
    }
    if (ok) {
        document.getElementById('botGate').classList.add('hidden');
        const rc = document.getElementById('readerContent');
        rc.style.display = 'block';
        rc.classList.add('active');
        initReader();
    } else {
        showGateErr(true);
        setTimeout(async () => {
            const res = await fetch('/api/challenge');
            currentChallenge = await res.json();
            document.getElementById('gateChallengeText').textContent = currentChallenge.question;
            document.getElementById('gateAnswer').value = '';
            showGateErr(false);
        }, 1500);
    }
}

function showGateErr(show) {
    const el = document.getElementById('gateError');
    if (show) el.classList.add('show'); else el.classList.remove('show');
}

// ── DRAWER ──────────────────────────────────────────────────────────────────
function openDrawer() {
    document.getElementById('drawerOverlay').classList.add('open');
    document.getElementById('commentsDrawer').classList.add('open');
}
function closeDrawer() {
    document.getElementById('drawerOverlay').classList.remove('open');
    document.getElementById('commentsDrawer').classList.remove('open');
}

// ── VIEWER ──────────────────────────────────────────────────────────────────
function showViewer(which) {
    ['pdfViewer','epubViewer','viewerFallback','viewerLoading'].forEach(id => {
        const el = document.getElementById(id);
        if (!el) return;
        el.classList.add('hidden');
    });
    const target = document.getElementById(which);
    if (target) target.classList.remove('hidden');
}

// ── PAGE SAVE (PDF only) ─────────────────────────────────────────────────────
function initPageSave() {
    document.getElementById('pageSaveBar').classList.remove('hidden');
    const saved = getSavedPage();
    if (saved) updateSaveUI(saved);

    // We can't directly read PDF page from iframe,
    // so we provide a manual "save page" that prompts the user.
    document.getElementById('savePageBtn').addEventListener('click', () => {
        const p = prompt('Enter the current page number to save:');
        const n = parseInt(p);
        if (!isNaN(n) && n > 0) {
            saveCurrentPage(n);
        }
    });
}

// ── LOAD BOOK ────────────────────────────────────────────────────────────────
async function loadBook() {
    try {
        const res = await fetch(`/api/books/${bookId}`);
        if (!res.ok) throw new Error('Not found');
        const book = await res.json();

        // Populate UI
        const title = book.title || 'Untitled';
        const author = book.author || '';
        const desc = book.description || 'No description available.';
        const filePath = (book.file_path || '').startsWith('/') ? book.file_path : `/${book.file_path}`;
        const isPdf  = book.file_path?.toLowerCase().endsWith('.pdf');
        const isEpub = book.file_path?.toLowerCase().endsWith('.epub');
        const ext = isPdf ? 'PDF' : isEpub ? 'EPUB' : 'Unknown';

        document.getElementById('bookTitle').textContent = title;
        document.getElementById('bookAuthor').textContent = author ? `by ${author}` : '';
        document.getElementById('bookDesc').textContent = desc;
        document.getElementById('metaTitle').textContent = title;
        document.getElementById('metaAuthor').textContent = author || '—';
        document.getElementById('metaFormat').textContent = ext;

        // Downloads
        document.getElementById('dlOriginal').href = filePath;
        document.getElementById('dlPdf').href  = `/api/books/${book.id}/download?format=pdf`;
        document.getElementById('dlEpub').href = `/api/books/${book.id}/download?format=epub`;

        // Viewer
        if (isPdf) {
            const saved = getSavedPage();
            const url = `${filePath}#toolbar=0&navpanes=0${saved ? `&page=${saved}` : ''}`;
            const iframe = document.getElementById('pdfViewer');
            iframe.src = url;
            showViewer('pdfViewer');
            initPageSave();
            updateSaveUI(saved);
        } else if (isEpub) {
            await loadEpub(book.id);
        } else {
            showViewer('viewerFallback');
        }

        setStatus('Ready to read', 'success');
    } catch {
        showViewer('viewerFallback');
        setStatus('Load error', 'danger');
    }
}

async function loadEpub(id) {
    try {
        const res = await fetch(`/api/books/${id}/preview`);
        if (!res.ok) throw new Error();
        const data = await res.json();
        if (!data || data.format !== 'epub' || !Array.isArray(data.chapters)) throw new Error();

        const html = data.chapters.map(ch => {
            const t = esc(ch.title || 'Chapter');
            const body = esc(ch.text || '').replace(/\n{2,}/g,'</p><p>').replace(/\n/g,' ');
            return `<div class="epub-chapter"><h3>${t}</h3><p>${body}</p></div>`;
        }).join('');

        const epubEl = document.getElementById('epubViewer');
        epubEl.innerHTML = html;
        showViewer('epubViewer');
        setStatus('EPUB ready', 'success');
    } catch {
        showViewer('viewerFallback');
        setStatus('EPUB preview unavailable', 'danger');
    }
}

// ── COMMENTS ─────────────────────────────────────────────────────────────────
async function loadComments() {
    try {
        const res = await fetch(`/api/comments/${bookId}`);
        if (!res.ok) throw new Error();
        const comments = await res.json();
        const list = document.getElementById('commentList');
        const count = comments.length;

        // update badges
        ['commentCountBadge','commentCountBadge2'].forEach(id => {
            const el = document.getElementById(id);
            if (el) el.textContent = count;
        });

        list.innerHTML = count === 0
            ? '<div class="c-empty">No comments yet.<br>Be the first to speak.</div>'
            : comments.map(c => `
                <div class="c-card">
                    <div class="c-meta">Anonymous · ${formatDate(c.created_at)}</div>
                    <p class="c-text">${esc(c.content)}</p>
                </div>
            `).join('');
    } catch {
        document.getElementById('commentList').innerHTML = '<div class="c-empty">Unable to load comments.</div>';
    }
}

async function loadChallenge() {
    const box = document.getElementById('antibotBox');
    const ansInput = document.getElementById('challengeAnswer');
    const textInput = document.getElementById('commentInput');
    const btn = document.getElementById('postCommentBtn');
    [ansInput, textInput, btn].forEach(el => el && (el.disabled = true));
    box.textContent = 'Requesting security verification…';
    try {
        const res = await fetch('/api/challenge');
        if (!res.ok) throw new Error();
        currentChallenge = await res.json();
        box.textContent = `Verification: ${currentChallenge.question}`;
        [ansInput, textInput, btn].forEach(el => el && (el.disabled = false));
    } catch {
        box.textContent = 'Unable to load anti-bot check.';
    }
}

async function submitComment() {
    const content = document.getElementById('commentInput').value.trim();
    const answer  = document.getElementById('challengeAnswer').value.trim();
    if (!content) { alert('Please enter a comment.'); return; }
    if (!answer)  { alert('Please answer the security check.'); return; }
    if (!currentChallenge?.id) { alert('Invalid verification. Please refresh.'); return; }

    const btn = document.getElementById('postCommentBtn');
    btn.disabled = true;

    try {
        const res = await fetch('/api/comments', {
            method: 'POST',
            headers: {'Content-Type':'application/json'},
            body: JSON.stringify({ book_id: bookId, content, challenge_id: currentChallenge.id, answer })
        });
        if (!res.ok) throw new Error((await res.json().catch(()=>{}))?.message || 'Error');
        document.getElementById('commentInput').value = '';
        document.getElementById('challengeAnswer').value = '';
        await loadComments();
        await loadChallenge();
    } catch (err) {
        alert(`Could not submit comment: ${err.message}`);
        await loadChallenge();
    }
}

// ── SCROLL ANIMATIONS ────────────────────────────────────────────────────────
function setupScrollAnim() {
    const obs = new IntersectionObserver(entries => {
        entries.forEach(e => { if (e.isIntersecting) { e.target.classList.add('is-visible'); obs.unobserve(e.target); }});
    }, { threshold: 0.08, rootMargin: '0px 0px -40px 0px' });
    document.querySelectorAll('.roll-in-element').forEach(el => obs.observe(el));
}

// ── INIT ─────────────────────────────────────────────────────────────────────
function initReader() {
    setupScrollAnim();

    // Drawer triggers
    document.getElementById('openDrawerBtn').addEventListener('click', openDrawer);
    document.getElementById('openDrawerBtn2').addEventListener('click', openDrawer);
    document.getElementById('closeDrawerBtn').addEventListener('click', closeDrawer);
    document.getElementById('drawerOverlay').addEventListener('click', closeDrawer);
    document.getElementById('postCommentBtn').addEventListener('click', submitComment);
    document.getElementById('refreshChallengeBtn').addEventListener('click', loadChallenge);

    loadBook();
    loadComments();
    loadChallenge();
}

// Boot
if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', initGatekeeper);
} else {
    initGatekeeper();
}