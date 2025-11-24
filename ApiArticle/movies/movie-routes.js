const express = require('express');
const router = express.Router();
const { httpApiResponse } = require('../core/http-library');

let DB_Movies = [
    {
        id: 1,
        slug: "1",
        title: "Inception",
        year: 2010,
        author: "Christopher Nolan",
        duration: 125,
        genre: "Action, Fantasy",
        synopsis: "Un voleur s'infiltre dans les rêves pour dérober des secrets.",
        cover: "https://m.media-amazon.com/images/M/MV5BMjAxMzY3NjcxNF5BMl5BanBnXkFtZTcwNTI5OTM0Mw@@._V1_.jpg",
        rating: 4.6
    },
    {
        id: 2,
        slug: "2",
        title: "The Dark Knight",
        year: 2018,
        author: "Roar Uthaug",
        duration: 125,
        genre: "Action, Fantasy",
        synopsis: "Batman affronte le Joker pour sauver Gotham.",
        cover: "https://image.tmdb.org/t/p/w500/qJ2tW6WMUDux911r6m7haRef0WH.jpg",
        rating: 5
    },
    {
        id: 3,
        slug: "3",
        title: "Interstellar",
        year: 2018,
        author: "Christopher Nolan",
        duration: 125,
        genre: "Action, Fantasy",
        synopsis: "Une équipe voyage à travers un trou de ver pour sauver l'humanité.",
        cover: "https://m.media-amazon.com/images/M/MV5BYzdjMDAxZGItMjI2My00ODA1LTlkNzItOWFjMDU5ZDJlYWY3XkEyXkFqcGc@._V1_FMjpg_UX1000_.jpg",
        rating: 4
    }
];

/**
 * Route GET : Pour récupèrer tout les films
 */
router.get("/", async (request, response) => {
    // Récupèrer une liste/tableau d'article
    const movies = DB_Movies;

    // Retourner les articles dans la réponse JSON
    return httpApiResponse(response, "200", `La liste des film a été récupérée avec succès !`, movies);
});

/**
 * Route GET : Pour récupèrer un film
 */
router.get("/:slug", async (request, response) => {
    // Récupérer l'slug de l'url
    const idParam = request.params.slug;

    // Rechercher un article par son id
    const foundArticle = DB_Articles.find(article => article.slug === idParam);

    if (!foundArticle) {
        return httpApiResponse(response, "721", `Le film n'existe pas`, null);
    }

    return httpApiResponse(response, "200", `Le film a été récupéré avec succès`, foundArticle);

});

// Exporter le router
module.exports = router;