"use client";

import React, { useState, useEffect, useCallback } from "react";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  LayoutDashboard,
  ChartNoAxesCombined,
  ChartPie,
  FileChartColumn,
  FileChartLine,
  GraduationCap,
  PanelLeft,
  School,
  LogOut,
  Settings,
  Orbit,
  Circle,
  SaveOff
} from "lucide-react";
import { toast } from "sonner";

interface TeacherDashboardProps {
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

interface Student {
  id: string;
  name: string;
  email?: string | null;
  avatar?: string | null;
  class: string;
  level: number;
  xp: number;
  coins: number;
  streak: number;
  lastActive: string | null;
  subjects: Array<{
    subjectId: number;
    subjectName: string;
    averageScore: number;
    totalQuizzes: number;
    bestScore: number;
  }>;
  quizScores: Array<{
    score: number;
    date: string;
    subject: string;
  }>;
  timeSpent: number;
  badges: number;
  leaderboardPosition: number;
}

interface TeacherData {
  id: string;
  name: string;
  email?: string | null;
  avatar?: string;
  classes: string[];
  subjects: string[];
  schoolCode?: string | null;
}

interface Analytics {
  completionRates: Array<{
    subjectId: number;
    subjectName: string;
    completedStudents: number;
    totalStudents: number;
    completionRate: number;
  }>;
  averageScores: Array<{
    subjectId: number;
    subjectName: string;
    averageScore: number;
    totalQuizzes: number;
    totalStudents: number;
  }>;
  totalStudents: number;
  activeToday: number;
  topPerformers: Array<{
    userId: string;
    name: string;
    xp: number;
    averageScore: number;
  }>;
  subjectPopularity: Array<{
    subjectId: number;
    subjectName: string;
    quizCount: number;
    uniqueStudents: number;
  }>;
  weeklyActivity: Array<{
    date: string;
    activeStudents: number;
    quizzesCompleted: number;
  }>;
  levelDistribution: {
    beginner: number;
    intermediate: number;
    advanced: number;
  };
  totalQuizzes: number;
  averageSessionTime: number;
  streakLeaders: Array<{
    userId: string;
    name: string;
    currentStreak: number;
    longestStreak: number;
  }>;
}

export default function TeacherDashboard({ onLogout, userData }: TeacherDashboardProps) {
  const [teacher, setTeacher] = useState<TeacherData>({
    id: userData?.profile.id || "1",
    name: userData?.profile.name || "Teacher",
    email: userData?.profile.email,
    avatar: undefined,
    classes: [],
    subjects: [],
    schoolCode: userData?.profile.schoolCode
  });

  const [students, setStudents] = useState<Student[]>([]);
  const [filteredStudents, setFilteredStudents] = useState<Student[]>([]);
  const [selectedStudent, setSelectedStudent] = useState<Student | null>(null);
  const [analytics, setAnalytics] = useState<Analytics | null>(null);
  const [isOnline, setIsOnline] = useState(true);
  const [isLoading, setIsLoading] = useState(true);
  const [isSyncing, setIsSyncing] = useState(false);
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedClass, setSelectedClass] = useState<string>("all");
  const [selectedSubject, setSelectedSubject] = useState<string>("all");
  const [sortBy, setSortBy] = useState<string>("name");

  // Fetch real data from APIs
  const fetchStudents = useCallback(async () => {
    if (userData?.isGuest) {
      // For guest users, show no students
      setStudents([]);
      setFilteredStudents([]);
      return;
    }

    try {
      const token = localStorage.getItem("bearer_token");
      const response = await fetch('/api/students', {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });

      if (!response.ok) {
        throw new Error('Failed to fetch students');
      }

      const data = await response.json();
      setStudents(data);
      setFilteredStudents(data);

      // Extract unique classes and subjects from student data
      const uniqueClasses = [...new Set(data.map((s: Student) => s.class))];
      const uniqueSubjects = [...new Set(data.flatMap((s: Student) => s.subjects.map(sub => sub.subjectName)))];
      
      setTeacher(prev => ({
        ...prev,
        classes: uniqueClasses,
        subjects: uniqueSubjects
      }));

    } catch (error) {
      console.error('Error fetching students:', error);
      toast.error("Failed to load student data");
    }
  }, [userData?.isGuest]);

  const fetchAnalytics = useCallback(async () => {
    if (userData?.isGuest) {
      // For guest users, show minimal analytics
      setAnalytics({
        completionRates: [],
        averageScores: [],
        totalStudents: 0,
        activeToday: 0,
        topPerformers: [],
        subjectPopularity: [],
        weeklyActivity: [],
        levelDistribution: { beginner: 0, intermediate: 0, advanced: 0 },
        totalQuizzes: 0,
        averageSessionTime: 0,
        streakLeaders: []
      });
      return;
    }

    try {
      const token = localStorage.getItem("bearer_token");
      const response = await fetch('/api/analytics/teacher', {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });

      if (!response.ok) {
        throw new Error('Failed to fetch analytics');
      }

      const data = await response.json();
      setAnalytics(data);

    } catch (error) {
      console.error('Error fetching analytics:', error);
      toast.error("Failed to load analytics data");
    }
  }, [userData?.isGuest]);

  // Initial data loading
  useEffect(() => {
    const loadData = async () => {
      setIsLoading(true);
      await Promise.all([fetchStudents(), fetchAnalytics()]);
      setIsLoading(false);
    };

    loadData();
  }, [fetchStudents, fetchAnalytics]);

  // Update teacher data when userData changes
  useEffect(() => {
    if (userData?.profile) {
      setTeacher(prev => ({
        ...prev,
        id: userData.profile.id,
        name: userData.profile.name,
        email: userData.profile.email,
        schoolCode: userData.profile.schoolCode
      }));
    }
  }, [userData]);

  // Filter and sort students
  useEffect(() => {
    let filtered = students.filter((student) => {
      const matchesSearch = student.name.toLowerCase().includes(searchTerm.toLowerCase());
      const matchesClass = selectedClass === "all" || student.class === selectedClass;
      const matchesSubject = selectedSubject === "all" || 
        student.subjects.some(sub => sub.subjectName === selectedSubject);
      return matchesSearch && matchesClass && matchesSubject;
    });

    // Sort students
    filtered.sort((a, b) => {
      switch (sortBy) {
        case "xp":
          return b.xp - a.xp;
        case "lastActive":
          if (!a.lastActive && !b.lastActive) return 0;
          if (!a.lastActive) return 1;
          if (!b.lastActive) return -1;
          return new Date(b.lastActive).getTime() - new Date(a.lastActive).getTime();
        case "name":
        default:
          return a.name.localeCompare(b.name);
      }
    });

    setFilteredStudents(filtered);
  }, [students, searchTerm, selectedClass, selectedSubject, sortBy]);

  // Online status detection
  useEffect(() => {
    const handleOnline = () => setIsOnline(true);
    const handleOffline = () => setIsOnline(false);

    window.addEventListener("online", handleOnline);
    window.addEventListener("offline", handleOffline);

    return () => {
      window.removeEventListener("online", handleOnline);
      window.removeEventListener("offline", handleOffline);
    };
  }, []);

  const handleSync = useCallback(async () => {
    if (!isOnline || userData?.isGuest) return;
    
    setIsSyncing(true);
    try {
      await Promise.all([fetchStudents(), fetchAnalytics()]);
      toast.success("Data synchronized successfully");
    } catch (error) {
      toast.error("Sync failed. Please try again.");
    } finally {
      setIsSyncing(false);
    }
  }, [isOnline, userData?.isGuest, fetchStudents, fetchAnalytics]);

  // Auto-sync every 30 seconds when online and not guest
  useEffect(() => {
    if (!isOnline || userData?.isGuest) return;
    const interval = setInterval(handleSync, 30000);
    return () => clearInterval(interval);
  }, [isOnline, userData?.isGuest, handleSync]);

  const exportToCSV = useCallback(() => {
    const headers = ["Name", "Class", "Level", "XP", "Coins", "Streak", "Quiz Scores", "Total Badges"];
    const csvContent = [
      headers.join(","),
      ...filteredStudents.map((student) =>
        [
          student.name,
          student.class,
          student.level,
          student.xp,
          student.coins,
          student.streak,
          student.quizScores.map(q => q.score).join(";"),
          student.badges,
        ].join(",")
      ),
    ].join("\n");

    const blob = new Blob([csvContent], { type: "text/csv" });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url;
    link.download = `student-report-${new Date().toISOString().split("T")[0]}.csv`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);

    toast.success("CSV report downloaded");
  }, [filteredStudents]);

  const exportToPDF = useCallback(() => {
    window.print();
    toast.success("Print dialog opened for PDF export");
  }, []);

  const formatTimeSpent = (seconds: number): string => {
    const hours = Math.floor(seconds / 3600);
    const minutes = Math.floor((seconds % 3600) / 60);
    if (hours > 0) return `${hours}h ${minutes}m`;
    return `${minutes}m`;
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto mb-4"></div>
          <p className="text-muted-foreground">Loading teacher dashboard...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <div className="bg-card border-b border-border p-4">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div className="flex items-center gap-3">
            <Avatar className="h-10 w-10">
              <AvatarImage src={teacher.avatar} alt={teacher.name} />
              <AvatarFallback><GraduationCap className="h-5 w-5" /></AvatarFallback>
            </Avatar>
            <div>
              <h1 className="font-display font-bold text-lg">{teacher.name}</h1>
              <div className="flex items-center gap-2">
                <p className="text-sm text-muted-foreground">Teacher Dashboard</p>
                {userData?.isGuest && (
                  <Badge variant="outline" className="text-xs">
                    Guest User
                  </Badge>
                )}
                {teacher.schoolCode && (
                  <Badge variant="secondary" className="text-xs">
                    {teacher.schoolCode}
                  </Badge>
                )}
              </div>
            </div>
          </div>
          
          <div className="flex items-center gap-2">
            <div className="flex items-center gap-1 text-xs text-muted-foreground">
              {isSyncing ? (
                <>
                  <Orbit className="h-3 w-3 animate-spin" />
                  <span>Syncing...</span>
                </>
              ) : isOnline ? (
                userData?.isGuest ? (
                  <>
                    <SaveOff className="h-3 w-3 text-blue-500" />
                    <span>Local only</span>
                  </>
                ) : (
                  <>
                    <Circle className="h-2 w-2 fill-green-500 text-green-500" />
                    <span>Online</span>
                  </>
                )
              ) : (
                <>
                  <SaveOff className="h-3 w-3 text-orange-500" />
                  <span>Offline</span>
                </>
              )}
            </div>

            <Button
              onClick={handleSync}
              disabled={isSyncing || userData?.isGuest}
              size="sm"
              variant="outline"
            >
              {isSyncing ? "Syncing..." : "Sync Now"}
            </Button>

            {onLogout && (
              <Button
                variant="ghost"
                size="sm"
                onClick={onLogout}
                className="text-muted-foreground hover:text-foreground"
              >
                <LogOut className="h-4 w-4" />
                <span className="sr-only">Logout</span>
              </Button>
            )}
          </div>
        </div>
      </div>

      {/* Controls */}
      <div className="p-4 bg-card border-b border-border">
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          <Input
            placeholder="Search students..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
          
          <Select value={selectedClass} onValueChange={setSelectedClass}>
            <SelectTrigger>
              <SelectValue placeholder="Select class" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Classes</SelectItem>
              {teacher.classes.map((cls) => (
                <SelectItem key={cls} value={cls}>{cls}</SelectItem>
              ))}
            </SelectContent>
          </Select>

          <Select value={selectedSubject} onValueChange={setSelectedSubject}>
            <SelectTrigger>
              <SelectValue placeholder="Select subject" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Subjects</SelectItem>
              {teacher.subjects.map((subject) => (
                <SelectItem key={subject} value={subject}>{subject}</SelectItem>
              ))}
            </SelectContent>
          </Select>

          <Select value={sortBy} onValueChange={setSortBy}>
            <SelectTrigger>
              <SelectValue placeholder="Sort by" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="name">Name</SelectItem>
              <SelectItem value="xp">XP</SelectItem>
              <SelectItem value="lastActive">Last Active</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </div>

      {/* Main Content */}
      <div className="p-4">
        {userData?.isGuest ? (
          <Card className="h-96 flex items-center justify-center">
            <div className="text-center text-muted-foreground">
              <School className="h-12 w-12 mx-auto mb-4 opacity-50" />
              <p className="text-lg font-medium mb-2">Guest Mode</p>
              <p>Create an account to view student data and analytics</p>
            </div>
          </Card>
        ) : students.length === 0 ? (
          <Card className="h-96 flex items-center justify-center">
            <div className="text-center text-muted-foreground">
              <School className="h-12 w-12 mx-auto mb-4 opacity-50" />
              <p className="text-lg font-medium mb-2">No Students Found</p>
              <p>Students will appear here once they start using the platform</p>
            </div>
          </Card>
        ) : (
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            {/* Student List */}
            <div className="lg:col-span-1">
              <Card>
                <CardHeader className="pb-4">
                  <div className="flex items-center justify-between">
                    <CardTitle className="flex items-center gap-2">
                      <School className="h-5 w-5" />
                      Students ({filteredStudents.length})
                    </CardTitle>
                    <div className="flex gap-2">
                      <Button size="sm" variant="outline" onClick={exportToCSV}>
                        <FileChartColumn className="h-4 w-4" />
                      </Button>
                      <Button size="sm" variant="outline" onClick={exportToPDF}>
                        <FileChartLine className="h-4 w-4" />
                      </Button>
                    </div>
                  </div>
                </CardHeader>
                <CardContent className="space-y-3">
                  {filteredStudents.map((student) => (
                    <div
                      key={student.id}
                      className={`p-3 rounded-lg border cursor-pointer transition-colors hover:bg-accent ${
                        selectedStudent?.id === student.id ? "bg-accent" : ""
                      }`}
                      onClick={() => setSelectedStudent(student)}
                    >
                      <div className="flex items-center gap-3">
                        <Avatar className="h-8 w-8">
                          <AvatarImage src={student.avatar || undefined} alt={student.name} />
                          <AvatarFallback>{student.name.charAt(0)}</AvatarFallback>
                        </Avatar>
                        <div className="flex-1 min-w-0">
                          <p className="font-medium text-sm truncate">{student.name}</p>
                          <p className="text-xs text-muted-foreground">{student.class}</p>
                        </div>
                        <div className="text-right">
                          <p className="text-sm font-medium">Lv.{student.level}</p>
                          <p className="text-xs text-muted-foreground">{student.xp} XP</p>
                        </div>
                      </div>
                      <div className="flex justify-between text-xs text-muted-foreground mt-2">
                        <span>{student.coins} coins</span>
                        <span>{student.streak} day streak</span>
                        <span>#{student.leaderboardPosition}</span>
                      </div>
                    </div>
                  ))}
                </CardContent>
              </Card>
            </div>

            {/* Student Details & Analytics */}
            <div className="lg:col-span-2">
              {selectedStudent ? (
                <div className="space-y-6">
                  {/* Student Header */}
                  <Card>
                    <CardHeader>
                      <div className="flex items-center gap-4">
                        <Avatar className="h-12 w-12">
                          <AvatarImage src={selectedStudent.avatar || undefined} alt={selectedStudent.name} />
                          <AvatarFallback>{selectedStudent.name.charAt(0)}</AvatarFallback>
                        </Avatar>
                        <div>
                          <CardTitle>{selectedStudent.name}</CardTitle>
                          <p className="text-muted-foreground">{selectedStudent.class} • Level {selectedStudent.level}</p>
                          <p className="text-xs text-muted-foreground">
                            Last active: {selectedStudent.lastActive ? new Date(selectedStudent.lastActive).toLocaleDateString() : 'Never'}
                          </p>
                        </div>
                      </div>
                    </CardHeader>
                  </Card>

                  {/* Analytics Tabs */}
                  <Tabs defaultValue="overview" className="w-full">
                    <TabsList className="grid w-full grid-cols-4">
                      <TabsTrigger value="overview">Overview</TabsTrigger>
                      <TabsTrigger value="subjects">Subjects</TabsTrigger>
                      <TabsTrigger value="activity">Activity</TabsTrigger>
                      <TabsTrigger value="badges">Badges</TabsTrigger>
                    </TabsList>

                    <TabsContent value="overview" className="space-y-4">
                      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                        <Card>
                          <CardContent className="pt-6">
                            <div className="text-2xl font-bold">{selectedStudent.xp}</div>
                            <p className="text-xs text-muted-foreground">Total XP</p>
                          </CardContent>
                        </Card>
                        <Card>
                          <CardContent className="pt-6">
                            <div className="text-2xl font-bold">{selectedStudent.coins}</div>
                            <p className="text-xs text-muted-foreground">Coins</p>
                          </CardContent>
                        </Card>
                        <Card>
                          <CardContent className="pt-6">
                            <div className="text-2xl font-bold">{selectedStudent.streak}</div>
                            <p className="text-xs text-muted-foreground">Day Streak</p>
                          </CardContent>
                        </Card>
                        <Card>
                          <CardContent className="pt-6">
                            <div className="text-2xl font-bold">#{selectedStudent.leaderboardPosition}</div>
                            <p className="text-xs text-muted-foreground">Rank</p>
                          </CardContent>
                        </Card>
                      </div>

                      <Card>
                        <CardHeader>
                          <CardTitle className="flex items-center gap-2">
                            <ChartNoAxesCombined className="h-5 w-5" />
                            Time Spent Learning
                          </CardTitle>
                        </CardHeader>
                        <CardContent>
                          <div className="text-center">
                            <div className="text-3xl font-bold">{formatTimeSpent(selectedStudent.timeSpent)}</div>
                            <p className="text-muted-foreground">Total time spent</p>
                          </div>
                        </CardContent>
                      </Card>
                    </TabsContent>

                    <TabsContent value="subjects" className="space-y-4">
                      <div className="grid gap-4">
                        {selectedStudent.subjects.length === 0 ? (
                          <Card>
                            <CardContent className="pt-6 text-center text-muted-foreground">
                              No subject data available
                            </CardContent>
                          </Card>
                        ) : (
                          selectedStudent.subjects.map((subject) => (
                            <Card key={subject.subjectId}>
                              <CardContent className="pt-6">
                                <div className="flex justify-between items-center mb-2">
                                  <h4 className="font-medium">{subject.subjectName}</h4>
                                  <span className="text-2xl font-bold">{subject.averageScore}%</span>
                                </div>
                                <div className="w-full bg-secondary rounded-full h-2 mb-2">
                                  <div
                                    className="bg-primary h-2 rounded-full transition-all"
                                    style={{ width: `${subject.averageScore}%` }}
                                  ></div>
                                </div>
                                <div className="flex justify-between text-xs text-muted-foreground">
                                  <span>Quizzes: {subject.totalQuizzes}</span>
                                  <span>Best: {subject.bestScore}%</span>
                                </div>
                              </CardContent>
                            </Card>
                          ))
                        )}
                      </div>
                    </TabsContent>

                    <TabsContent value="activity" className="space-y-4">
                      <Card>
                        <CardHeader>
                          <CardTitle>Recent Quiz Scores</CardTitle>
                        </CardHeader>
                        <CardContent>
                          <div className="space-y-3">
                            {selectedStudent.quizScores.length === 0 ? (
                              <p className="text-center text-muted-foreground">No quiz attempts yet</p>
                            ) : (
                              selectedStudent.quizScores.map((quiz, index) => (
                                <div key={index} className="flex justify-between items-center">
                                  <div>
                                    <span className="text-sm font-medium">{quiz.subject}</span>
                                    <p className="text-xs text-muted-foreground">
                                      {new Date(quiz.date).toLocaleDateString()}
                                    </p>
                                  </div>
                                  <div className="flex items-center gap-2">
                                    <div className="w-20 bg-secondary rounded-full h-2">
                                      <div
                                        className="bg-primary h-2 rounded-full"
                                        style={{ width: `${quiz.score}%` }}
                                      ></div>
                                    </div>
                                    <span className="text-sm font-medium w-10">{quiz.score}%</span>
                                  </div>
                                </div>
                              ))
                            )}
                          </div>
                        </CardContent>
                      </Card>
                    </TabsContent>

                    <TabsContent value="badges" className="space-y-4">
                      <Card>
                        <CardHeader>
                          <CardTitle>Badges Earned</CardTitle>
                        </CardHeader>
                        <CardContent>
                          <div className="text-center">
                            <div className="text-3xl font-bold">{selectedStudent.badges}</div>
                            <p className="text-muted-foreground">Total badges earned</p>
                          </div>
                        </CardContent>
                      </Card>
                    </TabsContent>
                  </Tabs>
                </div>
              ) : (
                <Card className="h-96 flex items-center justify-center">
                  <div className="text-center text-muted-foreground">
                    <LayoutDashboard className="h-12 w-12 mx-auto mb-4 opacity-50" />
                    <p>Select a student to view their analytics</p>
                  </div>
                </Card>
              )}
            </div>
          </div>
        )}

        {/* Class Analytics */}
        {analytics && !userData?.isGuest && (
          <div className="mt-8">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <ChartPie className="h-5 w-5" />
                  Class Overview
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-2 md:grid-cols-4 gap-6 mb-6">
                  <div className="text-center">
                    <div className="text-3xl font-bold">{analytics.totalStudents}</div>
                    <p className="text-sm text-muted-foreground">Total Students</p>
                  </div>
                  <div className="text-center">
                    <div className="text-3xl font-bold text-green-600">{analytics.activeToday}</div>
                    <p className="text-sm text-muted-foreground">Active Today</p>
                  </div>
                  <div className="text-center">
                    <div className="text-3xl font-bold">{analytics.totalQuizzes}</div>
                    <p className="text-sm text-muted-foreground">Total Quizzes</p>
                  </div>
                  <div className="text-center">
                    <div className="text-3xl font-bold">{formatTimeSpent(analytics.averageSessionTime)}</div>
                    <p className="text-sm text-muted-foreground">Avg Session</p>
                  </div>
                </div>

                <div className="grid md:grid-cols-2 gap-6">
                  <div>
                    <h4 className="font-medium mb-3">Subject Completion Rates</h4>
                    <div className="space-y-3">
                      {analytics.completionRates.map((item) => (
                        <div key={item.subjectId}>
                          <div className="flex justify-between text-sm mb-1">
                            <span>{item.subjectName}</span>
                            <span>{item.completionRate}%</span>
                          </div>
                          <div className="w-full bg-secondary rounded-full h-2">
                            <div
                              className="bg-primary h-2 rounded-full transition-all"
                              style={{ width: `${item.completionRate}%` }}
                            ></div>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>

                  <div>
                    <h4 className="font-medium mb-3">Average Scores</h4>
                    <div className="space-y-3">
                      {analytics.averageScores.map((item) => (
                        <div key={item.subjectId}>
                          <div className="flex justify-between text-sm mb-1">
                            <span>{item.subjectName}</span>
                            <span>{item.averageScore}%</span>
                          </div>
                          <div className="w-full bg-secondary rounded-full h-2">
                            <div
                              className="bg-chart-2 h-2 rounded-full transition-all"
                              style={{ width: `${item.averageScore}%` }}
                            ></div>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        )}
      </div>
    </div>
  );
}