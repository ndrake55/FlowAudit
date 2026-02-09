import { getAllSupportTickets } from "@/app/actions/admin";
import {
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableHeader,
    TableRow,
} from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";

export default async function AdminSupportPage() {
    const tickets = await getAllSupportTickets();

    return (
        <div className="flex-1 space-y-4 p-8 pt-6">
            <div className="flex items-center justify-between space-y-2">
                <h2 className="text-3xl font-bold tracking-tight">Support Tickets</h2>
            </div>
            <div className="border rounded-md">
                <Table>
                    <TableHeader>
                        <TableRow>
                            <TableHead>ID</TableHead>
                            <TableHead>User</TableHead>
                            <TableHead>Subject</TableHead>
                            <TableHead>Status</TableHead>
                            <TableHead>Date</TableHead>
                            <TableHead className="text-right">Actions</TableHead>
                        </TableRow>
                    </TableHeader>
                    <TableBody>
                        {tickets.map((ticket) => (
                            <TableRow key={ticket.id}>
                                <TableCell className="font-medium">{ticket.id.slice(-5)}...</TableCell>
                                <TableCell>{ticket.user.email}</TableCell>
                                <TableCell>{ticket.subject}</TableCell>
                                <TableCell>
                                    <Badge variant={ticket.status === 'OPEN' ? 'default' : 'secondary'}>
                                        {ticket.status}
                                    </Badge>
                                </TableCell>
                                <TableCell>{new Date(ticket.createdAt).toLocaleDateString()}</TableCell>
                                <TableCell className="text-right">
                                    {/* Link to detail/reply page */}
                                    <a href={`mailto:${ticket.user.email}?subject=Re: ${ticket.subject}`} className="underline text-blue-600">Reply via Email</a>
                                </TableCell>
                            </TableRow>
                        ))}
                    </TableBody>
                </Table>
            </div>
        </div>
    );
}
