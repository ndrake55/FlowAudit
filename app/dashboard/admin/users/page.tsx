import { getAllUsers, deleteUser, cancelUserSubscription } from "@/app/actions/admin";
import { Button } from "@/components/ui/button";
import {
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableHeader,
    TableRow,
} from "@/components/ui/table";
import { revalidatePath } from "next/cache";

export default async function AdminUsersPage() {
    const users = await getAllUsers();

    return (
        <div className="flex-1 space-y-4 p-8 pt-6">
            <div className="flex items-center justify-between space-y-2">
                <h2 className="text-3xl font-bold tracking-tight">User Management</h2>
            </div>
            <div className="border rounded-md">
                <Table>
                    <TableHeader>
                        <TableRow>
                            <TableHead>Name</TableHead>
                            <TableHead>Email</TableHead>
                            <TableHead>Role</TableHead>
                            <TableHead>Status</TableHead>
                            <TableHead>Joined</TableHead>
                            <TableHead className="text-right">Actions</TableHead>
                        </TableRow>
                    </TableHeader>
                    <TableBody>
                        {users.map((user) => (
                            <TableRow key={user.id}>
                                <TableCell className="font-medium">{user.name}</TableCell>
                                <TableCell>{user.email}</TableCell>
                                <TableCell>{user.role}</TableCell>
                                <TableCell>{user.isSubscribed ? "Subscribed" : "Free"}</TableCell>
                                <TableCell>{new Date(user.createdAt).toLocaleDateString()}</TableCell>
                                <TableCell className="text-right space-x-2">
                                    <form action={async () => {
                                        "use server";
                                        await cancelUserSubscription(user.id);
                                    }} className="inline">
                                        <Button variant="outline" size="sm" disabled={!user.isSubscribed}>Downgrade</Button>
                                    </form>
                                    <form action={async () => {
                                        "use server";
                                        await deleteUser(user.id);
                                    }} className="inline">
                                        <Button variant="destructive" size="sm">Delete</Button>
                                    </form>
                                </TableCell>
                            </TableRow>
                        ))}
                    </TableBody>
                </Table>
            </div>
        </div>
    );
}
