import { useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { LandingHero } from "@/components/landing/LandingHero";
import { SEO } from "@/components/SEO";

export default function Landing() {
  const navigate = useNavigate();

  // Check if user has already visited
  useEffect(() => {
    const hasVisited = localStorage.getItem("mothershipx-visited");
    if (hasVisited) {
      navigate("/problems", { replace: true });
    }
  }, [navigate]);

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
