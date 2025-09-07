"use client";

import React, { useState, useEffect } from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { TrendingUp, Flame, Award, Target } from 'lucide-react';
import { toast } from 'sonner';

interface UserStatsProps {
  userId?: string;
  isGuest?: boolean;
  onStatsUpdate?: (stats: UserStats) => void;
}

interface UserStats {
  xp: number;
  dayStreak: number;
  badgesEarned: number;
  testsAttempted: number;
}

interface StatCardProps {
  title: string;
  value: number;
  icon: React.ComponentType<{ className?: string }>;
  color: string;
  bgColor: string;
  isLoading?: boolean;
}

const StatCard: React.FC<StatCardProps> = ({ title, value, icon: Icon, color, bgColor, isLoading }) => {
  return (
    <Card className="relative overflow-hidden transition-all duration-300 hover:shadow-lg hover:-translate-y-1 border-0 shadow-sm">
      <CardContent className="p-6">
        <div className="flex items-center justify-between">
          <div className="flex-1">
            <p className="text-sm font-medium text-muted-foreground mb-2">{title}</p>
            {isLoading ? (
              <div className="h-8 w-16 bg-muted animate-pulse rounded-md"></div>
            ) : (
              <p className="text-3xl font-bold font-display" style={{ color }}>
                {value.toLocaleString()}
              </p>
            )}
          </div>
          <div 
            className="p-3 rounded-lg transition-transform duration-300 hover:scale-110"
            style={{ backgroundColor: bgColor }}
          >
            <Icon className="w-6 h-6" style={{ color }} />
          </div>
        </div>
      </CardContent>
    </Card>
  );
};

export const UserStats: React.FC<UserStatsProps> = ({ 
  userId, 
  isGuest = false, 
  onStatsUpdate 
}) => {
  const [stats, setStats] = useState<UserStats>({
    xp: 0,
    dayStreak: 0,
    badgesEarned: 0,
    testsAttempted: 0
  });
  const [isLoading, setIsLoading] = useState(true);
  const [lastVisitDate, setLastVisitDate] = useState<string | null>(null);

  // Load initial stats
  useEffect(() => {
    loadStats();
  }, [userId, isGuest]);

  // Update day streak on component mount
  useEffect(() => {
    if (!isLoading) {
      updateDayStreak();
    }
  }, [isLoading]);

  const loadStats = async () => {
    setIsLoading(true);
    
    try {
      if (isGuest) {
        // Load from localStorage for guest users
        const savedStats = localStorage.getItem('guestUserStats');
        const savedLastVisit = localStorage.getItem('guestLastVisitDate');
        
        if (savedStats) {
          const parsedStats = JSON.parse(savedStats);
          setStats(parsedStats);
        }
        
        if (savedLastVisit) {
          setLastVisitDate(savedLastVisit);
        }
      } else if (userId) {
        // Load from API for authenticated users
        const token = localStorage.getItem("bearer_token");
        const headers = token ? { Authorization: `Bearer ${token}` } : {};

        try {
          // Fetch user progress (XP and streak)
          const progressResponse = await fetch(`/api/user-progress?user_id=${userId}`, { headers });
          if (progressResponse.ok) {
            const progressData = await progressResponse.json();
            setStats(prev => ({
              ...prev,
              xp: progressData.xp || 0,
              dayStreak: progressData.currentStreak || 0
            }));
            setLastVisitDate(progressData.lastActivityDate);
          } else {
            // If no progress exists, initialize with defaults
            setStats(prev => ({
              ...prev,
              xp: 0,
              dayStreak: 0
            }));
          }

          // Fetch badges count
          const badgesResponse = await fetch(`/api/badges?user_id=${userId}`, { headers });
          if (badgesResponse.ok) {
            const badgesData = await badgesResponse.json();
            setStats(prev => ({
              ...prev,
              badgesEarned: Array.isArray(badgesData) ? badgesData.length : 0
            }));
          }

          // Fetch quiz attempts count
          const attemptsResponse = await fetch('/api/quiz-attempts', { headers });
          if (attemptsResponse.ok) {
            const attemptsData = await attemptsResponse.json();
            setStats(prev => ({
              ...prev,
              testsAttempted: Array.isArray(attemptsData) ? attemptsData.length : 0
            }));
          }
        } catch (error) {
          console.error('Error loading stats from API:', error);
          // Don't show error toast on initial load if no data exists yet
        }
      }
    } catch (error) {
      console.error('Error loading stats:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const saveStats = async (newStats: UserStats) => {
    if (isGuest) {
      localStorage.setItem('guestUserStats', JSON.stringify(newStats));
      localStorage.setItem('guestLastVisitDate', new Date().toISOString().split('T')[0]);
    } else if (userId) {
      // Update user progress via API
      const token = localStorage.getItem("bearer_token");
      const headers = {
        'Content-Type': 'application/json',
        ...(token ? { Authorization: `Bearer ${token}` } : {})
      };

      try {
        const response = await fetch(`/api/user-progress?user_id=${userId}`, {
          method: 'PUT',
          headers,
          body: JSON.stringify({
            xp: newStats.xp,
            currentStreak: newStats.dayStreak
          })
        });

        if (!response.ok) {
          console.error('Failed to update user progress');
        }
      } catch (error) {
        console.error('Error updating user progress:', error);
      }
    }
    
    setStats(newStats);
    onStatsUpdate?.(newStats);
  };

  const updateDayStreak = async () => {
    const today = new Date().toISOString().split('T')[0];
    const yesterday = new Date(Date.now() - 24 * 60 * 60 * 1000).toISOString().split('T')[0];
    
    if (isGuest) {
      const savedLastVisit = localStorage.getItem('guestLastVisitDate');
      
      if (!savedLastVisit) {
        // First visit
        const newStats = { ...stats, dayStreak: 1 };
        await saveStats(newStats);
        setLastVisitDate(today);
      } else if (savedLastVisit === yesterday) {
        // Consecutive day
        const newStats = { ...stats, dayStreak: stats.dayStreak + 1 };
        await saveStats(newStats);
        setLastVisitDate(today);
      } else if (savedLastVisit !== today && savedLastVisit < yesterday) {
        // Missed a day, reset streak
        const newStats = { ...stats, dayStreak: 1 };
        await saveStats(newStats);
        setLastVisitDate(today);
      }
    } else if (userId) {
      // For authenticated users, handle day streak via API
      if (!lastVisitDate) {
        // First visit
        const newStats = { ...stats, dayStreak: 1 };
        await saveStats(newStats);
        setLastVisitDate(today);
      } else if (lastVisitDate === yesterday) {
        // Consecutive day
        const newStats = { ...stats, dayStreak: stats.dayStreak + 1 };
        await saveStats(newStats);
        setLastVisitDate(today);
      } else if (lastVisitDate !== today && lastVisitDate < yesterday) {
        // Missed a day, reset streak
        const newStats = { ...stats, dayStreak: 1 };
        await saveStats(newStats);
        setLastVisitDate(today);
      }
    }
  };

  const handleQuizSubmission = async (score: number) => {
    const newStats = { ...stats };
    
    // Always increment tests attempted and XP
    newStats.testsAttempted += 1;
    newStats.xp += 10;
    
    // Increment badges if score > 80%
    if (score > 80) {
      newStats.badgesEarned += 1;
      
      // Award badge via API for authenticated users
      if (!isGuest && userId) {
        const token = localStorage.getItem("bearer_token");
        const headers = {
          'Content-Type': 'application/json',
          ...(token ? { Authorization: `Bearer ${token}` } : {})
        };

        try {
          // For demo purposes, award a simple achievement badge (badge ID 1)
          await fetch('/api/badges', {
            method: 'POST',
            headers,
            body: JSON.stringify({
              badgeId: 1
            })
          });
        } catch (error) {
          console.error('Error awarding badge:', error);
        }
      }
    }
    
    await saveStats(newStats);
    
    const message = score > 80 
      ? `Quiz completed! +10 XP, +1 Badge earned!` 
      : `Quiz completed! +10 XP`;
    
    toast.success(message);
  };

  const statCards = [
    {
      title: "Experience Points",
      value: stats.xp,
      icon: TrendingUp,
      color: "#f59e0b",
      bgColor: "#fef3c7"
    },
    {
      title: "Day Streak",
      value: stats.dayStreak,
      icon: Flame,
      color: "#ef4444",
      bgColor: "#fee2e2"
    },
    {
      title: "Badges Earned",
      value: stats.badgesEarned,
      icon: Award,
      color: "#16a34a",
      bgColor: "#dcfce7"
    },
    {
      title: "Tests Attempted",
      value: stats.testsAttempted,
      icon: Target,
      color: "#2563eb",
      bgColor: "#dbeafe"
    }
  ];

  return (
    <div className="space-y-6">
      {/* Stats Grid */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {statCards.map((card, index) => (
          <StatCard
            key={index}
            title={card.title}
            value={card.value}
            icon={card.icon}
            color={card.color}
            bgColor={card.bgColor}
            isLoading={isLoading}
          />
        ))}
      </div>
    </div>
  );
};