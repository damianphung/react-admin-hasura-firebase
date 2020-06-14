# React Admin Hasura Firebase

[![CircleCI](https://circleci.com/gh/dvasdekis/react-admin-hasura-firebase.svg?style=svg)](https://circleci.com/gh/dvasdekis/react-admin-hasura-firebase)

This is an example [react-admin](https://marmelab.com/react-admin/) (configuration based CRUD admin UI builder) starter pack that combines the [Hasura](https://hasura.io/) (automatic GraphQL API backend on top of PostgreSQL) data provider with a [Firebase](https://firebase.google.com/docs/auth) authentication provider. To illustrate the architecture:

![High-Level Architecure Diagram](https://raw.githubusercontent.com/dvasdekis/react-admin-hasura-firebase/master/public/architecture.png)

This approach lets us serve GraphQL queries from our Postgres database, with a **frontend built dynamically from inspection of the Postgres schema.** Additionally, user creation and queries to the database are secured by Firebase Authentication.

*By combining these three technologies, you can build secure, database-driven web app interfaces with all business logic written entirely in SQL.*

## Getting started

I recommend doing things in the below order:
1. **Understand the stack**, by looking at the [Docker-Compose file](https://github.com/dvasdekis/react-admin-hasura-firebase/blob/master/docker-compose.yaml)
2. **Test locally**, by ensuring that the admin dashboard works on [`localhost:8080`](http://localhost:8080) after running `docker-compose up --no-recreate --build` (wait for Docker's messages to stop flowing)
3. **Configure Firebase**, by setting up a Firebase project, creating users, and changing their Firebase IDs in the [SQL migrations](https://github.com/dvasdekis/react-admin-hasura-firebase/blob/getting_started/migrations/sql/V1__todo_app.up.sql), and change the Firebase project name in [`.firebaserc`](https://github.com/dvasdekis/react-admin-hasura-firebase/blob/getting_started/firebase/.firebaserc)
4. **Add SQL migrations**, by creating new [Flyway SQL files](https://github.com/dvasdekis/react-admin-hasura-firebase/tree/getting_started/migrations/sql) using the [Flyway migrations format](https://flywaydb.org/documentation/migrations#naming)
5. **Add Hasura migrations**, by using the Hasura admin portal [running on `localhost:8081`](http://localhost:8081/) to create permissions for the new tables you've defined in your SQL migrations. Export the Hasura config so that your new Hasura config overwrites [`metadata.json`](https://github.com/dvasdekis/react-admin-hasura-firebase/blob/getting_started/migrations/hasura/migrations/metadata.json)
6. **Edit the React-Admin Dashboard**, by editing the files under [`src`](https://github.com/dvasdekis/react-admin-hasura-firebase/tree/getting_started/src). The [React-Admin documentation](https://marmelab.com/react-admin/Readme.html) is quite terse - I recommend reading all of it each time you get stuck.

### Understanding the permissions model

This repo is bundled with a Firebase project that has a couple of users defined. They are:
* test@example.com (password: bigpassword, Firebase ID: mlYsXk9rlHc37tYJXBCFMnzHEGF3)
* test2@example.com (password: bigpassword, Firebase ID: xVSkxIkpMFPReOrooBSuU3K6W4G2)

Logging into the frontend with these users, you can see that they can view rows across Todos / Users in Postgres based on the value of their firebase UserID. The are also able to Insert / Update todos based on the value of thier firebase UserID. Currently when a user performs an action they don't have permissions for, their session will be invalidated and they will be logged out. 

You will need your own Firebase account if you wish to create users for your own project. 
1. Create a free Firebase project. Copy the firebase config lines from Project Settings, General, Firebase SDK snippet.
2. Replace the API config at the top of `src/App.JS` with the values from the step above.
3. Create users, and replace their usernames and Firebase IDs in `migrations/sql/V1__todo_app.up.sql` with your own values.

## Deploying the stack

### Deploying Locally (for development)

In the project directory, you can run: 
##### `docker-compose up --no-recreate --build`
If you want to rebuild the stack from scratch (or if Flyway is giving you `Migration checksum mismatch`), run `docker container prune -f && docker volume prune -f && docker-compose pull && docker-compose up --build --no-recreate --remove-orphans`

It will take more time to run the first time, as Docker installs node_modules in a temporary container. You will have a webserver on http://localhost:8080 and a Hasura server on http://localhost:8081

The containers that get started are:
 - Webserver (ra-webserver) - Creates the npm-built webserver on port 8080
 - Hasura (graphql-engine) - Creates a Hasura instance on port 8081
 - Postgres (postgres) - Database instance running on port 5432
 - Flyway (flyway) - Migrates (runs starting SQL) the Postgres container to the state described in your SQL files in `./migrations/sql`
 - graphql-migrations - Migrates (sets initial config) the Hasura container to the state described in your metadata.json file in `./migrations/hasura`
 - PGTap - Tests the database instance against PGTap SQL as written in `./tests/sql`

Ideally there'd be a container that runs frontend tests for the ra-webserver instance. Pull requests welcome.

To run just the webserver locally in dev mode, you can run:

##### `npm run-script start`

Runs the app in local development mode. The advantage of this compared to the server running on localhost:8080 is that the page will reload if you make edits, and you will also see any lint errors in the console. Both can be run at the same time.
Open [http://localhost:3000](http://localhost:3000) to view it in the browser.


### Deploying on Google Cloud

Having a managed PostgreSQL instance means that Firebase can create users in the instance via a function when a user goes through your create user process, and also that people can access your instance without you leaving your computer on :)

You will need to:
1. Get this repo hosted somewhere (I use Netlify)
2. Set up a Google Cloud Billing Account (required for Firebase to access GCP)
3. Replace the addresses to the Postgres server with your GCP details in the Hasura Docker config
4. Create a Google Cloud SQL Server (I use `gcloud sql instances create "db_instance" --database-version=POSTGRES_11 --zone="project_zone" --tier=db-g1-small --storage-type=SSD`)
5. Create a Hasura server on Google Cloud based on the container (I use `gcloud compute instances create-with-container "hasura_instance" --container-image="hasura/graphql-engine:v1.1.0" --machine-type=e2-micro --container-env-file="./hasura.env" --container-env HASURA_GRAPHQL_ADMIN_SECRET="hasura_admin_secret",HASURA_GRAPHQL_ACCESS_KEY="hasura_admin_secret",HASURA_GRAPHQL_DATABASE_URL="postgres://hasurauser:$hasura_db_pw@{sql_ip}:5432/postgres" --zone="project_zone" --container-restart-policy=always --tags="http-server" --address="hasura_fixed_ext_ip"`).
6. Uncomment lines 28 to 42 in `firebase/functions/index.js`
