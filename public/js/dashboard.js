let authToken = localStorage.getItem('adminToken');
const state = { editId: null, deleteId: null };

const elements = {
    loginSection: document.getElementById('loginSection'),
    adminPanel: document.getElementById('adminPanel'),
    loginBtn: document.getElementById('loginBtn'),
    logoutBtn: document.getElementById('logoutBtn'),
    openNewBookBtn: document.getElementById('openNewBookBtn'),
    openNewBookBtnSecondary: document.getElementById('openNewBookBtnSecondary'),
    loginMessage: document.getElementById('loginMessage'),
    totalBooks: document.getElementById('totalBooks'),
    recentComments: document.getElementById('recentComments'),
    adminBookList: document.getElementById('adminBookList'),
    dashboardToast: document.getElementById('dashboardToast'),
    bookModal: document.getElementById('bookModal'),
    modalTitle: document.getElementById('modalTitle'),
    closeModalBtn: document.getElementById('closeModalBtn'),
    cancelModalBtn: document.getElementById('cancelModalBtn'),
    modalBookId: document.getElementById('modalBookId'),
    modalTitleInput: document.getElementById('modalTitleInput'),
    modalAuthorInput: document.getElementById('modalAuthorInput'),
    modalDescInput: document.getElementById('modalDescInput'),
    modalEpubFile: document.getElementById('modalEpubFile'),
    modalCoverFile: document.getElementById('modalCoverFile'),
    epubCard: document.getElementById('epubCard'),
    coverCard: document.getElementById('coverCard'),
    epubFileName: document.getElementById('epubFileName'),
    coverFileName: document.getElementById('coverFileName'),
    coverPreview: document.getElementById('coverPreview'),
    modalMessage: document.getElementById('modalMessage'),
    saveBookBtn: document.getElementById('saveBookBtn'),
    confirmModal: document.getElementById('confirmModal'),
    closeConfirmBtn: document.getElementById('closeConfirmBtn'),
    cancelConfirmBtn: document.getElementById('cancelConfirmBtn'),
    confirmDeleteBtn: document.getElementById('confirmDeleteBtn'),
    confirmText: document.getElementById('confirmText')
};

function showToast(message, type = 'info') {
    const toast = document.createElement('div');
    toast.className = `toast toast--${type}`;
    toast.textContent = message;
    elements.dashboardToast.appendChild(toast);
    setTimeout(() => toast.remove(), 5000);
}

function setLoginMessage(message, type = 'danger') {
    elements.loginMessage.textContent = message;
    elements.loginMessage.style.color = type === 'success' ? '#16a34a' : '#b91c1c';
}

function setupScrollAnimations() {
    const observer = new IntersectionObserver((entries) => {
        entries.forEach((entry) => {
            if (entry.isIntersecting) {
                entry.target.classList.add('is-visible');
                observer.unobserve(entry.target);
            }
        });
    }, { threshold: 0.1 });

    document.querySelectorAll('.roll-in-element').forEach(el => observer.observe(el));
}

function bindModalEvents() {
    elements.openNewBookBtn?.addEventListener('click', () => openBookModal());
    elements.openNewBookBtnSecondary?.addEventListener('click', () => openBookModal());
    elements.logoutBtn?.addEventListener('click', logout);
    elements.loginBtn?.addEventListener('click', login);
    elements.closeModalBtn?.addEventListener('click', closeBookModal);
    elements.cancelModalBtn?.addEventListener('click', closeBookModal);
    elements.closeConfirmBtn?.addEventListener('click', closeConfirmModal);
    elements.cancelConfirmBtn?.addEventListener('click', closeConfirmModal);
    elements.confirmDeleteBtn?.addEventListener('click', confirmDeleteBook);
    elements.saveBookBtn?.addEventListener('click', saveBook);

    elements.modalEpubFile?.addEventListener('change', () => {
        const file = elements.modalEpubFile.files[0];
        elements.epubFileName.textContent = file ? file.name : 'Nessun file selezionato';
    });

    elements.modalCoverFile?.addEventListener('change', () => {
        const file = elements.modalCoverFile.files[0];
        if (file) {
            elements.coverFileName.textContent = file.name;
            const reader = new FileReader();
            reader.onload = () => {
                elements.coverPreview.innerHTML = `<img src="${reader.result}" alt="Anteprima copertina">`;
                elements.coverPreview.classList.remove('hidden');
            };
            reader.readAsDataURL(file);
        } else {
            elements.coverFileName.textContent = 'Nessuna immagine selezionata';
            elements.coverPreview.innerHTML = '';
            elements.coverPreview.classList.add('hidden');
        }
    });

    [elements.epubCard, elements.coverCard].forEach((card) => {
        if (!card) return;
        card.addEventListener('click', () => {
            if (card === elements.epubCard) elements.modalEpubFile.click();
            if (card === elements.coverCard) elements.modalCoverFile.click();
        });
        card.addEventListener('dragover', (event) => {
            event.preventDefault();
            card.classList.add('dragover');
        });
        card.addEventListener('dragleave', () => card.classList.remove('dragover'));
        card.addEventListener('drop', (event) => {
            event.preventDefault();
            card.classList.remove('dragover');
            const file = event.dataTransfer.files[0];
            if (!file) return;
            if (card === elements.epubCard && (file.type === 'application/epub+zip' || file.name.toLowerCase().endsWith('.epub'))) {
                const data = new DataTransfer();
                data.items.add(file);
                elements.modalEpubFile.files = data.files;
                elements.epubFileName.textContent = file.name;
            }
            if (card === elements.coverCard && file.type.startsWith('image/')) {
                const data = new DataTransfer();
                data.items.add(file);
                elements.modalCoverFile.files = data.files;
                elements.coverFileName.textContent = file.name;
                const reader = new FileReader();
                reader.onload = () => {
                    elements.coverPreview.innerHTML = `<img src="${reader.result}" alt="Anteprima copertina">`;
                    elements.coverPreview.classList.remove('hidden');
                };
                reader.readAsDataURL(file);
            }
        });
    });
}

function openBookModal(book = null) {
    resetModal();
    state.editId = book?.id || null;
    elements.modalTitle.textContent = book ? 'Modifica libro' : 'Aggiungi nuovo libro';
    if (book) {
        elements.modalBookId.value = book.id;
        elements.modalTitleInput.value = book.title || '';
        elements.modalAuthorInput.value = book.author || '';
        elements.modalDescInput.value = book.description || '';
        elements.epubFileName.textContent = 'Lascia vuoto per mantenere il file esistente';
        elements.coverFileName.textContent = book.cover_url ? 'Lascia vuoto per mantenere la copertina esistente' : 'Nessuna immagine selezionata';
        if (book.cover_url) {
            elements.coverPreview.innerHTML = `<img src="${book.cover_url}" alt="Copertina">`;
            elements.coverPreview.classList.remove('hidden');
        }
    }
    elements.bookModal.classList.remove('hidden');
}

function closeBookModal() {
    elements.bookModal.classList.add('hidden');
}

function openConfirmModal(book) {
    state.deleteId = book.id;
    elements.confirmText.innerHTML = `Eliminare <strong>${book.title}</strong> in modo permanente?`;
    elements.confirmModal.classList.remove('hidden');
}

function closeConfirmModal() {
    state.deleteId = null;
    elements.confirmModal.classList.add('hidden');
}

function resetModal() {
    elements.modalBookId.value = '';
    elements.modalTitleInput.value = '';
    elements.modalAuthorInput.value = '';
    elements.modalDescInput.value = '';
    elements.modalEpubFile.value = '';
    elements.modalCoverFile.value = '';
    elements.epubFileName.textContent = 'Nessun file selezionato';
    elements.coverFileName.textContent = 'Nessuna immagine selezionata';
    elements.coverPreview.innerHTML = '';
    elements.coverPreview.classList.add('hidden');
    elements.modalMessage.textContent = '';
}

async function login() {
    const psk = document.getElementById('pskInput').value.trim();
    const totp = document.getElementById('totpInput').value.trim();
    if (!psk || !totp) {
        setLoginMessage('Compila tutti i campi.', 'danger');
        return;
    }

    const res = await fetch('/api/admin/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ psk, token: totp })
    });

    if (res.ok) {
        const data = await res.json();
        authToken = data.token;
        localStorage.setItem('adminToken', authToken);
        showPanel();
        showToast('Accesso effettuato con successo.', 'success');
    } else {
        setLoginMessage('Credenziali non valide.', 'danger');
        showToast('Accesso fallito.', 'danger');
    }
}

function showPanel() {
    if (elements.loginSection) elements.loginSection.style.display = 'none';
    if (elements.adminPanel) {
        elements.adminPanel.classList.add('visible');
        requestAnimationFrame(() => setTimeout(setupScrollAnimations, 50));
    }
    loadAdminBooks();
}

function logout() {
    localStorage.removeItem('adminToken');
    authToken = null;
    window.location.reload();
}

async function fetchJson(url, options = {}) {
    const headers = options.headers || {};
    if (authToken) headers.Authorization = `Bearer ${authToken}`;
    const response = await fetch(url, { ...options, headers });
    if (response.status === 401) {
        logout();
        throw new Error('Sessione scaduta. Effettua nuovamente il login.');
    }
    return response;
}

async function loadAdminBooks() {
    try {
        const res = await fetchJson('/api/books');
        const books = await res.json();
        elements.totalBooks.textContent = books.length;

        const sortedBooks = books.slice().sort((a, b) => new Date(b.created_at) - new Date(a.created_at));
        elements.adminBookList.innerHTML = sortedBooks.length === 0 ? '<p style="color:var(--text-muted); grid-column:1/-1;">Nessun libro caricato.</p>' : sortedBooks.map((book, index) => `
            <div class="admin-book-card roll-in-element" style="transition-delay: ${index * 0.05}s;">
                <div class="admin-book-cover">
                    ${book.cover_url ? `<img src="${book.cover_url}" alt="Copertina ${book.title}">` : 'No cover'}
                </div>
                <div class="admin-book-info">
                    <h4>${book.title}</h4>
                    <p>${book.author || 'Autore sconosciuto'}</p>
                    <p class="section-note">${book.description ? book.description.substring(0, 120) : 'Nessuna descrizione disponibile.'}</p>
                </div>
                <div class="admin-book-actions">
                    <button class="btn btn-secondary" type="button" data-edit-id="${book.id}">Modifica</button>
                    <button class="btn btn-delete" type="button" data-delete-id="${book.id}" data-delete-title="${book.title}">Elimina</button>
                </div>
            </div>
        `).join('');

        requestAnimationFrame(() => setupScrollAnimations());
        Array.from(document.querySelectorAll('[data-edit-id]')).forEach(btn => {
            btn.addEventListener('click', async () => {
                const id = btn.dataset.editId;
                await editBook(id);
            });
        });
        Array.from(document.querySelectorAll('[data-delete-id]')).forEach(btn => {
            btn.addEventListener('click', async () => {
                const id = btn.dataset.deleteId;
                const title = btn.dataset.deleteTitle;
                openConfirmModal({ id, title });
            });
        });
    } catch (err) {
        console.error('Errore caricamento libri:', err);
        showToast(err.message, 'danger');
    }
}

async function editBook(id) {
    try {
        const res = await fetchJson(`/api/books/${id}`);
        if (!res.ok) throw new Error('Impossibile ottenere i dati del libro.');
        const book = await res.json();
        openBookModal(book);
        showToast('Modifica libro pronta.', 'info');
    } catch (err) {
        console.error(err);
        showToast(err.message, 'danger');
    }
}

async function saveBook() {
    const title = elements.modalTitleInput.value.trim();
    const author = elements.modalAuthorInput.value.trim();
    const description = elements.modalDescInput.value.trim();
    const epubFile = elements.modalEpubFile.files[0];
    const coverFile = elements.modalCoverFile.files[0];
    const bookId = elements.modalBookId.value;

    if (!title) {
        elements.modalMessage.textContent = 'Il titolo è obbligatorio.';
        return;
    }
    if (!bookId && !epubFile) {
        elements.modalMessage.textContent = 'Seleziona un file EPUB per caricare il libro.';
        return;
    }

    elements.modalMessage.textContent = '';
    elements.saveBookBtn.disabled = true;
    elements.saveBookBtn.textContent = 'Salvataggio...';

    try {
        const formData = new FormData();
        formData.append('title', title);
        formData.append('author', author);
        formData.append('description', description);
        if (epubFile) formData.append('bookFile', epubFile);
        if (coverFile) formData.append('coverFile', coverFile);

        const url = bookId ? `/api/admin/books/${bookId}` : '/api/admin/upload';
        const method = bookId ? 'PUT' : 'POST';
        const res = await fetchJson(url, {
            method,
            body: formData
        });

        if (!res.ok) {
            const payload = await res.json().catch(() => null);
            throw new Error(payload?.message || 'Errore durante il salvataggio.');
        }

        const successMessage = bookId ? 'Modifica salvata.' : 'Libro caricato con successo.';
        showToast(successMessage, 'success');
        closeBookModal();
        loadAdminBooks();
    } catch (err) {
        elements.modalMessage.textContent = err.message;
        showToast(err.message, 'danger');
    } finally {
        elements.saveBookBtn.disabled = false;
        elements.saveBookBtn.textContent = 'Salva';
    }
}

async function confirmDeleteBook() {
    if (!state.deleteId) return;
    try {
        const res = await fetchJson(`/api/admin/books/${state.deleteId}`, {
            method: 'DELETE'
        });
        if (!res.ok) {
            const payload = await res.json().catch(() => null);
            throw new Error(payload?.message || 'Errore durante l’eliminazione.');
        }
        showToast('Libro eliminato.', 'success');
        closeConfirmModal();
        loadAdminBooks();
    } catch (err) {
        console.error(err);
        showToast(err.message, 'danger');
    }
}

if (authToken) {
    showPanel();
} else {
    elements.adminPanel?.classList.remove('visible');
}

bindModalEvents();
