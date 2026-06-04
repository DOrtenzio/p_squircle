const express = require('express');
const multer = require('multer');
const path = require('path');
const fs = require('fs');
const cors = require('cors');
const jwt = require('jsonwebtoken');
const speakeasy = require('speakeasy');
const PDFParser = require('pdf-parse');
const PDFDocument = require('pdfkit');
const JSZip = require('jszip');
const xml2js = require('xml2js');
const { htmlToText } = require('html-to-text');
const db = require('./db');
require('dotenv').config();

const app = express();
app.use(cors());
app.use(express.json());
app.use(express.static('public'));
app.use('/uploads', express.static('uploads'));

// Ensure upload dir exists
if (!fs.existsSync('./uploads')) fs.mkdirSync('./uploads');

// Multer Config
const storage = multer.diskStorage({
    destination: './uploads/',
    filename: (req, file, cb) => {
        cb(null, Date.now() + path.extname(file.originalname));
    }
});
const upload = multer({ storage: storage });
const uploadFields = upload.fields([
    { name: 'bookFile', maxCount: 1 },
    { name: 'coverFile', maxCount: 1 }
]);

function sanitizeFileName(name) {
    return name ? name.replace(/[^a-zA-Z0-9-_\. ]/g, '_').trim() : 'download';
}

async function sendFileDownload(res, filePath, filename) {
    if (!fs.existsSync(filePath)) {
        return res.status(404).json({ message: 'File non trovato.' });
    }
    res.download(filePath, filename);
}

async function parseEpubContents(filePath) {
    const raw = await fs.promises.readFile(filePath);
    const zip = await JSZip.loadAsync(raw);
    const containerXml = await zip.file('META-INF/container.xml').async('string');
    const containerJson = await xml2js.parseStringPromise(containerXml);
    const rootfilePath = containerJson.container.rootfiles[0].rootfile[0].$['full-path'];
    const opfXml = await zip.file(rootfilePath).async('string');
    const opfJson = await xml2js.parseStringPromise(opfXml);
    const manifest = opfJson.package.manifest[0].item || [];
    const manifestMap = manifest.reduce((acc, item) => {
        acc[item.$.id] = item.$;
        return acc;
    }, {});
    const spine = (opfJson.package.spine[0].itemref || []).map(itemref => itemref.$.idref);
    const baseDir = path.posix.dirname(rootfilePath);
    const chapters = [];

    for (const idref of spine) {
        const item = manifestMap[idref];
        if (!item) continue;
        const href = item.href;
        const fullPath = path.posix.join(baseDir, href);
        const file = zip.file(fullPath) || zip.file(href);
        if (!file) continue;
        const html = await file.async('string');
        const text = htmlToText(html, {
            wordwrap: 130,
            selectors: [
                { selector: 'img', format: 'skip' },
                { selector: 'a', options: { ignoreHref: true } }
            ]
        }).trim();
        if (text) {
            chapters.push({ title: path.basename(href, path.extname(href)), text });
        }
    }

    return chapters.length ? chapters : [{ title: 'Contenuto EPUB', text: 'Il contenuto non è stato analizzato correttamente.' }];
}

async function convertEpubToPdf(epubPath) {
    const chapters = await parseEpubContents(epubPath);
    const doc = new PDFDocument({ autoFirstPage: false, margin: 50 });
    const buffers = [];

    return new Promise((resolve, reject) => {
        doc.on('data', chunk => buffers.push(chunk));
        doc.on('end', () => resolve(Buffer.concat(buffers)));
        doc.on('error', reject);

        chapters.forEach((chapter) => {
            doc.addPage();
            doc.fontSize(18).fillColor('#111').text(chapter.title, { underline: true, paragraphGap: 10 });
            doc.moveDown(0.5);
            doc.fontSize(12).fillColor('#222').text(chapter.text, { lineGap: 4 });
        });

        doc.end();
    });
}

function createEpubFile(pdfText, title) {
    const safeTitle = sanitizeFileName(title);
    const contentXhtml = `<?xml version="1.0" encoding="utf-8"?>\n<html xmlns="http://www.w3.org/1999/xhtml">\n  <head><title>${safeTitle}</title></head>\n  <body>\n    <h1>${safeTitle}</h1>\n    ${pdfText.split(/\r?\n/).filter(Boolean).map(line => `<p>${line.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;')}</p>`).join('\n    ')}\n  </body>\n</html>`;
    const zip = new JSZip();
    zip.file('mimetype', 'application/epub+zip', { compression: 'STORE' });
    zip.folder('META-INF').file('container.xml', `<?xml version="1.0"?>\n<container version="1.0" xmlns="urn:oasis:names:tc:opendocument:xmlns:container">\n  <rootfiles>\n    <rootfile full-path="OEBPS/content.opf" media-type="application/oebps-package+xml"/>\n  </rootfiles>\n</container>`);
    zip.folder('OEBPS').file('content.opf', `<?xml version="1.0" encoding="UTF-8"?>\n<package xmlns="http://www.idpf.org/2007/opf" unique-identifier="bookid" version="2.0">\n  <metadata xmlns:dc="http://purl.org/dc/elements/1.1/">\n    <dc:title>${safeTitle}</dc:title>\n    <dc:language>it</dc:language>\n    <dc:identifier id="bookid">urn:uuid:${Date.now()}</dc:identifier>\n  </metadata>\n  <manifest>\n    <item id="chapter1" href="text/chapter1.xhtml" media-type="application/xhtml+xml"/>\n  </manifest>\n  <spine toc="ncx">\n    <itemref idref="chapter1"/>\n  </spine>\n</package>`);
    zip.folder('OEBPS').file('toc.ncx', `<?xml version="1.0" encoding="UTF-8"?>\n<ncx xmlns="http://www.daisy.org/z3986/2005/ncx/" version="2005-1">\n  <head>\n    <meta name="dtb:uid" content="urn:uuid:${Date.now()}"/>\n    <meta name="dtb:depth" content="1"/>\n  </head>\n  <docTitle><text>${safeTitle}</text></docTitle>\n  <navMap>\n    <navPoint id="navPoint-1" playOrder="1">\n      <navLabel><text>${safeTitle}</text></navLabel>\n      <content src="text/chapter1.xhtml"/>\n    </navPoint>\n  </navMap>\n</ncx>`);
    zip.folder('OEBPS').folder('text').file('chapter1.xhtml', contentXhtml);
    return zip.generateAsync({ type: 'nodebuffer', compression: 'DEFLATE' });
}

async function convertPdfToEpub(pdfPath, title) {
    const fileData = await fs.promises.readFile(pdfPath);
    const data = await PDFParser(fileData);
    const rawText = data.text || '';
    return await createEpubFile(rawText, title || 'Libro convertito');
}

// --- PUBLIC ROUTES ---

// Get All Books
app.get('/api/books', async (req, res) => {
    try {
        const [rows] = await db.query('SELECT * FROM books ORDER BY created_at DESC');
        res.json(rows);
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

app.get('/ping', (req, res) => {
  res.status(200).send('OK');
});


// Get Single Book
app.get('/api/books/:id', async (req, res) => {
    try {
        const [rows] = await db.query('SELECT * FROM books WHERE id = ?', [req.params.id]);
        if (rows.length === 0) return res.status(404).json({ message: 'Book not found' });
        res.json(rows[0]);
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

app.get('/api/books/:id/preview', async (req, res) => {
    try {
        const [rows] = await db.query('SELECT * FROM books WHERE id = ?', [req.params.id]);
        if (rows.length === 0) return res.status(404).json({ message: 'Book not found' });

        const book = rows[0];
        const sourcePath = book.file_path;
        if (!sourcePath) return res.status(404).json({ message: 'File non trovato.' });

        const extension = path.extname(sourcePath).toLowerCase();
        const resolvedPath = path.resolve(sourcePath);

        if (extension === '.epub') {
            const chapters = await parseEpubContents(resolvedPath);
            return res.json({ format: 'epub', chapters });
        }

        if (extension === '.pdf') {
            const data = await PDFParser(await fs.promises.readFile(resolvedPath));
            const text = (data.text || '').trim().slice(0, 24000);
            return res.json({ format: 'pdf', text });
        }

        return res.status(400).json({ message: 'Preview non disponibile per questo formato.' });
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

app.get('/api/books/:id/download', async (req, res) => {
    const format = (req.query.format || 'original').toLowerCase();
    try {
        const [rows] = await db.query('SELECT * FROM books WHERE id = ?', [req.params.id]);
        if (rows.length === 0) return res.status(404).json({ message: 'Book not found' });
        const book = rows[0];
        const sourcePath = book.file_path;
        if (!sourcePath) return res.status(404).json({ message: 'File non trovato.' });
        const extension = path.extname(sourcePath).toLowerCase();
        const resolvedPath = path.resolve(sourcePath);
        const downloadName = sanitizeFileName(book.title || path.basename(sourcePath, extension));

        if (format === 'original') {
            return sendFileDownload(res, resolvedPath, `${downloadName}${extension}`);
        }

        if (format === 'pdf' && extension === '.pdf') {
            return sendFileDownload(res, resolvedPath, `${downloadName}.pdf`);
        }

        if (format === 'epub' && extension === '.epub') {
            return sendFileDownload(res, resolvedPath, `${downloadName}.epub`);
        }

        if (format === 'pdf' && extension === '.epub') {
            const pdfBuffer = await convertEpubToPdf(resolvedPath);
            res.setHeader('Content-Type', 'application/pdf');
            res.setHeader('Content-Disposition', `attachment; filename="${downloadName}.pdf"`);
            return res.send(pdfBuffer);
        }

        if (format === 'epub' && extension === '.pdf') {
            const epubBuffer = await convertPdfToEpub(resolvedPath, book.title || path.basename(sourcePath, extension));
            res.setHeader('Content-Type', 'application/epub+zip');
            res.setHeader('Content-Disposition', `attachment; filename="${downloadName}.epub"`);
            return res.send(epubBuffer);
        }

        return res.status(400).json({ message: 'Formato di download non supportato per questo libro.' });
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

// Generate Anti-Bot Challenge
app.get('/api/challenge', (req, res) => {
    const num1 = Math.floor(Math.random() * 10);
    const num2 = Math.floor(Math.random() * 10);
    const id = Math.random().toString(36).substring(7);
    
    // Store answer temporarily
    db.query('INSERT INTO bot_challenges (id, answer) VALUES (?, ?)', [id, (num1 + num2).toString()]);
    
    res.json({ id, question: `${num1} + ${num2} = ?` });
});

// Post Anonymous Comment
app.post('/api/comments', async (req, res) => {
    const { book_id, content, challenge_id, answer } = req.body;

    if (!book_id || !content || !challenge_id || !answer) {
        return res.status(400).json({ message: 'Missing fields' });
    }

    try {
        // Verify Bot Challenge
        const [rows] = await db.query('SELECT * FROM bot_challenges WHERE id = ? AND answer = ?', [challenge_id, answer.toString()]);
        
        if (rows.length === 0) {
            return res.status(403).json({ message: 'Bot verification failed' });
        }

        // Delete used challenge
        await db.query('DELETE FROM bot_challenges WHERE id = ?', [challenge_id]);

        // Insert Comment
        await db.query('INSERT INTO comments (book_id, content) VALUES (?, ?)', [book_id, content]);
        res.json({ message: 'Comment added' });
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

// Get Comments
app.get('/api/comments/:book_id', async (req, res) => {
    try {
        const [rows] = await db.query('SELECT * FROM comments WHERE book_id = ? ORDER BY created_at DESC', [req.params.book_id]);
        res.json(rows);
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

// --- ADMIN / DASHBOARD ROUTES (TOTP PROTECTED) ---

const JWT_SECRET = process.env.JWT_SECRET || 'supersecretjwt';
const ADMIN_PSK = process.env.ADMIN_PSK;
const DASHBOARD_SECRET_PATH = process.env.DASHBOARD_SECRET_PATH || '/admin';
const ADMIN_TOTP_SECRET = process.env.ADMIN_TOTP_SECRET;

// Login: Verify PSK + TOTP and Issue JWT (No QR code anymore)
app.post('/api/admin/login', async (req, res) => {
    const { psk, token } = req.body;
    
    if (psk !== ADMIN_PSK) {
        return res.status(401).json({ message: 'Invalid credentials' });
    }
    
    if (!ADMIN_TOTP_SECRET) {
        return res.status(500).json({ message: 'TOTP not configured. Please set ADMIN_TOTP_SECRET in .env' });
    }

    const verified = speakeasy.totp.verify({
        secret: ADMIN_TOTP_SECRET,
        encoding: 'base32',
        token: token,
        window: 1
    });

    if (verified) {
        const jwtToken = jwt.sign({ role: 'admin' }, JWT_SECRET, { expiresIn: '1h' });
        res.json({ token: jwtToken, message: 'Login successful' });
    } else {
        res.status(401).json({ message: 'Invalid PSK or TOTP code' });
    }
});

// Serve Dashboard HTML on Secret Path
app.get(DASHBOARD_SECRET_PATH, (req, res) => {
    res.sendFile(path.join(__dirname, 'public', 'dashboard.html'));
});

// Middleware to protect Admin Routes
const verifyAdmin = (req, res, next) => {
    const token = req.headers['authorization'];
    if (!token) return res.status(403).json({ message: 'No token provided' });
    
    try {
        const decoded = jwt.verify(token.split(' ')[1], JWT_SECRET);
        if (decoded.role !== 'admin') throw new Error('Not admin');
        req.user = decoded;
        next();
    } catch (err) {
        res.status(401).json({ message: 'Invalid Token' });
    }
};

// Upload Book (Admin Only)
app.post('/api/admin/upload', verifyAdmin, uploadFields, async (req, res) => {
    const { title, author, description } = req.body;
    const bookFile = req.files?.bookFile?.[0];
    const coverFile = req.files?.coverFile?.[0];
    const filePath = bookFile ? bookFile.path : null;
    const coverUrl = coverFile ? coverFile.path : null;

    if (!filePath) return res.status(400).json({ message: 'Nessun file EPUB o PDF caricato' });

    try {
        const [result] = await db.query(
            'INSERT INTO books (title, author, description, file_path, cover_url) VALUES (?, ?, ?, ?, ?)',
            [title, author, description, filePath, coverUrl]
        );
        res.json({ message: 'Book uploaded', id: result.insertId });
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

// Update Book (Admin Only)
app.put('/api/admin/books/:id', verifyAdmin, uploadFields, async (req, res) => {
    const { title, author, description } = req.body;
    const bookFile = req.files?.bookFile?.[0];
    const coverFile = req.files?.coverFile?.[0];

    try {
        const [rows] = await db.query('SELECT * FROM books WHERE id = ?', [req.params.id]);
        if (rows.length === 0) return res.status(404).json({ message: 'Book not found' });

        const book = rows[0];
        const updates = [];
        const values = [];

        if (title !== undefined) {
            updates.push('title = ?');
            values.push(title);
        }
        if (author !== undefined) {
            updates.push('author = ?');
            values.push(author);
        }
        if (description !== undefined) {
            updates.push('description = ?');
            values.push(description);
        }
        if (bookFile) {
            updates.push('file_path = ?');
            values.push(bookFile.path);
            if (book.file_path && fs.existsSync(book.file_path)) {
                try { fs.unlinkSync(book.file_path); } catch (err) { console.warn('Cannot remove old file:', err.message); }
            }
        }
        if (coverFile) {
            updates.push('cover_url = ?');
            values.push(coverFile.path);
            if (book.cover_url && !book.cover_url.startsWith('http') && fs.existsSync(book.cover_url)) {
                try { fs.unlinkSync(book.cover_url); } catch (err) { console.warn('Cannot remove old cover:', err.message); }
            }
        }

        if (updates.length === 0) {
            return res.status(400).json({ message: 'Nessuna modifica rilevata' });
        }

        values.push(req.params.id);
        const query = `UPDATE books SET ${updates.join(', ')} WHERE id = ?`;
        await db.query(query, values);
        res.json({ message: 'Book updated' });
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

// Delete Book (Admin Only)
app.delete('/api/admin/books/:id', verifyAdmin, async (req, res) => {
    try {
        await db.query('DELETE FROM books WHERE id = ?', [req.params.id]);
        res.json({ message: 'Book deleted' });
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`);
});