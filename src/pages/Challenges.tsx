import { AppLayout } from "@/components/AppLayout";
import { SEO } from "@/components/SEO";
import { CommunityChallenges } from "@/components/CommunityChallenges";

const Challenges = () => {
  return (
    <AppLayout title="Daily Challenges">
      <SEO 
        title="Daily Challenges" 
        description="Join daily build sprints, compete solo or in teams, and win 90% of the prize pool. AI judges your code quality and aesthetics."
      />
      <CommunityChallenges />
    </AppLayout>
  );
};

export default Challenges;
