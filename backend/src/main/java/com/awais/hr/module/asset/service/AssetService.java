package com.awais.hr.module.asset.service;

import java.util.List;
import java.util.Map;

public interface AssetService {
    List<Map<String, Object>> getAllAssets();
    List<Map<String, Object>> getMyAssets(String email);
    Map<String, Object> assignAsset(String assetId, String employeeId);
    Map<String, Object> returnAsset(String assetId);
    void addAsset(String name, String category, String serialNumber, String purchaseDate);
}
