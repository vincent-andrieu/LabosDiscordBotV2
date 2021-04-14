# Rules

## Mandatories
- Gérer plusieurs serveurs en même temps
- ID du serveur dans l'url
- Créer des services côté client et server
- Jamais faire d'appels server depuis le controller

## Must
- Mettre en paramètre des fonctions ou appels server les objects entier et pas seulement des valeurs (pour facilité les ajouts par la suite)
- Utiliser des alias pour les paths des imports des fichiers globaux

## Should
- Authentification entre les serveurs (pas le but premier et ralenti l'utilisation par le user)
    - Mot de passe facultatif qui peut être ajouté dans l'url pour pas avoir à le mettre dans une popup

## Can
- Traductions
- Docker


# To deploy in production with auth
1. Start the docker without users and passwords

2. Connect to the docker DB
    ```bash
    docker exec -it image_name bash
    mongo
    ```

3. Add users

    - root
    ```ts
    > use admin
    > db.createUser({
        user: "root",
        pwd: "root_password",
        roles: ["root"]
      });
    ```

    - server user
    ```ts
    > use admin
    > db.createUser({
        user: "mongodb",
        pwd: "password",
        roles: [{
            role: "readWrite",
            db: "db_name"
        }]
      });
    ```
4. Restart the docker-compose with the auth options
    - server
        - environment:
            - MONGODB_USERNAME
            - MONGODB_PASSWORD
    - db  
        - command: [--auth]
        - environment:
            - MONGO_INITDB_ROOT_USERNAME
            - MONGO_INITDB_ROOT_PASSWORD