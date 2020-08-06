import React from "react";
import { fetchUtils, Admin, Resource } from "react-admin";
import { TodoCreate, TodoEdit, TodoList } from "./todos";
import { UserList, UserShow } from "./users";
import hasuraDataProvider from "ra-data-hasura";
//import PostIcon from '@material-ui/icons/Book';
//import UserIcon from '@material-ui/icons/Group';
import { FirebaseAuthProvider } from "react-admin-firebase";
import CustomLoginPage from './CustomLoginPage';

// Define Firebase auth provider
const firebaseConfig = {
  apiKey: "AIzaSyAeTQUcAnY0Cq6uyxLfBvihW5EvLLzk6xM",
  authDomain: "react-admin-botservice.firebaseapp.com",
  databaseURL: "https://react-admin-botservice.firebaseio.com",
  projectId: "react-admin-botservice",
  storageBucket: "react-admin-botservice.appspot.com",
  messagingSenderId: "227248537210",
  appId: "1:227248537210:web:afece4f9cdd804e8d545c3"
};


const firebaseOptions = {
  // Enable logging of react-admin-firebase
  logging: true
  // Authentication persistence, defaults to 'session', options are 'session' | 'local' | 'none'
  persistence: "none"
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
      options.headers.set('Authorization', `Bearer ${JWT}`);
      return fetchUtils.fetchJson(url, options);
    });
    };

// Define the dataprovider
// ngtok this and deploy on firebase
const dataProvider = hasuraDataProvider('https://6b4438a3dff6.ngrok.io', httpClient);

// Define main App
const App = () => {
  return (
    <Admin
      dataProvider={dataProvider}
      authProvider={fbAuthProvider}
      loginPage={CustomLoginPage}
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
