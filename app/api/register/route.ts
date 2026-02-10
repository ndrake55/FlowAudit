import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import bcrypt from "bcryptjs";

export async function POST(req: Request) {
    try {
        const { firstName, lastName, email, password } = await req.json();

        if (!firstName || !lastName || !email || !password) {
            return NextResponse.json({ error: "Missing required fields" }, { status: 400 });
        }

        // Default Company Name since we removed it from the form
        const companyName = `${firstName} ${lastName}'s Laundry`;

        // Check if user exists
        const existingUser = await prisma.user.findUnique({ where: { email } });
        if (existingUser) {
            return NextResponse.json({ error: "User already exists" }, { status: 400 });
        }

        // Generate unique slug for Tenant
        let baseSlug = companyName.toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/^-+|-+$/g, "");
        if (!baseSlug) baseSlug = "company";

        let slug = baseSlug;
        let counter = 1;

        while (true) {
            const existingTenant = await prisma.tenant.findUnique({ where: { slug } });
            if (!existingTenant) break;
            slug = `${baseSlug}-${counter}`;
            counter++;
        }

        const hashedPassword = await bcrypt.hash(password, 10);

        // Transaction to create Tenant and User
        const result = await prisma.$transaction(async (tx) => {
            const tenant = await tx.tenant.create({
                data: {
                    name: companyName,
                    slug,
                },
            });

            const user = await tx.user.create({
                data: {
                    firstName,
                    lastName,

                    email,
                    password: hashedPassword,
                    password: hashedPassword,
                    role: "MEMBER", // Default role
                    tenantId: tenant.id,
                },
            });

            return { tenant, user };
        });

        return NextResponse.json({ success: true, userId: result.user.id });

    } catch (error) {
        console.error("Registration Error:", error);
        return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
    }
}
