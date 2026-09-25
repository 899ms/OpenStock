import { isRealtime } from "@/lib/market-data";

// Honest label for how old a number is: "Live" in realtime mode, otherwise the time of the last trade.
const DataFreshness = ({ tradeTime }: { tradeTime?: number }) => {
    if (isRealtime) {
        return <span className="inline-flex items-center gap-1.5 text-[12px] text-faint"><span className="live-dot" /> Live · 15s</span>;
    }
    const asOf = tradeTime
        ? new Date(tradeTime * 1000).toLocaleString('en-US', { month: 'short', day: 'numeric', hour: 'numeric', minute: '2-digit' })
        : null;
    return <span className="text-[12px] text-faint">{asOf ? `As of ${asOf}` : 'Delayed'} · refreshed hourly</span>;
};

export default DataFreshness;
