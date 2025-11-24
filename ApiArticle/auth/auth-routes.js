const express = require('express');
const router = express.Router();
const { httpApiResponse } = require('../core/http-library');
const { logger } = require('../core/logger');
const { v4: uuidv4 } = require('uuid');

const jwt = require('jsonwebtoken');
const { stringify } = require('uuid');

// Le clé
const jwtSecretKey = "AZERTY";

// Simulation de données en mémoire
let DB_USERS = [
    { email: 'isaac@gmail.com', password: 'password', pseudo: 'Isaac', cityCode: '44300', city: 'Nantes', phone: '0650660000' },
    { email: 'tata@gmail.com', password: '123456', pseudo: 'Tata', cityCode: '44300', city: 'TataLand', phone: '0650660000' },
    { email: 'toto@gmail.com', password: '12345', pseudo: 'Toto', cityCode: '44300', city: 'NutellaCrevette', phone: '0650660000' },
    { email: 'theotim.alberteau@supdevinci-edu.fr', password: 'test', pseudo: 'test', cityCode: '44300', city: 'NutellaCrevette', phone: '0650660000' },
];


function generetePassword(length) {
    const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789!@#$%^&*()_+[]{}|;:,.<>?';
    let password = '';

    for (let i = 0; i < length; i++) {
        const randomIndex = Math.floor(Math.random() * chars.length);
        password += chars[randomIndex];
    }

    return password;
}

router.post("/login", async (request, response) => {

    const userRequest = request.body;

    logger.info(`The sended user request : ${JSON.stringify(userRequest)}`);

    const foundUser = DB_USERS.find(user => user.email === userRequest.email && user.password === userRequest.password);

    // Erreur : 1
    if (!foundUser) {
        return httpApiResponse(response, "768", "Couple email/mot de passe incorrect", null);
    }

    // générer un token
    const token = await jwt.sign({ email: "toto@gmail.com" }, jwtSecretKey, { expiresIn: '1h' });

    return httpApiResponse(response, "200", "Vous êtes connecté(e)", token);
});

router.post("/signup", async (request, response) => {

    const userRequest = request.body;

    const foundUser = DB_USERS.find(user => user.email === userRequest.email);

    // Erreur : Can't create user with same email
    if (foundUser) {
        return httpApiResponse(response, "712", "L'email n'est plus valide", null);
    }

    // Erreur : Password confirmation
    if (userRequest.password != userRequest.passwordConfirm) {
        return httpApiResponse(response, "712", "Le mot de passe de confirmation n'est pas identique", null);
    }

    // Erreur : Les champs inexistant
    const fields = ['email', 'password', 'pseudo', 'cityCode', 'city', 'phone']
    const fieldSuccess = fields.every(field => userRequest.hasOwnProperty(field));
    if (!fieldSuccess) {
        return httpApiResponse(response, "713", "Il manque un ou des champs", null);
    }

    // Add user
    // -- keep only valid fields
    let newUser = {};
    fields.forEach(field => {
        if (field in userRequest) {
            newUser[field] = userRequest[field];
        }
    });
    // -- insert
    DB_USERS.push(newUser);

    return httpApiResponse(response, "200", "Inscription effectuée avec succès", newUser);
});

router.post("/reset-password", async (request, response) => {

    const userRequest = request.body;

    let foundUser = DB_USERS.find(user => user.email === userRequest.email);

    const newPassword = generetePassword(8);

    // Reset password
    if (foundUser) {
        foundUser.password = newPassword
    }

    return httpApiResponse(response, "200", "Mot de passe réinitialisé avec succès", newPassword);
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
    }

    // Si result null donc token incorrect
    if (!result) {
        return response.json({ message: "token pas bon ou déconnecté(e)" });
    }

    return response.json({ message: "Vous êtes toujours connecté(e)" });
});

// Après la route /check

router.get("/infos-user", (request, response) => {

    // 1. Vérification du Token
    if (!request.headers.authorization) {
        return httpApiResponse(response, "401", "Token manquant. Non autorisé.", null);
    }

    const token = request.headers.authorization.substring(7);
    let decodedToken = null;
    const jwtSecretKey = "AZERTY"; // Assurez-vous que cette clé est accessible

    try {
        // 2. Décoder le Token pour obtenir l'e-mail
        decodedToken = jwt.verify(token, jwtSecretKey);
    } catch (error) {
        // Le token est invalide, expiré ou corrompu
        // ... (logger.error nécessite d'importer logger)
        return httpApiResponse(response, "401", "Token invalide ou expiré.", null);
    }

    // 3. Récupération de l'e-mail à partir du token décodé
    const userEmailFromToken = decodedToken.email;

    // 4. Recherche de l'utilisateur dans la base de données (simulation)
    const foundUser = DB_USERS.find(user => user.email === userEmailFromToken);

    if (!foundUser) {
        return httpApiResponse(response, "404", "Utilisateur non trouvé.", null);
    }

    // 5. MODIFICATION : Retourner TOUTES les propriétés de foundUser
    //    Ceci inclut : email, password, pseudo, cityCode, city et phone.
    const userInfo = foundUser; // On retourne l'objet utilisateur complet

    return httpApiResponse(response, "200", "Informations utilisateur récupérées avec succès.", userInfo);
});

// Exporter le router
module.exports = router;
