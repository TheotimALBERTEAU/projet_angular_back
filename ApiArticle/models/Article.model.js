const mongoose = require('mongoose');

// ⬅️ IMPORTANT : Importation de la connexion spécifique 'Articles'
// Ce chemin doit être correct pour que Mongoose se lie à la bonne DB.
const { articlesConn } = require('../app');

// Définition de votre schéma d'Article
const articleSchema = new mongoose.Schema({
    // Champs nécessaires pour la création/modification d'articles
    title: {
        type: String,
        required: true
    },
    desc: {
        type: String,
        required: true
    },
    author: {
        type: String,
        required: true
    },
    imgPath: {
        type: String,
        required: false // L'image peut être optionnelle
    },
    content: {
        type: String,
        required: false
    }
    // Ajoutez tous les autres champs de votre modèle ici
}, {
    // ---------------------------------------------------------------- //
    // 🎯 BLOC CRUCIAL : Configuration pour les conversions en JSON
    // ---------------------------------------------------------------- //
    toJSON: {
        // 1. virtuals: true permet d'inclure les propriétés virtuelles, y compris l'alias 'id' de '_id'.
        virtuals: true,

        // 2. transform: Cette fonction modifie l'objet avant qu'il ne soit envoyé en JSON.
        transform: (doc, ret) => {
            // Crée la propriété 'id' à partir de '_id' et la convertit en string.
            ret.id = ret._id.toString();

            // Supprime les propriétés internes de Mongoose pour le client.
            delete ret._id;
            delete ret.__v;
        }
    },
    // Ajoute automatiquement les champs 'createdAt' et 'updatedAt'.
    timestamps: true
});

// ✅ Le modèle est rattaché à la connexion 'Articles'
module.exports = articlesConn.model('Article', articleSchema);