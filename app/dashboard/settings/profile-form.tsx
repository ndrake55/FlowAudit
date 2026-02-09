"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { toast } from "sonner"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { updateUserProfile, deleteUserAccount } from "@/app/actions/user"
import {
    AlertDialog,
    AlertDialogAction,
    AlertDialogCancel,
    AlertDialogContent,
    AlertDialogDescription,
    AlertDialogFooter,
    AlertDialogHeader,
    AlertDialogTitle,
    AlertDialogTrigger,
} from "@/components/ui/alert-dialog"

interface ProfileFormProps {
    user: {
        name: string | null
        email: string | null
        phoneNumber: string | null
    }
}

export function ProfileForm({ user }: ProfileFormProps) {
    const router = useRouter()
    const [isLoading, setIsLoading] = useState(false)
    const [isDeleting, setIsDeleting] = useState(false)
    const [formData, setFormData] = useState({
        name: user.name || "",
        phoneNumber: user.phoneNumber || "",
    })

    // Separate email as it is read-only for now
    const email = user.email || ""

    const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        setFormData({ ...formData, [e.target.name]: e.target.value })
    }

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault()
        setIsLoading(true)

        try {
            const result = await updateUserProfile(formData)
            if (result.success) {
                toast.success("Profile updated successfully")
                router.refresh()
            } else {
                toast.error("Failed to update profile")
            }
        } catch (error) {
            toast.error("An error occurred")
        } finally {
            setIsLoading(false)
        }
    }

    const handleDeleteAccount = async () => {
        setIsDeleting(true)
        try {
            const result = await deleteUserAccount()
            if (result.success) {
                toast.success("Account deleted successfully")
                router.push("/login") // Or wherever you want to redirect
            } else {
                toast.error(result.error || "Failed to delete account")
                setIsDeleting(false)
            }
        } catch (error) {
            toast.error("An error occurred")
            setIsDeleting(false)
        }
    }

    return (
        <div className="space-y-8">
            <form onSubmit={handleSubmit} className="space-y-8">
                <div className="rounded-lg border bg-card text-card-foreground shadow-sm">
                    <div className="p-6 pb-4">
                        <h3 className="text-xl font-semibold leading-none tracking-tight">Personal Information</h3>
                    </div>
                    <div className="p-6 pt-0 grid gap-6">
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                            <div className="space-y-2">
                                <Label htmlFor="name">Full Name</Label>
                                <Input id="name" name="name" value={formData.name} onChange={handleChange} placeholder="John Doe" />
                            </div>
                            <div className="space-y-2">
                                <Label htmlFor="email">Email</Label>
                                <Input id="email" value={email} disabled className="bg-muted" />
                                <p className="text-[0.8rem] text-muted-foreground">Email cannot be changed.</p>
                            </div>
                            <div className="space-y-2">
                                <Label htmlFor="phoneNumber">Phone Number</Label>
                                <Input id="phoneNumber" name="phoneNumber" value={formData.phoneNumber} onChange={handleChange} placeholder="555-0123" />
                            </div>
                        </div>
                    </div>
                </div>

                <div className="flex justify-end">
                    <Button type="submit" disabled={isLoading}>
                        {isLoading ? "Saving..." : "Save Changes"}
                    </Button>
                </div>
            </form>

            <div className="rounded-lg border border-red-200 bg-red-50 text-red-900 shadow-sm">
                <div className="p-6 flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
                    <div>
                        <h3 className="text-lg font-semibold text-red-900">Delete Account</h3>
                        <p className="text-sm text-red-700 mt-1">
                            Permanently delete your account and all of your content. This action cannot be undone.
                        </p>
                    </div>
                    <AlertDialog>
                        <AlertDialogTrigger asChild>
                            <Button variant="destructive" disabled={isDeleting}>
                                Delete Account
                            </Button>
                        </AlertDialogTrigger>
                        <AlertDialogContent>
                            <AlertDialogHeader>
                                <AlertDialogTitle>Are you absolutely sure?</AlertDialogTitle>
                                <AlertDialogDescription>
                                    This action cannot be undone. This will permanently delete your account and remove your data from our servers.
                                </AlertDialogDescription>
                            </AlertDialogHeader>
                            <AlertDialogFooter>
                                <AlertDialogCancel>Cancel</AlertDialogCancel>
                                <AlertDialogAction onClick={handleDeleteAccount} className="bg-red-600 hover:bg-red-700">
                                    {isDeleting ? "Deleting..." : "Delete Account"}
                                </AlertDialogAction>
                            </AlertDialogFooter>
                        </AlertDialogContent>
                    </AlertDialog>
                </div>
            </div>
        </div>
    )
}
