/**
 * [AI-assisted] Component Tests for Dashboard.jsx
 * 
 * Bu test dosyası AI (GitHub Copilot) ile yardımlı olarak oluşturulmuştur.
 * Test senaryoları:
 * - Component render testleri
 * - State yönetimi testleri
 * - Event handling testleri
 */

import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, waitFor } from '@testing-library/react';
import Dashboard from '../Dashboard';

// Firebase servislerini mock'la
vi.mock('../../../services/firebaseService', () => ({
  subscribeToEvents: vi.fn((callback) => {
    // Simüle edilmiş eventler
    setTimeout(() => {
      callback([
        {
          id: '1',
          type: 'AUTH_FAIL',
          sourceIP: '192.168.1.100',
          severity: 'high',
          createdAt: { toDate: () => new Date() },
        },
      ]);
    }, 100);
    return () => {}; // unsubscribe fonksiyonu
  }),
  subscribeToUserStats: vi.fn((callback) => {
    setTimeout(() => {
      callback([
        {
          id: 'user1',
          username: 'testuser',
          loginCount: 10,
          lastLogin: { toDate: () => new Date() },
        },
      ]);
    }, 100);
    return () => {};
  }),
  subscribeToRules: vi.fn((callback) => {
    setTimeout(() => {
      callback([]);
    }, 100);
    return () => {};
  }),
  detectAllAnomalies: vi.fn(() => ({
    bruteForce: [],
    abnormalLoginTime: [],
    sqlInjection: [],
    trafficSpike: [],
    geoAnomaly: [],
    apiAbuse: [],
  })),
  generateAllAIRecommendations: vi.fn(() => ({
    thresholds: [],
    blockIPs: [],
    notifications: [],
    userSecurity: [],
  })),
  createBruteForceAlarm: vi.fn(() => Promise.resolve('alarm-id')),
  createAlarm: vi.fn(() => Promise.resolve('alarm-id')),
}));

describe('Dashboard Component', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('should render dashboard with stat cards', async () => {
    render(<Dashboard />);
    
    await waitFor(() => {
      expect(screen.getByText(/Toplam Olay/i)).toBeInTheDocument();
      expect(screen.getByText(/Kritik Tehditler/i)).toBeInTheDocument();
      expect(screen.getByText(/Sistem Sağlığı/i)).toBeInTheDocument();
      expect(screen.getByText(/Aktif Kullanıcılar/i)).toBeInTheDocument();
    });
  });

  it('should display AI recommendations when available', async () => {
    const { generateAllAIRecommendations } = await import('../../../services/firebaseService');
    
    // Mock'u render'dan önce ayarla
    generateAllAIRecommendations.mockReturnValue({
      thresholds: [
        {
          type: 'THRESHOLD',
          rule: 'Brute Force',
          current: 5,
          suggested: 3,
          confidence: 85,
          reason: 'Test önerisi',
          priority: 'high',
        },
      ],
      blockIPs: [],
      notifications: [],
      userSecurity: [],
    });

    render(<Dashboard />);
    
    await waitFor(() => {
      expect(screen.getByText(/AI Destekli Öneriler/i)).toBeInTheDocument();
    }, { timeout: 3000 });
  });

  it('should display security alerts when anomalies detected', async () => {
    const { detectAllAnomalies } = await import('../../../services/firebaseService');
    
    // Mock'u render'dan önce ayarla
    detectAllAnomalies.mockReturnValue({
      bruteForce: [
        {
          ip: '192.168.1.100',
          attempts: 6,
          threshold: 5,
          lastAttempt: new Date(),
        },
      ],
      abnormalLoginTime: [],
      sqlInjection: [],
      trafficSpike: [],
      geoAnomaly: [],
      apiAbuse: [],
    });

    render(<Dashboard />);
    
    await waitFor(() => {
      expect(screen.getByText(/Güvenlik Uyarıları/i)).toBeInTheDocument();
    }, { timeout: 3000 });
  });

  it('should handle empty state gracefully', async () => {
    const { subscribeToEvents } = await import('../../../services/firebaseService');
    
    subscribeToEvents.mockImplementationOnce((callback) => {
      setTimeout(() => callback([]), 100);
      return () => {};
    });

    render(<Dashboard />);
    
    await waitFor(() => {
      // Component render olmalı, hata vermemeli
      expect(screen.getByText(/Toplam Olay/i)).toBeInTheDocument();
    });
  });
});
