"use client";

import { useState, useEffect, useCallback } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { toast } from "sonner";
import { authClient, useSession } from "@/lib/auth-client";
import { 
  School, 
  User, 
  CircleUser, 
  Dot, 
  LogIn, 
  UserRound,
  EyeOff,
  Key
} from "lucide-react";

interface AuthLandingProps {
  onAuth?: (userData: { role: 'student' | 'teacher'; isGuest?: boolean; profile: any }) => void;
  className?: string;
}

type Language = 'EN' | 'HI' | 'OD' | 'BN';

const translations = {
  EN: {
    getStarted: "Get Started",
    studentButton: "I'm a Student",
    teacherButton: "I'm a Teacher",
    login: "Login",
    signup: "Sign Up",
    continueAsGuest: "Continue as Guest",
    email: "Email",
    password: "Password",
    schoolCode: "School Code",
    name: "Full Name",
    welcomeTitle: "Welcome to EduApp",
    welcomeSubtitle: "Learn and teach with our comprehensive educational platform",
    offline: "Offline",
    syncing: "Syncing...",
    loading: "Loading...",
    optional: "(Optional for teachers)"
  },
  HI: {
    getStarted: "शुरू करें",
    studentButton: "मैं एक छात्र हूँ",
    teacherButton: "मैं एक शिक्षक हूँ",
    login: "लॉगिन",
    signup: "साइन अप",
    continueAsGuest: "अतिथि के रूप में जारी रखें",
    email: "ईमेल",
    password: "पासवर्ड",
    schoolCode: "स्कूल कोड",
    name: "पूरा नाम",
    welcomeTitle: "EduApp में आपका स्वागत है",
    welcomeSubtitle: "हमारे व्यापक शैक्षिक मंच के साथ सीखें और सिखाएं",
    offline: "ऑफलाइन",
    syncing: "सिंक हो रहा है...",
    loading: "लोड हो रहा है...",
    optional: "(शिक्षकों के लिए वैकल्पिक)"
  },
  OD: {
    getStarted: "ଆରମ୍ଭ କରନ୍ତୁ",
    studentButton: "ମୁଁ ଜଣେ ଛାତ୍ର",
    teacherButton: "ମୁଁ ଜଣେ ଶିକ୍ଷକ",
    login: "ଲଗଇନ୍",
    signup: "ସାଇନ୍ ଅପ୍",
    continueAsGuest: "ଅତିଥି ଭାବେ ଚାଲିବା",
    email: "ଇମେଲ୍",
    password: "ପାସୱାର୍ଡ",
    schoolCode: "ସ୍କୁଲ୍ କୋଡ୍",
    name: "ପୂର୍ଣ୍ଣ ନାମ",
    welcomeTitle: "EduApp ରେ ସ୍ୱାଗତ",
    welcomeSubtitle: "ଆমର ବ୍ୟାପକ ଶିକ୍ଷା ପ୍ଲାଟଫର୍ମ ସହିତ ଶିଖନ୍ତୁ ଏବଂ ଶିଖାନ୍ତୁ",
    offline: "ଅଫଲାଇନ୍",
    syncing: "ସିଙ୍କ ହେଉଛି...",
    loading: "ଲୋଡ୍ ହେଉଛି...",
    optional: "(ଶିକ୍ଷକମାନଙ୍କ ପାଇଁ ଇଚ୍ଛାଧୀନ)"
  },
  BN: {
    getStarted: "শুরু করুন",
    studentButton: "আমি একজন শিক্ষার্থী",
    teacherButton: "আমি একজন শিক্ষক",
    login: "লগইন",
    signup: "সাইন আপ",
    continueAsGuest: "অতিথি হিসেবে চালিয়ে যান",
    email: "ইমেইল",
    password: "পাসওয়ার্ড",
    schoolCode: "স্কুল কোড",
    name: "পূর্ণ নাম",
    welcomeTitle: "EduApp এ স্বাগতম",
    welcomeSubtitle: "আমাদের ব্যাপক শিক্ষামূলক প্ল্যাটফর্মের সাথে শিখুন এবং শেখান",
    offline: "অফলাইন",
    syncing: "সিঙ্ক হচ্ছে...",
    loading: "লোড হচ্ছে...",
    optional: "(শিক্ষকদের জন্য ঐচ্ছিক)"
  }
};

export default function AuthLanding({ onAuth, className }: AuthLandingProps) {
  const router = useRouter();
  const { data: session, isPending, refetch } = useSession();
  const [language, setLanguage] = useState<Language>('EN');
  const [isOnline, setIsOnline] = useState(true);
  const [isSyncing, setIsSyncing] = useState(false);
  const [selectedRole, setSelectedRole] = useState<'student' | 'teacher' | null>(null);
  const [activeTab, setActiveTab] = useState('login');
  const [isLoading, setIsLoading] = useState(false);
  const [formData, setFormData] = useState({
    email: '',
    password: '',
    name: '',
    schoolCode: '',
    rememberMe: false
  });

  const t = translations[language];

  // Check for existing session
  useEffect(() => {
    if (session?.user && !isPending) {
      // User is already authenticated, redirect based on role stored in localStorage or default to student
      const savedRole = localStorage.getItem('userRole') as 'student' | 'teacher' || 'student';
      const userData = {
        role: savedRole,
        profile: {
          id: session.user.id,
          name: session.user.name,
          email: session.user.email,
          schoolCode: null,
          createdAt: new Date().toISOString()
        }
      };
      onAuth?.(userData);
    }
  }, [session, isPending, onAuth]);

  // Initialize language from localStorage
  useEffect(() => {
    if (typeof window !== "undefined") {
      const savedLanguage = localStorage.getItem('language') as Language;
      if (savedLanguage && translations[savedLanguage]) {
        setLanguage(savedLanguage);
      }

      const savedRole = localStorage.getItem('lastRole') as 'student' | 'teacher';
      if (savedRole) {
        setSelectedRole(savedRole);
      }

      // Set up online/offline detection
      setIsOnline(navigator.onLine);
      
      const handleOnline = () => {
        setIsOnline(true);
        handleSync();
      };
      
      const handleOffline = () => setIsOnline(false);

      window.addEventListener('online', handleOnline);
      window.addEventListener('offline', handleOffline);

      return () => {
        window.removeEventListener('online', handleOnline);
        window.removeEventListener('offline', handleOffline);
      };
    }
  }, []);

  const handleLanguageChange = useCallback((newLanguage: Language) => {
    setLanguage(newLanguage);
    if (typeof window !== "undefined") {
      localStorage.setItem('language', newLanguage);
    }
  }, []);

  const handleSync = useCallback(async () => {
    if (!isOnline) return;
    
    setIsSyncing(true);
    try {
      // Simulate sync operation
      await new Promise(resolve => setTimeout(resolve, 2000));
      toast.success("Data synced successfully");
    } catch (error) {
      toast.error("Sync failed");
    } finally {
      setIsSyncing(false);
    }
  }, [isOnline]);

  const handleRoleSelect = useCallback((role: 'student' | 'teacher') => {
    setSelectedRole(role);
    if (typeof window !== "undefined") {
      localStorage.setItem('lastRole', role);
    }
  }, []);

  const handleInputChange = useCallback((field: string, value: string | boolean) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  }, []);

  const validateForm = useCallback(() => {
    if (!formData.email || !formData.password) {
      toast.error("Email and password are required");
      return false;
    }
    
    if (activeTab === 'signup' && !formData.name) {
      toast.error("Name is required for signup");
      return false;
    }

    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(formData.email)) {
      toast.error("Please enter a valid email address");
      return false;
    }

    if (formData.password.length < 6) {
      toast.error("Password must be at least 6 characters");
      return false;
    }

    return true;
  }, [formData, activeTab]);

  const handleLogin = useCallback(async () => {
    if (!selectedRole || !validateForm()) return;

    setIsLoading(true);
    try {
      const { data, error } = await authClient.signIn.email({
        email: formData.email,
        password: formData.password,
        rememberMe: formData.rememberMe,
        callbackURL: selectedRole === 'student' ? '/' : '/'
      });

      if (error?.code) {
        toast.error("Invalid email or password. Please make sure you have already registered an account and try again.");
        return;
      }

      // Store user role for redirect logic
      localStorage.setItem('userRole', selectedRole);
      
      toast.success("Logged in successfully!");
      
      // Refetch session to get updated data
      await refetch();
      
      // Create user data for onAuth callback
      const userData = {
        role: selectedRole,
        profile: {
          id: data?.user?.id || '',
          name: data?.user?.name || '',
          email: data?.user?.email || '',
          schoolCode: formData.schoolCode || null,
          createdAt: new Date().toISOString()
        }
      };

      onAuth?.(userData);
    } catch (error) {
      toast.error("Login failed. Please try again.");
    } finally {
      setIsLoading(false);
    }
  }, [selectedRole, validateForm, formData, authClient, refetch, onAuth]);

  const handleSignup = useCallback(async () => {
    if (!selectedRole || !validateForm()) return;

    setIsLoading(true);
    try {
      const { data, error } = await authClient.signUp.email({
        email: formData.email,
        name: formData.name,
        password: formData.password
      });

      if (error?.code) {
        const errorMessages: Record<string, string> = {
          USER_ALREADY_EXISTS: "Email already registered. Please try logging in instead."
        };
        toast.error(errorMessages[error.code] || "Registration failed. Please try again.");
        return;
      }

      toast.success("Account created successfully! You can now log in.");
      
      // Switch to login tab and clear password for security
      setActiveTab('login');
      setFormData(prev => ({ ...prev, password: '' }));
      
    } catch (error) {
      toast.error("Registration failed. Please try again.");
    } finally {
      setIsLoading(false);
    }
  }, [selectedRole, validateForm, formData, authClient]);

  const handleAuth = useCallback(async () => {
    if (activeTab === 'login') {
      await handleLogin();
    } else {
      await handleSignup();
    }
  }, [activeTab, handleLogin, handleSignup]);

  const handleGuestMode = useCallback(() => {
    const guestData = {
      role: 'student' as const,
      isGuest: true,
      profile: {
        id: 'guest_' + Math.random().toString(36).substr(2, 9),
        name: 'Guest User',
        email: null,
        isGuest: true,
        createdAt: new Date().toISOString()
      }
    };

    if (typeof window !== "undefined") {
      localStorage.setItem('guestProfile', JSON.stringify(guestData));
    }

    toast.success("Welcome, Guest! Your progress will be saved locally.");
    onAuth?.(guestData);
  }, [onAuth]);

  // Show loading if session is being fetched
  if (isPending) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto mb-4"></div>
          <p className="text-muted-foreground">{t.loading}</p>
        </div>
      </div>
    );
  }

  return (
    <div className={`min-h-screen bg-background ${className}`}>
      {/* Header */}
      <header className="border-b bg-card">
        <div className="container mx-auto px-4 py-3 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <School className="h-8 w-8 text-primary" />
            <span className="text-xl font-display font-bold">EduApp</span>
          </div>
          
          <div className="flex items-center gap-4">
            {/* Language Toggle */}
            <div className="flex bg-muted rounded-lg p-1">
              {(['EN', 'HI', 'OD', 'BN'] as Language[]).map((lang) => (
                <button
                  key={lang}
                  onClick={() => handleLanguageChange(lang)}
                  className={`px-3 py-1 text-sm font-medium rounded-md transition-colors ${
                    language === lang
                      ? 'bg-primary text-primary-foreground'
                      : 'text-muted-foreground hover:text-foreground'
                  }`}
                  aria-label={`Switch to ${lang}`}
                >
                  {lang}
                </button>
              ))}
            </div>

            {/* Online/Sync Status */}
            <div className="flex items-center gap-2">
              <Dot 
                className={`h-4 w-4 ${
                  !isOnline ? 'text-destructive' : isSyncing ? 'text-yellow-500' : 'text-green-500'
                }`} 
              />
              <span className="text-sm text-muted-foreground">
                {!isOnline ? t.offline : isSyncing ? t.syncing : 'Online'}
              </span>
            </div>
          </div>
        </div>
      </header>

      <main className="container mx-auto px-4 py-8">
        {/* Hero Section */}
        <div className="text-center mb-12">
          <h1 className="text-4xl md:text-5xl font-display font-bold mb-4">
            {t.welcomeTitle}
          </h1>
          <p className="text-lg text-muted-foreground mb-8 max-w-2xl mx-auto">
            {t.welcomeSubtitle}
          </p>

          {/* Role Selection */}
          {!selectedRole && (
            <Card className="max-w-md mx-auto">
              <CardHeader>
                <CardTitle className="text-center">{t.getStarted}</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <Button
                  variant="outline"
                  size="lg"
                  className="w-full h-16 text-left"
                  onClick={() => handleRoleSelect('student')}
                >
                  <div className="flex items-center gap-4">
                    <CircleUser className="h-8 w-8" />
                    <span className="text-lg font-medium">{t.studentButton}</span>
                  </div>
                </Button>
                
                <Button
                  variant="outline"
                  size="lg"
                  className="w-full h-16 text-left"
                  onClick={() => handleRoleSelect('teacher')}
                >
                  <div className="flex items-center gap-4">
                    <UserRound className="h-8 w-8" />
                    <span className="text-lg font-medium">{t.teacherButton}</span>
                  </div>
                </Button>
              </CardContent>
            </Card>
          )}

          {/* Auth Forms */}
          {selectedRole && (
            <Card className="max-w-md mx-auto">
              <CardHeader>
                <CardTitle className="flex items-center gap-2 justify-center">
                  {selectedRole === 'student' ? (
                    <CircleUser className="h-5 w-5" />
                  ) : (
                    <UserRound className="h-5 w-5" />
                  )}
                  {selectedRole === 'student' ? t.studentButton : t.teacherButton}
                </CardTitle>
                <CardDescription>
                  {selectedRole === 'student' && (
                    <Button 
                      variant="link" 
                      size="sm"
                      onClick={handleGuestMode}
                      className="p-0 h-auto"
                    >
                      {t.continueAsGuest}
                    </Button>
                  )}
                </CardDescription>
              </CardHeader>
              
              <CardContent>
                <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
                  <TabsList className="grid w-full grid-cols-2">
                    <TabsTrigger value="login" className="flex items-center gap-2">
                      <LogIn className="h-4 w-4" />
                      {t.login}
                    </TabsTrigger>
                    <TabsTrigger value="signup" className="flex items-center gap-2">
                      <User className="h-4 w-4" />
                      {t.signup}
                    </TabsTrigger>
                  </TabsList>
                  
                  <TabsContent value="login" className="space-y-4 mt-6">
                    <div className="space-y-2">
                      <Label htmlFor="email">{t.email}</Label>
                      <Input
                        id="email"
                        type="email"
                        value={formData.email}
                        onChange={(e) => handleInputChange('email', e.target.value)}
                        className="h-12"
                        placeholder="your@email.com"
                        autoComplete="email"
                      />
                    </div>
                    
                    <div className="space-y-2">
                      <Label htmlFor="password">{t.password}</Label>
                      <div className="relative">
                        <Input
                          id="password"
                          type="password"
                          value={formData.password}
                          onChange={(e) => handleInputChange('password', e.target.value)}
                          className="h-12 pr-10"
                          placeholder="••••••••"
                          autoComplete="current-password"
                        />
                        <EyeOff className="absolute right-3 top-3 h-6 w-6 text-muted-foreground" />
                      </div>
                    </div>

                    <div className="flex items-center space-x-2">
                      <input
                        id="rememberMe"
                        type="checkbox"
                        checked={formData.rememberMe}
                        onChange={(e) => handleInputChange('rememberMe', e.target.checked)}
                        className="h-4 w-4 text-primary focus:ring-primary border-gray-300 rounded"
                      />
                      <Label htmlFor="rememberMe" className="text-sm">
                        Remember me
                      </Label>
                    </div>
                    
                    <Button 
                      onClick={handleAuth}
                      disabled={isLoading}
                      className="w-full h-12"
                      size="lg"
                    >
                      {isLoading ? t.loading : t.login}
                    </Button>
                  </TabsContent>
                  
                  <TabsContent value="signup" className="space-y-4 mt-6">
                    <div className="space-y-2">
                      <Label htmlFor="name">{t.name}</Label>
                      <Input
                        id="name"
                        type="text"
                        value={formData.name}
                        onChange={(e) => handleInputChange('name', e.target.value)}
                        className="h-12"
                        placeholder="Your full name"
                        autoComplete="name"
                      />
                    </div>
                    
                    <div className="space-y-2">
                      <Label htmlFor="signup-email">{t.email}</Label>
                      <Input
                        id="signup-email"
                        type="email"
                        value={formData.email}
                        onChange={(e) => handleInputChange('email', e.target.value)}
                        className="h-12"
                        placeholder="your@email.com"
                        autoComplete="email"
                      />
                    </div>
                    
                    <div className="space-y-2">
                      <Label htmlFor="signup-password">{t.password}</Label>
                      <div className="relative">
                        <Input
                          id="signup-password"
                          type="password"
                          value={formData.password}
                          onChange={(e) => handleInputChange('password', e.target.value)}
                          className="h-12 pr-10"
                          placeholder="••••••••"
                          autoComplete="new-password"
                        />
                        <EyeOff className="absolute right-3 top-3 h-6 w-6 text-muted-foreground" />
                      </div>
                    </div>
                    
                    {selectedRole === 'teacher' && (
                      <div className="space-y-2">
                        <Label htmlFor="schoolCode" className="flex items-center gap-2">
                          <Key className="h-4 w-4" />
                          {t.schoolCode} <span className="text-xs text-muted-foreground">{t.optional}</span>
                        </Label>
                        <Input
                          id="schoolCode"
                          type="text"
                          value={formData.schoolCode}
                          onChange={(e) => handleInputChange('schoolCode', e.target.value)}
                          className="h-12"
                          placeholder="ABC123"
                          autoComplete="organization"
                        />
                      </div>
                    )}
                    
                    <Button 
                      onClick={handleAuth}
                      disabled={isLoading}
                      className="w-full h-12"
                      size="lg"
                    >
                      {isLoading ? t.loading : t.signup}
                    </Button>
                  </TabsContent>
                </Tabs>

                {selectedRole && (
                  <Button
                    variant="ghost"
                    onClick={() => setSelectedRole(null)}
                    className="w-full mt-4"
                  >
                    ← Back to role selection
                  </Button>
                )}
              </CardContent>
            </Card>
          )}
        </div>

        {/* Offline Banner */}
        {!isOnline && (
          <Card className="max-w-md mx-auto bg-yellow-50 border-yellow-200">
            <CardContent className="p-4">
              <div className="flex items-center gap-3">
                <Dot className="h-5 w-5 text-yellow-600" />
                <div>
                  <p className="font-medium text-yellow-800">Working Offline</p>
                  <p className="text-sm text-yellow-700">
                    Your progress will be saved locally and synced when you're back online.
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>
        )}
      </main>
    </div>
  );
}