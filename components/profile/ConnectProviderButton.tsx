'use client';

import { useState } from "react";
import { toast } from "sonner";
import { connectProvider } from "@/lib/actions/profile.actions";

export default function ConnectProviderButton({ provider }: { provider: 'google' | 'github' }) {
    const [pending, setPending] = useState(false);

    const onClick = async () => {
        setPending(true);
        const result = await connectProvider(provider);
        if (result.success && result.url) {
            window.location.href = result.url;
            return;
        }
        setPending(false);
        toast.error('Couldn’t connect', { description: result.error });
    };

    return (
        <button type="button" onClick={onClick} disabled={pending} className="btn btn-ghost h-8 px-3 text-[13px]">
            {pending ? 'Redirecting' : 'Connect'}
        </button>
    );
}
