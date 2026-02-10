"use client"

import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Check } from "lucide-react"
import { createCheckoutSession } from "@/app/actions/stripe"

interface PricingCardProps {
    title: string
    description: string
    price: string
    priceSuffix: string
    features: string[]
    buttonText: string
    priceId: string
    mode: "payment" | "subscription"
    popular?: boolean
}

export function PricingCard({
    title,
    description,
    price,
    priceSuffix,
    features,
    buttonText,
    priceId,
    mode,
    popular = false
}: PricingCardProps) {

    const handleCheckout = async () => {
        try {
            await createCheckoutSession(priceId, mode)
        } catch (error) {
            console.error("Error creating checkout session:", error)
        }
    }

    return (
        <Card className={`flex flex-col h-full ${popular ? "border-blue-600 shadow-xl relative scale-105 z-10" : "border-gray-200 shadow-sm hover:shadow-md transition-shadow"}`}>
            {popular && (
                <div className="absolute top-0 right-0 bg-blue-600 text-white text-xs font-bold px-3 py-1 rounded-bl-lg rounded-tr-lg uppercase tracking-wide">
                    Most Popular
                </div>
            )}
            <CardHeader>
                <CardTitle className="text-2xl">{title}</CardTitle>
                <CardDescription>{description}</CardDescription>
            </CardHeader>
            <CardContent className="flex-1 flex flex-col">
                <div className="text-4xl font-bold mb-6">{price}<span className="text-base font-normal text-gray-500">{priceSuffix}</span></div>
                <ul className="space-y-3 mb-8 text-sm flex-1">
                    {features.map((feature, i) => (
                        <li key={i} className="flex items-start">
                            <Check className="h-5 w-5 mr-2 text-green-500 shrink-0" />
                            <span dangerouslySetInnerHTML={{ __html: feature }} />
                        </li>
                    ))}
                </ul>
                <Button
                    className={`w-full text-white ${popular ? "bg-blue-600 hover:bg-blue-700 shadow-lg" : "bg-blue-900 hover:bg-blue-800"}`}
                    size="lg"
                    onClick={handleCheckout}
                >
                    {buttonText}
                </Button>
            </CardContent>
        </Card>
    )
}
