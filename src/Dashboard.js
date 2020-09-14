// in src/Dashboard.js
import * as React from "react";
import { Fragment } from "react";
import { useState, useEffect } from 'react';
import Card from '@material-ui/core/Card';
import { CardContent, CardActionArea, Typography, Button} from '@material-ui/core';
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

const styles = {
    drawerContent: {
        width: 300
    }
};

const UserProfile = ( props ) => {

    const dataProvider = useDataProvider();
    const [user, setUser] = useState();
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState();
    const [mutate, { loadingx }] = useMutation();

    function registerEvent() {
        console.log("Register event")
        window.addEventListener('message', handleMessage, true);
    } 

    function handleMessage({ origin, data, source}) {
        if ( origin === "https://xx-passport-starter.glitch.me") {
            if (!data.error) {
                console.log("data ---> ", data)
                if ( data.userid && data.fbuserid && data.fbpageid )
                {    /** Bind session with facebook */
                    updateProfile(user.user_id , data.userid);
                }
            } 
        }
    }    

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
    
    registerEvent();
    const updateProfile = (id, facebookid) => mutate({
        type: 'update',
        resource: 'users', // shopify facebook table linker
        payload: {
            id: id,
            data: { facebook_id: facebookid }
        },
    },
    {
        onSuccess: ({data}) => {
            setLoading(false);
            window.location.reload(false);
        },
        onFailure: (error) => {
            setLoading(false);
            console.log("onFailure Error ", error.message)
        },
    }
    );

    const userToken = localStorage.getItem("token");
    if( userToken === null )
    {
        console.log("Please sign up through shopify")
    }   
    else if ( !user.session_id ) // first time login 
    {
        // send session id for user to GQL
        // Bind user and session
        fetch('https://xx-passport-starter.glitch.me/linkUser', {
            method: 'PUT',
            headers: {
              'Content-Type': 'application/json',
              'Accept': 'application/json',
              "x-app-token" : userToken
            },
            body: JSON.stringify({
                user: user.id
            }),
          })
          .then(({ data }) => {
            console.log("linkUser data ", data)

        })
         .catch(error => {
            console.log("linkUser error ", error)
        })     
    }

    return (
        <Card>
            <CardActionArea>
                <CardContent>
                    {user.facebook_id  ?  
                    <Fragment>
                        <Typography gutterBottom variant="h5" component="h2">
                            Lizard
                        </Typography>
                        <Typography variant="body2" color="textSecondary" component="p">
                            Lizards are a widespread group of squamate reptiles, with over 6,000
                            species, ranging across all continents except Antarctica
                        </Typography>
                    </Fragment>
                    :
                    <Fragment>
                        <Button
                            size="small"
                            variant="contained"
                            color="primary"
                            onMouseDown={event => event.stopPropagation()}
                            onClick={event => buttonClick(event)}
                        >
                            Click to sign in
                        </Button>        
                    </Fragment>
                    }                   
                        
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
    // const [mutate, { loading }] = useMutation();
    // const updateProfile = (id, facebookid) => mutate({
    //     type: 'update',
    //     resource: 'users', // shopify facebook table linker
    //     payload: {
    //         id: id,
    //         data: { facebook_id: facebookid }
    //     },
    // },
    // {
    //     // , fb_id: fbid
    //     onSuccess: ({data}) => {
    //         console.log("onSuccess data ", data)
    //     },
    //     onFailure: (error) => console.log("onFailure Error ", error.message),
    // }
    // );    

    // function handleMessage({ origin, data, source}) {
    //     // console.log("handle message Got event --> origin ", origin);
    //     // console.log("rest user_id --> ", rest.permissions.user_id)
    //     if ( origin === "https://xx-passport-starter.glitch.me") {
    //         if (!data.error) {
    //             console.log("data ---> ", data)
    //             if ( data.userid )
    //             {
    //                 // localStorage.setItem('facebookData', data.id);
    //                 // console.log("This is where you send graphql data! :)")
    //                 console.log("origin = ", origin);
    //                 console.log("window.location.origin = ", window.location.origin);       
    //                 // const json = {
    //                 //     storedToken : storedToken,
    //                 //     facebook : data.userid
    //                 // };
    //                 // // do a fetch instead?
    //                 // // Send token + facebook id to web server to associate the two
    //                 // let options = {};
    //                 // options.headers = new Headers({ 
    //                 //     'Content-Type': 'application/json',
    //                 //     'Accept': 'application/json', 
    //                 //     "x-facebook-user-id": data.userid,
    //                 //     "x-user-id": rest.permissions.user_id });
    
    //                 console.log("Sending fetch")
    //                 updateProfile(rest.permissions.user_id , data.userid);
    //                 // Should send a POST instead to get a response. Set that response in local storage
    //                 // return fetchUtils.fetchJson("https://xx-passport-starter.glitch.me/facebook", options);   
    //             }
    //         } 
    //     }
    // }

    // function registerEvent() {
    //     window.addEventListener('message', handleMessage, true);
    // } 

    useEffect(() => {
        if (!count)
        {
            
        //    alert(JSON.stringify(props));
        //    alert(JSON.stringify(location))
            // console.log(permissions);
            // prevennt multiple registering of events
           
            
            // alert(props)
            // const session = qs.parse(location.search, { ignoreQueryPrefix: true }).session;
            // alert(session);
            // do GQL here to check user email.
            
            const email_verified = rest.email_verified;
            if ( ! email_verified )
            {
                console.log("Email not verified");
            }

            // if ( session )
            // {
            //     window.localStorage.setItem("Session", session);
            // }

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
        // registerEvent();
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