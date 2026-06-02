const express = require('express');
const multer = require('multer');
const path = require('path');
const fs = require('fs');
const cors = require('cors');
const jwt = require('jsonwebtoken');
const speakeasy = require('speakeasy');
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

    if (!filePath) return res.status(400).json({ message: 'Nessun file EPUB caricato' });

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