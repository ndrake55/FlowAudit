"use server";

export async function searchPlaces(input: string) {
    if (!input) return [];

    const key = process.env.NEXT_PUBLIC_GOOGLE_MAPS_API_KEY;
    const url = "https://places.googleapis.com/v1/places:autocomplete";

    try {
        console.log("--- SEARCH PLACES START ---");
        console.log("Input:", input);
        console.log("Key Configured:", !!key);

        const response = await fetch(url, {
            method: "POST",
            headers: {
                "Content-Type": "application/json",
                "X-Goog-Api-Key": key!,
            },
            body: JSON.stringify({
                input,
                // Removing locationBias temporarily to debug INVALID_ARGUMENT
            }),
        });

        console.log("Response Status:", response.status);

        if (!response.ok) {
            const errorText = await response.text();
            console.error("Places API Failure:", response.status, errorText);
            return [];
        }

        const data = await response.json();
        console.log("Results found:", data.suggestions?.length || 0);

        return (data.suggestions || []).map((s: any) => ({
            description: s.placePrediction.text.text,
            place_id: s.placePrediction.placeId,
        }));
    } catch (error) {
        console.error("Places API Network Exception:", error);
        return [];
    }
}

export async function getPlaceDetails(placeId: string) {
    if (!placeId) return null;

    const key = process.env.NEXT_PUBLIC_GOOGLE_MAPS_API_KEY;
    // Use V1 Place Details
    const url = `https://places.googleapis.com/v1/places/${placeId}`;

    try {
        const response = await fetch(url, {
            method: "GET",
            headers: {
                "Content-Type": "application/json",
                "X-Goog-Api-Key": key!,
                "X-Goog-FieldMask": "location,formattedAddress", // Request specific fields
            },
        });

        if (!response.ok) {
            const errorText = await response.text();
            console.error("Place Details Error:", response.status, errorText);
            throw new Error("Failed to get place details");
        }

        const data = await response.json();
        return {
            lat: data.location?.latitude || 0,
            lng: data.location?.longitude || 0,
            address: data.formattedAddress || "",
        };
    } catch (error) {
        console.error("Place Details API Error:", error);
        throw new Error("Failed to get place details");
    }
}
