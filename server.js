const express = require('express');

const bodyParser = require ('body-parser');

const multer = require('multer');

const path = require('path');

const fs = require('fs');

const mongodb = require('mongodb');

const app = express();

// use the middle ware of bodyparser

app.use(bodyParser.urlencoded({extended:true}))


var storage = multer.diskStorage({
    destination:function(req,file,cb){``
        cb(null,'uploads')
    }, 
    filename:function(req,file,cb){
        cb(null,file.fieldname + '-' + Date.now() + path.extname(file.originalname));
    }
})


var upload =multer({
    storage:storage
})


//configuring mongodb

const MongoClient = mongodb.MongoClient;
const url = 'mongodb://localhost:27017';

MongoClient.connect(url,{
    useUnifiedTopology:true,useNewUrlParser:true
},(err,client) =>{
    if(err) return console.log(err);

    db = client.db('uploads');

    app.listen(3000,() => {
        console.log("Mongodb Server Listening at 3000")
    })

})


//configuring the home route

app.get('/' ,(req,res)=>{
    res.sendFile(__dirname + '/index.html');
})

// configuring the image upload to the database

app.post("/uploadphoto",upload.single('myImage'),(req,res) =>{
    var img = fs.readFileSync(req.file.path);

    var encode_image = img.toString('base64');

    // define a JSON Object for the Image

    var finalImg = {
        contentType:req.file.mimetype,
        path:req.file.path,
        image:new Buffer(encode_image,'base64')

    };

    // insert the image to the database

    db.collection('image').insertOne(finalImg,(err,result) =>{
        console.log(result);

        if(err) return console.log(err);

        console.log("Saved to database");

        res.contentType(finalImg.contentType);

        res.send(finalImg.image);
    })
})

app.listen(5000,() => {
    console.log("Server is listening on port 5000");
})