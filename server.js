const express = require('express');  // import express libraries 
const app = express(); //call express
const path = require('path'); //path is node.js inbuilt module
const cors = require('cors');

const connectDB = require('./config/db');
connectDB();

//cors - serve multiple origin(domain, port)
const corsOptions = {
    origin: process.env.ALLOWED_CLIENTS.split(',')
}
app.use(cors(corsOptions))


//static middleware of express 
app.use(express.static('public'))
app.use(express.json())

//Routes 

app.use('/api/files', require('./routes/files')) //upload
app.use('/files', require('./routes/show'))
app.use('/files/download', require('./routes/download'))



//template engine
app.set('views', path.join(__dirname, '/views'))
app.set('view engine', 'ejs')

app.get('/', function (req, res) {
    res.sendFile(__dirname + "/frontend/index.html")    
})



const PORT = process.env.PORT || 7000;
app.listen(PORT, () => {
    console.log(`Listeing on port ${PORT}`); // templet literal 
})




