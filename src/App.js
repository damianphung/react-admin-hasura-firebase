import React from "react";
import { fetchUtils, Admin, Resource } from "react-admin";
import { TodoCreate, TodoEdit, TodoList } from "./todos";
import { UserList, UserShow } from "./users";
import hasuraDataProvider from "ra-data-hasura";
//import PostIcon from '@material-ui/icons/Book';
//import UserIcon from '@material-ui/icons/Group';
import { FirebaseAuthProvider } from "react-admin-firebase";
import CustomLoginPage from './CustomLoginPage';
import Dashboard from './Dashboard';

import firebase from 'firebase';
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


// const firebaseApp = firebase.initializeApp(firebaseConfig);

const firebaseOptions = {
  // Enable logging of react-admin-firebase
  // app: firebaseApp,
  logging: true,
  // Authentication persistence, defaults to 'session', options are 'session' | 'local' | 'none'
  persistence: "session"
};

// This defines the AuthProvider first
const fbAuthProvider = FirebaseAuthProvider(firebaseConfig, firebaseOptions);
console.log("auth provider --> ", fbAuthProvider);

// Use this just like the normal auth provider
const myAuthProvider = {
  // Copy all authprovider functionality
  ...fbAuthProvider,
  // Wrap the login and check for custom claims
  login: async (params) => {
    // const claims = await fbAuthProvider.getPermissions();

    // console.log("Login claims -> ", claims);    
    const user = await fbAuthProvider.login(params);
    // getPermissions is how when get the custom claims for the logged in user

    // const isAdmin = Array.isArray(claims) && claims.includes("admin");
    return user;
    // if (isAdmin) {
    //   return user;
    // }
    // // Make sure user is logged out, if not an admin
    // await fbAuthProvider.logout()
    // throw new Error("Login error, invalid permissions");
  },
};

// console.log("myAuthProvider provider --> ", myAuthProvider);




// Create a client for Hasura with the right headers
const httpClient = (url, options = {}) => {
    return myAuthProvider.getJWTToken().then(function (JWT){
      if (!options.headers) {
          options.headers = new Headers({ Accept: 'application/json' });
      }
      // add your own headers here
      // console.log("JWT -> ", JWT);

      // console.log("fbAuthProvider.getPermissions() -> ", fbAuthProvider.getPermissions()); 
      options.headers.set('Authorization', `Bearer ${JWT}`);
      return fetchUtils.fetchJson(url, options);
    });
    };

// Define the dataprovider
// ngtok this and deploy on firebase
const dataProvider = hasuraDataProvider('https://hasura-container-test.herokuapp.com', httpClient);

// Define main App
const App = () => {
  return (
    <Admin
      dashboard={Dashboard}
      authProvider={myAuthProvider}
      dataProvider={dataProvider}
      loginPage={CustomLoginPage}
    >
      {(permissions) => [
        <Resource
          name="todos"
          list={TodoList}
          edit={TodoEdit}
          create={TodoCreate}
        />,
        <Resource name="users" list={UserList} show={UserShow} />
      ]}
    </Admin>
  );
};

export default App;
