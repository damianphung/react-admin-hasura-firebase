import React from "react";
import { Route } from 'react-router-dom';
import { fetchUtils, Admin, Resource } from "react-admin";
import { TodoCreate, TodoEdit, TodoList } from "./todos";
import hasuraDataProvider from "ra-data-hasura";
import { FirebaseAuthProvider } from "react-admin-firebase";
import firebase from 'firebase';
/** Custom pages  */
import { UserList, UserShow } from "./users";
import CustomLoginPage from './CustomLoginPage';
import tags from './tags';
// import dashboard from './dashboard'
import Dashboard from './Dashboard';
import CustomPage from './CustomPage';

// import { useRouterHistory } from 'react-router'
import { createBrowserHistory } from 'history'
// import { browserHistory } from 'react-router'
// import { useHistory } from 'react-router-dom'
const history = createBrowserHistory();
// const history = useHistory()

// Define Firebase auth provider
const firebaseConfig = {
  apiKey: "AIzaSyB8CXiCfujjLdry1m35Zb-fpAhUirjsqoo",
  authDomain: "react-admin-firebase-hasura.firebaseapp.com",
  databaseURL: "https://react-admin-firebase-hasura.firebaseio.com",
  projectId: "react-admin-firebase-hasura",
  storageBucket: "react-admin-firebase-hasura.appspot.com",
  messagingSenderId: "1095256164368",
  appId: "1:1095256164368:web:c1691d031e699c5678e295",
};


const firebaseApp = firebase.initializeApp(firebaseConfig);

const firebaseOptions = {
  // Enable logging of react-admin-firebase
  app: firebaseApp,
  logging: true,
  // Authentication persistence, defaults to 'session', options are 'session' | 'local' | 'none'
  persistence: "session"
};

// This defines the AuthProvider first
const baseAuthProvider = FirebaseAuthProvider(firebaseConfig, firebaseOptions);

// Use this just like the normal auth provider
// 
const myAuthProvider = {
  // Copy all authprovider functionality
  ...baseAuthProvider,

  // login: async (params) => 
  // {
  //   alert("login -- ", params);
  //   await baseAuthProvider.HandleAuthLogin(params);
  // },
  // Wrap the login and check for custom claims
  getPermissions: async (params) => {
      try {

        let permissions = await baseAuthProvider.getPermissions();
        if( !permissions["https://hasura.io/jwt/claims"] )
        {
          // from 
          // https://firebase.google.com/docs/auth/admin/custom-claims
          const user = await baseAuthProvider.checkAuth();
          if (user) {
            // Check if refresh is required.
            let metadataRef = null;
            let callback = null;
            metadataRef = firebase.database().ref('metadata/' + user.uid + '/refreshTime');

            // Need to wait for the token to refresh. The token gets refreshed within the callback so 
            // we need to wait for that to finish before proceeding.
            await new Promise( async (resolve, reject) => {
              callback = async (snapshot) => { 
                // Force refresh to pick up the latest custom claims changes.
                // Note this is always triggered on first call. Further optimization could be
                // added to avoid the initial trigger when the token is issued and already contains
                // the latest claims.
                await user.getIdToken(true);
                console.log("Force user token refresh ");
                permissions = await baseAuthProvider.getPermissions();
                resolve(permissions);
              };
              // Subscribe new listener to changes on that node.
              metadataRef.once('value', callback);
              // Wait for callback to execute.     
            });
          }      
        }
          
        console.log("Permissions -> ", permissions);
        return permissions;
      }
      catch(e)
      {
        console.log("error ", e )
        // return permissions;
      }
      
  },
};

// Create a client for Hasura with the right headers
const httpClient = async (url, options = {}) =>  {

    return myAuthProvider.getJWTToken().then( function (JWT){
      if (!options.headers) {
          options.headers = new Headers({ Accept: 'application/json' });
      }

      options.headers.set('Authorization', `Bearer ${JWT}`);
      return fetchUtils.fetchJson(url, options);
    });
};

// Define the dataprovider
const dataProvider = hasuraDataProvider('https://hasura-container-test.herokuapp.com', httpClient);




const customRoutes = [
  <Route exact path="/CustomPage" component={CustomPage}  />
];
// Define main App
const App = () => {
  return (
    <Admin
      
      customRoutes={customRoutes}
      dashboard={Dashboard}
      history={history}
      // catchAll={Dashboard}
      authProvider={myAuthProvider}
      dataProvider={dataProvider}
      loginPage={CustomLoginPage}
    >
      {permissions => [
        // <Resource name="Dashboard" {...dashboard} />,
        <Resource name="tags" {...tags} />,
        permissions.email_verified ?
          <Resource
            name="todos"
            list={TodoList}
            edit={TodoEdit}
            create={TodoCreate}
          /> 
          : null,
        permissions.email_verified ?
          <Resource name="users" list={UserList} show={UserShow} />
          : null,
        
      ]
    }
    </Admin>
  );
};

export default App;
