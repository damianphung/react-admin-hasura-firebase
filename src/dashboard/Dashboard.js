// in src/Dashboard.js
import * as React from "react";
import { useState, useEffect } from 'react';
import Card from '@material-ui/core/Card';
import { CardContent, CardActionArea, Typography, Button} from '@material-ui/core';
import { Title } from 'react-admin';
import { usePermissions } from 'react-admin';

import { connect } from 'react-redux';
import { compose } from 'recompose';
import { push } from 'react-router-redux';
import { withStyles } from '@material-ui/core';
import { useDataProvider, Loading, Error } from 'react-admin';

import {
    BrowserRouter as Router,
    Switch,
    useLocation
  } from "react-router-dom";

var qs = require("qs");

const styles = {
    drawerContent: {
        width: 300
    }
};



const UserProfile = ({ userId }) => {
    const dataProvider = useDataProvider();
    const [user, setUser] = useState();
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState();
    useEffect(() => {
        dataProvider.getOne('users', { id: userId })
            .then(({ data }) => {
                setUser(data);
                setLoading(false);
            })
            .catch(error => {
                setError(error);
                setLoading(false);
            })
    }, []);

    if (loading) return <Loading />;
    if (error) return <Error />;
    if (!user) return null;

    return (

        <Card>
            <CardActionArea>
                <CardContent>
                    <ul>
                        <li>Email: {user.email}</li>
                    </ul>                    
                    {/* <Typography>Click me!</Typography> */}
                    <Typography gutterBottom variant="h5" component="h2">
                        Lizard
                    </Typography>
                    <Typography variant="body2" color="textSecondary" component="p">
                        Lizards are a widespread group of squamate reptiles, with over 6,000
                        species, ranging across all continents except Antarctica
                    </Typography>
                    <Button
                        size="small"
                        variant="contained"
                        color="primary"
                        onMouseDown={event => event.stopPropagation()}
                        onClick={event => buttonClick(event)}
                    >
                        Learn More
                    </Button>                           
                        
                </CardContent>
            </CardActionArea>
        </Card>        
    )
};

function buttonClick(event)
{
    event.stopPropagation();
    event.preventDefault();
    // var childwin = window.open('https://99c9c66d1a37.ngrok.io/login/facebook', "popup", 'height=600px, width=600px');
    var childwin = window.open('https://xx-passport-starter.glitch.me/login/facebook', "popup", 'height=600px, width=600px');

}
// TODO:
// Add button to open new window
// https://github.com/damianphung/react-postgres-starter/blob/master/src/hooks/useAuth.js
function handleMessage({ origin, data, source}) {

    console.log("handle message Got event --> source ");
    if ( origin === "https://xx-passport-starter.glitch.me") {
        // if ( origin === "https://99c9c66d1a37.ngrok.io") {
      if (!data.error) {
        console.log("data ---> ", data)
        if ( data.id )
            localStorage.setItem('facebookData', data.id);
            console.log("This is where you send graphql data! :)")
            console.log("origin = ", origin);
            console.log("window.location.origin = ", window.location.origin);     
            
        } else if ( data.session )
        {
            console.log("Got session ", data.session)
        }
      }
    else{

        console.log("origin = ", origin);
        console.log("window.location.origin = ", window.location.origin);
        if ( data )
        {
            console.log("Got data ", data)
        }        
    }
}

function registerEvent() {
    console.log("registerEvent")
    // window.addEventListener('message', handleMessage, true);
    window.addEventListener('message', handleMessage, true);
}



const query_email = `
query {
    users {
      email
    }
  }
`;



const Dashboard = (props) => 
{   
    // onload check if *user email* has facebook configured in the system
    // if it is:
    //  render the page with user details on dash board, by subscribing to graphql server
    //  render sign up with facebook component
    // if not:
    //  assume they come from shopify
    //  - look in to session value from localStorage.
    //  - prompt user to sign in to facebook
    //  - on eventHandler send session value with facebook profile info to server
    //  - render page, by subscribing to graphql server
    //  - render fb details component
    
    // const { push, classes, ...props } = this.props;
    const { push, classes, ...permissions } = props;
    
    // const { loaded, permissionsx } = usePermissions();
    let location = useLocation();
    const [count, setCount] = useState(false);
    // const { permissions } = usePermissions();
    useEffect(() => {
        if (!count)
        {
        //    alert(JSON.stringify(permissions));
        //    alert(JSON.stringify(location))
            // console.log(permissions);
            // prevennt multiple registering of events
            
            registerEvent();
            // alert(props)
            const session = qs.parse(location.search, { ignoreQueryPrefix: true }).session;
            // alert(JSON.stringify(props));
            // do GQL here to check user email.
            const email_verified = permissions.email_verified;
            if ( ! email_verified )
            {
                console.log("Email not verified");
            }

            if ( session )
            {
                window.localStorage.setItem("Session", session);
            }

            // let url = new URL((location));
            // let searchParams = new URLSearchParams(location);
            // alert(url);

            setCount(true);
        }

        // return function cleanup() {
        //     console.log("CLeaning up")
        //     setCount(false)
        //     window.removeEventListener('message', handleMessage, true);
        // };        
    });

    // let url = new URL("https://99c9c66d1a37.ngrok.io?session");
    // let searchParams = new URLSearchParams(url.search);
    // console.log("search params -> ", searchParams);
    // console.log("has session -> ", searchParams.get("session"));    

    // const parsed = queryString.parse(location.search);    

            
    // let location = useLocation();
    // console.log("location --> ", location);
    // let searchParams = new URLSearchParams(location.pathname);
    // console.log("search params --> ", searchParams);   
    
        return (
            <UserProfile/>
    );
}

export default compose(
    connect(
        undefined,
        { push }
    ),
    withStyles(styles)
)(Dashboard);