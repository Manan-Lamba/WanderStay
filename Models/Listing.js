const mongoose = require('mongoose');
const Review = require("./Review")

// listing schema
const listingSchema = new mongoose.Schema({
    title: {
        type: String,
        required: true
    },
    description: {
        type: String,
        required: true
    },
    image: {
        filename: {
            type: String
        },
        url: {
            type: String
        }
    },
    price: {
        type: String,
        required: true
    },
    location: {
        type: String,
        required: true
    },
    country: {
        type: String,
        required: true
    },
    reviews: [
        {
            type: mongoose.Schema.Types.ObjectId,
            ref: "Review"
        }
    ]
});

// listing model
const Listing = mongoose.model('Listing', listingSchema);

listingSchema.post("findOneAndDelete", async (listing) => {
    if(listing){
        await Review.deleteMany({
            _id: {$in: listing.reviews}
        });
    }
});

//export only the model
module.exports = Listing;