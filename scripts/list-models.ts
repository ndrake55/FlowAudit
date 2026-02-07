
import { GoogleGenerativeAI } from "@google/generative-ai";
import { env } from "@/lib/env";

async function listModels() {
    const genAI = new GoogleGenerativeAI(env.GOOGLE_GEMINI_API_KEY);
    try {
        const models = await genAI.getGenerativeModel({ model: "gemini-1.5-flash" }).apiKey; // Just accessing to instantiate, listModels is on the client usually or we check docs.
        // Wait, the SDK doesn't have a direct 'listModels' on the instance easily accessible in this version?
        // Actually, it's usually on the class or via valid model fetch. 
        // Let's use a raw fetch to the API to be sure, or check if the SDK supports it.
        // The error message said "Call ListModels to see the list".

        // Using raw fetch to be safe and dependency-agnostic for listing
        const apiKey = env.GOOGLE_GEMINI_API_KEY;
        const response = await fetch(`https://generativelanguage.googleapis.com/v1beta/models?key=${apiKey}`);
        const data = await response.json();

        console.log("Available Models:");
        if (data.models) {
            data.models.forEach((m: any) => {
                if (m.supportedGenerationMethods && m.supportedGenerationMethods.includes("generateContent")) {
                    console.log(`- ${m.name}`);
                }
            });
        } else {
            console.log("No models found or error:", data);
        }

    } catch (error) {
        console.error("Error listing models:", error);
    }
}

listModels();
