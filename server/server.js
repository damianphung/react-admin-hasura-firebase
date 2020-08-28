// server.js
// where your node app starts

// we've started you off with Express (https://expressjs.com/)
// but feel free to use whatever libraries or frameworks you'd like through `package.json`.
const express = require("express");
const path = require('path');
require('dotenv').config()
let session = require("express-session");

let FileStore = require("session-file-store")(session);

let bodyParser = require("body-parser");
let cors = require("cors");
const app = express();
const passport = require("./passport");
const querystring = require("querystring");

const fetch = require("isomorphic-fetch");

const NONCE = "blah";
const SHOPIFY_API_KEY = process.env.SHOPIFY_API_KEY;
const SHOPIFY_API_SECRET_KEY = process.env.SHOPIFY_API_SECRET_KEY;

// const BASE_URL = "https://xx-passport-starter.glitch.me";
const BASE_URL = "https://99c9c66d1a37.ngrok.io";

// our default array of dreams
app.use(cors());
// app.use(express.cookieParser());
app.use(bodyParser.urlencoded());
app.use(bodyParser.json());

app.use(
  session({
    store: new FileStore({
      path: "./session-store"
    }),
    secret: "keyboard cat",
    resave: false,
    saveUninitialized: false,
    cookie: { secure: true }
  })
);

app.use(passport.initialize());
app.use(passport.session());

// make all the files in 'public' available
// https://expressjs.com/en/starter/static-files.html
// app.use(express.static("public"));

// https://expressjs.com/en/starter/basic-routing.html
// app.get("/", (request, response) => {
//   response.sendFile(__dirname + "/views/index.html");
// });
app.use(express.static(path.join(__dirname, "..", "build")));
// app.use(express.static("public"));
// https://expressjs.com/en/starter/basic-routing.html
app.get("/", (request, response) => {
    console.log("HI");
//   response.sendFile(path.join(__dirname, "public", "index.html"));
  response.sendFile(path.join(__dirname, "..", "build", "index.html"));
  // response.sendFile(__dirname + "/build/index.html");
});


// var sess;
app.get(
  "/login/facebook",
  function(request, response, next) {
    // const email = request.body;
    let sess = request.session;
    console.log("login/facebook session  -> ", sess);

    next();
  },
  passport.authenticate("facebook", {
    scope: [
      "pages_messaging",
      "pages_manage_metadata",
      "pages_show_list",
      "pages_manage_posts"
    ]
  })
);

function authenticate() {
  console.log("Hello authenticate");
  return (req, res, next) => {
    console.log("Into closure authenticate");
    passport.authenticate("facebook", async (err, user) => {
      console.log("AUTHENTICATION user ", user);
      console.log("req headers ", req.headers);
      if (err) {
        res.redirect("https://www.example.com");
      } else if (user) {
        console.log("user --> ", user);
        // res.json(user);
        // redirect with query params
        // `https://www.example.com?profileId=${user.id}`

        const resp = await req.logIn(user, function(err) {
          if (err) return next(err);
          console.log("Callback login... user -> ", req.user);
        });
        const query = {
          id: "88888"
        };

        req.session["facebook"] = query;
        let sess = req.session;
        console.log("/login/facebook/return session  -> ", sess);
        // res.redirect("https://5da761cc6b80.ngrok.io/?" + query);
        // REDIRECT_TARGET_ORIGIN
        // window.location.href = "https://5da761cc6b80.ngrok.io/login?error=123";
        res.send(`
<script>
  if (window.opener) {
    window.opener.postMessage(${JSON.stringify(query)}, ${process.env.REDIRECT_TARGET_ORIGIN});
    window.opener.focus();
    window.close();
  } 
</script>`); // prettier-ignore

        //
      } else {
        res.redirect("https://www.example.com");
      }
    })(req, res, next);
  };
}

app.get(
  "/login/facebook/return",
  authenticate()
  // passport.authenticate("facebook", {
  //   successRedirect: "/",
  //   failureRedirect: "/login/facebook"
  // })
);

// shopify

async function postInstall(shop, token) {
  // See
  // https://shopify.dev/docs/admin-api/rest/reference/store-properties/shop
  // GET https://${shop}/admin/api/2020-07/shop.json with X-Shopify-Access-Token
  const shopObjectURL = `https://${shop}/admin/api/2020-07/shop.json`;
  const shopObject = await fetch(shopObjectURL, {
    method: "GET",
    headers: {
      "X-Shopify-Access-Token": token,
      Accept: "application/json"
    }
  });

  const shopResult = await shopObject.json();
  console.log("Shop result ?? -> ", shopResult);
  /** https://shopify.dev/docs/admin-api/rest/reference/events/webhook

    What you can do with Webhook
    The Shopify API lets you do the following with the Webhook resource. 
    More detailed versions of these general actions may be available:

    GET /admin/api/2020-07/webhooks.json
    Retrieves a list of webhooks

    GET /admin/api/2020-07/webhooks/count.json
    Receive a count of all Webhooks

    GET /admin/api/2020-07/webhooks/{webhook_id}.json
    Receive a single Webhook

    POST /admin/api/2020-07/webhooks.json
    Create a new Webhook

    PUT /admin/api/2020-07/webhooks/{webhook_id}.json
    Modify an existing Webhook

    DELETE /admin/api/2020-07/webhooks/{webhook_id}.json
    Remove an existing Webhook
  */
  // POST INSTALL SCRIPT
  const headers = {
    "X-Shopify-Access-Token": token,
    "Content-Type": "application/json"
  };
  // console.log("installScript --> ", installScriptRes);

  // Webhook registeration when app uninstalled
  const registerWebHookUrl = `https://${shop}/admin/api/2020-07/webhooks.json`;
  const webHook = await fetch(registerWebHookUrl, {
    method: "POST",
    headers: headers,
    body: JSON.stringify({
      webhook: {
        topic: "app/uninstalled",
        address: `${BASE_URL}/app/uninstalled`,
        format: "json"
      }
    })
  });

  const webHookRes = await webHook.json();
  console.log("webHookRes --> ", webHookRes);

  return {
    shopify: {
      token: token,
      domain: shop,
      email: shopResult.shop.email,
      id: shopResult.shop.id
    }
  };
}
// make all the files in 'public' available
// https://expressjs.com/en/starter/static-files.html
// app.use(express.static("public"));

// // https://expressjs.com/en/starter/basic-routing.html
// app.get("/", (request, response) => {
//   response.sendFile(__dirname + "/views/index.html");
// });

// send the default array of dreams to the webpage
app.get("/shopify", async (request, response) => {
  console.log("/ request query -> ", request.query);
  let hmac = request.query.hmac;
  let shop = request.query.shop;
  let timestamp = request.query.timestamp;
  let scopes = "write_orders,write_products,write_script_tags";

  let redirectURI = `${BASE_URL}/shopify/auth/callback`;

  const query = querystring.stringify({
    client_id: SHOPIFY_API_KEY,
    scope: scopes,
    redirect_uri: redirectURI,
    state: NONCE
  });
  // https://{shop}.myshopify.com/admin/oauth/authorize?client_id={api_key}&scope={scopes}&redirect_uri={redirect_uri}&state={nonce}&grant_options[]={access_mode}
  let redirect = `https://${shop}/admin/oauth/authorize?${query}`;
  console.log("redirect -> ", redirect);
  response.redirect(redirect);
});

app.get("/shopify/auth/callback", async (request, response) => {
  console.log("/shopify/auth/callback -> request query", request.query);

  // at this stage... can get emaiul>?
  // sample app competitor makes use of local storage to store shopify user email to register.
  // They are able to get the website address , and user email from shopify at this stage.
  // This assumes a shopify login sso

  // Howveer they can still asks for email to register just incase you do not come from shopify.
  // such as email/pass , facebook, wix, and also shopify

  // if not in local storage -> go to register page with redirect and params to the 'tour' stage
  // i.e https://www.otherapp.com/panel/login?redirectTo=tour%2Fconfigure-live-chat

  let code = request.query.code;
  let hmac = request.query.hmac;
  let shop = request.query.shop;
  let state = request.query.state;
  let timestamp = request.query.timestamp;

  // if (shop is valid)
  // if (state === NONCE)
  // if (HMAC)

  // Exchange for the token
  const accessTokenRequestUrl = `https://${shop}/admin/oauth/access_token`;
  const accessTokenPayload = {
    client_id: SHOPIFY_API_KEY,
    client_secret: SHOPIFY_API_SECRET_KEY,
    code
  };

  console.log("accessTokenRequestUrl -> ", accessTokenRequestUrl);
  const tokenRes = await fetch(accessTokenRequestUrl, {
    method: "POST",
    headers: {
      Accept: "application/json",
      "Content-Type": "application/json"
    },
    body: JSON.stringify(accessTokenPayload)
  });

  const tokenJson = await tokenRes.json();

  // store token and shop in DB

  const shopDetails = await postInstall(shop, tokenJson.access_token);
  console.log("Shop details to store --> ", shopDetails);

  request.session.shopify = shopDetails;
  // sess = shopDetails;
  console.log("Session --> ", request.session);
  // const redirect = `https://keen-brown-09d0c2.netlify.app`;
  const redirect = `https://99c9c66d1a37.ngrok.io`;
  response.redirect(redirect);
});

app.post("/app/uninstalled", async (request, response) => {
  console.log("/app/uninstalled route called");
  // X-Shopify-Topic: orders/create
  // X-Shopify-Hmac-Sha256: XWmrwMey6OsLMeiZKwP4FppHH3cmAiiJJAweH5Jo4bM=
  // X-Shopify-Shop-Domain: johns-apparel.myshopify.com
  // X-Shopify-API-Version: 2019-04

  console.log("headers ", request.headers);
  const topic = request.headers["x-shopify-topic"];
  const hmac = request.headers["x-shopify-hmac-sha256"];
  const shopDomain = request.headers["x-shopify-shop-domain"];
  const apiVersion = request.headers["x-shopify-api-version"];

  console.log("Api version , ", apiVersion);
  console.log("post body ", request.body);
});

app.get("/facebook", async (request, response) => {
  // See
  // https://shopify.dev/docs/admin-api/rest/reference/store-properties/shop
  // GET https://${shop}/admin/api/2020-07/shop.json with X-Shopify-Access-Token

  //given email from client
  // look up email associated with shopify domain
  const shop = "hello";
  const token = "123";

  // POST INSTALL SCRIPT
  const headers = {
    "X-Shopify-Access-Token": token,
    "Content-Type": "application/json"
  };

  const createScriptTagUrl = `https://${shop}/admin/script_tags.json`;
  const scriptTagBody = {
    script_tag: {
      event: "onload",
      src: "https://damosscript.com/damooo.js"
    }
  };

  const installScript = await fetch(createScriptTagUrl, {
    method: "POST",
    headers: headers,
    body: JSON.stringify(scriptTagBody)
  });

  const installScriptRes = await installScript.json();
});

//

// listen for requests :)
const listener = app.listen(process.env.PORT, () => {
  console.log("Your app is listening on port " + listener.address().port);
});
