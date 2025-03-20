import mongoose from 'mongoose';

const ngoSchema = new mongoose.Schema({
    name: {
        type: String,
        required: true,
    },
    contact: {
        type: String,
        required: true,
    },
    latitude: {
        type: Number,
        required: true
    },
    longitude: {
        type: Number,
        required: true
    },
    orgSize:{
        type: Number,
        required: true,
    },
    operatingArea:{
        type: Number, 
        enum: [10, 30, 50, 100, 500, 1000, Infinity],
        required: true 
    },
    ticketsClosed: {
        type:Number, 
        default:0
    },
    ticketQueue:[{
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Ticket',
    }],
    createdAt: {
        type: Date,
        default: Date.now,
    },
    updatedAt: {
        type: Date,
        default: Date.now,
    },
});

const Ngo = mongoose.model('Ngo', ngoSchema);

export default Ngo;
