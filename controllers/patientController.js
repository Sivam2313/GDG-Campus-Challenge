import expressAsyncHandler from "express-async-handler";
import { Patient } from "../models/patientSchema.js";
import { geocodeAddress } from "../utils/geocode.js";
import Ngo from "../models/ngoSchema.js";
import selectClosestAddress from "../utils/locationUtils.js";
import Doctor from "../models/doctorSchema.js";
import { genAI } from '../config/google-generative-ai.js';

export const addPatient = expressAsyncHandler(async (req, res) => {

    const { name, address, phone, gender, dob, description } = req.body;

    if (!name || !address || !phone || !gender || !dob || !description) {
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
        longitude: longitude,
        description: description
    };

    await Patient.create(patient);
    res.status(201).json(patient)
})

export const setClosestNgoSubscribers = expressAsyncHandler(async (req, res) => {
    const { id } = req.body;

    if (!id) {
        res.status(400);
        throw new Error("Bad Request - Missing id");
    }

    const patient = await Patient.findById(id);
    if (!patient) {
        res.status(400);
        throw new Error("No Patient found with that id");
    }
    const ngos = await Ngo.find();

    const destinationList = ngos.map(ngo => ({
        latitude: ngo.latitude,
        longitude: ngo.longitude,
        id: ngo._id,
        operatingArea: ngo.operatingArea,
    }));

    const closestNgo = await selectClosestAddress(patient, destinationList);

    const updatePatient = await Patient.findByIdAndUpdate(id, {
        $set: {
            ticketSubscribers: closestNgo.map(ngo => ngo.id)
        }
    }, { new: true })

    console.log(updatePatient);
    res.status(200).json(closestNgo);
})

export const showDoctorsList = expressAsyncHandler(async (req, res) => {
    const { id } = req.body;
    if (!id) {
        res.status(400);
        throw new Error("Bad Request - Missing id");
    }

    const patient = await Patient.findById(id);
    if (!patient) {
        res.status(404);
        throw new Error("No Patient found with that id");
    }

    const patientSymptoms = patient.description;
    let allDoctors = [];
    try {
        // Include availability in the query
        const doctorsResponse = await Doctor.find({})
            .select('-credentials')
            .lean();
        if (!doctorsResponse.length) {
            res.status(404);
            throw new Error('No doctors found');
        }

        allDoctors = doctorsResponse.map((doctor) => ({
            id: doctor._id,
            name: doctor.name,
            specialization: doctor.specialization,
            availability: doctor.availability?.map((avail) => ({
                day: avail.day,
                slots: avail.slots?.map((slot) => ({
                    startTime: slot.startTime,
                    endTime: slot.endTime,
                    isBooked: slot.isBooked
                })) || [] 
            })) || [] 
        }));
    } catch (error) {
        console.error("Error fetching doctors list:", error.message);
        res.status(500);
        throw new Error("Failed to retrieve doctors list");
    }

    const prompt = `Patient has described their symptoms as: "${patientSymptoms}".  
Here is a list of available doctors with their specializations and availability:  
${allDoctors.map(d => `${d.id} - ${d.name} - ${d.specialization} - ${JSON.stringify(d.availability)}`).join('\n')}. 

Based on the symptoms, suggest suitable doctors in JSON format.  

Use this JSON schema:  
Doctor = {
    'id': str, 
    'name': str, 
    'specialization': str, 
    'availability': list[{
        'day': str, 
        'slots': list[{
            'startTime': str, 
            'endTime': str, 
            'isBooked': bool
        }]
    }]
}  
Return: list[Doctor] 
Provide output as a raw JSON object, not as a string and without any formatting.
`;

    try {
        const model = genAI.getGenerativeModel({ model: "gemini-2.0-flash" });
        const result = await model.generateContent(prompt);

        let responseText = result.response?.text() || "";
        let cleanResponse = responseText.replace(/```json|```/g, '').trim();

        let recommendedDoctors;
        try {
            recommendedDoctors = JSON.parse(cleanResponse);
            if (typeof recommendedDoctors === 'string') {
                recommendedDoctors = JSON.parse(recommendedDoctors);
            }
        } catch (parseError) {
            console.error("Failed to parse Gemini response:", parseError.message);
            return res.status(500).json({ message: "Invalid response format from Gemini" });
        }

        res.status(200).json({ recommendedDoctors });
    } catch (error) {
        console.error("Error fetching response from Gemini:", error.message);
        res.status(500).json({ message: "Failed to retrieve recommended doctors" });
    }
});

