import expressAsyncHandler from "express-async-handler";
import { Patient } from "../models/patientSchema.js";
import { geocodeAddress } from "../utils/geocode.js";
import Ngo from "../models/ngoSchema.js";
import selectClosestAddress from "../utils/locationUtils.js";


export const addPatient = expressAsyncHandler(async (req, res) => {

    const { name, address, phone, gender, dob } = req.body;

    

    if (!name || !address || !phone || !gender || !dob) {
        res.status(400);
        throw new Error("Please add all the fields");
    }

    const existingPatient = await Patient.findOne({ phone });
    if (existingPatient) {
        res.status(400);
        throw new Error("Patient already exists");
    }

    const { latitude, longitude } = await geocodeAddress(address);
    

    const patient = {
        name: name,
        address: address,
        phone: phone,
        gender: gender,
        dob: dob,
        latitude: latitude,
        longitude: longitude
    };

    await Patient.create(patient);
    res.status(201).json(patient)
})

export const getClosestNgo = expressAsyncHandler(async (req, res) => {
    const { id } = req.body;

    if (!id) {
        res.status(400);
        throw new Error("Bad Request - Missing id");
    }

    const patient = await Patient.findById(id);
    if(!patient){
        res.status(400);
        throw new Error("No Patient found with that id");
    }
    const ngos = await Ngo.find();
    
    const destinationList = ngos.map(ngo => ({
        latitude: ngo.latitude,
        longitude: ngo.longitude,
        id: ngo._id
    }));

    const closestNgo = await selectClosestAddress(patient, destinationList);

    res.status(200).json(closestNgo);
})