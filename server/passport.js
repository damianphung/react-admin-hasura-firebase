const passport = require("passport");
// const localStrategy = require("passport-local").Strategy;
// const { Strategy as GoogleStrategy } from 'passport-google-oauth20';
const FacebookStrategy = require("passport-facebook").Strategy;
const fetch = require("isomorphic-fetch");
const axios = require("axios");
const querystring = require("querystring");
//cb(null, data.data[0]);
passport.serializeUser(function(user, done) {
  global.console.log("serializeUser ------ ", user);
  done(null, user.id);
});

passport.deserializeUser(function(id, done) {
  global.console.log("deserializeUser ------ ");

  const user = {
    access_token:
      "EAADqbBNa0pIBAKUnLoHXkLV12GiTScQplC7D908FFWFO6xfMyOnHBa6xe6mrN7AZAZCMVt4PBLPUZA45BBGQZAW6intWBEZAJP2gEbZBQoo1JMOVSNP9CZCL8qFbEKHaNawydF6CmcZCtDKStvh69jZBSIQbqFh0hYQJ21UbUqm5FWQZDZD",
    category: "Just For Fun",
    category_list: [{ id: "129417183848258", name: "Just For Fun" }],
    name: "Testpage",
    id: "113775866993678",
    tasks: ["ANALYZE", "ADVERTISE", "MODERATE", "CREATE_CONTENT", "MANAGE"]
  };
  done(null, user);
});

passport.use(
  new FacebookStrategy(
    {
      clientID: process.env.FACEBOOK_APP_ID,
      clientSecret: process.env.FACEBOOK_APP_SECRET,
      graphAPIVersion: "v8.0",
      callbackURL: `https://933be034b455.ngrok.io/login/facebook/return`,
      profileFields: [
        "id",
        "cover",
        "name",
        "displayName",
        "age_range",
        "link",
        "gender",
        "locale",
        "picture",
        "timezone",
        "updated_time",
        "verified",
        "email"
      ],
      passReqToCallback: true
    },
    async (req, accessToken, refreshToken, profile, done) => {
      console.log("VERIFY CALLBACK  ------ ");
      // console.log("req body ", req);
      //console.log(profile)
      let credentials;
      let pageInfoList;

      try {
        const query = querystring.stringify({
          fb_exchange_token: accessToken,
          client_id: process.env.FACEBOOK_APP_ID,
          client_secret: process.env.FACEBOOK_APP_SECRET,
          grant_type: "fb_exchange_token"
        });
        // https://{shop}.myshopify.com/admin/oauth/authorize?client_id={api_key}&scope={scopes}&redirect_uri={redirect_uri}&state={nonce}&grant_options[]={access_mode}
        let requestURL = `https://graph.facebook.com/v8.0/oauth/access_token?${query}`;
        const facebookResponse = await axios.get(requestURL);

        //       const facebookResponse = await fetch(requestURL, {
        //         method: "GET",
        //         headers: {
        //           Accept: "application/json"
        //         }
        //       });

        // console.log("facebook response data -> ", facebookResponse);
        // const longAccessToken = await facebookResponse.data;

        const longAccessToken = facebookResponse.data.access_token;

        console.log("facebookResponse.data -> ", facebookResponse.data);

        const query2 = querystring.stringify({
          access_token: longAccessToken
        });

        // const facebookResponse2 = await fetch(
        //   `https://graph.facebook.com/v8.0/${profile.id}/accounts?${query2}`,
        //   {
        //     method: "GET",
        //     headers: {
        //       Accept: "application/json"
        //     }
        //   }
        // );
        const pageData = await axios.get(
          `https://graph.facebook.com/v8.0/${profile.id}/accounts?${query2}`
        );

        const data = pageData.data;
        console.log("pdata -> ", data);
        console.log("page data response data[0] -> ", data.data[0].name);

        console.log("page data response id[0] -> ", data.data[0].id);
        // store access token for the page here
        // let saved = await saveData(); // ...
        console.log("profile -> ", profile);
        done(null, data.data[0]);
      } catch (err) {
        console.log("ERROR ", err);
      }
    }
  )
);
//
module.exports = passport;
