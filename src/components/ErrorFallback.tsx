"use client";

import { AlertTriangle } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { useRouter } from "next/navigation";

interface ErrorFallbackProps {
  title: string;
  message: string;
}

export const ErrorFallback = ({ title, message }: ErrorFallbackProps) => {
  const router = useRouter();

  const handleTryAgain = () => {
    window.location.reload();
  };

  const handleBackToHome = () => {
    router.push("/");
  };

  return (
    <div className="min-h-screen bg-background flex items-center justify-center p-4">
      <Card className="w-full max-w-md mx-auto shadow-lg">
        <CardHeader className="text-center pb-4">
          <div className="flex justify-center mb-4">
            <div className="rounded-full bg-destructive/10 p-3">
              <AlertTriangle className="h-8 w-8 text-destructive" />
            </div>
          </div>
          <h1 className="text-xl font-display font-bold text-foreground mb-2">
            {title}
          </h1>
        </CardHeader>
        
        <CardContent className="text-center space-y-6">
          <p className="text-muted-foreground leading-relaxed">
            {message}
          </p>
          
          <div className="space-y-3">
            <Button 
              onClick={handleTryAgain}
              className="w-full bg-primary hover:bg-primary/90 text-primary-foreground font-medium transition-colors duration-200"
              size="lg"
            >
              Try Again
            </Button>
            
            <Button 
              onClick={handleBackToHome}
              variant="outline"
              className="w-full border-border hover:bg-accent hover:text-accent-foreground transition-colors duration-200"
              size="lg"
            >
              Back to Home
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};