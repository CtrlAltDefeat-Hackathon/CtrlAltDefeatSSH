"use client";

import { useState, useEffect, useCallback, useMemo } from "react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Progress } from "@/components/ui/progress";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { SubjectCards } from "@/components/SubjectCards";
import { UserStats } from "@/components/UserStats";
import { GameLauncher } from "@/components/games/GameLauncher";
import { toast } from "sonner";
import {
  Coins,
  BookOpenCheck,
  Dot,
  TimerReset,
  Puzzle,
  MonitorPlay,
  MessageSquareCode,
  Undo,
  SaveOff,
  SquareLibrary,
  Orbit,
  Clapperboard,
  Circle,
  LogOut,
  Settings,
  Trophy,
  Target,
  Flame,
  Users,
  Award,
  TrendingUp,
  Gamepad2,
  Zap } from
"lucide-react";

// Types
interface StudentPortalProps {
  onLogout?: () => void;
  userData?: {
    role: 'student' | 'teacher';
    isGuest?: boolean;
    profile: {
      id: string;
      name: string;
      email?: string | null;
      schoolCode?: string | null;
      isGuest?: boolean;
      createdAt: string;
    };
  };
}

interface StudentProgress {
  id: string;
  xp: number;
  coins: number;
  level: number;
  streak: number;
  avatar: string;
  completedLessons: string[];
  badges: string[];
  lastSync: Date | null;
}

interface LeaderboardEntry {
  id: string;
  name: string;
  avatar: string;
  xp: number;
  coins: number;
  position: number;
}

// Mock data and utilities
const AVATARS = ["🎓", "🚀", "🔬", "⚡", "🎯", "🌟"];

const LOCALE_STRINGS = {
  EN: {
    level: "Level",
    coins: "Coins",
    streak: "Streak",
    dashboard: "Dashboard",
    subjects: "Subjects",
    achievements: "Achievements",
    games: "Games",
    leaderboard: "Leaderboard",
    offline: "Offline Mode",
    syncing: "Syncing...",
    lastSync: "Last sync",
    cached: "Cached",
    locked: "Locked",
    mins: "mins",
    earnedXP: "Earned {xp} XP!",
    earnedCoins: "Earned {coins} coins!",
    syncSuccess: "Progress synced successfully",
    syncError: "Sync failed - will retry",
    complete: "Complete",
    logout: "Logout",
    guest: "Guest User",
    selectSubject: "Choose a subject to start learning",
    welcomeBack: "Welcome back!",
    continueJourney: "Continue your learning journey",
    startLearning: "Start Learning",
    viewProgress: "View Progress",
    totalXP: "Total XP",
    currentStreak: "Day Streak",
    badgesEarned: "Badges Earned",
    subjectsStarted: "Subjects Started"
  },
  HI: {
    level: "स्तर",
    coins: "सिक्के",
    streak: "लगातार",
    dashboard: "डैशबोर्ड",
    subjects: "विषय",
    achievements: "उपलब्धियां",
    games: "खेल",
    leaderboard: "लीडरबोर्ड",
    offline: "ऑफलाइन मोड",
    syncing: "सिंक हो रहा है...",
    lastSync: "अंतिम सिंक",
    cached: "संग्रहीत",
    locked: "बंद",
    mins: "मिनट",
    earnedXP: "{xp} XP अर्जित किया!",
    earnedCoins: "{coins} सिक्के अर्जित किए!",
    syncSuccess: "प्रगति सफलतापूर्वक सिंक की गई",
    syncError: "सिंक असफल - पुन: प्रयास करेगा",
    complete: "पूर्ण",
    logout: "लॉगआउट",
    guest: "अतिथि उपयोगकर्ता",
    selectSubject: "सीखना शुरू करने के लिए कोई विषय चुनें",
    welcomeBack: "वापसी पर स्वागत है!",
    continueJourney: "अपनी सीखने की यात्रा जारी रखें",
    startLearning: "सीखना शुरू करें",
    viewProgress: "प्रगति देखें",
    totalXP: "कुल XP",
    currentStreak: "दिन की लकीर",
    badgesEarned: "अर्जित बैज",
    subjectsStarted: "शुरू किए गए विषय"
  },
  OD: {
    level: "ସ୍ତର",
    coins: "ମୁଦ୍ରା",
    streak: "ଧାରାବାହିକ",
    dashboard: "ଡ୍ୟାସବୋର୍ଡ",
    subjects: "ବିଷୟ",
    achievements: "ସଫଳତା",
    games: "ଖେଳ",
    leaderboard: "ଲିଡରବୋର୍ଡ",
    offline: "ଅଫଲାଇନ ମୋଡ୍",
    syncing: "ସିଙ୍କ ହେଉଛି...",
    lastSync: "ଶେଷ ସିଙ୍କ",
    cached: "ସଂରକ୍ଷିତ",
    locked: "ବନ୍ଦ",
    mins: "ମିନିଟ୍",
    earnedXP: "{xp} XP ଅର୍ଜନ କଲେ!",
    earnedCoins: "{coins} ମୁଦ୍ରା ଅର୍ଜନ କଲେ!",
    syncSuccess: "ପ୍ରଗତି ସଫଳତାର ସହିତ ସିଙ୍କ ହେଲା",
    syncError: "ସିଙ୍କ ବିଫଳ - ପୁନଃ ଚେଷ୍ଟା କରିବ",
    complete: "ସମ୍ପୂର୍ଣ୍ଣ",
    logout: "ଲଗଆଉଟ୍",
    guest: "ଅତିଥି ଉପଯୋଗକାରୀ",
    selectSubject: "ଶିକ୍ଷା ଆରମ୍ଭ କରିବାକୁ ଏକ ବିଷୟ ବেছে নিন",
    welcomeBack: "ଫিରে আসার জন্য স্বাগতম!",
    continueJourney: "ଆপଣଙ୍କ ଶেখার যাত্রা চালিয়ে যান",
    startLearning: "শেখা শুরু করুন",
    viewProgress: "অগ্রগতি দেখুন",
    totalXP: "ମୋଟ XP",
    currentStreak: "ଦିନের ধারা",
    badgesEarned: "অর্জিত ব্যাজ",
    subjectsStarted: "শুরু করা বিষয়"
  },
  BN: {
    level: "স্তর",
    coins: "কয়েন",
    streak: "ধারাবাহিক",
    dashboard: "ড্যাশবোর্ড",
    subjects: "বিষয়",
    achievements: "অর্জন",
    games: "গেমস",
    leaderboard: "লিডারবোর্ড",
    offline: "অফলাইন মোড",
    syncing: "সিঙ্ক হচ্ছে...",
    lastSync: "শেষ সিঙ্ক",
    cached: "সংরক্ষিত",
    locked: "লক",
    mins: "মিনিট",
    earnedXP: "{xp} XP অর্জন করেছেন!",
    earnedCoins: "{coins} কয়েন অর্জন করেছেন!",
    syncSuccess: "অগ্রগতি সফলভাবে সিঙ্ক হয়েছে",
    syncError: "সিঙ্ক ব্যর্থ - পুনরায় চেষ্টা করবে",
    complete: "সম্পূর্ণ",
    logout: "লগআউট",
    guest: "অতিথি ব্যবহারকারী",
    selectSubject: "শেখা শুরু করতে একটি বিষয় বেছে নিন",
    welcomeBack: "ফিরে আসার জন্য স্বাগতম!",
    continueJourney: "আপনার শেখার যাত্রা চালিয়ে যান",
    startLearning: "শেখা শুরু করুন",
    viewProgress: "অগ্রগতি দেখুন",
    totalXP: "মোট XP",
    currentStreak: "দিনের ধারা",
    badgesEarned: "অর্জিত ব্যাজ",
    subjectsStarted: "শুরু করা বিষয়"
  }
};

const mockLeaderboard: LeaderboardEntry[] = [
{ id: "1", name: "Alex", avatar: "🎓", xp: 1250, coins: 245, position: 1 },
{ id: "2", name: "Maya", avatar: "🚀", xp: 1180, coins: 230, position: 2 },
{ id: "3", name: "Sam", avatar: "🔬", xp: 1050, coins: 195, position: 3 }];


export default function StudentPortal({ onLogout, userData }: StudentPortalProps) {
  const [currentLang, setCurrentLang] = useState<"EN" | "HI" | "OD" | "BN">("EN");
  const [currentTab, setCurrentTab] = useState<string>("subjects");
  const [isOnline, setIsOnline] = useState(true);
  const [isSyncing, setIsSyncing] = useState(false);
  const [showLeaderboard, setShowLeaderboard] = useState(false);

  const [progress, setProgress] = useState<StudentProgress>({
    id: userData?.profile.id || "student-1",
    xp: 0,
    coins: 165,
    level: 1,
    streak: 7,
    avatar: "🎓",
    completedLessons: [],
    badges: ["first-quiz", "science-explorer"],
    lastSync: new Date()
  });

  const t = LOCALE_STRINGS[currentLang];

  // Calculate level progress (100 XP per level)
  const levelProgress = useMemo(() => {
    const xpForCurrentLevel = (progress.level - 1) * 100;
    const xpForNextLevel = progress.level * 100;
    const progressInLevel = progress.xp - xpForCurrentLevel;
    const totalXpNeeded = xpForNextLevel - xpForCurrentLevel;
    return Math.max(0, Math.min(100, progressInLevel / totalXpNeeded * 100));
  }, [progress.xp, progress.level]);

  // Network status detection
  useEffect(() => {
    const updateOnlineStatus = () => setIsOnline(navigator.onLine);
    window.addEventListener('online', updateOnlineStatus);
    window.addEventListener('offline', updateOnlineStatus);
    return () => {
      window.removeEventListener('online', updateOnlineStatus);
      window.removeEventListener('offline', updateOnlineStatus);
    };
  }, []);

  // Load saved language preference
  useEffect(() => {
    if (typeof window !== "undefined") {
      const savedLanguage = localStorage.getItem('language') as "EN" | "HI" | "OD" | "BN";
      if (savedLanguage && LOCALE_STRINGS[savedLanguage]) {
        setCurrentLang(savedLanguage);
      }
    }
  }, []);

  // Sync progress to server
  const syncProgress = useCallback(async () => {
    if (!isOnline || userData?.isGuest) return;

    setIsSyncing(true);
    try {
      // Mock API call - in real app, would sync to database
      await new Promise((resolve) => setTimeout(resolve, 1000));
      setProgress((prev) => ({ ...prev, lastSync: new Date() }));
      toast.success(t.syncSuccess);
    } catch (error) {
      toast.error(t.syncError);
    } finally {
      setIsSyncing(false);
    }
  }, [isOnline, userData?.isGuest, t]);

  // Auto-sync every 30 seconds when online and not guest
  useEffect(() => {
    if (!isOnline || userData?.isGuest) return;
    const interval = setInterval(syncProgress, 30000);
    return () => clearInterval(interval);
  }, [isOnline, userData?.isGuest, syncProgress]);

  // Award XP and coins
  const awardRewards = useCallback((xp: number, coins: number) => {
    setProgress((prev) => {
      const newXp = prev.xp + xp;
      const newLevel = Math.floor(newXp / 100) + 1;

      // Check for level up
      if (newLevel > prev.level) {
        toast.success(`Level up! Welcome to level ${newLevel}!`);
      }

      toast.success(t.earnedXP.replace("{xp}", xp.toString()));
      if (coins > 0) {
        toast.success(t.earnedCoins.replace("{coins}", coins.toString()));
      }

      return {
        ...prev,
        xp: newXp,
        coins: prev.coins + coins,
        level: newLevel
      };
    });
  }, [t]);

  const handleLanguageChange = useCallback((newLang: "EN" | "HI" | "OD" | "BN") => {
    setCurrentLang(newLang);
    if (typeof window !== "undefined") {
      localStorage.setItem('language', newLang);
    }
  }, []);

  return (
    <div className="min-h-screen bg-background">
      {/* Enhanced Status Strip */}
      <div className="sticky top-0 z-50 bg-white/95 backdrop-blur-md border-b border-border/50 shadow-sm">
        <div className="container mx-auto px-6 py-4">
          <div className="flex items-center justify-between gap-6">
            {/* Left Section - User Info & Progress */}
            <div className="flex items-center gap-4">
              <Dialog>
                <DialogTrigger asChild>
                  <Button variant="ghost" size="sm" className="p-1 h-auto hover:bg-accent/50 transition-colors">
                    <Avatar className="h-10 w-10 ring-2 ring-primary/10">
                      <AvatarFallback className="text-xl bg-gradient-to-br from-primary/20 to-primary/10">
                        {progress.avatar}
                      </AvatarFallback>
                    </Avatar>
                  </Button>
                </DialogTrigger>
                <DialogContent className="sm:max-w-md">
                  <DialogHeader>
                    <DialogTitle>Choose Avatar</DialogTitle>
                  </DialogHeader>
                  <div className="grid grid-cols-3 gap-3">
                    {AVATARS.map((avatar, index) =>
                    <Button
                      key={index}
                      variant={progress.avatar === avatar ? "default" : "outline"}
                      className="aspect-square text-2xl hover:scale-105 transition-transform"
                      onClick={() => {
                        setProgress((prev) => ({ ...prev, avatar }));
                        toast.success("Avatar updated!");
                      }}>

                        {avatar}
                      </Button>
                    )}
                  </div>
                </DialogContent>
              </Dialog>
              
              {/* Level & Progress */}
              <div className="flex items-center gap-3">
                <div className="flex flex-col gap-1">
                  <div className="flex items-center gap-2">
                    <span className="text-sm font-semibold text-foreground/90">
                      Level {progress.level}
                    </span>
                    <Progress
                      value={levelProgress}
                      className="w-24 h-2.5 bg-muted/50" />

                  </div>
                </div>
                
                {/* Coins */}
                <div className="flex items-center gap-1.5 px-3 py-1.5 bg-gradient-to-r from-yellow-50 to-orange-50 rounded-full border border-yellow-200/50 !w-[90px] !h-full">
                  <div className="w-5 h-5 rounded-full bg-gradient-to-br from-yellow-400 to-orange-500 flex items-center justify-center">
                    <Coins className="h-3 w-3 text-white" />
                  </div>
                  <span className="text-sm font-semibold text-yellow-700">{progress.coins}</span>
                </div>
                
                {/* Streak */}
                <div className="flex items-center gap-1.5 px-3 py-1.5 bg-gradient-to-r from-red-50 to-pink-50 rounded-full border border-red-200/50">
                  <Flame className="h-4 w-4 text-red-500" />
                  <span className="text-sm font-semibold text-red-700">{progress.streak}</span>
                </div>
              </div>
            </div>
            
            {/* Right Section - Controls */}
            <div className="flex items-center gap-3">
              {/* Language Selector */}
              <Select value={currentLang} onValueChange={handleLanguageChange}>
                <SelectTrigger className="w-20 h-9 border-border/50 bg-white/50 hover:bg-white/80 transition-colors">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="EN">EN</SelectItem>
                  <SelectItem value="HI">HI</SelectItem>
                  <SelectItem value="OD">OD</SelectItem>
                  <SelectItem value="BN">BN</SelectItem>
                </SelectContent>
              </Select>
              
              {/* Sync Status */}
              <div className="flex items-center gap-2 px-3 py-1.5 bg-muted/30 rounded-full">
                {isSyncing ?
                <>
                    <Orbit className="h-3.5 w-3.5 animate-spin text-blue-500" />
                    <span className="text-xs font-medium text-muted-foreground">{t.syncing}</span>
                  </> :
                isOnline ?
                userData?.isGuest ?
                <>
                      <SaveOff className="h-3.5 w-3.5 text-blue-500" />
                      <span className="text-xs font-medium text-muted-foreground">Local only</span>
                    </> :

                <>
                      <Circle className="h-2.5 w-2.5 fill-green-500 text-green-500" />
                      <span className="text-xs font-medium text-muted-foreground">
                        Last sync: {progress.lastSync?.toLocaleTimeString()}
                      </span>
                    </> :


                <>
                    <SaveOff className="h-3.5 w-3.5 text-orange-500" />
                    <span className="text-xs font-medium text-muted-foreground">{t.offline}</span>
                  </>
                }
              </div>
              
              {/* Leaderboard Button */}
              <Button
                variant="outline"
                size="sm"
                onClick={() => setShowLeaderboard(true)}
                className="hidden sm:flex h-9 px-4 bg-white/50 hover:bg-white/80 border-border/50 transition-all hover:shadow-sm">

                <Users className="h-4 w-4 mr-2" />
                {t.leaderboard}
              </Button>

              {/* Logout Button */}
              {onLogout &&
              <Button
                variant="ghost"
                size="sm"
                onClick={onLogout}
                className="h-9 w-9 p-0 text-muted-foreground hover:text-foreground hover:bg-red-50 hover:text-red-600 transition-colors">

                  <LogOut className="h-4 w-4" />
                  <span className="sr-only">{t.logout}</span>
                </Button>
              }
              
              {/* Guest Badge */}
              {userData?.isGuest &&
              <Badge variant="outline" className="text-xs px-2 py-1 bg-blue-50 text-blue-700 border-blue-200">
                  {t.guest}
                </Badge>
              }
            </div>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="container mx-auto px-6 py-8">
        {/* Welcome Section */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold mb-3 bg-gradient-to-r from-foreground to-foreground/70 bg-clip-text text-transparent">
            {t.welcomeBack} {userData?.profile.name || 'Student'}
          </h1>
          <p className="text-muted-foreground text-lg">
            {t.continueJourney}
          </p>
        </div>

        {/* User Statistics Dashboard */}
        <div className="mb-8">
          <UserStats
            userId={userData?.profile.id}
            isGuest={userData?.isGuest}
            onStatsUpdate={(newStats) => {
              setProgress((prev) => ({
                ...prev,
                xp: newStats.xp,
                streak: newStats.dayStreak
              }));
            }} />

        </div>

        {/* Main Content Tabs */}
        <Tabs value={currentTab} onValueChange={setCurrentTab} className="w-full">
          <TabsList className="grid w-full grid-cols-4 h-12 bg-muted/30 p-1">
            <TabsTrigger value="subjects" className="h-10 data-[state=active]:bg-white data-[state=active]:shadow-sm">
              <SquareLibrary className="h-4 w-4 mr-2" />
              {t.subjects}
            </TabsTrigger>
            <TabsTrigger value="games" className="h-10 data-[state=active]:bg-white data-[state=active]:shadow-sm">
              <Gamepad2 className="h-4 w-4 mr-2" />
              {t.games}
            </TabsTrigger>
            <TabsTrigger value="achievements" className="h-10 data-[state=active]:bg-white data-[state=active]:shadow-sm">
              <Trophy className="h-4 w-4 mr-2" />
              {t.achievements}
            </TabsTrigger>
            <TabsTrigger value="dashboard" className="h-10 data-[state=active]:bg-white data-[state=active]:shadow-sm">
              <TrendingUp className="h-4 w-4 mr-2" />
              {t.dashboard}
            </TabsTrigger>
          </TabsList>

          <TabsContent value="subjects" className="mt-8">
            <SubjectCards />
          </TabsContent>

          <TabsContent value="games" className="mt-8">
            <GameLauncher />
          </TabsContent>

          <TabsContent value="achievements" className="mt-8">
            <div className="space-y-6">
              <Card className="border-0 shadow-md bg-gradient-to-br from-white to-gray-50/50">
                <CardHeader>
                  <CardTitle className="flex items-center gap-2 text-xl">
                    <div className="w-8 h-8 rounded-full bg-gradient-to-br from-yellow-400 to-orange-500 flex items-center justify-center">
                      <Trophy className="h-4 w-4 text-white" />
                    </div>
                    Your Badges
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                    {progress.badges.map((badge, index) =>
                    <div key={index} className="flex items-center gap-3 p-4 bg-white rounded-xl border border-border/50 shadow-sm hover:shadow-md transition-shadow">
                        <div className="w-10 h-10 bg-gradient-to-br from-primary/20 to-primary/10 rounded-full flex items-center justify-center">
                          <Award className="h-5 w-5 text-primary" />
                        </div>
                        <div>
                          <div className="font-semibold text-sm">{badge.replace('-', ' ').replace(/\b\w/g, (l) => l.toUpperCase())}</div>
                          <div className="text-xs text-muted-foreground">Achievement unlocked</div>
                        </div>
                      </div>
                    )}
                  </div>
                </CardContent>
              </Card>
            </div>
          </TabsContent>

          <TabsContent value="dashboard" className="mt-8">
            <div className="grid lg:grid-cols-2 gap-6">
              <Card className="border-0 shadow-md bg-gradient-to-br from-white to-blue-50/30">
                <CardHeader>
                  <CardTitle className="text-xl">Learning Progress</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-6">
                    <div className="flex justify-between items-center">
                      <span className="text-sm font-medium">Overall Progress</span>
                      <span className="text-sm font-bold text-blue-600">68%</span>
                    </div>
                    <Progress value={68} className="h-3 bg-blue-100" />
                    
                    <div className="grid grid-cols-2 gap-6 pt-4">
                      <div className="text-center p-4 bg-green-50 rounded-xl">
                        <div className="text-3xl font-bold text-green-600 mb-1">12</div>
                        <div className="text-sm text-green-700 font-medium">Quizzes Completed</div>
                      </div>
                      <div className="text-center p-4 bg-blue-50 rounded-xl">
                        <div className="text-3xl font-bold text-blue-600 mb-1">76%</div>
                        <div className="text-sm text-blue-700 font-medium">Average Score</div>
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>

              <Card className="border-0 shadow-md bg-gradient-to-br from-white to-purple-50/30">
                <CardHeader>
                  <CardTitle className="text-xl">Recent Activity</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    <div className="flex items-center gap-4 p-3 rounded-xl bg-white border border-green-200/50 shadow-sm">
                      <div className="w-10 h-10 bg-gradient-to-br from-green-400 to-green-500 rounded-full flex items-center justify-center">
                        <BookOpenCheck className="h-5 w-5 text-white" />
                      </div>
                      <div className="flex-1">
                        <div className="text-sm font-semibold">Completed Math Quiz</div>
                        <div className="text-xs text-muted-foreground">Scored 85% • 2h ago</div>
                      </div>
                    </div>
                    
                    <div className="flex items-center gap-4 p-3 rounded-xl bg-white border border-blue-200/50 shadow-sm">
                      <div className="w-10 h-10 bg-gradient-to-br from-blue-400 to-blue-500 rounded-full flex items-center justify-center">
                        <Award className="h-5 w-5 text-white" />
                      </div>
                      <div className="flex-1">
                        <div className="text-sm font-semibold">Earned Science Explorer Badge</div>
                        <div className="text-xs text-muted-foreground">For completing 5 science quizzes • 1d ago</div>
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>
          </TabsContent>
        </Tabs>
      </div>

      {/* Enhanced Leaderboard Modal */}
      <Dialog open={showLeaderboard} onOpenChange={setShowLeaderboard}>
        <DialogContent className="sm:max-w-md bg-gradient-to-br from-white to-gray-50">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2 text-xl">
              <div className="w-8 h-8 rounded-full bg-gradient-to-br from-purple-400 to-pink-500 flex items-center justify-center">
                <Users className="h-4 w-4 text-white" />
              </div>
              {t.leaderboard}
            </DialogTitle>
          </DialogHeader>
          
          <div className="space-y-3">
            {mockLeaderboard.map((entry, index) =>
            <div
              key={entry.id}
              className={`flex items-center justify-between p-4 rounded-xl transition-all hover:shadow-md ${
              index === 0 ? 'bg-gradient-to-r from-yellow-50 to-orange-50 border border-yellow-200' :
              index === 1 ? 'bg-gradient-to-r from-gray-50 to-slate-50 border border-gray-200' :
              index === 2 ? 'bg-gradient-to-r from-orange-50 to-amber-50 border border-orange-200' :
              'bg-white border border-border/50'}`
              }>

                <div className="flex items-center gap-3">
                  <div className={`flex items-center justify-center w-8 h-8 rounded-full text-sm font-bold ${
                index === 0 ? 'bg-gradient-to-br from-yellow-400 to-orange-500 text-white' :
                index === 1 ? 'bg-gradient-to-br from-gray-400 to-slate-500 text-white' :
                index === 2 ? 'bg-gradient-to-br from-orange-400 to-amber-500 text-white' :
                'bg-primary text-primary-foreground'}`
                }>
                    {entry.position}
                  </div>
                  <Avatar className="h-10 w-10 ring-2 ring-primary/10">
                    <AvatarFallback className="text-lg">{entry.avatar}</AvatarFallback>
                  </Avatar>
                  <span className="font-semibold">{entry.name}</span>
                </div>
                
                <div className="text-right">
                  <div className="font-bold text-sm">{entry.xp} XP</div>
                  <div className="flex items-center gap-1 text-muted-foreground justify-end">
                    <Coins className="h-3 w-3" />
                    <span className="text-xs">{entry.coins}</span>
                  </div>
                </div>
              </div>
            )}
          </div>
        </DialogContent>
      </Dialog>
    </div>);

}