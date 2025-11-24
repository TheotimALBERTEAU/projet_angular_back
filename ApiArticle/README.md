# API Mockée pour Travaux Pratiques

Bienvenue sur le dépôt GitHub de l'API mockée destinée aux travaux pratiques des étudiants. Cette API simule un backend simple avec des données en mémoire, afin de permettre aux étudiants de tester des appels API depuis une application frontend. Elle couvre plusieurs fonctionnalités essentielles comme la gestion des utilisateurs et des articles.

## Objectif

L'objectif de cette API est de fournir une interface RESTful pour :
- Tester des opérations CRUD sur des articles.
- Gérer des utilisateurs avec des actions comme l'inscription, la connexion et la réinitialisation du mot de passe.
- Fournir un token JWT pour simuler des mécanismes d'authentification.

Cette API ne nécessite pas de base de données, les données sont stockées en mémoire et réinitialisées à chaque redémarrage.

## Installation

1. Clonez ce dépôt sur votre machine :
```bash
git clone https://github.com/Chocolaterie/ApiArticle.git
```

2. Installez les dépendances :
```bash
npm install
```
    
3. Démarrez le serveur :
```bash
npm start
```

Le serveur sera accessible sur http://localhost:3000.

## Entry Points de l'API

### Gestion des Utilisateurs

#### POST /login

Les comptes mock :
- isaac@gmail.com | password 
- tata@gmail.com | 123456
- toto@gmail.com | 12345

Permet à un utilisateur de se connecter en fournissant son email et mot de passe. Retourne un token JWT.

```json
{
  "email": "user@example.com",
  "password": "password"
}
```

**Réponse :**

```json
{
  "code": "200",
  "message": "Vous êtes connecté(e)",
  "data": "token_jwt"
}
```

#### POST /signup

Inscription d'un nouvel utilisateur avec vérification de l'unicité de l'email et confirmation du mot de passe.

```json
{
  "email": "user@example.com",
  "password": "password",
  "passwordConfirm": "password",
  "pseudo": "User",
  "cityCode": "44000",
  "city": "Nantes",
  "phone": "0600000000"
}
```

**Réponse :**

```json
{
  "code": "200",
  "message": "Inscription effectuée avec succès",
  "data": { ...nouvel_utilisateur }
}
```

#### POST /reset-password

Réinitialise le mot de passe d'un utilisateur en générant un nouveau mot de passe aléatoire.

```json
{
  "email": "user@example.com"
}
```

**Réponse :**

```json
{
  "code": "200",
  "message": "Mot de passe réinitialisé avec succès",
  "data": "new_password"
}
```

### Gestion des Articles

#### GET /articles

Récupère la liste complète des articles disponibles.

**Réponse :**

```json
{
  "code": "200",
  "message": "La liste des articles a été récupérée avec succès",
  "data": [ ...articles ]
}
```

#### GET /articles/:id

Récupère un article spécifique par son id.

**Réponse :**

```json
{
  "code": "200",
  "message": "L'article a été récupéré avec succès",
  "data": { ...article }
}
```

#### POST /articles/save

Crée ou met à jour un article. Si un id est présent dans la requête, l'article existant sera mis à jour, sinon un nouvel article sera créé.

**Réponse :**

```json
{
  "code": "200",
  "message": "Article créé ou modifié avec succès",
  "data": { ...article }
}
```

#### DELETE /articles/:id

Supprime un article par son id.

**Réponse :**

```json
{
  "code": "200",
  "message": "Article supprimé avec succès"
}
```

## Technologies Utilisées

- Node.js
- Express.js pour créer les routes.
- JWT pour la gestion des tokens d'authentification.
- UUID pour générer des identifiants uniques pour les articles.
- CORS pour permettre les requêtes entre le frontend et l'API.

© 2024 - Projet pédagogique pour les étudiants.