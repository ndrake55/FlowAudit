import Stripe from 'stripe';
import dotenv from 'dotenv';

// Load environment variables
dotenv.config();

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!, {
    apiVersion: '2025-01-27.acacia', // Use latest or matching package.json
});

async function main() {
    console.log('Creating new Stripe prices...');

    try {
        // 1. Single Forensic Audit - $50.00
        const singlePrice = await stripe.prices.create({
            unit_amount: 5000, // $50.00
            currency: 'usd',
            product_data: {
                name: 'Single Forensic Audit',
                metadata: {
                    type: 'single'
                }
            },
            // mode: 'payment' is not a valid param for Price object creation, it's for Checkout Sessions
        });
        console.log(`Created Single Audit Price: ${singlePrice.id}`);

        // 2. Active Searcher Plan - $40.00 / Month
        const monthlyPrice = await stripe.prices.create({
            unit_amount: 4000, // $40.00
            currency: 'usd',
            recurring: {
                interval: 'month',
            },
            product_data: {
                name: 'Active Searcher Plan',
                metadata: {
                    type: 'subscription'
                }
            },
        });
        console.log(`Created Monthly Subscription Price: ${monthlyPrice.id}`);

        // Output for easy copying
        const output = `
single_deal: "${singlePrice.id}"
searcher_plan: "${monthlyPrice.id}"
        `;
        console.log(output);
        const fs = require('fs');
        fs.writeFileSync('scripts/price_ids.txt', output);
        console.log('Saved to scripts/price_ids.txt');

    } catch (error) {
        console.error('Error creating prices:', error);
    }
}

main();
