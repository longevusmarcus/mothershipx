import { useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { LandingHero } from "@/components/landing/LandingHero";
import { SEO } from "@/components/SEO";
import { useAuth } from "@/contexts/AuthContext";

export default function Landing() {
  const navigate = useNavigate();
  const { isAuthenticated, isLoading } = useAuth();

  // Redirect authenticated users or returning visitors to /problems
  useEffect(() => {
    if (isLoading) return;
    
    const hasVisited = localStorage.getItem("mothershipx-visited");
    
    if (isAuthenticated || hasVisited) {
      navigate("/problems", { replace: true });
    }
  }, [isAuthenticated, isLoading, navigate]);

  // Show loading or nothing while checking auth/redirect
  if (isLoading) {
    return null;
  }

  // Don't render landing if we should redirect
  const hasVisited = localStorage.getItem("mothershipx-visited");
  if (isAuthenticated || hasVisited) {
    return null;
  }

  return (
    <>
      <SEO 
        title="Welcome"
        description="MothershipX helps builders discover real problems and trends with proven momentum across TikTok, Reddit, YouTube, and more, compete to build the best solutions, and earn rewards based on real outcomes."
      />
      <LandingHero />
    </>
  );
}
