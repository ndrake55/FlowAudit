import { User } from "@prisma/client";

export function isSubscriptionActive(user: User | null | undefined): boolean {
    if (!user) return false;

    const now = new Date();

    // 1. Check if explicit flag is true (useful for overrides or lag)
    if (user.isSubscribed) return true;

    // 2. Check if period end is in the future (Grace Period logic)
    if (user.stripeCurrentPeriodEnd && user.stripeCurrentPeriodEnd > now) {
        return true;
    }

    return false;
}
