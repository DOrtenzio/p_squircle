let allBooks = [];
let filteredBooks = [];
let currentPage = 0;
const booksPerPage = 6;

async function loadBooks() {
    try {
        const res = await fetch('/api/books');
        allBooks = await res.json();
        filteredBooks = allBooks;
        displayCurrentPage();
        updateNavigation();
    } catch (err) {
        document.getElementById('bookGrid').innerHTML = `<p class="loading-text">Errore nel caricamento dei libri.</p>`;
    }
}

function filterBooks(query) {
    const normalized = query.trim().toLowerCase();
    filteredBooks = allBooks.filter(book => {
        return [book.title, book.author, book.description].some(value =>
            value && value.toLowerCase().includes(normalized)
        );
    });
    currentPage = 0;
    displayCurrentPage();
    updateNavigation();
}

function displayCurrentPage() {
    const grid = document.getElementById('bookGrid');
    if (!grid) return;

    if (filteredBooks.length === 0) {
        grid.innerHTML = `<p class="loading-text">Nessun libro trovato. Prova con un altro termine.</p>`;
        return;
    }

    const start = currentPage * booksPerPage;
    const end = start + booksPerPage;
    const pageBooks = filteredBooks.slice(start, end);

    grid.innerHTML = pageBooks.map(book => {
        const coverContent = book.cover_url ?
            `<img src="${book.cover_url}" alt="${book.title} cover">` :
            `<div class="book-cover-fallback">${book.title.split(' ').map(word => word[0]).join('').slice(0, 3).toUpperCase()}</div>`;

        return `
            <article class="book-card">
                <div class="book-cover">${coverContent}</div>
                <div class="book-details">
                    <h3>${book.title}</h3>
                    <p class="book-author">${book.author}</p>
                    <p class="book-desc">${book.description ? book.description.substring(0, 120) + '...' : 'Descrizione non disponibile.'}</p>
                </div>
                <div class="card-actions">
                    <a href="reader.html?id=${book.id}" class="icon-button" aria-label="Apri libro">
                        <svg viewBox="0 0 24 24" aria-hidden="true" style="fill: none; stroke: currentColor; stroke-width: 2; stroke-linecap: round; stroke-linejoin: round;">
                        <path d="M2 6c0-1.1.9-2 2-2h8v16H4a2 2 0 0 1-2-2V6z"></path>
                        <path d="M22 6c0-1.1-.9-2-2-2h-8v16h8a2 2 0 0 0 2-2V6z"></path>
                        <path d="M12 4v16"></path>
                    </svg>
                    </a>
                    <button type="button" class="icon-button" data-book-id="${book.id}" aria-label="Info libro">
                        <svg viewBox="0 0 24 24" aria-hidden="true"><path d="M12 2a10 10 0 1 0 10 10A10 10 0 0 0 12 2Zm1 15h-2v-6h2Zm0-8h-2V7h2Z"/></svg>
                    </button>
                </div>
            </article>
        `;
    }).join('');
}

function updateNavigation() {
    const totalPages = Math.max(1, Math.ceil(filteredBooks.length / booksPerPage));
    const pageInfo = document.getElementById('pageInfo');
    if (pageInfo) {
        pageInfo.innerText = `${currentPage + 1} / ${totalPages}`;
    }
    document.getElementById('prevBtn').disabled = currentPage === 0;
    document.getElementById('nextBtn').disabled = currentPage >= totalPages - 1;
}

function nextBooks() {
    const totalPages = Math.ceil(filteredBooks.length / booksPerPage);
    if (currentPage < totalPages - 1) {
        currentPage++;
        displayCurrentPage();
        updateNavigation();
    }
}

function previousBooks() {
    if (currentPage > 0) {
        currentPage--;
        displayCurrentPage();
        updateNavigation();
    }
}

function setupSearch() {
    const searchInput = document.getElementById('searchInput');
    if (!searchInput) return;
    searchInput.addEventListener('input', event => {
        filterBooks(event.target.value);
    });
}

function setupModal() {
    const modal = document.getElementById('bookModal');
    const closeButton = modal && modal.querySelector('.modal-close');
    if (!modal || !closeButton) return;

    closeButton.addEventListener('click', closeBookModal);
    modal.addEventListener('click', event => {
        if (event.target === modal) closeBookModal();
    });

    document.body.addEventListener('click', event => {
        const infoButton = event.target.closest('[data-book-id]');
        if (!infoButton) return;
        const bookId = infoButton.dataset.bookId;
        showBookModal(bookId);
    });
}

function showBookModal(bookId) {
    const modal = document.getElementById('bookModal');
    const book = allBooks.find(item => item.id.toString() === bookId.toString());
    if (!modal || !book) return;

    document.getElementById('modalTitle').innerText = book.title;
    document.getElementById('modalAuthor').innerText = book.author;
    document.getElementById('modalDescription').innerText = book.description || 'Nessuna descrizione disponibile.';
    modal.classList.remove('hidden');
}

function closeBookModal() {
    const modal = document.getElementById('bookModal');
    if (!modal) return;
    modal.classList.add('hidden');
}

function setupFeatureMotion() {
    document.querySelectorAll('.feature-card').forEach(card => {
        const image = card.querySelector('.feature-image');
        const offset = Number(card.dataset.offset) || 14;

        card.addEventListener('mousemove', event => {
            const rect = card.getBoundingClientRect();
            const x = event.clientX - rect.left;
            const y = event.clientY - rect.top;
            const halfWidth = rect.width / 2;
            const halfHeight = rect.height / 2;
            const rotateY = ((x - halfWidth) / halfWidth) * offset * 0.4;
            const rotateX = ((halfHeight - y) / halfHeight) * offset * 0.4;
            const translateX = ((x - halfWidth) / halfWidth) * 6;
            const translateY = ((y - halfHeight) / halfHeight) * 6;

            card.style.transform = `perspective(1000px) rotateX(${rotateX}deg) rotateY(${rotateY}deg) translateY(-4px)`;
            card.style.boxShadow = '0 40px 95px rgba(0,0,0,0.13)';
            if (image) {
                image.style.transform = `translateX(${translateX}px) translateY(${translateY}px) scale(1.04)`;
            }
        });

        card.addEventListener('mouseleave', () => {
            card.style.transform = '';
            card.style.boxShadow = '';
            if (image) {
                image.style.transform = '';
            }
        });
    });
}

function setupScrollEffects() {
    const observer = new IntersectionObserver((entries) => {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                entry.target.classList.add('is-visible');
                observer.unobserve(entry.target);
            }
        });
    }, { threshold: 0.08, rootMargin: '0px 0px -40px 0px' });

    document.querySelectorAll('.roll-in-element').forEach(el => observer.observe(el));

    const squircle = document.querySelector('.squircle-dot');
    if (squircle) {
        const updateDot = () => {
            const drop = Math.min(window.scrollY * 0.15, 30);
            squircle.style.setProperty('--squircle-drop', `${drop}px`);
        };
        updateDot();
        window.addEventListener('scroll', updateDot, { passive: true });
    }
}

function setupHomeToolbar() {
    const toolbar = document.getElementById('homeToolbar');
    const hero = document.querySelector('.hero');
    if (!toolbar || !hero) return;

    const observer = new IntersectionObserver(([entry]) => {
        toolbar.classList.toggle('visible', !entry.isIntersecting);
    }, {
        threshold: 0,
        rootMargin: '-64px 0px 0px 0px'
    });

    observer.observe(hero);
}

window.addEventListener('load', () => {
    loadBooks();
    setupSearch();
    setupFeatureMotion();
    setupModal();
    setupScrollEffects();
    setupHomeToolbar();
});
