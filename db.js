const mysql = require('mysql2/promise');
require('dotenv').config();

const pool = mysql.createPool({
    host: process.env.DB_HOST || 'localhost',
    user: process.env.DB_USER || 'root',
    password: process.env.DB_PASSWORD || 'secret_password',
    database: process.env.DB_NAME || 'books_db',
    waitForConnections: true,
    connectionLimit: 10,
    queueLimit: 0
});

// Initialize Tables
async function initDB() {
    const connection = await pool.getConnection();
    try {
        // Books Table
        await connection.query(`
            CREATE TABLE IF NOT EXISTS books (
                id INT AUTO_INCREMENT PRIMARY KEY,
                title VARCHAR(255) NOT NULL,
                author VARCHAR(255) NOT NULL,
                cover_url VARCHAR(255),
                file_path VARCHAR(255) NOT NULL,
                description TEXT,
                created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
            )
        `);

        // Comments Table (Anonymous)
        await connection.query(`
            CREATE TABLE IF NOT EXISTS comments (
                id INT AUTO_INCREMENT PRIMARY KEY,
                book_id INT,
                content TEXT NOT NULL,
                created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
                FOREIGN KEY (book_id) REFERENCES books(id) ON DELETE CASCADE
            )
        `);
        
        // Simple Anti-Bot Challenge Store
        await connection.query(`
            CREATE TABLE IF NOT EXISTS bot_challenges (
                id VARCHAR(255) PRIMARY KEY,
                answer VARCHAR(255) NOT NULL,
                expires_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
            )
        `);

        /*
        // Add test books if table is empty
        const [books] = await connection.query('SELECT COUNT(*) as count FROM books');
        if(books[0].count === 0) {
            const testBooks = [
                ['Pride and Prejudice', 'Jane Austen', 'https://picsum.photos/seed/pride/400/250?grayscale', 'uploads/test.pdf', 'A romantic novel set in Georgian England, following Elizabeth Bennet as she navigates love and social expectations.'],
                ['The Great Gatsby', 'F. Scott Fitzgerald', 'https://picsum.photos/seed/gatsby/400/250?grayscale', 'uploads/test.pdf', 'A masterpiece of American literature exploring wealth, love, and the American Dream in the Jazz Age.'],
                ['To Kill a Mockingbird', 'Harper Lee', 'https://picsum.photos/seed/mockingbird/400/250?grayscale', 'uploads/test.pdf', 'A gripping tale of racial injustice and childhood innocence in the American South.'],
                ['1984', 'George Orwell', 'https://picsum.photos/seed/1984/400/250?grayscale', 'uploads/test.pdf', 'A dystopian novel depicting a totalitarian society where truth is manipulated and individuality is suppressed.'],
                ['Jane Eyre', 'Charlotte Brontë', 'https://picsum.photos/seed/janeeyre/400/250?grayscale', 'uploads/test.pdf', 'A Gothic romance following the passionate life of an orphaned governess with an indomitable spirit.'],
                ['Wuthering Heights', 'Emily Brontë', 'https://picsum.photos/seed/wuthering/400/250?grayscale', 'uploads/test.pdf', 'A dark, passionate tale of love and revenge set on the Yorkshire moors.'],
                ['The Catcher in the Rye', 'J.D. Salinger', 'https://picsum.photos/seed/catcher/400/250?grayscale', 'uploads/test.pdf', 'A controversial novel following teenager Holden Caulfield through New York City.'],
                ['Moby Dick', 'Herman Melville', 'https://picsum.photos/seed/mobydick/400/250?grayscale', 'uploads/test.pdf', 'An epic adventure of Captain Ahab\'s obsessive quest for the white whale.'],
                ['Frankenstein', 'Mary Shelley', 'https://picsum.photos/seed/frankenstein/400/250?grayscale', 'uploads/test.pdf', 'A groundbreaking science fiction novel exploring the consequences of scientific ambition.'],
                ['The Hobbit', 'J.R.R. Tolkien', 'https://picsum.photos/seed/hobbit/400/250?grayscale', 'uploads/test.pdf', 'A fantasy adventure following Bilbo Baggins as he embarks on an unexpected journey.']
            ];

            for(const book of testBooks) {
                await connection.query(
                    'INSERT INTO books (title, author, cover_url, file_path, description) VALUES (?, ?, ?, ?, ?)',
                    book
                );
            }
            console.log("Test books added to database");
        }

        */

        console.log("Database initialized");
    } catch (err) {
        console.error("DB Init Error:", err);
    } finally {
        connection.release();
    }
}

initDB();

module.exports = pool;