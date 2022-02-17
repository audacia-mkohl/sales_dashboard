import express from 'express';
import dotenv from 'dotenv';
import { Shopify } from '@shopify/shopify-api';
dotenv.config();

const host = '127.0.0.1';
const port = 3000; 
const shops = {};
const ACTIVE_SHOPIFY_SHOPS = {};

const {SHOPIFY_API_KEY, SHOPIFY_API_SECRET, SHOPIFY_API_SCOPES, HOST} = process.env;

Shopify.Context.initialize({
    API_KEY: SHOPIFY_API_KEY,
    API_SECRET_KEY: SHOPIFY_API_SECRET,
    SCOPES: SHOPIFY_API_SCOPES,
    HOST_NAME: HOST,
    IS_EMBEDDED_APP: true,
    SESSION_STORAGE: new Shopify.Session.MemorySessionStorage()
});


const app = express();

app.get('/', async (req, res) => {
    if (typeof shops[req.query.shop] !== 'undefined'){
        res.send('Hello World test 4');
    } else {
        res.redirect(`/auth?shop=${req.query.shop}`);
    }
});

app.get('/auth', async (req, res) => {
    const authRoute = await Shopify.Auth.beginAuth(
        req,
        res,
        req.query.shop,
        '/auth/callback',
        false,
    )
    res.redirect(authRoute);
});

app.get('/auth/callback', async (req, res) => {
    try {
        const shopSession = await Shopify.Auth.validateAuthCallback(
            req,
            res,
            req.query
        );
        ACTIVE_SHOPIFY_SHOPS[shopSession.shop] = shopSession.scope;
        console.log(shopSession);
        shops[shopSession.shop] = shopSession;
        res.redirect(`http://${shopSession.shop}/admin/apps/dashboard-62`)
    } catch (error) {
        console.error(error); // in practice these should be handled more gracefully
      }
});

app.listen(port, () => {
    console.log(`Server running at http://${host}:${port}/`);
});
