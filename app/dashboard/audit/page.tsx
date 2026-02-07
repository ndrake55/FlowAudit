import { getCommonLocations } from "@/app/actions/audit";
import Link from "next/link";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { createTestLocation } from "@/app/actions/seed";

export default async function AuditIndexPage() {
    const locations = await getCommonLocations();

    return (
        <div className="space-y-6">
            <div>
                <h1 className="text-3xl font-bold tracking-tight">Audits</h1>
                <p className="text-muted-foreground">Select a location to start a new audit.</p>
            </div>

            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
                {locations.map((loc) => (
                    <Card key={loc.id}>
                        <CardHeader>
                            <CardTitle>{loc.name}</CardTitle>
                            <CardDescription>{loc.tenant.name}</CardDescription>
                        </CardHeader>
                        <CardContent>
                            <Link href={`/dashboard/audit/${loc.id}`}>
                                <Button className="w-full">Start Audit</Button>
                            </Link>
                        </CardContent>
                    </Card>
                ))}

                {locations.length === 0 && (
                    <div className="col-span-3 text-center py-10 text-muted-foreground">
                        <p className="mb-4">No locations found. Create a test location to get started.</p>
                        <form action={async () => {
                            'use server';
                            await createTestLocation();
                        }}>
                            <Button variant="outline">Create Test Location</Button>
                        </form>
                    </div>
                )}
            </div>
        </div>
    );
}
