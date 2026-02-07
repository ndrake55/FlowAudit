"use client";

import { UserButton } from "@clerk/nextjs";
import { useEffect, useState } from "react";

export function ClerkUserButton() {
    const [mounted, setMounted] = useState(false);

    useEffect(() => {
        setMounted(true);
    }, []);

    if (!mounted) {
        return <div className="h-8 w-8 rounded-full bg-slate-200" />;
    }

    return <UserButton showName />;
}
