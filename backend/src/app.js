// .dotenv initialization
import '@dotenvx/dotenvx/config'

import multer from 'multer';
const upload = multer({ dest: 'uploads/' })


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

app.post('/upload', upload.single('pic'), (req, res) => {

})
  
app.listen(port, () => {
    console.log(`Example app listening on port ${port}`);
})