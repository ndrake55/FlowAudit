require('dotenv').config({ path: '.env' });

const key = process.env.NEXT_PUBLIC_GOOGLE_MAPS_API_KEY;

async function testNewApi() {
    console.log("Testing Places API (New) with key:", key ? (key.substring(0, 5) + "...") : "MISSING");

    const url = "https://places.googleapis.com/v1/places:autocomplete";

    try {
        const response = await fetch(url, {
            method: "POST",
            headers: {
                "Content-Type": "application/json",
                "X-Goog-Api-Key": key,
                // vital for New API
            },
            body: JSON.stringify({
                input: "1600 Amphitheatre Pkwy",
            }),
        });

        if (response.ok) {
            const data = await response.json();
            console.log("Success! Suggestions found:", data.suggestions?.length);
        } else {
            console.error("New API Failed:", response.status, response.statusText);
            const text = await response.text();
            console.error("Response:", text);
        }
    } catch (err) {
        console.error("Fetch error:", err);
    }
}

testNewApi();
