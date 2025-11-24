const express = require('express');
const router = express.Router();
const { httpApiResponse } = require('../core/http-library');
const { middlewareVerifyToken } = require('../core/middlewares');
const { v4: uuidv4 } = require('uuid');

let DB_Articles = [
    { id: '1', title: 'Premier article', desc: 'Contenu du premier article', author: 'Isaac', imgPath: 'https://dogtime.com/wp-content/uploads/sites/12/2011/01/GettyImages-653001154-e1691965000531.jpg' },
    { id: '2', title: 'Deuxième article', desc: 'Contenu du deuxième article', author: 'Sanchez', imgPath: 'https://dogtime.com/wp-content/uploads/sites/12/2011/01/GettyImages-653001154-e1691965000531.jpg' },
    { id: '3', title: 'Troisième article', desc: 'Contenu du troisième article', author: 'Toto', imgPath: 'https://dogtime.com/wp-content/uploads/sites/12/2011/01/GettyImages-653001154-e1691965000531.jpg' }
];

// ================================================================== //
// GESTION ARTICLES
// ================================================================== //
/**
 * Route GET : Pour récupèrer tout les articles
 */
router.get("/", async (request, response) => {
    // Récupèrer une liste/tableau d'article
    const articles = DB_Articles;

    // Retourner les articles dans la réponse JSON
    return httpApiResponse(response, "200", `La liste des articles a été récupérée avec succès !`, articles);
});

/**
 * Route GET : Pour récupèrer un article
 */
router.get("/:id", async (request, response) => {
    // Récupérer l'id de l'url
    const idParam = request.params.id;

    // Rechercher un article par son id
    const foundArticle = DB_Articles.find(article => article.id === idParam);

    if (!foundArticle) {
        return httpApiResponse(response, "721", `L'article n'existe pas`, null);
    }

    return httpApiResponse(response, "200", `L'article a été récupéré avec succès`, foundArticle);

});

/**
 * Route POST : Pour ajouter un article
 */
router.post("/save", async (request, response) => {
    // Récupérer l'article qui est envoyé en JSON
    const articleJSON = request.body;

    let foundArticle = null;

    // Est-ce on a un id envoyer dans le json
    if (articleJSON.id != undefined || articleJSON.id) {
        // essayer de trouver un article existant
        foundArticle = DB_Articles.find(article => article.id === articleJSON.id);
    }

    // Si je trouve je modifie les nouvelles valeurs
    if (foundArticle) {
        foundArticle.title = articleJSON.title;
        foundArticle.desc = articleJSON.desc;
        foundArticle.author = articleJSON.author;

        return httpApiResponse(response, "200", `L'article a été modifié avec succès`, articleJSON);
    }

    // Sinon par défaut je créer

    // -- generer l'id
    articleJSON.id = uuidv4();

    DB_Articles.push(articleJSON);

    return httpApiResponse(response, "200", `Article crée avec succès !`, articleJSON);
});


/**
 * Route POST : Pour ajouter supprimer un article
 */
router.delete('/:id', (request, response) => {

    // Il faut l'id en entier
    const id = request.params.id;

    // trouver l'index
    const foundArticleIndex = DB_Articles.findIndex(article => article.id === id);

    // si article trouve erreur
    if (foundArticleIndex < 0) {
        return httpApiResponse(response, "721", `Impossible de supprimer un article inexistant`, null);
    }

    // supprimer grace à l'index
    DB_Articles.splice(foundArticleIndex, 1);

    return httpApiResponse(response, "200", `Article ${id} supprimé avec succès`, null);
});

// Exporter le router
module.exports = router;