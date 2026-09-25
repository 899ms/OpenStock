"use client";

import React, { useState } from "react";
import { BellRing, Trash2 } from "lucide-react";
import { toast } from "sonner";
import { deleteAlert } from "@/lib/actions/alert.actions";
import { formatPrice } from "@/lib/utils";

type AlertRow = {
    _id: string;
    symbol: string;
    targetPrice: number;
    condition: 'ABOVE' | 'BELOW';
    triggered?: boolean;
    active?: boolean;
    expiresAt?: string;
};

const statusOf = (alert: AlertRow) => {
    if (alert.triggered) return { label: 'Triggered', className: 'pill is-brand' };
    if (alert.expiresAt && new Date(alert.expiresAt) < new Date()) return { label: 'Expired', className: 'pill' };
    if (alert.active === false) return { label: 'Paused', className: 'pill' };
    return { label: 'Watching', className: 'pill is-up' };
};

export default function AlertsPanel({ alerts }: { alerts: AlertRow[] }) {
    const [pendingId, setPendingId] = useState<string | null>(null);

    const handleDelete = async (alert: AlertRow) => {
        setPendingId(alert._id);
        try {
            await deleteAlert(alert._id);
            toast.success(`Alert for ${alert.symbol} removed`);
        } catch {
            toast.error("Couldn’t remove the alert");
        } finally {
            setPendingId(null);
        }
    };

    if (alerts.length === 0) {
        return (
            <div className="empty-state py-10">
                <span className="empty-icon"><BellRing className="size-5" /></span>
                <h3>No alerts yet</h3>
                <p className="max-w-60 text-[13px]">Use the bell on any row, or “Set alert” on a stock page. We email you when it fires.</p>
            </div>
        );
    }

    return (
        <ul className="row-list">
            {alerts.map((alert) => {
                const status = statusOf(alert);
                return (
                    <li key={alert._id} className="flex items-center gap-3 px-3 py-2.5">
                        <div className="min-w-0 flex-1">
                            <p className="mono font-semibold text-foreground">{alert.symbol}</p>
                            <p className="num truncate text-[12.5px] text-faint">
                                {alert.condition === 'ABOVE' ? 'Above' : 'Below'} {formatPrice(alert.targetPrice)}
                                {alert.expiresAt && !alert.triggered && ` · until ${new Date(alert.expiresAt).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}`}
                            </p>
                        </div>
                        <span className={status.className}>{status.label}</span>
                        <button
                            type="button"
                            onClick={() => handleDelete(alert)}
                            disabled={pendingId === alert._id}
                            className="icon-btn is-danger"
                            title="Remove alert"
                            aria-label={`Remove alert for ${alert.symbol}`}
                        >
                            <Trash2 />
                        </button>
                    </li>
                );
            })}
        </ul>
    );
}
