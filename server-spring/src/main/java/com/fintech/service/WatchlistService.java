package com.fintech.service;

import com.fintech.entity.User;
import com.fintech.entity.Watchlist;
import com.fintech.repository.WatchlistRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import java.util.List;
import java.util.Objects;
import java.util.Optional;

@Service
public class WatchlistService {

    @Autowired
    private WatchlistRepository watchlistRepository;

    // Get all watchlist items for a user
    public List<Watchlist> getWatchlistByUser(User user) {
        return watchlistRepository.findByUser(user);
    }

    // Save a watchlist item
    public Watchlist save(Watchlist item) {
        return watchlistRepository.save(Objects.requireNonNull(item, "Watchlist item is required!!!"));
    }

    public Optional<Watchlist> findByIdAndUser(Long id, User user) {
        return watchlistRepository.findByIdAndUser(id, user);
    }

    // Delete a watchlist item by ID
    public void delete(Long id) {
        watchlistRepository.deleteById(Objects.requireNonNull(id, "Watchlist ID is required!!!"));
    }
}
