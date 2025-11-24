const express = require('express');
const router = express.Router();
const { httpApiResponse } = require('../core/http-library');
const { middlewareVerifyToken } = require('../core/middlewares');

let DB_MESSAGES = [
	{
		"id" : 1,
		"profile": "https://avatar.iran.liara.run/public",
		"created_date" : 1730904962,
		"author" : "toto@gmail.com",
		"message" : "Mais Attila vous y attend, Sire! Attila! Le Fléau de Dieu! Mais…"
	},
	{
		"id" : 2,
		"profile": "https://avatar.iran.liara.run/public",
		"created_date" : 1719835211,
		"author" : "clodomir@gmail.com",
		"message" : "Moi j’appelle ça des politesses! S'il y a un autre qui groupe qui arrive par là on est marron des deux côtés"
	},
	{
		"id" : 3,
		"profile": "https://avatar.iran.liara.run/public",
		"created_date" : 1623379200,
		"author" : "ratio@gmail.com",
		"message" : "Parce que les rares fois où il arrive à faire quelque chose de ses dix doigts"
	}
];

router.get("/", middlewareVerifyToken, async (request, response) => {

    return httpApiResponse(response, "200", "La liste des messages a été récupérés avec succès", DB_MESSAGES)
});

// Exporter le router
module.exports = router;