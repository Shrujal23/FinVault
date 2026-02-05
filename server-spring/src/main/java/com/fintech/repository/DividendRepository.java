package com.fintech.repository;

import com.fintech.entity.Dividend;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.time.Instant;
import java.util.List;

@Repository
public interface DividendRepository extends JpaRepository<Dividend, Long> {
    List<Dividend> findByTickerOrderByExDateDesc(String ticker);
    List<Dividend> findByExDateBetweenOrderByExDateAsc(Instant start, Instant end);
}
