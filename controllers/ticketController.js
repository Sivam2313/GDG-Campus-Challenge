import expressAsyncHandler from "express-async-handler";
import { Ticket }  from "../models/ticketSchema.js";
import Patient from "../models/patientSchema.js";
import Ngo from "../models/ngoSchema.js";

export const addTicket = expressAsyncHandler(async (req, res) => {
    const {patientId, doctorId, type, details} = req.body;
    if (!patientId || !doctorId || !type || !details) {
        res.status(400);
        throw new Error("Please add all the fields");
    }

    const ticket = {
        patientId: patientId,
        doctorId: doctorId,
        type: type,
        details: details,
    };

    const newTicket = await Ticket.create(ticket);
    if(newTicket){
        notifyAdd(patientId,newTicket);
        res.status(201).json(newTicket)
    }
    else{
        res.status(400);
        throw new Error("Could not create ticket");
    }
})

export const closeTicket = expressAsyncHandler(async (req, res) => {
    const {ticketId} = req.body;

    const ticket = await Ticket.findById(ticketId);
    
    if(ticket){
        notifyDelete(ticket)
        await Ticket.findByIdAndDelete(ticketId);
        res.status(200).json(ticket)
    }
    else{
        res.status(400);
        throw new Error("Could not find ticket")
    }   
})

async function notifyAdd(patientId,ticket){
    const patient = await Patient.findById(patientId);
    const subscribers = patient.ticketSubscribers;
    subscribers.forEach(async (ngoId) => {
        const ngo = await Ngo.findByIdAndUpdate(ngoId,{
            $push: {
                ticketQueue: ticket._id
            }
        })
    });
    await Ticket.findByIdAndUpdate(ticket._id, {
        $set: {
            subscribers: subscribers
        }
    })
    const result = await Ticket.findById(ticket._id);
    
}

async function notifyDelete(ticket) {
    const subscribers = ticket.subscribers;
    subscribers.forEach(async (ngoId) => {
        const ngo = await Ngo.findByIdAndUpdate(ngoId,{
            $pull: {
                ticketQueue: ticket._id
            }
        });
    });
    await Ticket.findByIdAndUpdate(ticket._id, {
        $set: {
            subscribers: subscribers
        }
    })
}