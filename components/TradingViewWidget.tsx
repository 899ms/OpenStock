'use client';

import React, { memo, useState, useEffect } from 'react';
import { createPortal } from 'react-dom';
import useTradingViewWidget from "@/hooks/useTradingViewWidget";
import { cn } from "@/lib/utils";
import { Maximize2, Minimize2 } from 'lucide-react';

interface TradingViewWidgetProps {
    scriptUrl: string;
    config: Record<string, unknown>;
    height?: number;
    className?: string;
    allowExpand?: boolean;
}

const TradingViewWidget = ({ scriptUrl, config, height = 600, className, allowExpand = false }: TradingViewWidgetProps) => {
    const [isExpanded, setIsExpanded] = useState(false);
    const [windowHeight, setWindowHeight] = useState(0);

    useEffect(() => {
        setWindowHeight(window.innerHeight);
        const handleResize = () => setWindowHeight(window.innerHeight);
        window.addEventListener('resize', handleResize);
        return () => window.removeEventListener('resize', handleResize);
    }, []);

    useEffect(() => {
        if (!isExpanded) return;
        const onKey = (e: KeyboardEvent) => e.key === 'Escape' && setIsExpanded(false);
        document.body.style.overflow = 'hidden';
        window.addEventListener('keydown', onKey);
        return () => {
            document.body.style.overflow = '';
            window.removeEventListener('keydown', onKey);
        };
    }, [isExpanded]);

    const currentHeight = isExpanded ? windowHeight - 24 : height;

    const widgetConfig = {
        ...config,
        height: currentHeight,
        width: "100%",
        autosize: true,
    };

    const containerRef = useTradingViewWidget(scriptUrl, widgetConfig, currentHeight);

    const widget = (
        <div className={cn("tv-frame group", isExpanded && "fixed inset-3 z-50 shadow-[0_0_0_4px_var(--frame),0_24px_60px_oklch(0_0_0/0.6)]")}>
            {allowExpand && (
                <button
                    type="button"
                    onClick={() => setIsExpanded(!isExpanded)}
                    className={cn("icon-btn absolute top-2 right-2 z-10 bg-card/80", !isExpanded && "opacity-0 group-hover:opacity-100 focus-visible:opacity-100")}
                    aria-label={isExpanded ? "Exit full screen" : "Full screen"}
                    title={isExpanded ? "Exit full screen (Esc)" : "Full screen"}
                >
                    {isExpanded ? <Minimize2 /> : <Maximize2 />}
                </button>
            )}

            <div className={cn('tradingview-widget-container', className)} ref={containerRef} style={{ height: currentHeight }}>
                <div className="tradingview-widget-container__widget" style={{ height: currentHeight, width: "100%" }} />
            </div>
        </div>
    );

    // Full screen escapes the shell grid instead of fighting its overflow
    return isExpanded ? createPortal(<><div className="fixed inset-0 z-50 bg-page/70 backdrop-blur-[3px]" />{widget}</>, document.body) : widget;
}

export default memo(TradingViewWidget);
