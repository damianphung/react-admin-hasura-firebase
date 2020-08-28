// in src/Foo.js
import * as React from "react";
import Card from '@material-ui/core/Card';
import CardContent from '@material-ui/core/CardContent';
import { Title } from 'react-admin';
import { useAuthState, Loading } from 'react-admin';

const CustomPage = (props) => {
    const { loading, authenticated } = useAuthState();
    console.log("props ", props);
    return (
    <Card>
        <Title title="My Page" />
        <CardContent>
            Hello CustomPage
        </CardContent>
    </Card>
    );
};

export default CustomPage;