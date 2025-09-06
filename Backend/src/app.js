const express = require('express') ; 
const aiRoutes = require('./routes/ai.routes') ; 
const cors = require('cors'); 
const app = express() ; 

app.use(cors()) ; 


app.get('/' , function(req ,  res) {
    res.send("hello saif")
})

app.use(express.json()) ; 

app.use('/ai' , aiRoutes) ; 

module.exports = app 
