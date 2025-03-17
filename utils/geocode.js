import axios from 'axios';
import dotenv from 'dotenv';

dotenv.config();

export const geocodeAddress = async (address) => {
    const apiKey = process.env.GOOGLE_MAPS_API_KEY;
    const url = `https://maps.googleapis.com/maps/api/geocode/json?address=${encodeURIComponent(
        address
    )}&key=${apiKey}`;

    try {
        const response = await axios.get(url);
        const { status, results } = response.data;

        if (status === 'OK') {
            if (results.length === 0) {
                throw new Error('No results found');
            }
            const { lat, lng } = results[0].geometry.location;
            return { latitude: lat, longitude: lng };
        } else {
            throw new Error(`Geocoding API Error: ${response.data.status}`);
        }
    } catch (error) {
        throw new Error(`Geocoding Request Error: ${error.message}`);
    }
};
