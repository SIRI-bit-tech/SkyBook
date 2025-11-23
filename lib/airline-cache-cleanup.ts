/**
 * Airline Cache Cleanup Utility
 * 
 * This module provides utilities for maintaining the airline cache,
 * including cleanup of expired entries and cache statistics.
 */

import { airlineCache } from './airline-cache';

/**
 * Cleanup expired cache entries
 * Should be called periodically (e.g., daily via cron job)
 */
export function cleanupAirlineCache(): void {
  try {
    const statsBefore = airlineCache.getCacheStats();
    console.log('Airline cache cleanup started:', statsBefore);
    
    airlineCache.cleanupExpiredEntries();
    
    const statsAfter = airlineCache.getCacheStats();
    console.log('Airline cache cleanup completed:', statsAfter);
    
    const cleaned = statsBefore.total - statsAfter.total;
    if (cleaned > 0) {
      console.log(`Cleaned up ${cleaned} expired airline cache entries`);
    }
  } catch (error) {
    console.error('Airline cache cleanup failed:', error);
  }
}

/**
 * Get comprehensive cache statistics
 */
export function getAirlineCacheStats() {
  const stats = airlineCache.getCacheStats();
  const allAirlines = airlineCache.getAllCachedAirlines();
  
  const sourceBreakdown = allAirlines.reduce((acc, airline) => {
    acc[airline.source] = (acc[airline.source] || 0) + 1;
    return acc;
  }, {} as Record<string, number>);

  const ageBreakdown = allAirlines.reduce((acc, airline) => {
    const ageHours = Math.floor((Date.now() - airline.cachedAt) / (1000 * 60 * 60));
    const ageCategory = ageHours < 1 ? 'fresh' : 
                       ageHours < 24 ? 'recent' : 
                       ageHours < 168 ? 'week' : 'old';
    acc[ageCategory] = (acc[ageCategory] || 0) + 1;
    return acc;
  }, {} as Record<string, number>);

  return {
    total: stats.total,
    bySource: sourceBreakdown,
    byAge: ageBreakdown,
    coverage: {
      amadeus: sourceBreakdown.amadeus || 0,
      fallback: sourceBreakdown.fallback || 0,
      searchResult: sourceBreakdown['search-result'] || 0,
    }
  };
}

/**
 * Initialize cache cleanup interval (for server environments)
 */
export function initializeAirlineCacheCleanup(): void {
  // Clean up every 6 hours
  const CLEANUP_INTERVAL = 6 * 60 * 60 * 1000;
  
  setInterval(() => {
    cleanupAirlineCache();
  }, CLEANUP_INTERVAL);
  
  console.log('Airline cache cleanup initialized (6-hour interval)');
}