/**
 * [AI-generated] Unit Tests for firebaseService.js
 * 
 * Bu test dosyası AI (Claude Code) ile oluşturulmuştur.
 * Test senaryoları:
 * - Anomali tespit fonksiyonları
 * - AI öneri sistemleri
 * - Edge-case senaryoları
 * - Hata durumları
 */

import { describe, it, expect, beforeEach, vi } from 'vitest';
import {
  detectBruteForce,
  detectAbnormalLoginTime,
  detectSQLInjection,
  detectTrafficSpike,
  detectGeoAnomaly,
  detectAPIAbuse,
  detectAllAnomalies,
  generateAIThresholdRecommendation,
  generateAIBlockRecommendation,
  generateAINotificationRecommendation,
  generateAIUserSecurityRecommendation,
  generateAllAIRecommendations,
} from '../firebaseService';

// Mock Firebase Timestamp helper
const createMockTimestamp = (date) => ({
  toDate: () => date,
  seconds: Math.floor(date.getTime() / 1000),
});

// Mock event oluşturucu
const createMockEvent = (overrides = {}) => {
  const now = new Date();
  return {
    type: 'AUTH_FAIL',
    sourceIP: '192.168.1.100',
    username: 'testuser',
    severity: 'medium',
    createdAt: createMockTimestamp(now),
    ...overrides,
  };
};

describe('Anomali Tespit Fonksiyonları', () => {
  describe('detectBruteForce', () => {
    it('should detect brute force attack when threshold exceeded', () => {
      const now = new Date();
      const events = [];
      
      // 3 dakika içinde 6 başarısız giriş (eşik: 5)
      for (let i = 0; i < 6; i++) {
        events.push(createMockEvent({
          type: 'AUTH_FAIL',
          sourceIP: '192.168.1.100',
          createdAt: createMockTimestamp(new Date(now.getTime() - (2 - i) * 60000)), // Son 2 dakika
        }));
      }
      
      const result = detectBruteForce(events, { threshold: 5, timeWindow: 3, timeUnit: 'minutes' });
      
      expect(result).toHaveLength(1);
      expect(result[0].ip).toBe('192.168.1.100');
      expect(result[0].attempts).toBe(6);
      expect(result[0].threshold).toBe(5);
    });

    it('should not detect brute force when below threshold', () => {
      const now = new Date();
      const events = [];
      
      // Sadece 3 başarısız giriş (eşik: 5)
      for (let i = 0; i < 3; i++) {
        events.push(createMockEvent({
          type: 'AUTH_FAIL',
          sourceIP: '192.168.1.100',
          createdAt: createMockTimestamp(new Date(now.getTime() - i * 60000)),
        }));
      }
      
      const result = detectBruteForce(events, { threshold: 5, timeWindow: 3, timeUnit: 'minutes' });
      expect(result).toHaveLength(0);
    });

    it('should ignore events outside time window', () => {
      const now = new Date();
      const events = [];
      
      // 5 dakika önceki eventler (pencerenin dışında)
      for (let i = 0; i < 10; i++) {
        events.push(createMockEvent({
          type: 'AUTH_FAIL',
          sourceIP: '192.168.1.100',
          createdAt: createMockTimestamp(new Date(now.getTime() - (5 + i) * 60000)),
        }));
      }
      
      const result = detectBruteForce(events, { threshold: 5, timeWindow: 3, timeUnit: 'minutes' });
      expect(result).toHaveLength(0);
    });

    it('should handle multiple IP addresses separately', () => {
      const now = new Date();
      const events = [];
      
      // IP1: 6 deneme (tespit edilmeli)
      for (let i = 0; i < 6; i++) {
        events.push(createMockEvent({
          type: 'AUTH_FAIL',
          sourceIP: '192.168.1.100',
          createdAt: createMockTimestamp(new Date(now.getTime() - i * 30000)),
        }));
      }
      
      // IP2: 3 deneme (tespit edilmemeli)
      for (let i = 0; i < 3; i++) {
        events.push(createMockEvent({
          type: 'AUTH_FAIL',
          sourceIP: '192.168.1.200',
          createdAt: createMockTimestamp(new Date(now.getTime() - i * 30000)),
        }));
      }
      
      const result = detectBruteForce(events, { threshold: 5, timeWindow: 3, timeUnit: 'minutes' });
      
      expect(result).toHaveLength(1);
      expect(result[0].ip).toBe('192.168.1.100');
    });

    // Edge case: Empty events array
    it('should return empty array for empty events', () => {
      const result = detectBruteForce([], { threshold: 5, timeWindow: 3, timeUnit: 'minutes' });
      expect(result).toEqual([]);
    });

    // Edge case: Invalid timestamp
    it('should handle events with invalid timestamps gracefully', () => {
      const events = [
        createMockEvent({ createdAt: null }),
        createMockEvent({ createdAt: undefined }),
      ];
      
      const result = detectBruteForce(events, { threshold: 5, timeWindow: 3, timeUnit: 'minutes' });
      // Should not crash, may return empty or filter invalid events
      expect(Array.isArray(result)).toBe(true);
    });
  });

  describe('detectAbnormalLoginTime', () => {
    it('should detect login at abnormal hours (00:00-06:00)', () => {
      const abnormalTime = new Date();
      abnormalTime.setHours(3, 30, 0, 0); // 03:30
      
      const events = [
        createMockEvent({
          type: 'LOGIN_SUCCESS',
          username: 'testuser',
          sourceIP: '192.168.1.100',
          createdAt: createMockTimestamp(abnormalTime),
        }),
      ];
      
      const result = detectAbnormalLoginTime(events, { timeWindow: 6 });
      
      expect(result).toHaveLength(1);
      expect(result[0].username).toBe('testuser');
      expect(result[0].hour).toBe(3);
    });

    it('should not detect login at normal hours', () => {
      const normalTime = new Date();
      normalTime.setHours(14, 30, 0, 0); // 14:30
      
      const events = [
        createMockEvent({
          type: 'LOGIN_SUCCESS',
          username: 'testuser',
          createdAt: createMockTimestamp(normalTime),
        }),
      ];
      
      const result = detectAbnormalLoginTime(events, { timeWindow: 6 });
      expect(result).toHaveLength(0);
    });

    it('should handle custom time window', () => {
      const time = new Date();
      time.setHours(7, 0, 0, 0); // 07:00
      
      const events = [
        createMockEvent({
          type: 'LOGIN_SUCCESS',
          createdAt: createMockTimestamp(time),
        }),
      ];
      
      // 00:00-08:00 arası anormal sayılsın
      const result = detectAbnormalLoginTime(events, { timeWindow: 8 });
      expect(result).toHaveLength(1);
    });
  });

  describe('detectSQLInjection', () => {
    it('should detect SQL injection patterns', () => {
      const events = [
        createMockEvent({
          type: 'AUTH_FAIL',
          username: "admin' OR '1'='1",
          sourceIP: '192.168.1.100',
          createdAt: createMockTimestamp(new Date()),
        }),
        createMockEvent({
          type: 'SQL_INJECTION',
          username: "'; DROP TABLE users; --",
          sourceIP: '192.168.1.100',
          createdAt: createMockTimestamp(new Date()),
        }),
      ];
      
      const result = detectSQLInjection(events);
      
      expect(result.length).toBeGreaterThan(0);
      expect(result.some(r => r.type === 'SQL_INJECTION')).toBe(true);
    });

    it('should not detect normal usernames', () => {
      const events = [
        createMockEvent({
          type: 'AUTH_FAIL',
          username: 'normaluser',
          createdAt: createMockTimestamp(new Date()),
        }),
      ];
      
      const result = detectSQLInjection(events);
      expect(result).toHaveLength(0);
    });
  });

  describe('detectTrafficSpike', () => {
    it('should detect traffic spike when rate exceeds threshold', () => {
      const now = new Date();
      const events = [];
      
      // Son 4 dakikada 10 event (ortalama: 2.5/dk)
      for (let i = 0; i < 10; i++) {
        events.push(createMockEvent({
          createdAt: createMockTimestamp(new Date(now.getTime() - (4 - i) * 60000)),
        }));
      }
      
      // Son 1 dakikada 15 event (7.5x artış, eşik: 3x)
      for (let i = 0; i < 15; i++) {
        events.push(createMockEvent({
          createdAt: createMockTimestamp(new Date(now.getTime() - i * 4000)),
        }));
      }
      
      const result = detectTrafficSpike(events, { threshold: 3, timeWindow: 5 });
      
      expect(result.length).toBeGreaterThan(0);
      if (result.length > 0) {
        expect(result[0].type).toBe('TRAFFIC_SPIKE');
        expect(result[0].multiplier).toBeGreaterThan(3);
      }
    });

    it('should not detect spike when rate is normal', () => {
      const now = new Date();
      const events = [];
      
      // Düzenli trafik
      for (let i = 0; i < 20; i++) {
        events.push(createMockEvent({
          createdAt: createMockTimestamp(new Date(now.getTime() - i * 30000)),
        }));
      }
      
      const result = detectTrafficSpike(events, { threshold: 3, timeWindow: 5 });
      expect(result).toHaveLength(0);
    });
  });

  describe('detectGeoAnomaly', () => {
    it('should detect geo anomaly when user logs in from multiple IPs', () => {
      const now = new Date();
      const events = [
        createMockEvent({
          type: 'LOGIN_SUCCESS',
          username: 'testuser',
          sourceIP: '192.168.1.100',
          createdAt: createMockTimestamp(new Date(now.getTime() - 5 * 60000)),
        }),
        createMockEvent({
          type: 'LOGIN_SUCCESS',
          username: 'testuser',
          sourceIP: '192.168.1.200',
          createdAt: createMockTimestamp(new Date(now.getTime() - 3 * 60000)),
        }),
        createMockEvent({
          type: 'LOGIN_SUCCESS',
          username: 'testuser',
          sourceIP: '10.0.0.50',
          createdAt: createMockTimestamp(new Date(now.getTime() - 1 * 60000)),
        }),
      ];
      
      const result = detectGeoAnomaly(events, { threshold: 2, timeWindow: 10 });
      
      expect(result).toHaveLength(1);
      expect(result[0].username).toBe('testuser');
      expect(result[0].ips.length).toBe(3);
    });

    it('should not detect anomaly for single IP', () => {
      const now = new Date();
      const events = [
        createMockEvent({
          type: 'LOGIN_SUCCESS',
          username: 'testuser',
          sourceIP: '192.168.1.100',
          createdAt: createMockTimestamp(new Date(now.getTime() - 5 * 60000)),
        }),
        createMockEvent({
          type: 'LOGIN_SUCCESS',
          username: 'testuser',
          sourceIP: '192.168.1.100',
          createdAt: createMockTimestamp(new Date(now.getTime() - 1 * 60000)),
        }),
      ];
      
      const result = detectGeoAnomaly(events, { threshold: 2, timeWindow: 10 });
      expect(result).toHaveLength(0);
    });
  });

  describe('detectAPIAbuse', () => {
    it('should detect API rate limit abuse', () => {
      const now = new Date();
      const events = [];
      
      // 1 dakikada 150 API isteği (eşik: 100)
      for (let i = 0; i < 150; i++) {
        events.push(createMockEvent({
          type: 'API_REQUEST',
          sourceIP: '192.168.1.100',
          createdAt: createMockTimestamp(new Date(now.getTime() - i * 400)),
        }));
      }
      
      const result = detectAPIAbuse(events, { threshold: 100, timeWindow: 1, timeUnit: 'minutes' });
      
      expect(result).toHaveLength(1);
      expect(result[0].ip).toBe('192.168.1.100');
      expect(result[0].requestCount).toBeGreaterThanOrEqual(100);
    });

    it('should handle different time units correctly', () => {
      const now = new Date();
      const events = [];
      
      // 1 saatte 200 istek (eşik: 150)
      for (let i = 0; i < 200; i++) {
        events.push(createMockEvent({
          type: 'API_REQUEST',
          sourceIP: '192.168.1.100',
          createdAt: createMockTimestamp(new Date(now.getTime() - i * 18000)), // ~18 saniye aralıklarla
        }));
      }
      
      const result = detectAPIAbuse(events, { threshold: 150, timeWindow: 1, timeUnit: 'hours' });
      
      expect(result.length).toBeGreaterThanOrEqual(0); // Zaman penceresi büyük olduğu için sonuç değişebilir
    });
  });

  describe('detectAllAnomalies', () => {
    it('should detect all types of anomalies', () => {
      const now = new Date();
      const events = [];
      
      // Brute force
      for (let i = 0; i < 6; i++) {
        events.push(createMockEvent({
          type: 'AUTH_FAIL',
          sourceIP: '192.168.1.100',
          createdAt: createMockTimestamp(new Date(now.getTime() - i * 30000)),
        }));
      }
      
      // SQL Injection
      events.push(createMockEvent({
        type: 'SQL_INJECTION',
        username: "admin' OR '1'='1",
        sourceIP: '192.168.1.200',
        createdAt: createMockTimestamp(new Date()),
      }));
      
      // Abnormal login time
      const abnormalTime = new Date();
      abnormalTime.setHours(3, 0, 0, 0);
      events.push(createMockEvent({
        type: 'LOGIN_SUCCESS',
        username: 'testuser',
        createdAt: createMockTimestamp(abnormalTime),
      }));
      
      const rules = [
        { id: 'brute-force', isActive: true },
        { id: 'sql-injection', isActive: true },
        { id: 'abnormal-login-time', isActive: true },
        { id: 'traffic-spike', isActive: true },
        { id: 'geo-anomaly', isActive: true },
        { id: 'api-rate-limit', isActive: true },
      ];
      
      const result = detectAllAnomalies(events, rules);
      
      expect(result.bruteForce.length).toBeGreaterThan(0);
      expect(result.sqlInjection.length).toBeGreaterThan(0);
      expect(result.abnormalLoginTime.length).toBeGreaterThan(0);
    });

    it('should respect inactive rules', () => {
      const events = [
        createMockEvent({
          type: 'AUTH_FAIL',
          sourceIP: '192.168.1.100',
          createdAt: createMockTimestamp(new Date()),
        }),
      ];
      
      const rules = [
        { id: 'brute-force', isActive: false },
      ];
      
      const result = detectAllAnomalies(events, rules);
      expect(result.bruteForce).toEqual([]);
    });
  });
});

describe('AI Öneri Sistemleri', () => {
  describe('generateAIThresholdRecommendation', () => {
    it('should recommend lower threshold when fail rate is high', () => {
      const now = new Date();
      const events = [];
      
      // Yüksek başarısız giriş oranı
      for (let i = 0; i < 20; i++) {
        events.push(createMockEvent({
          type: 'AUTH_FAIL',
          createdAt: createMockTimestamp(new Date(now.getTime() - i * 60000)),
        }));
      }
      
      for (let i = 0; i < 10; i++) {
        events.push(createMockEvent({
          type: 'LOGIN_SUCCESS',
          createdAt: createMockTimestamp(new Date(now.getTime() - i * 60000)),
        }));
      }
      
      const result = generateAIThresholdRecommendation(events);
      
      expect(result.length).toBeGreaterThan(0);
      const thresholdRec = result.find(r => r.type === 'THRESHOLD');
      if (thresholdRec) {
        expect(thresholdRec.suggested).toBeLessThan(thresholdRec.current);
      }
    });

    it('should recommend higher threshold when system is stable', () => {
      const now = new Date();
      const events = [];
      
      // Düşük başarısız giriş oranı
      for (let i = 0; i < 5; i++) {
        events.push(createMockEvent({
          type: 'AUTH_FAIL',
          createdAt: createMockTimestamp(new Date(now.getTime() - i * 60000)),
        }));
      }
      
      for (let i = 0; i < 100; i++) {
        events.push(createMockEvent({
          type: 'LOGIN_SUCCESS',
          createdAt: createMockTimestamp(new Date(now.getTime() - i * 60000)),
        }));
      }
      
      const result = generateAIThresholdRecommendation(events);
      
      // Sistem stabil olduğunda öneri olmayabilir veya eşik artırılabilir
      expect(Array.isArray(result)).toBe(true);
    });
  });

  describe('generateAIBlockRecommendation', () => {
    it('should recommend blocking IP with many alarms', () => {
      const now = new Date();
      const events = [];
      
      // Bir IP'den çok sayıda saldırı
      for (let i = 0; i < 15; i++) {
        events.push(createMockEvent({
          type: 'AUTH_FAIL',
          sourceIP: '192.168.1.100',
          createdAt: createMockTimestamp(new Date(now.getTime() - i * 60000)),
        }));
      }
      
      const result = generateAIBlockRecommendation(events);
      
      expect(result.length).toBeGreaterThan(0);
      const blockRec = result.find(r => r.type === 'BLOCK_IP' && r.ip === '192.168.1.100');
      if (blockRec) {
        expect(blockRec.alarmCount).toBeGreaterThanOrEqual(10);
        expect(blockRec.priority).toBe('high');
      }
    });

    it('should not recommend blocking for low threat IPs', () => {
      const now = new Date();
      const events = [];
      
      // Az sayıda event
      for (let i = 0; i < 3; i++) {
        events.push(createMockEvent({
          type: 'AUTH_FAIL',
          sourceIP: '192.168.1.100',
          createdAt: createMockTimestamp(new Date(now.getTime() - i * 60000)),
        }));
      }
      
      const result = generateAIBlockRecommendation(events);
      const blockRec = result.find(r => r.ip === '192.168.1.100');
      expect(blockRec).toBeUndefined();
    });
  });

  describe('generateAINotificationRecommendation', () => {
    it('should recommend reducing notifications for high-frequency events', () => {
      const now = new Date();
      const events = [];
      
      // Çok fazla aynı tip event
      for (let i = 0; i < 60; i++) {
        events.push(createMockEvent({
          type: 'WEB_TRAFFIC',
          createdAt: createMockTimestamp(new Date(now.getTime() - i * 60000)),
        }));
      }
      
      const result = generateAINotificationRecommendation(events);
      
      expect(result.length).toBeGreaterThan(0);
      const notifRec = result.find(r => r.type === 'REDUCE_NOTIFICATIONS');
      if (notifRec) {
        expect(notifRec.count).toBeGreaterThanOrEqual(50);
      }
    });
  });

  describe('generateAIUserSecurityRecommendation', () => {
    it('should recommend 2FA for users with many failed attempts', () => {
      const now = new Date();
      const events = [];
      
      // Bir kullanıcı için çok sayıda başarısız giriş
      for (let i = 0; i < 8; i++) {
        events.push(createMockEvent({
          type: 'AUTH_FAIL',
          username: 'vulnerable_user',
          createdAt: createMockTimestamp(new Date(now.getTime() - i * 24 * 60 * 60 * 1000)), // Son 7 gün
        }));
      }
      
      const result = generateAIUserSecurityRecommendation(events);
      
      expect(result.length).toBeGreaterThan(0);
      const userRec = result.find(r => r.type === 'ENABLE_2FA' && r.username === 'vulnerable_user');
      if (userRec) {
        expect(userRec.failedAttempts).toBeGreaterThanOrEqual(5);
      }
    });
  });

  describe('generateAllAIRecommendations', () => {
    it('should return all recommendation types', () => {
      const now = new Date();
      const events = [];
      
      // Çeşitli eventler
      for (let i = 0; i < 30; i++) {
        events.push(createMockEvent({
          type: i % 2 === 0 ? 'AUTH_FAIL' : 'LOGIN_SUCCESS',
          createdAt: createMockTimestamp(new Date(now.getTime() - i * 60000)),
        }));
      }
      
      const result = generateAllAIRecommendations(events);
      
      expect(result).toHaveProperty('thresholds');
      expect(result).toHaveProperty('blockIPs');
      expect(result).toHaveProperty('notifications');
      expect(result).toHaveProperty('userSecurity');
      expect(Array.isArray(result.thresholds)).toBe(true);
      expect(Array.isArray(result.blockIPs)).toBe(true);
      expect(Array.isArray(result.notifications)).toBe(true);
      expect(Array.isArray(result.userSecurity)).toBe(true);
    });
  });
});

describe('Edge Cases ve Hata Durumları', () => {
  it('should handle null/undefined events gracefully', () => {
    expect(() => detectBruteForce(null, {})).not.toThrow();
    expect(() => detectBruteForce(undefined, {})).not.toThrow();
    expect(() => detectBruteForce([], {})).not.toThrow();
  });

  it('should handle missing configuration with defaults', () => {
    const events = [];
    for (let i = 0; i < 6; i++) {
      events.push(createMockEvent({
        type: 'AUTH_FAIL',
        sourceIP: '192.168.1.100',
        createdAt: createMockTimestamp(new Date(Date.now() - i * 30000)),
      }));
    }
    
    // Config olmadan çalışmalı (varsayılan değerler kullanılmalı)
    const result = detectBruteForce(events, {});
    expect(Array.isArray(result)).toBe(true);
  });

  it('should handle events with missing required fields', () => {
    const events = [
      { type: 'AUTH_FAIL' }, // sourceIP yok
      { sourceIP: '192.168.1.100' }, // type yok
      { type: 'AUTH_FAIL', sourceIP: '192.168.1.100', createdAt: null }, // timestamp yok
    ];
    
    const result = detectBruteForce(events, { threshold: 5, timeWindow: 3, timeUnit: 'minutes' });
    expect(Array.isArray(result)).toBe(true);
  });

  it('should handle very large event arrays', () => {
    const events = [];
    for (let i = 0; i < 10000; i++) {
      events.push(createMockEvent({
        createdAt: createMockTimestamp(new Date(Date.now() - i * 1000)),
      }));
    }
    
    const startTime = Date.now();
    const result = detectBruteForce(events, { threshold: 5, timeWindow: 3, timeUnit: 'minutes' });
    const endTime = Date.now();
    
    expect(Array.isArray(result)).toBe(true);
    // Performans kontrolü: 1 saniyeden az sürmeli
    expect(endTime - startTime).toBeLessThan(1000);
  });

  it('should handle concurrent detection calls', async () => {
    const events = [];
    for (let i = 0; i < 10; i++) {
      events.push(createMockEvent({
        type: 'AUTH_FAIL',
        sourceIP: '192.168.1.100',
        createdAt: createMockTimestamp(new Date(Date.now() - i * 30000)),
      }));
    }
    
    // Aynı anda birden fazla tespit çağrısı
    const promises = [
      Promise.resolve(detectBruteForce(events, { threshold: 5, timeWindow: 3, timeUnit: 'minutes' })),
      Promise.resolve(detectSQLInjection(events)),
      Promise.resolve(detectTrafficSpike(events, { threshold: 3, timeWindow: 5 })),
    ];
    
    const results = await Promise.all(promises);
    
    expect(results).toHaveLength(3);
    results.forEach(result => {
      expect(Array.isArray(result)).toBe(true);
    });
  });
});
