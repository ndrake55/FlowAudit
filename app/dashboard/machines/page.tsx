import { getMachines, getMachineDefinitions, getLocations } from "@/app/actions/machines";
import { AddMachineDialog } from "@/components/machines/add-machine-dialog";
import { BulkAddMachineDialog } from "@/components/machines/bulk-add-machine-dialog";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import {
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableHeader,
    TableRow,
} from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";

export default async function MachinesPage() {
    const machines = await getMachines();
    const definitions = await getMachineDefinitions();
    const locations = await getLocations();

    const serializedLocations = locations.map(loc => ({
        ...loc,
        askingPrice: loc.askingPrice?.toNumber() ?? null,
        claimedMonthlyRevenue: loc.claimedMonthlyRevenue?.toNumber() ?? null,
    }));

    return (
        <div className="space-y-6">
            <div className="flex items-center justify-between">
                <div>
                    <h1 className="text-3xl font-bold tracking-tight">Machines</h1>
                    <p className="text-muted-foreground">Manage your laundry machines and equipment.</p>
                </div>
                <div className="flex gap-2">
                    <BulkAddMachineDialog definitions={definitions} locations={serializedLocations} />
                    <AddMachineDialog definitions={definitions} locations={serializedLocations} />
                </div>
            </div>

            <Card>
                <CardHeader>
                    <CardTitle>Equipment List</CardTitle>
                    <CardDescription>A list of all machines across your locations.</CardDescription>
                </CardHeader>
                <CardContent>
                    <Table>
                        <TableHeader>
                            <TableRow>
                                <TableHead>Brand</TableHead>
                                <TableHead>Model</TableHead>
                                <TableHead>Location</TableHead>
                                <TableHead>Water/Cycle (Gal)</TableHead>
                                <TableHead>Status</TableHead>
                            </TableRow>
                        </TableHeader>
                        <TableBody>
                            {machines.length === 0 ? (
                                <TableRow>
                                    <TableCell colSpan={5} className="text-center h-24 text-muted-foreground">
                                        No machines found. Add your first machine above.
                                    </TableCell>
                                </TableRow>
                            ) : (
                                machines.map((machine) => (
                                    <TableRow key={machine.id}>
                                        <TableCell className="font-medium">{machine.machineDefinition.brand}</TableCell>
                                        <TableCell>{machine.machineDefinition.modelNumber}</TableCell>
                                        <TableCell>{machine.location.name}</TableCell>
                                        <TableCell>{machine.machineDefinition.waterPerCycleGal}</TableCell>
                                        <TableCell>
                                            <Badge variant="outline" className="text-green-600 bg-green-50 border-green-200">
                                                Active
                                            </Badge>
                                        </TableCell>
                                    </TableRow>
                                ))
                            )}
                        </TableBody>
                    </Table>
                </CardContent>
            </Card>
        </div>
    );
}
