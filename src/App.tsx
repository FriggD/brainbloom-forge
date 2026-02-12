import React, { useState } from "react";
import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import { ThemeProvider } from "next-themes";
import { AuthProvider, useAuth } from "@/contexts/AuthContext";
import { StudyProvider } from "@/contexts/StudyContext";
import Index from "./pages/Index";
import CornellPage from "./pages/CornellPage";
import MindMapPage from "./pages/MindMapPage";
import FlashcardsPage from "./pages/FlashcardsPage";
import CalendarPage from "./pages/CalendarPage";
import ContentHubPage from "./pages/ContentHubPage";
import GlossaryPage from "./pages/GlossaryPage";
import KnowledgeMapPage from "./pages/KnowledgeMapPage";
import SettingsPage from "./pages/SettingsPage";
import ThemeSettingsPage from "./pages/ThemeSettingsPage";
import ProfileSettingsPage from "./pages/ProfileSettingsPage";
import CalendarSettingsPage from "./pages/CalendarSettingsPage";
import FolderViewPage from "./pages/FolderViewPage";
import SchedulePage from "./pages/SchedulePage";
import AuthPage from "./pages/AuthPage";
import NotFound from "./pages/NotFound";

const ProtectedRoute = ({ children }: { children: React.ReactNode }) => {
  const { user, loading } = useAuth();
  
  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
      </div>
    );
  }
  
  if (!user) {
    return <Navigate to="/auth" replace />;
  }
  
  return <>{children}</>;
};

const App = () => {
  const [queryClient] = useState(() => new QueryClient());
  
  return (
    <QueryClientProvider client={queryClient}>
    <ThemeProvider attribute="class" defaultTheme="light" themes={['light', 'dark', 'orquidea', 'sapphira', 'bubblegum']}>
      <TooltipProvider>
        <BrowserRouter>
          <AuthProvider>
            <StudyProvider>
              <Toaster />
              <Sonner />
              <Routes>
                <Route path="/auth" element={<AuthPage />} />
                <Route path="/" element={<ProtectedRoute><Index /></ProtectedRoute>} />
                <Route path="/folder/:folderId" element={<ProtectedRoute><FolderViewPage /></ProtectedRoute>} />
                <Route path="/cornell" element={<ProtectedRoute><CornellPage /></ProtectedRoute>} />
                <Route path="/mindmap" element={<ProtectedRoute><MindMapPage /></ProtectedRoute>} />
                <Route path="/flashcards" element={<ProtectedRoute><FlashcardsPage /></ProtectedRoute>} />
                <Route path="/calendar" element={<ProtectedRoute><CalendarPage /></ProtectedRoute>} />
                <Route path="/content-hub" element={<ProtectedRoute><ContentHubPage /></ProtectedRoute>} />
                <Route path="/schedule" element={<ProtectedRoute><SchedulePage /></ProtectedRoute>} />
                <Route path="/glossary" element={<ProtectedRoute><GlossaryPage /></ProtectedRoute>} />
                <Route path="/knowledge-map" element={<ProtectedRoute><KnowledgeMapPage /></ProtectedRoute>} />
                <Route path="/settings" element={<ProtectedRoute><SettingsPage /></ProtectedRoute>} />
              <Route path="/settings/theme" element={<ProtectedRoute><ThemeSettingsPage /></ProtectedRoute>} />
              <Route path="/settings/profile" element={<ProtectedRoute><ProfileSettingsPage /></ProtectedRoute>} />
              <Route path="/settings/calendar" element={<ProtectedRoute><CalendarSettingsPage /></ProtectedRoute>} />
                <Route path="*" element={<NotFound />} />
              </Routes>
            </StudyProvider>
          </AuthProvider>
        </BrowserRouter>
      </TooltipProvider>
    </ThemeProvider>
    </QueryClientProvider>
  );
};

export default App;
