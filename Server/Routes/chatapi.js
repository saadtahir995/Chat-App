const { GoogleGenerativeAI } = require("@google/generative-ai");
require('dotenv').config();
const express = require('express');
const bodyParser = require('body-parser');
const app = express();
app.use(express.json());
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: false }));

const genAI = new GoogleGenerativeAI(process.env.API_KEY);
app.post('/chat', async (req, res) => {
    const { message } = req.body;
    if(!message) return res.send('No prompt provided');
    const result = await genAI.getGenerativeModel({ model: "gemini-1.5-flash" }).generateContent(message);
    const response = await result.response;
    const text = await response.text();
    res.send({text});
    
})

module.exports = app

