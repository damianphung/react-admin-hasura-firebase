// This is sourced from https://hasura.io/blog/authentication-and-authorization-using-hasura-and-firebase/
// and also https://hasura.io/blog/build-flutter-app-hasura-firebase-part2/
// and is committed to Firebase with console `firebase deploy --only functions`
const functions = require("firebase-functions");
const admin = require("firebase-admin");
const fetch = require("isomorphic-fetch");
// const { Pool } = require('pg');
admin.initializeApp(functions.config().firebase);

// Below extracts environment variables from Firebase, and uses them to define the connection to Postgres
// Uncomment the below if you wish to write your users to a Postgres DB
// const pool = new Pool({
//   user: functions.config().database.user,
//   host: functions.config().database.ip,
//   database: functions.config().database.dbname,
//   password: functions.config().database.password,
//   port: functions.config().database.port,
// });

async function fetchGraphQL(operationsDoc, operationName, variables) {


  const result = await fetch(
    process.env.HASURA_URL,
    {
      headers: {
        "Content-Type": "application/json",
        Accept: "application/json",
        "x-hasura-admin-secret": process.env.HASURA_SECRET
      },
      method: "POST",
      body: JSON.stringify({
        query: operationsDoc,
        variables: variables,
        operationName: operationName
      })
    }
  );

  return await result.json();
}


// On sign up.
exports.processSignUp = functions.auth.user().onCreate(user => {
    // Load API keys, secrets etc. from Firebase environment
    // https://firebase.google.com/docs/functions/config-env
    const { app: config } = functions.config();
    Object.keys(config).forEach(key => {
      process.env[key.toUpperCase()] =
        typeof config[key] === 'object'
          ? JSON.stringify(config[key])
          : config[key];
    });    
    console.log("process.env.HASURA_URL --", process.env.HASURA_URL);
    const newUser = `mutation userMutation {
      insert_users_one(object: {id: "${user.uid}", email: "${user.email}"})
    }`;
    fetchGraphQL(newUser, {})
    .then( function(json) {
        console.log("resolved json ", json); 
        return Promise.resolve(1);
    })
    .then( function(resolved_value) { 
      console.log("resolved ... custom claims now "); 
      const customClaims = {
        "https://hasura.io/jwt/claims": {
          "x-hasura-default-role": "user",
          "x-hasura-allowed-roles": ["user"],
          "x-hasura-user-id": user.uid
        }
      };
      return admin
        .auth()
        .setCustomUserClaims(user.uid, customClaims)
        .then(() => {
          // Update real-time database to notify client to force refresh.
          const metadataRef = admin.database().ref("metadata/" + user.uid);
          // Set the refresh time to the current UTC timestamp.
          // This will be captured on the client to force a token refresh.
          return metadataRef.set({ refreshTime: new Date().getTime() });
            });

    })
    .catch(function(err) {
        console.log(err.stack);
    });

});

// Below is only needed if you wish to have Firebase sync its users to a Google Cloud DB
// We can write any parameter listed here: https://firebase.google.com/docs/reference/admin/node/admin.auth.UserRecord.html
// const text = 'INSERT INTO public.users(id, email) VALUES($1, $2)';
// const values = [user.uid, user.email];
// (async () => {
//   const client = await pool.connect();
//   try {
//     const res = await client.query(text, values);
//     console.log(res.rows[0])
//   } finally {
//     // Make sure to release the client before any error handling,
//     // just in case the error handling itself throws an error.
//     client.release()
//   }
// })().catch(err => console.log(err.stack));

