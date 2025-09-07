"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import AuthLanding from "@/components/AuthLanding";
import StudentPortal from "@/components/StudentPortal";
import TeacherDashboard from "@/components/TeacherDashboard";
import { authClient, useSession } from "@/lib/auth-client";
import { toast } from "sonner";

type UserRole = 'student' | 'teacher';
type CurrentView = 'landing' | 'student' | 'teacher';

interface UserData {
  role: UserRole;
  isGuest?: boolean;
  profile: {
    id: string;
    name: string;
    email?: string | null;
    schoolCode?: string | null;
    isGuest?: boolean;
    createdAt: string;
  };
}

export default function Home() {
  const router = useRouter();
  const { data: session, isPending, refetch } = useSession();
  const [currentView, setCurrentView] = useState<CurrentView>('landing');
  const [userData, setUserData] = useState<UserData | null>(null);

  // Check for existing session on mount
  useEffect(() => {
    if (typeof window !== "undefined") {
      // Check for guest profile first
      const savedGuest = localStorage.getItem('guestProfile');
      if (savedGuest) {
        try {
          const guest = JSON.parse(savedGuest) as UserData;
          setUserData(guest);
          setCurrentView('student');
          return; // Exit early for guest users
        } catch (error) {
          console.error('Failed to parse saved guest:', error);
          localStorage.removeItem('guestProfile'); // Clean up invalid data
        }
      }

      // For authenticated users, wait for session data
      if (session?.user && !isPending) {
        const userRole = localStorage.getItem('userRole') as UserRole || 'student';
        const authUserData: UserData = {
          role: userRole,
          profile: {
            id: session.user.id,
            name: session.user.name || 'User',
            email: session.user.email,
            schoolCode: null,
            createdAt: session.user.createdAt || new Date().toISOString()
          }
        };
        
        setUserData(authUserData);
        setCurrentView(userRole === 'student' ? 'student' : 'teacher');
      } else if (!session?.user && !isPending) {
        // No session and not loading, show landing
        setCurrentView('landing');
        setUserData(null);
      }
    }
  }, [session, isPending]);

  // Register service worker for offline functionality
  useEffect(() => {
    if (typeof window !== "undefined" && 'serviceWorker' in navigator) {
      navigator.serviceWorker.register('/sw.js')
        .then((registration) => {
          console.log('Service Worker registered:', registration);
        })
        .catch((error) => {
          console.log('Service Worker registration failed:', error);
        });
    }
  }, []);

  const handleAuth = (authUserData: UserData) => {
    setUserData(authUserData);
    setCurrentView(authUserData.role === 'student' ? 'student' : 'teacher');
  };

  const handleLogout = async () => {
    try {
      // Handle guest logout
      if (userData?.isGuest) {
        if (typeof window !== "undefined") {
          localStorage.removeItem('guestProfile');
        }
        setUserData(null);
        setCurrentView('landing');
        toast.success("Logged out successfully");
        return;
      }

      // Handle authenticated user logout
      const { error } = await authClient.signOut();
      if (error?.code) {
        toast.error("Logout failed");
      } else {
        if (typeof window !== "undefined") {
          localStorage.removeItem('bearer_token');
          localStorage.removeItem('userRole');
        }
        await refetch(); // Update session state
        setUserData(null);
        setCurrentView('landing');
        toast.success("Logged out successfully");
      }
    } catch (error) {
      toast.error("Logout failed");
    }
  };

  // Show loading if session is being fetched and we don't have guest data
  if (isPending && (typeof window === "undefined" || !localStorage.getItem('guestProfile'))) {
    return (
      <main className="min-h-screen bg-background flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto mb-4"></div>
          <p className="text-muted-foreground">Loading...</p>
        </div>
      </main>
    );
  }

  return (
    <main className="min-h-screen bg-background">
      {currentView === 'landing' && (
        <AuthLanding onAuth={handleAuth} />
      )}
      
      {currentView === 'student' && userData && (
        <div className="min-h-screen flex flex-col">
          <StudentPortal onLogout={handleLogout} userData={userData} />
        </div>
      )}
      
      {currentView === 'teacher' && userData && (
        <div className="min-h-screen flex flex-col">
          <TeacherDashboard onLogout={handleLogout} userData={userData} />
        </div>
      )}
    </main>
  );
}