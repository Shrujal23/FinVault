package com.fintech.service;

import com.fintech.entity.Asset;
import com.fintech.entity.User;
import org.springframework.stereotype.Service;

import java.math.BigDecimal;
import java.util.ArrayList;
import java.util.HashMap;
import java.util.List;
import java.util.Map;
import java.util.stream.Collectors;

@Service
public class PortfolioService {

    private final AssetService assetService;

    public PortfolioService(AssetService assetService) {
        this.assetService = assetService;
    }

    public Map<String, Object> buildSummary(User user) {
        List<Asset> assets = assetService.getAssetsByUser(user);

        List<String> stockSymbols = assets.stream()
                .filter(a -> a.getType() != Asset.AssetType.crypto)
                .map(a -> a.getSymbol().toUpperCase())
                .distinct()
                .collect(Collectors.toList());

        List<String> cryptoSymbols = assets.stream()
                .filter(a -> a.getType() == Asset.AssetType.crypto)
                .map(Asset::getSymbol)
                .distinct()
                .collect(Collectors.toList());

        Map<String, BigDecimal> stockPrices = assetService.getLivePrices(stockSymbols);
        Map<String, BigDecimal> cryptoPrices = assetService.getCryptoPrices(cryptoSymbols);

        List<Map<String, Object>> items = new ArrayList<>();
        List<Map<String, Object>> allocation = new ArrayList<>();
        double totalPortfolioValue = 0.0;

        for (Asset asset : assets) {
            Map<String, Object> itemMap = enrichAsset(asset, stockPrices, cryptoPrices);
            double marketValue = ((Number) itemMap.get("marketValue")).doubleValue();
            totalPortfolioValue += marketValue;
            items.add(itemMap);
        }

        for (Map<String, Object> item : items) {
            Map<String, Object> allocationItem = new HashMap<>();
            allocationItem.put("name", item.get("name"));
            allocationItem.put("symbol", item.get("symbol"));
            double itemMarketValue = ((Number) item.get("marketValue")).doubleValue();
            double weight = totalPortfolioValue > 0 ? (itemMarketValue / totalPortfolioValue) * 100 : 0.0;
            allocationItem.put("value", itemMarketValue);
            allocationItem.put("weight", weight);
            allocation.add(allocationItem);
        }

        Map<String, Object> result = new HashMap<>();
        result.put("allocation", allocation);
        result.put("items", items);
        result.put("totalMarketValue", totalPortfolioValue);
        return result;
    }

    public Map<String, Object> enrichAsset(Asset asset, Map<String, BigDecimal> stockPrices, Map<String, BigDecimal> cryptoPrices) {
        Map<String, Object> m = new HashMap<>();
        String sym = asset.getSymbol() != null ? asset.getSymbol() : "";
        String symUp = sym.toUpperCase();

        double live = resolveLivePrice(asset, sym, symUp, stockPrices, cryptoPrices);
        double quantity = asset.getQuantity() != null ? asset.getQuantity().doubleValue() : 0.0;
        double avgBuy = asset.getAvgBuyPrice() != null ? asset.getAvgBuyPrice().doubleValue() : 0.0;
        double marketValue = quantity * live;
        double cost = quantity * avgBuy;
        double pnl = marketValue - cost;
        double returnPct = cost > 0 ? (pnl / cost) * 100 : 0.0;

        m.put("id", asset.getId());
        m.put("type", asset.getType());
        m.put("name", asset.getName());
        m.put("symbol", asset.getSymbol());
        m.put("quantity", asset.getQuantity());
        m.put("avgBuyPrice", asset.getAvgBuyPrice());
        m.put("lastPriceINR", live);
        m.put("marketValue", marketValue);
        m.put("pnl", pnl);
        m.put("returnPct", returnPct);
        return m;
    }

    private double resolveLivePrice(Asset asset, String sym, String symUp,
                                    Map<String, BigDecimal> stockPrices,
                                    Map<String, BigDecimal> cryptoPrices) {
        if (asset.getType() == Asset.AssetType.crypto) {
            BigDecimal bd = cryptoPrices.get(symUp);
            if (bd == null) bd = cryptoPrices.get(sym);
            return bd != null ? bd.doubleValue() : 0.0;
        }
        BigDecimal bd = stockPrices.get(symUp);
        return bd != null ? bd.doubleValue() : 0.0;
    }
}
