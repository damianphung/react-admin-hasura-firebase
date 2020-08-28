// LoginPage.js
import React from "react";
import { Login } from "react-admin";
import StyledFirebaseAuth from 'react-firebaseui/StyledFirebaseAuth';
import firebase from 'firebase';
import { Typography } from '@material-ui/core';
// import { ThemeProvider , MuiThemeProvider, createMuiTheme } from '@material-ui/core/styles';


// Configure FirebaseUI.
const uiConfig = {
  // Popup signin flow rather than redirect flow.
  signInFlow: 'popup',
  // Redirect to /signedIn after sign in is successful. Alternatively you can provide a callbacks.signInSuccess function.
  signInSuccessUrl: '/',
  // We will display Google and Facebook as auth providers.
  signInOptions: [
    {
        provider: firebase.auth.EmailAuthProvider.PROVIDER_ID,
        // signInMethod: firebase.auth.EmailAuthProvider.EMAIL_LINK_SIGN_IN_METHOD
        requireDisplayName: false
    },    
    // firebase.auth.EmailAuthProvider.PROVIDER_ID,
    firebase.auth.GoogleAuthProvider.PROVIDER_ID,
    firebase.auth.FacebookAuthProvider.PROVIDER_ID,
  ],
  // callbacks: {
  //   // Avoid redirects after sign-in
  //   signInSuccessWithAuthResult: () => false
  // }     
};

const SignInScreen = () => <StyledFirebaseAuth uiConfig={uiConfig} firebaseAuth={firebase.auth()}/>;

const CustomLoginForm = props => {

  const { location } = props;
  console.log("Location --> ", location);  
  return(
      <div>
        <div style={{fontFamily: "monospace", marginLeft: '5em', marginRight: '5em' }}>
          <Typography align="centre"> Welcome to xxxx </Typography>
        </div>
        {/* <LoginForm {...props} /> */}
        <SignInScreen />
      </div>    

  );

};

const CustomLoginPage = props => (
  <Login {...props}>
    <CustomLoginForm {...props}/>
  </Login>
);

export default CustomLoginPage;