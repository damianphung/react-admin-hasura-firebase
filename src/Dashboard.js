// in src/Dashboard.js
import * as React from "react";
import { useRef, useState, useEffect } from 'react';
import Card from '@material-ui/core/Card';
import { CardContent, CardActionArea, Typography, Button} from '@material-ui/core';
import { Title } from 'react-admin';
import { useMutation } from 'react-admin';

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



const UserProfile = ( props ) => {
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

    
    const dataProvider = useDataProvider();
    const [user, setUser] = useState();
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState();

    // console.log("props ", props);
    useEffect( () => {
        const permissions = props.permissions;
        const userId = permissions.user_id; 
        console.log("user id ", userId)

        dataProvider.getOne('users', { id: userId })
            .then(({ data }) => {
                console.log("data ", data)
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
                    {true ?  
                    <ul>
                        Signed in with facebook
                        <li>Email: {user.email}</li>
                    </ul>    
                    :
                    <ul>
                        Please login with facebook
                        <li>id: {user.id}</li>
                    </ul>                    
                    }            
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
                        Click to sign in
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
    var childwin = window.open('https://xx-passport-starter.glitch.me/login/facebook', "popup", 'height=600px, width=600px');
}

const Dashboard = (props) => 
{   
    const { push, classes, ...rest } = props;
    
    // const { loaded, permissionsx } = usePermissions();
    let location = useLocation();
    const [count, setCount] = useState(false);


    const [mutate, { loading }] = useMutation();
    const updateProfile = (id, fbid) => mutate({
        type: 'update',
        resource: 'users',
        payload: {
            id: id,
            data: { last_seen: new Date(), fb_id: fbid }
        },
    },
    {
        onSuccess: ({data}) => {
            console.log("onSuccess data ", data)
        },
        onFailure: (error) => console.log("onFailure Error ", error.message),
    }
    );    

    // TODO:
    // Add button to open new window
    // https://github.com/damianphung/react-postgres-starter/blob/master/src/hooks/useAuth.js
    function handleMessage({ origin, data, source}) {

        // console.log("handle message Got event --> origin ", origin);
        // console.log("rest user_id --> ", rest.permissions.user_id)
        if ( origin === "https://xx-passport-starter.glitch.me") {
            // if ( origin === "https://99c9c66d1a37.ngrok.io") {
            if (!data.error) {
                console.log("data ---> ", data)
                if ( data.id )
                {
                    localStorage.setItem('facebookData', data.id);
                    // console.log("This is where you send graphql data! :)")
                    console.log("origin = ", origin);
                    console.log("window.location.origin = ", window.location.origin);       

                    updateProfile(rest.permissions.user_id, data.id);
                }
            } 
            else if ( data.session )
            {
                console.log("Got session ", data.session)
            }
        }
    }

    function registerEvent() {
        window.addEventListener('message', handleMessage, true);
    }

    useEffect(() => {
        if (!count)
        {
            
        //    alert(JSON.stringify(props));
        //    alert(JSON.stringify(location))
            // console.log(permissions);
            // prevennt multiple registering of events
           
            
            // alert(props)
            const session = qs.parse(location.search, { ignoreQueryPrefix: true }).session;
            // alert(JSON.stringify(props));
            // do GQL here to check user email.
            
            const email_verified = rest.email_verified;
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
    // console.log("props --- dashboard ", props);
    // console.log("permissions x-> ", rest)
    if (rest.permissions) {
        registerEvent();
        return <UserProfile {...props}/>  
    }
    else {
        return <Loading/> 
    }
}

export default compose(
    connect(
        undefined,
        { push }
    ),
    withStyles(styles)
)(Dashboard);