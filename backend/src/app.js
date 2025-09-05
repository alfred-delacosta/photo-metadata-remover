// .dotenv initialization
import '@dotenvx/dotenvx/config'

import multer from 'multer';
const upload = multer({ dest: './src/uploads/' })

import uniqueFilename from 'unique-filename';
import getFileParts  from './utils/fileUtils.js';


//#region Express app Setup
import  express  from 'express';
// const express = require('express');
const app = express();
const port = process.env.PORT;

app.use(express.json());
app.use(express.urlencoded({ extended: false }));
//#endregion

app.get('/', async (req, res) => {
    console.log (uniqueFilename('/uploads'));
    res.send('welcome to the API');
})

app.post('/upload', upload.single('pic'), (req, res) => {
    const { basename, extension } = getFileParts(req.file.originalname);
    console.log(basename)
    console.log(extension);
    res.send("File uploaded");
})
  
app.listen(port, () => {
    console.log(`Example app listening on port ${port}`);
})