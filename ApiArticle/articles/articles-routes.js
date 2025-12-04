const express = require('express');
const router = express.Router();
const { httpApiResponse } = require('../core/http-library');
// const { middlewareVerifyToken } = require('../core/middlewares'); // Maintenu si nécessaire
// const { v4: uuidv4 } = require('uuid'); // Plus besoin de UUID pour l'ID, MongoDB le gère.

// ------------------------------------------------------------------ //
// ⚠️ IMPORT DU MODÈLE MONGOOSE
// ------------------------------------------------------------------ //
// Assurez-vous d'avoir créé un fichier Article.model.js et de l'importer ici.
const Article = require('../models/Article.model');


// ================================================================== //
// GESTION ARTICLES - OPÉRATIONS MONGOOSE
// ================================================================== //

/**
 * Route GET : Pour récupérer tous les articles
 */
router.get("/", async (request, response) => {
    try {
        // Remplacer DB_Articles par Article.find()
        const articles = await Article.find();

        // Retourner les articles dans la réponse JSON
        return httpApiResponse(response, "200", `La liste des articles a été récupérée avec succès !`, articles);

    } catch (error) {
        console.error("Erreur lors de la récupération des articles:", error);
        return httpApiResponse(response, "500", `Erreur serveur lors de la récupération des articles`, null);
    }
});

/**
 * Route GET : Pour récupérer un article
 */
router.get("/:id", async (request, response) => {
    // Récupérer l'id de l'url (Mongoose utilise _id par défaut pour la recherche)
    const idParam = request.params.id;

    try {
        // Remplacer DB_Articles.find() par Article.findById()
        const foundArticle = await Article.findById(idParam);

        if (!foundArticle) {
            return httpApiResponse(response, "721", `L'article n'existe pas`, null);
        }

        return httpApiResponse(response, "200", `L'article a été récupéré avec succès`, foundArticle);

    } catch (error) {
        // Cela peut capturer une erreur si l'ID n'est pas un ObjectId valide
        console.error("Erreur lors de la recherche de l'article:", error);
        return httpApiResponse(response, "721", `L'ID fourni n'est pas valide`, null);
    }
});

/**
 * Route POST : Pour ajouter ou modifier un article (CRUD: Create/Update)
 */
router.post("/save", async (request, response) => {
    // Récupérer l'article qui est envoyé en JSON
    const articleJSON = request.body;

    try {
        // Vérifier si l'ID MongoDB (_id) est fourni pour l'UPDATE
        if (articleJSON._id) {
            // ------------------ UPDATE ------------------
            // Article.findByIdAndUpdate trouve et modifie l'article en une seule requête.
            const updatedArticle = await Article.findByIdAndUpdate(
                articleJSON._id,
                {
                    title: articleJSON.title,
                    desc: articleJSON.desc,
                    author: articleJSON.author,
                    imgPath: articleJSON.imgPath // Assurez-vous d'inclure imgPath si elle est modifiable
                },
                { new: true } // { new: true } demande à Mongoose de retourner le document mis à jour
            );

            if (!updatedArticle) {
                return httpApiResponse(response, "721", `Impossible de trouver l'article pour modification`, null);
            }

            return httpApiResponse(response, "200", `L'article a été modifié avec succès`, updatedArticle);

        } else {
            // ------------------ CREATE ------------------
            // Créer un nouveau document Mongoose et le sauvegarder
            const newArticle = new Article(articleJSON);
            const savedArticle = await newArticle.save(); // La méthode .save() insère dans MongoDB et génère un _id.

            return httpApiResponse(response, "200", `Article crée avec succès !`, savedArticle);
        }
    } catch (error) {
        console.error("Erreur lors de la création/modification de l'article:", error);
        // Vous pouvez ajouter une logique pour gérer les erreurs de validation (required fields)
        return httpApiResponse(response, "500", `Erreur serveur lors de l'opération d'enregistrement`, null);
    }
});


/**
 * Route DELETE : Pour supprimer un article (CRUD: Delete)
 */
router.delete('/:id', async (request, response) => {

    // Il faut l'id MongoDB (_id) en entier
    const id = request.params.id;

    try {
        // Remplacer splice par findByIdAndDelete
        const deletedArticle = await Article.findByIdAndDelete(id);

        // Si findByIdAndDelete ne trouve rien, il retourne null
        if (!deletedArticle) {
            return httpApiResponse(response, "721", `Impossible de supprimer un article inexistant (ID: ${id})`, null);
        }

        return httpApiResponse(response, "200", `Article ${id} supprimé avec succès`, null);

    } catch (error) {
        console.error("Erreur lors de la suppression de l'article:", error);
        return httpApiResponse(response, "500", `Erreur serveur lors de la suppression`, null);
    }
});

// Exporter le router
module.exports = router;