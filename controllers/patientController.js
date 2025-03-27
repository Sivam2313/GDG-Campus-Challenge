import expressAsyncHandler from "express-async-handler";
import Patient  from "../models/patientSchema.js";
import { geocodeAddress } from "../utils/geocode.js";
import Ngo from "../models/ngoSchema.js";
import selectClosestAddress from "../utils/locationUtils.js";
import Doctor from "../models/doctorSchema.js";
import { genAI } from '../config/google-generative-ai.js';
import Appointment from "../models/appointmentSchema.js";
import jwt from 'jsonwebtoken';

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

    const token = jwt.sign(
        { patientId: patient._id, contact: patient.phone },
        process.env.SECRET_KEY,
        { expiresIn: '1h' }
      );
    res.status(201).json(token)
    
})


export const loginPatient = expressAsyncHandler(async (req, res) =>{
    const { phone, name } = req.body;
    const isValidPhoneNumber = /^(\+91\s?|0)?[6-9][0-9]{9}$/.test(phone);
    if (!phone || !name) {
        res.status(400);
        throw new Error("Please add all the fields");
    }
    if(!isValidPhoneNumber){
        res.status(400);
        throw new Error("Invalid Phone Number")
    }
    const patient = await Patient.findOne({ phone });
    if (!patient) {
        res.status(400);
        throw new Error("Patient does not exist");
    }
    const isMatch = (patient.name === name);
    if(!isMatch){
        res.status(400).json({message: 'Invalid Name'});
        return;
    }
    const token = jwt.sign({ patientId: patient._id, contact: patient.phone }, process.env.SECRET_KEY, { expiresIn: '1h' });
    res.status(201).json({token})
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
    const { symptoms } = req.body;
    const id = req.patient._id;
    if (!id) {
        res.status(400);
        throw new Error("Bad Request - Missing id");
    }

    const patient = await Patient.findById(id);
    if (!patient) {
        res.status(404);
        throw new Error("No Patient found with that id");
    }

    const patientSymptoms = symptoms;
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
                date: avail.date,
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
                            'date': str, 
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



export const selectDoctorFromList = expressAsyncHandler(async (req, res) => {
    const { doctorId, date, startTime, endTime } = req.body;
    
    if (!doctorId || !date || !startTime || !endTime) {
        return res.status(400).json({ message: 'Doctor ID, date, startTime, and endTime are required' });
    }

    const doctor = await Doctor.findById(doctorId);
    if (!doctor) {
        return res.status(404).json({ message: 'Doctor not found' });
    }

    const appointmentDate = new Date(date);

    const start = new Date(date);
    const end = new Date(date);

    const [startHours, startMinutes] = startTime.split(':');
    const [endHours, endMinutes] = endTime.split(':');

    start.setHours(startHours, startMinutes);
    end.setHours(endHours, endMinutes);

    const dateAvailability = doctor.availability.find(avail =>
        avail.date.getTime() === appointmentDate.getTime()
    );

    if (!dateAvailability) {
        return res.status(400).json({ message: `Doctor not available on ${date}` });
    }

    const slotIndex = dateAvailability.slots.findIndex(
        slot =>
            slot.startTime.getTime() === start.getTime() &&
            slot.endTime.getTime() === end.getTime() &&
            !slot.isBooked
    );

    if (slotIndex === -1) {
        return res.status(400).json({ message: 'Time slot not available or already booked' });
    }

    const appointment = new Appointment({
        doctorId,
        patientId: req.patient.id, 
        date: appointmentDate,
        startTime: start,
        endTime: end,
        status: true,
    });

    await appointment.save();
    dateAvailability.slots[slotIndex].isBooked = true;
    await doctor.save();

    res.status(201).json({
        message: 'Appointment booked successfully',
        appointment,
    });
});


