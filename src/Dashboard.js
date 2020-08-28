// in src/Dashboard.js
import * as React from "react";
import { useState, useEffect } from 'react';
import Card from '@material-ui/core/Card';
import { CardContent, CardActionArea, Typography, Button} from '@material-ui/core';
import { Title } from 'react-admin';
import fetch from "isomorphic-fetch";
import {
    BrowserRouter as Router,
    Switch,
    useLocation
  } from "react-router-dom";

var qs = require("qs");
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
            
        }
      }
    else{

        console.log("origin = ", origin);
        console.log("window.location.origin = ", window.location.origin);
    }
}

function registerEvent() {
    console.log("registerEvent")
    // window.addEventListener('message', handleMessage, true);
    window.addEventListener('message', handleMessage, true);
}




export default (props) => 
{
    let location = useLocation();
    const [count, setCount] = useState(false);

    useEffect(() => {
        if (!count)
        {
            // prevennt multiple registering of events
            registerEvent();
            alert("Loaded dashboard")
            const session = qs.parse(location.search, { ignoreQueryPrefix: true }).session;
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
    function buttonClick(event)
    {
        event.stopPropagation();
        event.preventDefault();
        // var childwin = window.open('https://99c9c66d1a37.ngrok.io/login/facebook', "popup", 'height=600px, width=600px');
        var childwin = window.open('https://xx-passport-starter.glitch.me/login/facebook', "popup", 'height=600px, width=600px');
 
    }
            
    // let location = useLocation();
    // console.log("location --> ", location);
    // let searchParams = new URLSearchParams(location.pathname);
    // console.log("search params --> ", searchParams);   
    
        return (
        <Card>
            <Title title="Welcome to the administration" />
            <CardActionArea href="https://b660acc568e0.ngrok.io/login/facebook">
                <CardContent>
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
    );
}