require('dotenv').config();

const mongoose = require('mongoose')

function connectDB() {
    // Database Connection 
    mongoose.connect(process.env.mongo_url, {useNewURlParser: true, useUnifiedTopology: true});  // url will be the sacred because that will hold credentials which we cant disclose


    const connection = mongoose.connection;

    connection.once('open', () => {        // work like a event listener
        console.log('Database Connected.')
    })                  
 
}


module.exports = connectDB;