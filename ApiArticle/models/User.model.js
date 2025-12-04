const mongoose = require('mongoose');
// ⬅️ IMPORTANT : Importation de la connexion spécifique 'Users' depuis app.js
const { usersConn } = require('../app');

// Définition du schéma de l'utilisateur basé sur la structure fournie
const userSchema = mongoose.Schema({
    // L'email doit être unique pour l'authentification et l'inscription
    email: {
        type: String,
        required: true,
        unique: true,
        match: [/.+@.+\..+/, "Veuillez entrer une adresse email valide"]
    },
    // Le mot de passe sera stocké (haché par bcrypt)
    // ⚠️ CONSEIL : Ajoutez `select: false` pour la sécurité.
    password: {
        type: String,
        required: true
    },
    // Le pseudo doit être unique
    pseudo: {
        type: String,
        required: true,
        unique: true
    },
    cityCode: {
        type: String,
        required: true
    },
    city: {
        type: String,
        required: true
    },
    phone: {
        type: String,
        required: true
    }
}, {
    // Conservation des timestamps (createdAt et updatedAt) pour le suivi des dates
    timestamps: true
});

// Création et exportation du Modèle. Mongoose utilisera la collection 'users'.
// ✅ Utilisation de usersConn.model pour attacher ce modèle à la DB 'Users'.
module.exports = usersConn.model('User', userSchema);