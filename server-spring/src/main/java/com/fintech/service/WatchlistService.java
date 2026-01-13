package com.fintech.service;

import com.fintech.entity.User;
import com.fintech.entity.Watchlist;
import com.fintech.repository.WatchlistRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import java.util.List;

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
        return watchlistRepository.save(item);
    }

    // Delete a watchlist item by ID
    public void delete(Long id) {
        watchlistRepository.deleteById(id);
    }
}
