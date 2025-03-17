import axios from 'axios';
import dotenv from 'dotenv';
dotenv.config();

async function selectClosestAddress(address, destinationList) {
  if (!address || !destinationList || destinationList.length === 0) {
    return null;
  }

  const apiKey = process.env.GOOGLE_MAPS_API_KEY;

  const destinationsString = destinationList.map(dest => `${dest.latitude},${dest.longitude}`).join('|');

  const url = `https://maps.googleapis.com/maps/api/distancematrix/json?origins=${address.latitude},${address.longitude}&destinations=${destinationsString}&units=metric&key=${apiKey}`;

  try {
    const response = await axios.get(url);
    const data = response.data;

    if (data.status !== 'OK') {
      throw new Error(`Distance Matrix API Error: ${data.status}`);
    }
    
    if (!data.rows || data.rows.length === 0 || !data.rows[0].elements) {
        throw new Error("Invalid response format from Distance Matrix API");
      }

    let minDistance = Infinity;
    let closestAddressIndex = -1;
    data.rows[0].elements.forEach((element, index) => {
      if (element.distance.value < minDistance) {
        minDistance = element.distance.value;
        closestAddressIndex = index;
      }
    });
    console.log(minDistance);
    
    return closestAddressIndex !== -1 ? destinationList[closestAddressIndex] : null;
  } catch (error) {
    throw new Error(`Error fetching distance matrix data: ${error.message}`);
  }
}

export default selectClosestAddress;