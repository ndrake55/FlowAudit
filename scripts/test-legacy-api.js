require('dotenv').config({ path: '.env' });

const key = process.env.NEXT_PUBLIC_GOOGLE_MAPS_API_KEY;

async function testLegacyApi() {
    console.log("Testing Places API (Legacy) with key:", key ? (key.substring(0, 5) + "...") : "MISSING");

    const url = `https://maps.googleapis.com/maps/api/place/autocomplete/json?input=1600+Amphitheatre+Pkwy&key=${key}&components=country:us`;

    try {
        const response = await fetch(url);
        const data = await response.json();

        if (data.status === "OK") {
            console.log("Success! Predictions found:", data.predictions.length);
            if (data.predictions.length > 0) {
                console.log("First prediction:", data.predictions[0].description);
            }
        } else {
            console.error("Legacy API Failed with status:", data.status);
            if (data.error_message) {
                console.error("Error Message:", data.error_message);
            }
        }
    } catch (err) {
        console.error("Fetch error:", err);
    }
}

testLegacyApi();
