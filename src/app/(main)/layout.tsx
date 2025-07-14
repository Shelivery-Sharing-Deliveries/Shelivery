// app/(main)/layout.tsx
"use client"; // This is crucial to make this a Client Component

import AuthGuard from '@/lib/AuthGuard'; // Import your AuthGuard from /lib

export default function MainLayout({
    children,
}: {
    children: React.ReactNode;
}) {
    return (
        <AuthGuard>
            {/* Any layout specific to protected pages can go here, e.g., a common header/footer */}
            {children}
        </AuthGuard>
    );
}