require('dotenv').config({ path: '.env' });
const { Client } = require("@googlemaps/google-maps-services-js");

const client = new Client({});
const key = process.env.NEXT_PUBLIC_GOOGLE_MAPS_API_KEY;

console.log("Testing API Key:", key ? (key.substring(0, 5) + "...") : "MISSING");

async function test() {
    try {
        const response = await client.placeAutocomplete({
            params: {
                input: "1600 Amphitheatre Parkway",
                key: key,
                components: ["country:us"],
            },
        });
        console.log("Success! Predictions found:", response.data.predictions.length);
        if (response.data.predictions.length > 0) {
            console.log("First prediction:", response.data.predictions[0].description);
        }
    } catch (error) {
        console.error("API Call Failed:");
        if (error.response) {
            console.error("Status:", error.response.status);
            console.error("Data:", JSON.stringify(error.response.data, null, 2));
        } else {
            console.error(error.message);
        }
    }
}

test();
