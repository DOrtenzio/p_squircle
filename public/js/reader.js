const urlParams = new URLSearchParams(window.location.search);
const bookId = urlParams.get('id');
let currentChallenge = null;

// Elementi UI Generali
const elements = {
    // Gatekeeper
    botGate: document.getElementById('botGate'),
    gateChallengeText: document.getElementById('gateChallengeText'),
    gateAnswer: document.getElementById('gateAnswer'),
    gateSubmitBtn: document.getElementById('gateSubmitBtn'),
    gateError: document.getElementById('gateError'),
    readerContent: document.getElementById('readerContent'),
    
    // Reader
    status: document.getElementById('readerStatus'),
    statusNote: document.getElementById('readerUpdated'),
    title: document.getElementById('bookTitle'),
    author: document.getElementById('bookAuthor'),
    description: document.getElementById('bookDescription'),
    pdfViewer: document.getElementById('pdfViewer'),
    viewerFallback: document.getElementById('viewerFallback'),
    downloadOriginalLink: document.getElementById('downloadOriginalLink'),
    downloadPdfBtn: document.getElementById('downloadPdfBtn'),
    downloadEpubBtn: document.getElementById('downloadEpubBtn'),
    
    // Comments
    challengeBox: document.getElementById('challengeBox'),
    challengeAnswer: document.getElementById('challengeAnswer'),
    commentInput: document.getElementById('commentInput'),
    postCommentBtn: document.getElementById('postCommentBtn'),
    commentList: document.getElementById('commentList'),
    platformLog: document.getElementById('platformLog'),
    refreshChallengeBtn: document.getElementById('refreshChallengeBtn')
};

function formatDate(value) {
    return new Date(value).toLocaleDateString('it-IT', {
        day: '2-digit', month: '2-digit', year: 'numeric'
    });
}

function setStatus(text, type = 'neutral') {
    if(elements.status) {
        elements.status.textContent = text;
        elements.status.className = `status-pill status-pill--${type}`;
    }
}

function appendLog(message, type = 'info') {
    if(!elements.platformLog) return;
    const entry = document.createElement('div');
    entry.className = `log-entry log-entry--${type}`;
    entry.innerHTML = `<span>${message}</span>`;
    elements.platformLog.prepend(entry);
}

function setCommentControls(enabled) {
    if(elements.challengeAnswer) elements.challengeAnswer.disabled = !enabled;
    if(elements.commentInput) elements.commentInput.disabled = !enabled;
    if(elements.postCommentBtn) elements.postCommentBtn.disabled = !enabled;
}

function getFileUrl(path) {
    return path.startsWith('/') ? path : `/${path}`;
}

// --- LOGICA ANTI-BOT GATEKEEPER ---
async function initGatekeeper() {
    try {
        const res = await fetch('/api/challenge');
        if (!res.ok) throw new Error('Errore challenge');
        
        currentChallenge = await res.json();
        elements.gateChallengeText.textContent = `Quanto fa ${currentChallenge.question}?`;
        elements.gateSubmitBtn.addEventListener('click', verifyGateEntry);
        
        // Permetti invio con tasto Enter
        elements.gateAnswer.addEventListener('keypress', (e) => {
            if (e.key === 'Enter') verifyGateEntry();
        });

    } catch (error) {
        elements.gateChallengeText.textContent = 'Impossibile caricare la verifica di sicurezza.';
        console.error(error);
    }
}

async function verifyGateEntry() {
    const userAnswer = parseInt(elements.gateAnswer.value);
    
    if (isNaN(userAnswer)) {
        showGateError(true);
        return;
    }

    // Calcolo manuale sicuro invece di eval()
    let isCorrect = false;
    const parts = currentChallenge.question.split('+').map(n => parseInt(n.trim()));
    
    if (parts.length === 2 && !isNaN(parts[0]) && !isNaN(parts[1])) {
        isCorrect = userAnswer === (parts[0] + parts[1]);
    } else {
        // Fallback se la domanda non è una semplice addizione
        try {
            isCorrect = userAnswer === Function('"use strict";return (' + currentChallenge.question + ')')();
        } catch(e) { isCorrect = false; }
    }

    if (isCorrect) {
        elements.botGate.classList.add('hidden');
        elements.readerContent.classList.remove('hidden');
        initializeReader(); 
    } else {
        showGateError(true);
        setTimeout(() => {
             initGatekeeper();
             elements.gateAnswer.value = '';
        }, 1500);
    }
}

function showGateError(show) {
    if (show) {
        elements.gateError.classList.remove('hidden');
        elements.gateAnswer.style.borderColor = '#dc2626';
    } else {
        elements.gateError.classList.add('hidden');
        elements.gateAnswer.style.borderColor = 'rgba(0,0,0,0.14)';
    }
}

// --- LOGICA READER STANDARD ---

async function fetchBook() {
    try {
        const res = await fetch(`/api/books/${bookId}`);
        if (!res.ok) throw new Error('Libro non trovato');
        
        const book = await res.json();
        const fileUrl = getFileUrl(book.file_path || '');

        elements.title.textContent = book.title || 'Titolo non disponibile';
        elements.author.textContent = book.author ? `di ${book.author}` : '';
        elements.description.textContent = book.description || 'Nessuna descrizione disponibile.';

        const isPdf = book.file_path?.toLowerCase().endsWith('.pdf');
        const isEpub = book.file_path?.toLowerCase().endsWith('.epub');
        elements.downloadOriginalLink.href = fileUrl;
        elements.downloadOriginalLink.textContent = 'Scarica file originale';
        elements.downloadPdfBtn.href = `/api/books/${book.id}/download?format=pdf`;
        elements.downloadEpubBtn.href = `/api/books/${book.id}/download?format=epub`;
        elements.downloadPdfBtn.textContent = isPdf ? 'Scarica PDF originale' : 'Converti EPUB in PDF';
        elements.downloadEpubBtn.textContent = isEpub ? 'Scarica EPUB originale' : 'Converti PDF in EPUB';

        if (isPdf) {
            elements.pdfViewer.src = `${fileUrl}#toolbar=0&navpanes=0`;
            elements.pdfViewer.hidden = false;
            elements.viewerFallback.classList.add('hidden');
        } else {
            elements.pdfViewer.hidden = true;
            elements.viewerFallback.classList.remove('hidden');
        }

        setStatus('Libro pronto', 'success');
        elements.statusNote.textContent = 'Contenuto caricato con successo.';
        appendLog('Libro caricato correttamente.', 'success');
    } catch (error) {
        setStatus('Errore caricamento', 'danger');
        elements.description.textContent = 'Impossibile caricare il libro al momento.';
        appendLog(`Errore caricamento libro: ${error.message}`, 'danger');
        console.error(error);
    }
}

async function loadComments() {
    try {
        const res = await fetch(`/api/comments/${bookId}`);
        if (!res.ok) throw new Error('Impossibile caricare i commenti');
        
        const comments = await res.json();
        elements.commentList.innerHTML = comments.length === 0
            ? '<div class="empty-state">Nessun commento ancora. Sii il primo a parlare.</div>'
            : comments.map(comment => `
                <article class="comment-card">
                    <div class="comment-card__meta">Anonimo • ${formatDate(comment.created_at)}</div>
                    <p>${comment.content}</p>
                </article>
            `).join('');

        appendLog('Commenti aggiornati.', 'info');
    } catch (error) {
        appendLog(`Impossibile caricare i commenti: ${error.message}`, 'danger');
        console.error(error);
    }
}

async function loadCommentChallenge() {
    try {
        setCommentControls(false);
        elements.challengeBox.textContent = 'Richiesta controllo di sicurezza...';
        
        const res = await fetch('/api/challenge');
        if (!res.ok) throw new Error('Errore challenge');

        // Aggiorniamo la challenge corrente per i commenti
        // Potremmo usare una variabile diversa se la challenge di accesso è diversa
        currentChallenge = await res.json(); 
        elements.challengeBox.textContent = `Verifica: ${currentChallenge.question}`;
        setCommentControls(true);
        appendLog('Nuova verifica anti-bot generata.', 'success');
    } catch (error) {
        elements.challengeBox.textContent = 'Impossibile ottenere il controllo anti-bot.';
        appendLog(`Errore generazione verifica: ${error.message}`, 'danger');
        console.error(error);
    }
}

async function submitComment() {
    const content = elements.commentInput.value.trim();
    const answer = elements.challengeAnswer.value.trim();
    
    if (!content) {
        alert('Inserisci un commento prima di inviare.');
        return;
    }
    if (!answer) {
        alert('Rispondi al controllo di sicurezza.');
        return;
    }
    if (!currentChallenge?.id) {
        alert('Verifica non valida. Ricarica la pagina o il controllo.');
        return;
    }

    try {
        setCommentControls(false);
        setStatus('Invio commento...', 'neutral');

        const res = await fetch('/api/comments', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
                book_id: bookId,
                content,
                challenge_id: currentChallenge.id,
                answer
            })
        });

        if (!res.ok) {
            const payload = await res.json().catch(() => null);
            throw new Error(payload?.message || 'Invio fallito');
        }

        elements.commentInput.value = '';
        elements.challengeAnswer.value = '';
        appendLog('Commento inviato con successo.', 'success');
        setStatus('Commento inviato', 'success');
        await loadComments();
        await loadCommentChallenge();
    } catch (error) {
        appendLog(`Errore invio commento: ${error.message}`, 'danger');
        alert(error.message);
        setStatus('Errore invio', 'danger');
        await loadCommentChallenge();
    }
}

function initializeReader() {
    if (!bookId) {
        window.location.href = 'index.html';
        return;
    }
    
    elements.postCommentBtn.addEventListener('click', submitComment);
    elements.refreshChallengeBtn.addEventListener('click', loadCommentChallenge);

    fetchBook();
    loadComments();
    loadCommentChallenge();
}

// Avvio iniziale: Mostra prima il Gatekeeper
if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', initGatekeeper);
} else {
    initGatekeeper();
}