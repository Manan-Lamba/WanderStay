// Initialization of sample data to the DataBase

const mongoose = require('mongoose');
const Listing = require('../Models/Listing');
const initData = require('./data');

// connect to the database
async function main(){
    try{
        await mongoose.connect("mongodb://127.0.0.1:27017/wanderstay");
        console.log("database connected successfully");
    }
    catch(err){
        console.log(err);
    }
}
main();

// initialising DB
async function init(){
    await Listing.deleteMany({});
    const data = await Listing.insertMany(initData.data);
    console.log(data);
}

init()
    .then((res) => console.log("data added successfully"))
    .catch((err) => console.log(err));

