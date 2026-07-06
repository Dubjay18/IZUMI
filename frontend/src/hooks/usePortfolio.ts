import { useState, useEffect, useCallback } from "react";
import { saverApi } from "@/lib/api";
import type {
  PortfolioMetric,
  PortfolioAllocation,
  PortfolioPerformance,
  PortfolioDistribution,
  StrategyMixItem,
  NextYieldEvent,
  YieldForecastQuarter,
  AssetFlowItem,
} from "@/lib/types";

interface UsePortfolioResult {
  metrics: PortfolioMetric[];
  allocation: PortfolioAllocation[];
  performance: PortfolioPerformance[];
  distribution: PortfolioDistribution[];
  strategyMix: StrategyMixItem[];
  nextYieldEvent: NextYieldEvent | null;
  yieldForecast: YieldForecastQuarter[];
  assetFlow: AssetFlowItem[];
  loading: boolean;
  error: string | null;
  refresh: () => void;
}

export function usePortfolio(
  userId: string | null | undefined
): UsePortfolioResult {
  const [data, setData] = useState<{
    metrics: PortfolioMetric[];
    allocation: PortfolioAllocation[];
    performance: PortfolioPerformance[];
    distribution: PortfolioDistribution[];
    strategyMix: StrategyMixItem[];
    nextYieldEvent: NextYieldEvent | null;
    yieldForecast: YieldForecastQuarter[];
    assetFlow: AssetFlowItem[];
  }>({
    metrics: [],
    allocation: [],
    performance: [],
    distribution: [],
    strategyMix: [],
    nextYieldEvent: null,
    yieldForecast: [],
    assetFlow: [],
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const fetch = useCallback(async () => {
    if (!userId) return;
    setLoading(true);
    setError(null);
    try {
      const result = await saverApi.getPortfolio(userId);
      setData(result);
    } catch (err) {
      setError((err as Error).message);
    } finally {
      setLoading(false);
    }
  }, [userId]);

  useEffect(() => {
    fetch();
  }, [fetch]);

  return {
    metrics: data.metrics,
    allocation: data.allocation,
    performance: data.performance,
    distribution: data.distribution,
    strategyMix: data.strategyMix,
    nextYieldEvent: data.nextYieldEvent,
    yieldForecast: data.yieldForecast,
    assetFlow: data.assetFlow,
    loading,
    error,
    refresh: fetch,
  };
}
