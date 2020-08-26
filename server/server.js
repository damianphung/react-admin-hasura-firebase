// server.js
// where your node app starts

// we've started you off with Express (https://expressjs.com/)
// but feel free to use whatever libraries or frameworks you'd like through `package.json`.
const express = require("express");
var session = require("express-session");
var bodyParser = require("body-parser");
var cors = require("cors");
const app = express();
require('dotenv').config()
const passport = require("./passport");
const querystring = require("querystring");
const path = require('path');
// const { Console } = require("console");
// our default array of dreams
app.use(cors());
// app.use(express.cookieParser());
app.use(bodyParser());

app.use(
  session({
    secret: "keyboard cat",
    resave: false,
    saveUninitialized: true,
    cookie: { secure: true }
  })
);

app.use(passport.initialize());
app.use(passport.session());

// make all the files in 'public' available
// https://expressjs.com/en/starter/static-files.html
app.use(express.static(path.join(__dirname, "..", "build")));
// app.use(express.static("public"));
// https://expressjs.com/en/starter/basic-routing.html
app.get("/", (request, response) => {
    console.log("HJI");
//   response.sendFile(path.join(__dirname, "public", "index.html"));
  response.sendFile(path.join(__dirname, "..", "build", "index.html"));
  // response.sendFile(__dirname + "/build/index.html");
});

app.get(
  "/login/facebook",
  function(request, response, next) {
    // const email = request.body;
    // console.log("STARTING REQUEST request sessions  -> ", request.sessions);
    // request.headers["Access-Control-Allow-Origin"] = '*';
    // request.body = {};
    // request.body["XXX"] = "hi";
    // console.log("STARTING REQUEST request body  -> ", request.body);
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
          id: "12345"
        };        
        // res.json(query);
        // res.redirect("https://5da761cc6b80.ngrok.io/?" + query);
        //
        // window.location.href = "https://5da761cc6b80.ngrok.io/login?error=123";
        res.send(`
<script>
  if (window.opener) {
    window.opener.postMessage(${JSON.stringify(query)}, '*');
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

const listener = app.listen(3000, () => {
  console.log("Your app is listening on port " + listener.address().port);
});
