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
router.post('/articles/save', async (req, res) => {
    // Récupérer l'article qui est envoyé en JSON
    const articleJSON = req.body; // Utilisez 'req' et 'res' comme variables Express standard

    try {
        // Vérifier si l'ID MongoDB (_id ou id) est fourni pour l'UPDATE
        // Nous vérifions à la fois l'id virtuel et le _id interne
        const articleId = articleJSON._id || articleJSON.id;

        if (articleId) {
            // ------------------ UPDATE ------------------
            // Article.findByIdAndUpdate trouve et modifie l'article en une seule requête.
            const updatedArticle = await Article.findByIdAndUpdate(
                articleId,
                {
                    title: articleJSON.title,
                    desc: articleJSON.desc,
                    author: articleJSON.author,
                    imgPath: articleJSON.imgPath
                },
                { new: true, runValidators: true } // new: true retourne le document mis à jour, runValidators pour appliquer les règles du schéma
            );

            if (!updatedArticle) {
                // Si l'ID ne correspond à aucun document
                return res.status(404).json({
                    message: "Impossible de trouver l'article pour modification."
                });
            }

            // Mongoose utilise toJSON, donc l'objet renvoyé aura bien la propriété 'id'
            return res.status(200).json({
                message: "L'article a été modifié avec succès",
                article: updatedArticle
            });

        } else {
            // ------------------ CREATE ------------------
            // Créer un nouveau document Mongoose et le sauvegarder
            const newArticle = new Article(articleJSON);
            const savedArticle = await newArticle.save(); // La méthode .save() insère dans MongoDB et génère un _id.

            // Mongoose utilise toJSON, donc l'objet renvoyé aura bien la propriété 'id'
            return res.status(201).json({
                message: "Article créé avec succès !",
                article: savedArticle
            });
        }
    } catch (error) {
        console.error("Erreur lors de la création/modification de l'article:", error);

        // Gérer spécifiquement les erreurs de validation Mongoose
        if (error.name === 'ValidationError') {
            return res.status(400).json({
                message: "Erreur de validation : des champs requis sont manquants ou invalides.",
                details: error.errors
            });
        }

        return res.status(500).json({
            message: "Erreur serveur lors de l'opération d'enregistrement"
        });
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