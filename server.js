const { MongoClient } = require('mongodb');
const express = require("express");
const bodyParser = require('body-parser');
const ejs = require('ejs');
const app = express();

app.use(bodyParser.urlencoded({ extended: true }));
app.use(bodyParser.json());

const uri = "mongodb://127.0.0.1:27017/?readPreference=primary&ssl=false&directConnection=true";
const client = new MongoClient(uri);

const myDB = client.db("CandyFactory");
const myColl = myDB.collection("Candies");

app.listen(3000,function(){
    console.log("server is running on 3000");
});

var newSave = 0;

app.get("/", async (req, res) => {
    let data = await myColl.find({}).toArray();
    if(data.length > 0){
        res.render('index.ejs', {
            candyList : data
        })
        newSave = 2;
    }
    else{
        res.sendFile(__dirname + "/index.html");
        newSave = 1;
    }

});

app.post("/", async (req, res) =>{
    const bodyString = JSON.stringify(req.body);
    const temp = bodyString.split(",");

    var candyParameters = [];
    
    for (var i = 0; i < temp.length; i++) {
        candyParameters.push(temp[i].toString().split(":").pop());
    }
    console.log(candyParameters);
    var candy =[];
    var jsonCandy = [];
    var inc = 1;

    for (let i = 0; i < candyParameters.length; i++) {
        candy.push(candyParameters[i].toString().replace('"','').replace('"','').replace('}',''));
        
        if((i+1) % 4 == 0){
            if(newSave == 1){
                var currentdate = new Date();
                jsonCandy.push({
                    _id : inc,
                    name : "candy" + inc.toString(),
                    shape : candy[0],
                    color : candy[1],
                    sweetness : candy[2],
                    hardness : candy[3],
                    time : "Table created at: " + currentdate.getDate() + "/" + (currentdate.getMonth()+1) + "/" + currentdate.getFullYear() + "  " + currentdate.getHours() + ":" + currentdate.getMinutes() + ":" + currentdate.getSeconds()
                })
            }
            else if(newSave == 2){
                const filter = {_id : inc};

                const updateDocument = {
                    $set: {
                       shape : candy[0],
                       color : candy[1],
                       sweetness : candy[2],
                       hardness : candy[3],
                    },
                 };
                 const result = await myColl.updateOne(filter, updateDocument);
            }
            candy = [];
            inc++;
        }
    }
    if(newSave == 1){
        const insertManyresult = await myColl.insertMany(jsonCandy);
        let ids = insertManyresult.insertedIds;
        console.log(`${insertManyresult.insertedCount} documents were inserted.`);
        for (let id of Object.values(ids)) {
            console.log(`Inserted a document with id ${id}`);
        }
    }
    res.redirect('/');
});