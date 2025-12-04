const express = require('express');
const cors = require('cors');
const mongoose = require('mongoose');
const dotenv = require('dotenv'); // ⬅️ 1. Importation de dotenv

// 2. Charger les variables d'environnement depuis le fichier .env
dotenv.config();

// Initialiser l'application back
const app = express();

// ------------------------------------------------------------------ //
// ✅ CONNEXION MONGODB ATLAS (UTILISATION DE VARIABLE D'ENVIRONNEMENT)
// ------------------------------------------------------------------ //

// Récupération de l'URI complète depuis process.env
const clusterURI = process.env.MONGO_CLUSTER_URI; // ⬅️ 3. Utilisation de la variable d'environnement

// Vérification de sécurité
if (!clusterURI) {
    console.error('❌ ERREUR: MONGO_CLUSTER_URI non défini dans le fichier .env.');
    process.exit(1); // Arrêter l'application si l'URI est manquante
}

const connectionOptions = {
    retryWrites: true,
    w: 'majority',
};

// 1. Connexion à la base de données 'Users'
const usersConn = mongoose.createConnection(clusterURI + 'Users', connectionOptions);
usersConn.on('connected', () => console.log('✅ Connexion à la DB Users réussie !'));
usersConn.on('error', (err) => console.error('❌ Connexion à la DB Users échouée :', err.message));

// 2. Connexion à la base de données 'Articles'
const articlesConn = mongoose.createConnection(clusterURI + 'Articles', connectionOptions);
articlesConn.on('connected', () => console.log('✅ Connexion à la DB Articles réussie !'));
articlesConn.on('error', (err) => console.error('❌ Connexion à la DB Articles échouée :', err.message));

// Exportation des connexions pour utilisation dans les modèles et les routes
module.exports.usersConn = usersConn;
module.exports.articlesConn = articlesConn;

// ------------------------------------------------------------------ //

// Autoriser envoie JSON
app.use(express.json());
// Désactiver le CORS
app.use(cors());

// SWAGGER
// Init swagger middleware
const swaggerUI = require('swagger-ui-express');
const swaggerDocument = require('./swagger_output.json');

app.use('/api-docs', swaggerUI.serve, swaggerUI.setup(swaggerDocument));

// Injecter routes
const authRouter = require('./auth/auth-routes');
app.use(authRouter);

const articlesRouter = require('./articles/articles-routes');
app.use('/articles', articlesRouter);

const messagesRouter = require('./messages/messages-routes');
app.use('/messages', messagesRouter);

const moviesRouter = require('./movies/movie-routes');
app.use('/movies', moviesRouter);

// Démarrer le serveur avec le port 3000
app.listen(process.env.PORT, () => {
    console.log("Le serveur a démarré sur http://localhost:3000");
});