import { useNavigate } from "react-router-dom";
import { LandingHero } from "@/components/landing/LandingHero";
import { SEO } from "@/components/SEO";
import { useAuth } from "@/contexts/AuthContext";

export default function Landing() {
  const navigate = useNavigate();
  const { isAuthenticated, isLoading } = useAuth();

  // Redirect authenticated users or returning visitors to /problems
  if (!isLoading && isAuthenticated) {
    navigate("/problems", { replace: true });
    return null;
  }

  const hasVisited = localStorage.getItem("mothershipx-visited");
  if (hasVisited) {
    navigate("/problems", { replace: true });
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
