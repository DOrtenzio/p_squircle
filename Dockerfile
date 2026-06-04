# 1. Usiamo Debian (bullseye) per installare facilmente MariaDB e Node insieme
FROM node:18-bullseye

# 2. Installiamo MariaDB server e puliamo la cache per ridurre lo spazio
RUN apt-get update && \
    apt-get install -y mariadb-server && \
    rm -rf /var/lib/apt/lists/*

# 3. Impostiamo la cartella di lavoro dell'app
WORKDIR /app

# 4. Copiamo e installiamo le dipendenze Node.js
COPY package*.json ./
RUN npm install

# 5. Copiamo il resto del codice dell'applicazione
COPY . .

# 6. Creiamo la cartella per gli uploads
RUN mkdir -p uploads

# 7. Esponiamo la porta dell'applicazione
EXPOSE 3000

# 8. Script di avvio: 
#    - Inizializza i file di sistema di MariaDB
#    - Avvia il servizio MariaDB
#    - Crea il database 'books_db' e imposta la password di root
#    - Avvia l'applicazione Node.js
CMD service mariadb start && \
    mysql -e "CREATE DATABASE IF NOT EXISTS books_db;" && \
    mysql -e "ALTER USER 'root'@'localhost' IDENTIFIED BY 'secret_password';" && \
    mysql -e "FLUSH PRIVILEGES;" && \
    npm start
