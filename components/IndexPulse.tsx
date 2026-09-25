import Link from "next/link";
import { LineChart } from "lucide-react";
import ChangePill from "@/components/ChangePill";
import TradingViewWidget from "@/components/TradingViewWidget";
import { getLiveQuotes } from "@/lib/actions/finnhub.actions";
import { singleQuoteConfig } from "@/lib/constants";
import { getMarket, type Market } from "@/lib/markets";

const SINGLE_QUOTE = 'https://s3.tradingview.com/external-embedding/embed-widget-single-quote.js';

const formatAmount = (value: number) =>
    value.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: value < 1 ? 4 : 2 });

// Four headline tiles for a market. Markets Finnhub can price get native tiles from our shared quote cache;
// the rest use TradingView's quote tile, which is free for those exchanges.
export default async function IndexPulse({ market = getMarket('us') }: { market?: Market }) {
    const native = market.pulse.flatMap((p) => (p.finnhub ? [p.finnhub] : []));
    const quotes = native.length ? await getLiveQuotes(native) : {};

    return (
        <div className="bento">
            {market.pulse.map((tile) => {
                if (!tile.finnhub) {
                    return (
                        <div key={tile.symbol} className="bento-tile p-1.5">
                            <TradingViewWidget scriptUrl={SINGLE_QUOTE} config={singleQuoteConfig(tile.symbol)} height={112} />
                        </div>
                    );
                }
                const quote = quotes[tile.finnhub];
                const isCrypto = tile.finnhub.startsWith('BINANCE:');
                return (
                    <Link key={tile.symbol} href={`/stocks/${encodeURIComponent(tile.finnhub)}`} className="bento-tile transition-colors hover:bg-hover/60">
                        <div className="bento-head">
                            <span className="bento-ico"><LineChart /></span>
                            <span className="truncate">{tile.label}</span>
                            <span className="mono ml-auto text-xs text-faint">{tile.finnhub.replace('BINANCE:', '')}</span>
                        </div>
                        <p className="bento-value">
                            {quote?.c ? (
                                isCrypto ? <>{formatAmount(quote.c)}<small> USDT</small></> : <><small>$</small>{formatAmount(quote.c)}</>
                            ) : '—'}
                        </p>
                        <div className="bento-foot">
                            {quote?.c ? (
                                <>
                                    <ChangePill value={quote.dp} />
                                    <span className="num truncate">{(quote.d ?? 0) > 0 ? '+' : ''}{formatAmount(quote.d ?? 0)} vs prev close</span>
                                </>
                            ) : (
                                <span>Quote unavailable</span>
                            )}
                        </div>
                    </Link>
                );
            })}
        </div>
    );
}

export const PulseSkeleton = () => (
    <div className="bento" aria-busy="true">
        {[0, 1, 2, 3].map((i) => (
            <div key={i} className="bento-tile h-[124px]"><span className="h-full animate-pulse rounded-lg bg-hover/60" /></div>
        ))}
    </div>
);
