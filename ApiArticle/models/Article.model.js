const mongoose = require('mongoose');
// ⬅️ IMPORTANT : Importation de la connexion spécifique 'Articles'
const { articlesConn } = require('../app');

// Définition de votre schéma d'Article (exemple)
const articleSchema = new mongoose.Schema({
    // Adaptez ceci à votre schéma réel
    title: { type: String, required: true },
    author: { type: String, required: true },
    content: { type: String },
    // ... autres champs
}, {
    timestamps: true
});

// ✅ Le modèle est rattaché à la connexion 'Articles'
module.exports = articlesConn.model('Article', articleSchema);