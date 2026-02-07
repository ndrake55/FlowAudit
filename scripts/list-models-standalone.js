
const fs = require('fs');
const path = require('path');

// manually read .env
const envPath = path.resolve(__dirname, '../.env');
const envContent = fs.readFileSync(envPath, 'utf8');

let apiKey = '';
envContent.split('\n').forEach(line => {
    if (line.startsWith('GOOGLE_GEMINI_API_KEY=')) {
        apiKey = line.split('=')[1].trim();
        // remove quotes if present
        if (apiKey.startsWith('"') && apiKey.endsWith('"')) {
            apiKey = apiKey.slice(1, -1);
        }
    }
});

if (!apiKey) {
    console.error("Could not find GOOGLE_GEMINI_API_KEY in .env");
    process.exit(1);
}

async function listModels() {
    try {
        const response = await fetch(`https://generativelanguage.googleapis.com/v1beta/models?key=${apiKey}`);
        if (!response.ok) {
            throw new Error(`HTTP error! status: ${response.status} ${response.statusText}`);
        }
        const data = await response.json();

        console.log("--- All Available Models ---");
        if (data.models) {
            data.models.forEach(m => {
                if (m.supportedGenerationMethods.includes("generateContent")) {
                    console.log(`- ${m.name} (Version: ${m.version})`);
                }
            });
        }
    } catch (error) {
        console.error("Error fetching models:", error);
    }
}

listModels();
