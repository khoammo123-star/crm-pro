// =====================================================
// CRM PRO - CACHE MANAGER
// localStorage caching with TTL support
// =====================================================

const CacheManager = {
    // Cache configuration
    config: {
        prefix: 'crm_cache_',
        defaultTTL: 5 * 60 * 1000, // 5 minutes
        maxItems: 50
    },

    // Cache TTL by action type (in milliseconds)
    ttlConfig: {
        'getDashboardStats': 2 * 60 * 1000,    // 2 minutes
        'getContacts': 3 * 60 * 1000,          // 3 minutes
        'getCompanies': 5 * 60 * 1000,         // 5 minutes
        'getDealsPipeline': 2 * 60 * 1000,     // 2 minutes
        'getTasks': 2 * 60 * 1000,             // 2 minutes
        'getConfig': 10 * 60 * 1000            // 10 minutes
    },

    /**
     * Generate cache key from action and params
     */
    generateKey(action, params = {}) {
        const paramStr = Object.keys(params)
            .sort()
            .filter(k => params[k] !== undefined && params[k] !== '')
            .map(k => `${k}=${JSON.stringify(params[k])}`)
            .join('&');
        return `${this.config.prefix}${action}_${paramStr}`;
    },

    /**
     * Get cached data if valid
     */
    get(action, params = {}) {
        try {
            const key = this.generateKey(action, params);
            const cached = localStorage.getItem(key);

            if (!cached) return null;

            const { data, timestamp, ttl } = JSON.parse(cached);
            const now = Date.now();

            // Check if cache is still valid
            if (now - timestamp < ttl) {
                console.log(`[Cache] HIT: ${action}`);
                return data;
            }

            // Cache expired, remove it
            localStorage.removeItem(key);
            console.log(`[Cache] EXPIRED: ${action}`);
            return null;

        } catch (error) {
            console.warn('[Cache] Error reading cache:', error);
            return null;
        }
    },

    /**
     * Store data in cache
     */
    set(action, params = {}, data) {
        try {
            const key = this.generateKey(action, params);
            const ttl = this.ttlConfig[action] || this.config.defaultTTL;

            const cacheItem = {
                data,
                timestamp: Date.now(),
                ttl
            };

            localStorage.setItem(key, JSON.stringify(cacheItem));
            console.log(`[Cache] SET: ${action} (TTL: ${ttl / 1000}s)`);

            // Cleanup old items if too many
            this.cleanup();

        } catch (error) {
            console.warn('[Cache] Error setting cache:', error);
            // If localStorage is full, clear oldest items
            if (error.name === 'QuotaExceededError') {
                this.clearOldest(10);
                try {
                    localStorage.setItem(key, JSON.stringify(cacheItem));
                } catch (e) {
                    // Give up
                }
            }
        }
    },

    /**
     * Invalidate cache for specific action or all related actions
     */
    invalidate(action = null) {
        try {
            if (action) {
                // Clear specific action cache
                const keys = Object.keys(localStorage).filter(k =>
                    k.startsWith(`${this.config.prefix}${action}`)
                );
                keys.forEach(k => localStorage.removeItem(k));
                console.log(`[Cache] INVALIDATED: ${action} (${keys.length} items)`);
            } else {
                // Clear all CRM cache
                const keys = Object.keys(localStorage).filter(k =>
                    k.startsWith(this.config.prefix)
                );
                keys.forEach(k => localStorage.removeItem(k));
                console.log(`[Cache] CLEARED ALL: ${keys.length} items`);
            }
        } catch (error) {
            console.warn('[Cache] Error invalidating:', error);
        }
    },

    /**
     * Invalidate related caches when data changes
     */
    invalidateOnWrite(entity) {
        const relatedActions = {
            'contact': ['getContacts', 'getDashboardStats', 'searchContacts'],
            'company': ['getCompanies', 'getDashboardStats'],
            'deal': ['getDeals', 'getDealsPipeline', 'getDashboardStats'],
            'task': ['getTasks', 'getDashboardStats', 'getOverdueTasks', 'getTodayTasks']
        };

        const actions = relatedActions[entity] || [];
        actions.forEach(action => this.invalidate(action));
    },

    /**
     * Remove expired and oldest cache items
     */
    cleanup() {
        try {
            const keys = Object.keys(localStorage)
                .filter(k => k.startsWith(this.config.prefix));

            if (keys.length <= this.config.maxItems) return;

            // Sort by timestamp and remove oldest
            const items = keys.map(k => {
                try {
                    const item = JSON.parse(localStorage.getItem(k));
                    return { key: k, timestamp: item.timestamp || 0 };
                } catch {
                    return { key: k, timestamp: 0 };
                }
            }).sort((a, b) => a.timestamp - b.timestamp);

            // Remove oldest 20%
            const toRemove = Math.ceil(items.length * 0.2);
            items.slice(0, toRemove).forEach(item => {
                localStorage.removeItem(item.key);
            });

            console.log(`[Cache] Cleanup: removed ${toRemove} old items`);
        } catch (error) {
            console.warn('[Cache] Cleanup error:', error);
        }
    },

    /**
     * Clear oldest N items
     */
    clearOldest(n) {
        const keys = Object.keys(localStorage)
            .filter(k => k.startsWith(this.config.prefix));

        const items = keys.map(k => {
            try {
                const item = JSON.parse(localStorage.getItem(k));
                return { key: k, timestamp: item.timestamp || 0 };
            } catch {
                return { key: k, timestamp: 0 };
            }
        }).sort((a, b) => a.timestamp - b.timestamp);

        items.slice(0, n).forEach(item => {
            localStorage.removeItem(item.key);
        });
    },

    /**
     * Get cache statistics
     */
    getStats() {
        const keys = Object.keys(localStorage)
            .filter(k => k.startsWith(this.config.prefix));

        let totalSize = 0;
        let validCount = 0;
        let expiredCount = 0;
        const now = Date.now();

        keys.forEach(k => {
            try {
                const value = localStorage.getItem(k);
                totalSize += value.length;
                const item = JSON.parse(value);
                if (now - item.timestamp < item.ttl) {
                    validCount++;
                } else {
                    expiredCount++;
                }
            } catch { }
        });

        return {
            totalItems: keys.length,
            validItems: validCount,
            expiredItems: expiredCount,
            totalSize: Math.round(totalSize / 1024) + ' KB'
        };
    }
};

// Make it globally available
window.CacheManager = CacheManager;
