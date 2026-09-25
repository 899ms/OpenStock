'use server';

import { connectToDatabase } from '@/database/mongoose';
import { Alert, type IAlert } from '@/database/models/alert.model';
import { revalidatePath } from 'next/cache';
import { requireUserId } from '@/lib/better-auth/auth';
import { hasFinnhubQuotes } from '@/lib/markets';

// Create a new alert
export async function createAlert(params: {
    symbol: string;
    targetPrice: number;
    condition: 'ABOVE' | 'BELOW';
}) {
    const userId = await requireUserId();
    // The alert checker prices symbols through Finnhub, whose free plan covers US stocks and crypto
    if (!hasFinnhubQuotes(params.symbol)) {
        throw new Error('Alerts are available for US stocks and crypto');
    }
    if (!Number.isFinite(params.targetPrice) || params.targetPrice <= 0) {
        throw new Error('Target price must be a positive number');
    }
    try {
        await connectToDatabase();
        const newAlert = await Alert.create({
            ...params,
            userId,
            active: true,
            // expiresAt handled by default value in schema
        });
        revalidatePath('/watchlist');
        return JSON.parse(JSON.stringify(newAlert));
    } catch (error) {
        console.error('Error creating alert:', error);
        throw new Error('Failed to create alert');
    }
}

// Get all alerts for a user
export async function getUserAlerts(userId: string) {
    try {
        await connectToDatabase();
        const alerts = await Alert.find({ userId }).sort({ createdAt: -1 });
        return JSON.parse(JSON.stringify(alerts));
    } catch (error) {
        console.error('Error fetching alerts:', error);
        return [];
    }
}

// Delete an alert
export async function deleteAlert(alertId: string) {
    const userId = await requireUserId();
    try {
        await connectToDatabase();
        await Alert.findOneAndDelete({ _id: alertId, userId });
        revalidatePath('/watchlist');
        return { success: true };
    } catch (error) {
        console.error('Error deleting alert:', error);
        throw new Error('Failed to delete alert');
    }
}

// Toggle alert active status (optional utility)
export async function toggleAlert(alertId: string, active: boolean) {
    const userId = await requireUserId();
    try {
        await connectToDatabase();
        await Alert.findOneAndUpdate({ _id: alertId, userId }, { active });
        revalidatePath('/watchlist');
        return { success: true };
    } catch (error) {
        console.error('Error toggling alert:', error);
        throw new Error('Failed to update alert');
    }
}
