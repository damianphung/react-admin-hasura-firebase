import React from "react";
import { fetchUtils, Admin, Resource } from "react-admin";
import { TodoCreate, TodoEdit, TodoList } from "./todos";
import { UserList, UserShow } from "./users";
import hasuraDataProvider from "ra-data-hasura";
//import PostIcon from '@material-ui/icons/Book';
//import UserIcon from '@material-ui/icons/Group';
import { FirebaseAuthProvider } from "react-admin-firebase";
import CustomLoginPage from './CustomLoginPage';
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


const firebaseApp = firebase.initializeApp(firebaseConfig);

const firebaseOptions = {
  // Enable logging of react-admin-firebase
  app: firebaseApp,
  logging: true,
  // Authentication persistence, defaults to 'session', options are 'session' | 'local' | 'none'
  persistence: "session"
};

// This defines the AuthProvider first
const fbAuthProvider = FirebaseAuthProvider(firebaseConfig, firebaseOptions);

// Create a client for Hasura with the right headers
const httpClient = (url, options = {}) => {
    return fbAuthProvider.getJWTToken().then(function (JWT){
      if (!options.headers) {
          options.headers = new Headers({ Accept: 'application/json' });
      }
      // add your own headers here
      // The issue is claims are not found:
      // This needs to be in the header.
      // const customClaims = {
      //   "https://hasura.io/jwt/claims": {
      //     "x-hasura-default-role": "user",
      //     "x-hasura-allowed-roles": ["user"],
      //     "x-hasura-user-id": user.uid
      //   }
      // };      
      console.log("JWT -> ", JWT);
      console.log("decoded JWT.user_id -> ", JSON.parse(atob(JWT.split('.')[1])));

      
      options.headers.set('Authorization', `Bearer ${JWT}`);
      return fetchUtils.fetchJson(url, options);
    });
    };

// Define the dataprovider
// ngtok this and deploy on firebase
const dataProvider = hasuraDataProvider('https://21a206013681.ngrok.io', httpClient);

// Define main App
const App = () => {
  return (
    <Admin
      dataProvider={dataProvider}
      authProvider={fbAuthProvider}
      // loginPage={CustomLoginPage}
    >
      <Resource
        name="todos"
        list={TodoList}
        edit={TodoEdit}
        create={TodoCreate}
      />
      <Resource name="users" list={UserList} show={UserShow} />
    </Admin>
  );
};

export default App;
