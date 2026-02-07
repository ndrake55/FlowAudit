import { getUtilityBills } from "@/app/actions/bills";
import { getLocations } from "@/app/actions/machines"; // Reusing location fetch
import { AddBillDialog } from "@/components/bills/add-bill-dialog";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import {
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableHeader,
    TableRow,
} from "@/components/ui/table";
import { FileText } from "lucide-react";
import Link from "next/link";

export default async function UtilityBillsPage() {
    const bills = await getUtilityBills();
    const locations = await getLocations();

    return (
        <div className="space-y-6">
            <div className="flex items-center justify-between">
                <div>
                    <h1 className="text-3xl font-bold tracking-tight">Utility Bills</h1>
                    <p className="text-muted-foreground">Manage and track your utility consumption and costs.</p>
                </div>
                <AddBillDialog locations={locations} />
            </div>

            <Card>
                <CardHeader>
                    <CardTitle>Bill History</CardTitle>
                    <CardDescription>A record of all processed utility bills.</CardDescription>
                </CardHeader>
                <CardContent>
                    <Table>
                        <TableHeader>
                            <TableRow>
                                <TableHead>Date Range</TableHead>
                                <TableHead>Location</TableHead>
                                <TableHead>Usage (Gal)</TableHead>
                                <TableHead>Cost</TableHead>
                                <TableHead>Document</TableHead>
                            </TableRow>
                        </TableHeader>
                        <TableBody>
                            {bills.length === 0 ? (
                                <TableRow>
                                    <TableCell colSpan={5} className="text-center h-24 text-muted-foreground">
                                        No bills found. Upload your first bill above.
                                    </TableCell>
                                </TableRow>
                            ) : (
                                bills.map((bill) => (
                                    <TableRow key={bill.id}>
                                        <TableCell>
                                            <Link href={`/dashboard/bills/${bill.id}`} className="hover:underline font-medium text-primary">
                                                {new Date(bill.startDate).toLocaleDateString()} - {new Date(bill.endDate).toLocaleDateString()}
                                            </Link>
                                        </TableCell>
                                        <TableCell>{bill.location.name}</TableCell>
                                        <TableCell>{bill.totalWaterGal.toLocaleString()}</TableCell>
                                        <TableCell>${Number(bill.totalCost).toFixed(2)}</TableCell>
                                        <TableCell>
                                            <div className="flex items-center gap-2 text-muted-foreground">
                                                <FileText className="h-4 w-4" />
                                                <span className="text-xs">PDF Stored</span>
                                            </div>
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
