// ─── Configuration ──────────────────────────────────────────────
const DEFAULT_LANG = 'en';
let currentLang = localStorage.getItem('docs_language') || DEFAULT_LANG;
let currentDoc = null;
let challenge = null;
let allDocs = [];

// ─── DOM Elements ──────────────────────────────────────────────
const docViewer = document.getElementById('docViewer');
const docNav = document.getElementById('docNav');
const commentList = document.getElementById('commentList');
const searchInput = document.getElementById('searchInput');
const langToggle = document.getElementById('langToggle');
const langDropdown = document.getElementById('langDropdown');
const postCommentBtn = document.getElementById('postCommentBtn');
const commentInput = document.getElementById('commentInput');
const challengeAnswer = document.getElementById('challengeAnswer');
const antibotBox = document.getElementById('antibotBox');

// ─── Languages ──────────────────────────────────────────────────
const LANGUAGES = [
    { code: 'en', name: 'English', flag: '🇺🇸' },
    { code: 'it', name: 'Italiano', flag: '🇮🇹' },
    { code: 'fr', name: 'Français', flag: '🇫🇷' },
    { code: 'de', name: 'Deutsch', flag: '🇩🇪' },
    { code: 'es', name: 'Español', flag: '🇪🇸' },
    { code: 'pt', name: 'Português', flag: '🇵🇹' },
    { code: 'nl', name: 'Nederlands', flag: '🇳🇱' },
    { code: 'pl', name: 'Polski', flag: '🇵🇱' },
    { code: 'uk', name: 'Українська', flag: '🇺🇦' },
    { code: 'ru', name: 'Русский', flag: '🇷🇺' },
    { code: 'ja', name: '日本語', flag: '🇯🇵' },
    { code: 'zh', name: '中文', flag: '🇨🇳' },
    { code: 'ko', name: '한국어', flag: '🇰🇷' },
    { code: 'ar', name: 'العربية', flag: '🇸🇦' },
    { code: 'hi', name: 'हिन्दी', flag: '🇮🇳' },
    { code: 'tr', name: 'Türkçe', flag: '🇹🇷' }
];

// ─── Markdown Rendering ────────────────────────────────────────
function renderMarkdown(content) {
    if (!content) return '<p>No content available.</p>';
    // Simple markdown to HTML (you can use marked library)
    let html = content
        .replace(/^# (.*$)/gm, '<h1>$1</h1>')
        .replace(/^## (.*$)/gm, '<h2>$1</h2>')
        .replace(/^### (.*$)/gm, '<h3>$1</h3>')
        .replace(/```(\w*)\n([\s\S]*?)```/g, (match, lang, code) => {
            return `<pre><code class="language-${lang || 'text'}">${escapeHtml(code.trim())}</code></pre>`;
        })
        .replace(/`([^`]+)`/g, '<code>$1</code>')
        .replace(/\*\*([^*]+)\*\*/g, '<strong>$1</strong>')
        .replace(/\*([^*]+)\*/g, '<em>$1</em>')
        .replace(/^-\s+(.*)$/gm, '<li>$1</li>')
        .replace(/^\d\.\s+(.*)$/gm, '<li>$1</li>');
    
    // Wrap lists
    html = html.replace(/(<li>.*<\/li>)/gs, '<ul>$1</ul>');
    html = html.replace(/\n/g, '<br>');
    return html;
}

function escapeHtml(str) {
    return str.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;');
}

// ─── Navigation ──────────────────────────────────────────────────
async function loadNavigation() {
    try {
        const res = await fetch(`/api/docs?lang=${currentLang}`);
        const docs = await res.json();
        allDocs = docs;
        
        if (docs.length === 0) {
            docNav.innerHTML = '<p class="empty-nav">No documents available in this language.</p>';
            return;
        }
        
        // Group by category
        const grouped = docs.reduce((acc, doc) => {
            const cat = doc.category || 'general';
            if (!acc[cat]) acc[cat] = [];
            acc[cat].push(doc);
            return acc;
        }, {});
        
        let html = '';
        for (const [category, items] of Object.entries(grouped)) {
            html += `<div class="nav-category"><span class="cat-title">${category}</span>`;
            for (const doc of items) {
                const active = currentDoc?.slug === doc.slug ? 'active' : '';
                html += `<a href="#" class="nav-link ${active}" data-slug="${doc.slug}">${doc.title}</a>`;
            }
            html += '</div>';
        }
        docNav.innerHTML = html;
        
        // Add click handlers
        docNav.querySelectorAll('.nav-link').forEach(link => {
            link.addEventListener('click', (e) => {
                e.preventDefault();
                loadDocument(link.dataset.slug);
                // Update active state
                docNav.querySelectorAll('.nav-link').forEach(l => l.classList.remove('active'));
                link.classList.add('active');
            });
        });
        
        // Load first document if none active
        if (!currentDoc || !docs.find(d => d.slug === currentDoc.slug)) {
            loadDocument(docs[0].slug);
        }
    } catch (err) {
        docNav.innerHTML = '<p class="error-nav">Failed to load navigation.</p>';
        console.error(err);
    }
}

// ─── Document Loading ──────────────────────────────────────────
async function loadDocument(slug) {
    docViewer.innerHTML = '<div class="loading-state">📖 Loading...</div>';
    
    try {
        const res = await fetch(`/api/docs/${slug}?lang=${currentLang}`);
        if (!res.ok) throw new Error('Not found');
        const doc = await res.json();
        currentDoc = doc;
        
        // Update URL
        window.history.pushState({ slug, lang: currentLang }, '', `/${slug}?lang=${currentLang}`);
        
        // Render content
        const html = renderMarkdown(doc.content);
        docViewer.innerHTML = `
            <div class="doc-header">
                <h1>${doc.title}</h1>
                ${doc.is_fallback ? `<div class="fallback-notice">⚠️ This document is available in <strong>${doc.language_available}</strong>. You are viewing the fallback version.</div>` : ''}
                <div class="doc-languages">
                    <span>Available in:</span>
                    ${doc.language_available ? `<span class="lang-badge">${doc.language_available}</span>` : '<span class="lang-badge">en</span>'}
                </div>
            </div>
            <div class="doc-body">${html}</div>
        `;
        
        // Load comments
        loadComments(slug);
        
        // Update title
        document.title = `${doc.title} · ML-KEM Docs`;
        
        // Highlight code blocks
        document.querySelectorAll('pre code').forEach(block => {
            hljs?.highlightElement(block);
        });
        
    } catch (err) {
        docViewer.innerHTML = '<div class="error-state">⚠️ Document not found.</div>';
        console.error(err);
    }
}

// ─── Comments ────────────────────────────────────────────────────
async function loadComments(slug) {
    try {
        const res = await fetch(`/api/comments/${slug}?lang=${currentLang}`);
        const comments = await res.json();
        
        if (comments.length === 0) {
            commentList.innerHTML = '<div class="empty-comments">No comments yet. Start the discussion!</div>';
            return;
        }
        
        commentList.innerHTML = comments.map(c => `
            <div class="comment">
                <div class="comment-meta">Anonymous · ${formatDate(c.created_at)}</div>
                <p class="comment-content">${escapeHtml(c.content)}</p>
            </div>
        `).join('');
    } catch (err) {
        commentList.innerHTML = '<div class="error-comments">Failed to load comments.</div>';
    }
}

async function loadChallenge() {
    try {
        const res = await fetch('/api/challenge');
        challenge = await res.json();
        antibotBox.textContent = `🧮 ${challenge.question}`;
        challengeAnswer.disabled = false;
        commentInput.disabled = false;
        postCommentBtn.disabled = false;
    } catch {
        antibotBox.textContent = '⚠️ Failed to load verification.';
    }
}

async function postComment() {
    const content = commentInput.value.trim();
    const answer = challengeAnswer.value.trim();
    
    if (!content) { alert('Please enter a comment.'); return; }
    if (!answer) { alert('Please answer the security check.'); return; }
    if (!currentDoc) { alert('No document loaded.'); return; }
    
    postCommentBtn.disabled = true;
    postCommentBtn.textContent = 'Posting...';
    
    try {
        const res = await fetch('/api/comments', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
                doc_slug: currentDoc.slug,
                content,
                language: currentLang,
                challenge_id: challenge.id,
                answer
            })
        });
        
        if (!res.ok) {
            const data = await res.json();
            throw new Error(data.error || 'Failed to post');
        }
        
        commentInput.value = '';
        challengeAnswer.value = '';
        await loadComments(currentDoc.slug);
        await loadChallenge();
        
    } catch (err) {
        alert(`Error: ${err.message}`);
    } finally {
        postCommentBtn.disabled = false;
        postCommentBtn.textContent = 'Post Comment';
    }
}

// ─── Search ──────────────────────────────────────────────────────
let searchTimeout;

async function performSearch(query) {
    if (!query.trim()) {
        loadNavigation();
        return;
    }
    
    try {
        const res = await fetch(`/api/search?q=${encodeURIComponent(query)}&lang=${currentLang}`);
        const results = await res.json();
        
        if (results.length === 0) {
            docNav.innerHTML = '<p class="empty-nav">No results found.</p>';
            return;
        }
        
        // Show results in navigation
        let html = `<div class="search-results"><span class="search-label">Search Results (${results.length})</span>`;
        for (const doc of results) {
            html += `<a href="#" class="nav-link" data-slug="${doc.slug}">${doc.title}</a>`;
        }
        html += '</div>';
        docNav.innerHTML = html;
        
        docNav.querySelectorAll('.nav-link').forEach(link => {
            link.addEventListener('click', (e) => {
                e.preventDefault();
                loadDocument(link.dataset.slug);
                document.getElementById('searchInput').value = '';
                loadNavigation();
            });
        });
    } catch (err) {
        console.error(err);
    }
}

// ─── Language Dropdown ──────────────────────────────────────────
function renderLanguageDropdown() {
    const currentLangObj = LANGUAGES.find(l => l.code === currentLang);
    langToggle.textContent = currentLangObj ? `${currentLangObj.flag} ${currentLangObj.name}` : '🌐';
    
    langDropdown.innerHTML = LANGUAGES.map(l => `
        <button class="lang-option ${l.code === currentLang ? 'active' : ''}" data-code="${l.code}">
            ${l.flag} ${l.name}
        </button>
    `).join('');
    
    langDropdown.querySelectorAll('.lang-option').forEach(btn => {
        btn.addEventListener('click', () => {
            currentLang = btn.dataset.code;
            localStorage.setItem('docs_language', currentLang);
            langDropdown.classList.add('hidden');
            renderLanguageDropdown();
            loadNavigation();
            document.getElementById('current-lang').textContent = 
                LANGUAGES.find(l => l.code === currentLang)?.name || 'English';
        });
    });
}

// ─── Utilities ──────────────────────────────────────────────────
function formatDate(dateStr) {
    const d = new Date(dateStr);
    return d.toLocaleDateString('en-US', { 
        day: '2-digit', 
        month: 'short', 
        year: 'numeric' 
    });
}

// ─── Init ────────────────────────────────────────────────────────
document.addEventListener('DOMContentLoaded', () => {
    renderLanguageDropdown();
    
    // Toggle language dropdown
    langToggle.addEventListener('click', (e) => {
        e.stopPropagation();
        langDropdown.classList.toggle('hidden');
    });
    
    document.addEventListener('click', () => {
        langDropdown.classList.add('hidden');
    });
    
    // Search
    searchInput.addEventListener('input', (e) => {
        clearTimeout(searchTimeout);
        searchTimeout = setTimeout(() => performSearch(e.target.value), 300);
    });
    
    // Post comment
    postCommentBtn.addEventListener('click', postComment);
    
    // Enter key for comment
    commentInput.addEventListener('keydown', (e) => {
        if (e.key === 'Enter' && !e.shiftKey) {
            e.preventDefault();
            postComment();
        }
    });
    
    // Load initial
    const urlParams = new URLSearchParams(window.location.search);
    const langParam = urlParams.get('lang');
    if (langParam && LANGUAGES.some(l => l.code === langParam)) {
        currentLang = langParam;
        localStorage.setItem('docs_language', currentLang);
    }
    
    loadNavigation();
    loadChallenge();
    
    document.getElementById('current-lang').textContent = 
        LANGUAGES.find(l => l.code === currentLang)?.name || 'English';
});

// ─── Keyboard Shortcuts ─────────────────────────────────────────
document.addEventListener('keydown', (e) => {
    if ((e.ctrlKey || e.metaKey) && e.key === 'k') {
        e.preventDefault();
        document.getElementById('searchInput').focus();
    }
});