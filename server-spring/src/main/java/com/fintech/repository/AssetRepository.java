package com.fintech.repository;

import com.fintech.entity.Asset;
import com.fintech.entity.User;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;
import java.util.List;
import java.util.Optional;

@Repository
public interface AssetRepository extends JpaRepository<Asset, Long> {
    List<Asset> findByUser(User user);
    List<Asset> findByUserAndType(User user, Asset.AssetType type);
    Optional<Asset> findByIdAndUser(Long id, User user);
}
