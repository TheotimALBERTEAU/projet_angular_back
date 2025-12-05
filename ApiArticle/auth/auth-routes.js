const express = require('express');
const router = express.Router();
const { httpApiResponse } = require('../core/http-library');
const { logger } = require('../core/logger');
const jwt = require('jsonwebtoken');
const bcrypt = require('bcrypt'); // 🎯 Importation de bcrypt
const { stringify } = require('uuid');

// ------------------------------------------------------------------ //
// ⚠️ IMPORT DU MODÈLE MONGOOSE
// ------------------------------------------------------------------ //
const User = require('../models/User.model');


// Le clé JWT
const jwtSecretKey = "AZERTY";
// Configuration pour le hachage
const saltRounds = 10; // Niveau de complexité du hachage (standard)

// Fonction utilitaire pour générer un mot de passe
function generetePassword(length) {
    const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789!@#$%^&*()_+[]{}|;:,.<>?';
    let password = '';

    for (let i = 0; i < length; i++) {
        const randomIndex = Math.floor(Math.random() * chars.length);
        password += chars[randomIndex];
    }

    return password;
}

// ================================================================== //
// ROUTES D'AUTHENTIFICATION (MODE SÉCURISÉ AVEC HACHAGE BCrypt)
// ================================================================== //

router.post("/login", async (request, response) => {
    const userRequest = request.body;

    logger.info(`The sended user request : ${JSON.stringify(userRequest)}`);

    try {
        // 1. Trouver l'utilisateur par email
        // 🎯 Nous devons demander explicitement le champ 'password' car il est exclu dans le toJSON du modèle
        const foundUser = await User.findOne({ email: userRequest.email }).select('+password');

        // Erreur : 1 - Utilisateur non trouvé
        if (!foundUser) {
            return httpApiResponse(response, "768", "Couple email/mot de passe incorrect", null);
        }

        // 2. Comparer le mot de passe reçu avec le HASH stocké
        const isMatch = await bcrypt.compare(userRequest.password, foundUser.password);

        if (!isMatch) {
            return httpApiResponse(response, "768", "Couple email/mot de passe incorrect", null);
        }

        // 3. Générer un token
        const token = jwt.sign({ email: foundUser.email }, jwtSecretKey, { expiresIn: '1h' });

        return httpApiResponse(response, "200", "Vous êtes connecté(e)", token);

    } catch (error) {
        logger.error("Erreur lors de la connexion:", error);
        return httpApiResponse(response, "500", "Erreur serveur lors de la connexion", null);
    }
});

router.post("/signup", async (request, response) => {
    const userRequest = request.body;

    try {
        // 1. Vérifier si l'utilisateur existe déjà
        const foundUser = await User.findOne({ email: userRequest.email });

        // Erreur : Can't create user with same email
        if (foundUser) {
            return httpApiResponse(response, "712", "L'email n'est plus valide (déjà utilisé)", null);
        }

        // Erreur : Password confirmation
        if (userRequest.password != userRequest.passwordConfirm) {
            return httpApiResponse(response, "712", "Le mot de passe de confirmation n'est pas identique", null);
        }

        // Erreur : Les champs inexistant
        // 🎯 CHANGEMENT ICI : 'username' est retiré de la vérification front-end.
        // Nous conservons 'pseudo' qui sera utilisé comme 'username' dans la BDD.
        const fields = ['email', 'password', 'pseudo', 'cityCode', 'city', 'phone'];
        const fieldSuccess = fields.every(field => userRequest.hasOwnProperty(field));
        if (!fieldSuccess) {
            return httpApiResponse(response, "713", "Il manque un ou des champs requis", null);
        }

        // 2. 🎯 HACHAGE du mot de passe
        const hashedPassword = await bcrypt.hash(userRequest.password, saltRounds);

        // 3. Créer le nouvel utilisateur Mongoose
        let newUser = {};
        fields.forEach(field => {
            if (field in userRequest) {
                newUser[field] = userRequest[field];
            }
        });

        // 4. Remplacer le mot de passe en clair par le HASH
        newUser.password = hashedPassword;

        // 🎯 AJOUT CRUCIAL : Si le modèle Mongoose nécessite 'username',
        // on lui assigne la valeur de 'pseudo' pour satisfaire le schéma.
        // Si vous avez corrigé votre modèle pour utiliser 'pseudo', cette ligne est optionnelle
        // mais sécurise l'opération si le modèle User.model.js est resté sur 'username'.
        newUser.username = userRequest.pseudo;

        // 5. Insérer dans la BDD
        const userToSave = new User(newUser);
        const savedUser = await userToSave.save();

        // 6. Nettoyer l'objet avant de le retourner
        // Grâce au toJSON du modèle, 'password' est déjà exclu.
        return httpApiResponse(response, "200", "Inscription effectuée avec succès", savedUser);

    } catch (error) {
        logger.error("Erreur lors de l'inscription:", error);
        return httpApiResponse(response, "500", `Erreur serveur lors de l'inscription: ${error.message}`, null);
    }
});

router.post("/reset-password", async (request, response) => {
    const userRequest = request.body;

    try {
        // 1. Trouver l'utilisateur par email
        // Ici, pas besoin de .select('+password') car on ne compare pas
        let foundUser = await User.findOne({ email: userRequest.email });

        // 2. Si non trouvé, on renvoie quand même succès pour des raisons de sécurité
        if (!foundUser) {
            return httpApiResponse(response, "200", "Si l'utilisateur existe, le mot de passe a été réinitialisé avec succès", null);
        }

        // 3. Générer le nouveau mot de passe
        const newPasswordClearText = generetePassword(12); // Utiliser une longueur raisonnable (12)

        // 4. 🎯 HACHER le nouveau mot de passe
        const newHashedPassword = await bcrypt.hash(newPasswordClearText, saltRounds);

        // 5. Mettre à jour dans la BDD
        foundUser.password = newHashedPassword;
        await foundUser.save();

        // 6. Retourner le nouveau mot de passe temporaire (en texte clair pour l'utilisateur)
        return httpApiResponse(response, "200", "Mot de passe réinitialisé avec succès (un e-mail serait envoyé)", newPasswordClearText);

    } catch (error) {
        logger.error("Erreur lors de la réinitialisation du mot de passe:", error);
        return httpApiResponse(response, "500", "Erreur serveur lors de la réinitialisation", null);
    }
});

router.get("/check", (request, response) => {
    // Si token null alors erreur
    if (request.headers.authorization == undefined || !request.headers.authorization) {
        return response.json({ message: "Token null" });
    }

    // Extraire le token (qui est bearer)
    const token = request.headers.authorization.substring(7);

    // par defaut le result est null
    let result = null;

    // Si reussi à générer le token sans crash
    try {
        result = jwt.verify(token, jwtSecretKey);
    } catch {
        // Le token est invalide/expiré
    }

    // Si result null donc token incorrect
    if (!result) {
        return response.json({ message: "token pas bon ou déconnecté(e)" });
    }

    return response.json({ message: "Vous êtes toujours connecté(e)" });
});

router.get("/infos-user", async (request, response) => {

    // 1. Vérification du Token
    if (!request.headers.authorization) {
        return httpApiResponse(response, "401", "Token manquant. Non autorisé.", null);
    }

    const token = request.headers.authorization.substring(7);
    let decodedToken = null;

    try {
        // 2. Décoder le Token pour obtenir l'e-mail
        decodedToken = jwt.verify(token, jwtSecretKey);
    } catch (error) {
        // Le token est invalide, expiré ou corrompu
        return httpApiResponse(response, "401", "Token invalide ou expiré.", null);
    }

    // 3. Récupération de l'e-mail à partir du token décodé
    const userEmailFromToken = decodedToken.email;

    try {
        // 4. Recherche de l'utilisateur dans la BDD
        // Pas besoin du mot de passe ici, donc pas de .select('+password')
        const foundUser = await User.findOne({ email: userEmailFromToken });

        if (!foundUser) {
            return httpApiResponse(response, "404", "Utilisateur non trouvé.", null);
        }

        // 5. Préparer les informations à retourner
        // Le .toJSON() du modèle s'applique ici et supprime le mot de passe
        return httpApiResponse(response, "200", "Informations utilisateur récupérées avec succès.", foundUser);

    } catch (error) {
        logger.error("Erreur lors de la récupération des infos utilisateur:", error);
        return httpApiResponse(response, "500", "Erreur serveur lors de la récupération des informations utilisateur.", null);
    }
});

router.get("/healthz", (req, res) => {
    res.status(200).send({ status: "OK" });
});

// Exporter le router
module.exports = router;