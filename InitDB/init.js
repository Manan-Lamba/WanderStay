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
    initData.data = initData.data.map((listing) => {
        return{
            ...listing,
            owner: "6a85467886a42ede2ff4a256"
        };
    });
    // initData.data = array of objects
    const data = await Listing.insertMany(initData.data);
    console.log(data);
}

init()
    .then((res) => console.log("data added successfully"))
    .catch((err) => console.log(err));

