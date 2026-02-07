
const fs = require('fs');
const path = require('path');

// manually read .env
const envPath = path.resolve(__dirname, '../.env');
const envContent = fs.readFileSync(envPath, 'utf8');

let apiKey = '';
envContent.split('\n').forEach(line => {
    if (line.startsWith('GOOGLE_GEMINI_API_KEY=')) {
        apiKey = line.split('=')[1].trim();
        if (apiKey.startsWith('"') && apiKey.endsWith('"')) apiKey = apiKey.slice(1, -1);
    }
});

const models = [
    "gemini-1.5-flash",
    "gemini-1.5-flash-001",
    "gemini-1.5-flash-002",
    "gemini-1.5-pro",
    "gemini-1.5-flash-8b",
    "gemini-2.0-flash-exp",
    "gemini-pro"
];

const sleep = (ms) => new Promise(r => setTimeout(r, ms));
const logFile = path.resolve(__dirname, 'model-results.txt');
fs.writeFileSync(logFile, "Model Test Results:\n");

async function testModel(modelName) {
    try {
        console.log(`Testing ${modelName}...`);
        const response = await fetch(`https://generativelanguage.googleapis.com/v1beta/models/${modelName}:generateContent?key=${apiKey}`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
                contents: [{ parts: [{ text: "Hello" }] }]
            })
        });

        let result = "";
        if (response.ok) {
            result = `[SUCCESS] ${modelName} is WORKING.\n`;
        } else {
            const data = await response.json();
            result = `[FAILED] ${modelName}: ${response.status} - ${data.error?.message || 'Unknown error'}\n`;
        }

        console.log(result.trim());
        fs.appendFileSync(logFile, result);

    } catch (error) {
        const msg = `[ERROR] ${modelName}: ${error.message}\n`;
        console.log(msg.trim());
        fs.appendFileSync(logFile, msg);
    }
}

async function runTests() {
    for (const model of models) {
        await testModel(model);
        await sleep(2000); // Wait 2s to minimize rate limiting
    }
    console.log("Done.");
}

runTests();
