import { useEffect } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import { LandingHero } from "@/components/landing/LandingHero";
import { SEO } from "@/components/SEO";
import { useAuth } from "@/contexts/AuthContext";

export default function Landing() {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const { isAuthenticated, isLoading } = useAuth();
  
  // Check if user explicitly requested the about page
  const isAboutMode = searchParams.get("about") === "true";

  // Redirect authenticated users or returning visitors to /problems (unless viewing about)
  useEffect(() => {
    if (isLoading || isAboutMode) return;
    
    const hasVisited = localStorage.getItem("mothershipx-visited");
    
    if (isAuthenticated || hasVisited) {
      navigate("/problems", { replace: true });
    }
  }, [isAuthenticated, isLoading, navigate, isAboutMode]);

  // Show nothing while checking auth/redirect (unless about mode)
  if (isLoading && !isAboutMode) {
    return null;
  }

  // Don't render landing if we should redirect (unless about mode)
  const hasVisited = localStorage.getItem("mothershipx-visited");
  if ((isAuthenticated || hasVisited) && !isAboutMode) {
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
