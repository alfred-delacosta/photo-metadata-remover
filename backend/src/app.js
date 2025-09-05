// .dotenv initialization
import '@dotenvx/dotenvx/config'


//#region Express app Setup
import  express  from 'express';
// const express = require('express');
const app = express();
const port = process.env.PORT;

app.use(express.json());
app.use(express.urlencoded({ extended: false }));
//#endregion

app.get('/', async (req, res) => {
    res.send('welcome to the API');
})
  
app.listen(port, () => {
    console.log(`Example app listening on port ${port}`);
})