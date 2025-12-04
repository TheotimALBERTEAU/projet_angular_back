const express = require('express');
const router = express.Router();
const { httpApiResponse } = require('../core/http-library');
const { logger } = require('../core/logger');
// const { v4: uuidv4 } = require('uuid');
const jwt = require('jsonwebtoken');
// ❌ Retrait de la ligne : const bcrypt = require('bcrypt');
const { stringify } = require('uuid');

// ------------------------------------------------------------------ //
// ⚠️ IMPORT DU MODÈLE MONGOOSE
// ------------------------------------------------------------------ //
const User = require('../models/User.model');


// Le clé JWT
const jwtSecretKey = "AZERTY";

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
// ROUTES D'AUTHENTIFICATION (MODE INSEECUR - SANS HACHAGE)
// ================================================================== //

router.post("/login", async (request, response) => {
    const userRequest = request.body;

    logger.info(`The sended user request : ${JSON.stringify(userRequest)}`);

    try {
        // 1. Trouver l'utilisateur par email
        const foundUser = await User.findOne({ email: userRequest.email });

        // Erreur : 1 - Utilisateur non trouvé
        if (!foundUser) {
            return httpApiResponse(response, "768", "Couple email/mot de passe incorrect", null);
        }

        // 2. Comparer le mot de passe en texte clair (⚠️ INSECURE)
        const passwordMatch = userRequest.password === foundUser.password;

        if (!passwordMatch) {
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
        const fields = ['email', 'password', 'pseudo', 'cityCode', 'city', 'phone']
        const fieldSuccess = fields.every(field => userRequest.hasOwnProperty(field));
        if (!fieldSuccess) {
            return httpApiResponse(response, "713", "Il manque un ou des champs requis", null);
        }

        // 2. ❌ Retrait du hachage du mot de passe (stockage en texte clair - ⚠️ INSECURE)

        // 3. Créer le nouvel utilisateur Mongoose
        let newUser = {};
        fields.forEach(field => {
            if (field in userRequest) {
                newUser[field] = userRequest[field];
            }
        });
        // Le mot de passe est stocké tel quel

        // 4. Insérer dans la BDD
        const userToSave = new User(newUser);
        const savedUser = await userToSave.save();

        // 5. Nettoyer l'objet avant de le retourner
        // Supprimer le mot de passe de la réponse
        const responseUser = savedUser.toObject();
        delete responseUser.password;

        return httpApiResponse(response, "200", "Inscription effectuée avec succès", responseUser);

    } catch (error) {
        logger.error("Erreur lors de l'inscription:", error);
        return httpApiResponse(response, "500", `Erreur serveur lors de l'inscription: ${error.message}`, null);
    }
});

router.post("/reset-password", async (request, response) => {
    const userRequest = request.body;

    try {
        // 1. Trouver l'utilisateur par email
        let foundUser = await User.findOne({ email: userRequest.email });

        // 2. Si non trouvé, on renvoie quand même succès pour des raisons de sécurité
        if (!foundUser) {
            return httpApiResponse(response, "200", "Si l'utilisateur existe, le mot de passe a été réinitialisé avec succès", null);
        }

        // 3. Générer le nouveau mot de passe
        const newPassword = generetePassword(8);

        // 4. Mettre à jour dans la BDD (avec le mot de passe en texte clair - ⚠️ INSECURE)
        foundUser.password = newPassword;
        await foundUser.save();

        // 5. Retourner le nouveau mot de passe temporaire
        return httpApiResponse(response, "200", "Mot de passe réinitialisé avec succès (un e-mail serait envoyé)", newPassword);

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
        const foundUser = await User.findOne({ email: userEmailFromToken });

        if (!foundUser) {
            return httpApiResponse(response, "404", "Utilisateur non trouvé.", null);
        }

        // 5. Préparer les informations à retourner
        const userInfo = foundUser.toObject();
        delete userInfo.password; // Supprimer le mot de passe (même s'il est en clair)

        return httpApiResponse(response, "200", "Informations utilisateur récupérées avec succès.", userInfo);

    } catch (error) {
        logger.error("Erreur lors de la récupération des infos utilisateur:", error);
        return httpApiResponse(response, "500", "Erreur serveur lors de la récupération des informations utilisateur.", null);
    }
});

// Exporter le router
module.exports = router;