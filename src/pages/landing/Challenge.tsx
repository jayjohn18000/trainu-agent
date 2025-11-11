import { LandingLayout } from "@/components/landing/LandingLayout";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Trophy, Star, TrendingUp, Users, Gift } from "lucide-react";
import { ScrollReveal } from "@/components/landing/ScrollReveal";
import { AnimatedCounter } from "@/components/landing/AnimatedCounter";
import { useNavigate } from "react-router-dom";
import trainerGroupImage from "@/assets/group-training-class.jpg";
import gradientBg from "@/assets/gradient-mesh-bg.svg";
import { useChallengeLeaderboard, useChallengeStats } from "@/hooks/queries/useChallengeLeaderboard";
import { TrainerClaimButton } from "@/components/challenge/TrainerClaimButton";
import { TrainerClaimModal } from "@/components/challenge/TrainerClaimModal";
import { useState } from "react";
const topTrainers = [{
  rank: 1,
  name: "Sarah Mitchell",
  city: "Chicago, IL",
  rating: 4.9,
  reviews: 247,
  badge: "🥇"
}, {
  rank: 2,
  name: "Marcus Rodriguez",
  city: "Austin, TX",
  rating: 4.9,
  reviews: 203,
  badge: "🥈"
}, {
  rank: 3,
  name: "Jessica Chen",
  city: "Seattle, WA",
  rating: 4.8,
  reviews: 189,
  badge: "🥉"
}, {
  rank: 4,
  name: "Alex Thompson",
  city: "Denver, CO",
  rating: 4.8,
  reviews: 176
}, {
  rank: 5,
  name: "Maria Garcia",
  city: "Miami, FL",
  rating: 4.7,
  reviews: 164
}];
const prizes = [{
  place: "1st Place",
  prize: "$5,000 Cash + Feature in Fitness Monthly",
  icon: Trophy
}, {
  place: "2nd Place",
  prize: "$2,500 Cash + TrainU Pro (1 Year Free)",
  icon: Trophy
}, {
  place: "3rd Place",
  prize: "$1,000 Cash + Premium Gym Equipment",
  icon: Trophy
}, {
  place: "Top 10",
  prize: "TrainU Growth Plan (6 Months Free)",
  icon: Star
}];
export default function Challenge() {
  const navigate = useNavigate();
  const { data: leaderboardData, isLoading: leaderboardLoading } = useChallengeLeaderboard(5);
  const { data: stats } = useChallengeStats();
  const [claimModalOpen, setClaimModalOpen] = useState(false);
  const [selectedTrainer, setSelectedTrainer] = useState<any>(null);

  // Format leaderboard data with emojis for top 3
  const displayTrainers = leaderboardData?.map((entry, index) => ({
    rank: entry.rank || index + 1,
    userId: entry.trainer_id || "",
    userName: entry.trainer_name || "Unknown Trainer",
    userAvatar: undefined,
    city: entry.trainer_city || "",
    state: entry.trainer_state || "",
    score: entry.average_rating ? Number(entry.average_rating.toFixed(1)) : 0,
    reviews: entry.total_ratings || 0,
    badge: index === 0 ? "🥇" : index === 1 ? "🥈" : index === 2 ? "🥉" : undefined,
  })) || topTrainers.map((t, idx) => ({
    ...t,
    userId: "",
    userName: t.name,
    userAvatar: undefined,
  }));
  
  return <LandingLayout>
      {/* Hero */}
      <section className="relative overflow-hidden">
        {/* Video Background */}
        <video 
          autoPlay 
          loop 
          muted 
          playsInline
          className="absolute inset-0 w-full h-full object-cover"
        >
          <source src="/challenge-hero-video.mp4" type="video/mp4" />
        </video>
        
        {/* Dark Gradient Overlay */}
        <div className="absolute inset-0 bg-gradient-to-t from-black via-black/80 to-black/40" />
        
        <div className="container mx-auto px-4 py-20 relative z-10">
          <ScrollReveal className="max-w-4xl mx-auto text-center">
            <Badge className="mb-6 text-sm px-4 py-2">
              <Trophy className="h-4 w-4 mr-2" />
              Live Challenge - Ends March 31, 2025
            </Badge>
            
            <h1 className="text-5xl md:text-6xl font-bold mb-6">
              Rate Your Trainer{" "}
              <span className="bg-gradient-to-r from-primary to-primary-hover bg-clip-text text-transparent">
Challenge 2025</span>
            </h1>
            
            <p className="text-xl text-muted-foreground mb-8 max-w-2xl mx-auto">
              Help us find America's best trainers. Rate your current or past trainer, compete for prizes, and discover top-rated fitness professionals in your area.
            </p>

            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Button size="lg" className="shadow-glow" onClick={() => navigate("/challenge/rate")}>
                <Star className="h-5 w-5 mr-2" />
                Rate Your Trainer
              </Button>
              <Button size="lg" variant="outline">
                View Leaderboard
              </Button>
            </div>

            {/* Stats */}
            <div className="mt-12 grid grid-cols-3 gap-6 max-w-2xl mx-auto">
              <div>
                <p className="text-3xl font-bold text-primary">
                  <AnimatedCounter end={stats?.totalRatings || 0} duration={1500} />
                </p>
                <p className="text-sm text-muted-foreground">Ratings Submitted</p>
              </div>
              <div>
                <p className="text-3xl font-bold text-success">
                  <AnimatedCounter end={stats?.uniqueTrainers || 0} duration={1500} />
                </p>
                <p className="text-sm text-muted-foreground">Trainers Rated</p>
              </div>
              <div>
                <p className="text-3xl font-bold text-warning">
                  $<AnimatedCounter end={10} suffix="k" duration={1500} />
                </p>
                <p className="text-sm text-muted-foreground">Prize Pool</p>
              </div>
            </div>
          </ScrollReveal>
        </div>
        
        {/* Gradient transition to next section */}
        <div className="absolute bottom-0 left-0 right-0 h-32 bg-gradient-to-b from-transparent to-background z-20" />
      </section>

      {/* How It Works */}
      <section className="py-20 bg-background relative -mt-1">
        <div className="container mx-auto px-4">
          <div className="max-w-4xl mx-auto">
            <ScrollReveal>
              <div className="text-center mb-16">
                <h2 className="text-5xl md:text-6xl font-bold mb-4 bg-gradient-to-r from-blue-400 via-primary to-blue-600 bg-clip-text text-transparent">
                  How It Works
                </h2>
                <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
                  Four simple steps to rate your trainer and help them compete for prizes
                </p>
              </div>
            </ScrollReveal>
            
            <div className="grid md:grid-cols-2 gap-6">
              <ScrollReveal delay={100}>
              <Card className="p-6 hover:shadow-glow transition-all hover:scale-[1.02]">
                <div className="flex items-start gap-4">
                  <div className="h-10 w-10 rounded-full bg-primary/10 flex items-center justify-center flex-shrink-0 text-primary font-bold">
                    1
                  </div>
                  <div>
                    <h3 className="font-semibold mb-2">Search for Your Trainer</h3>
                    <p className="text-sm text-muted-foreground">
                      Find your current or past trainer by name, gym, or city. Not listed? Add them to the system.
                    </p>
                  </div>
                </div>
              </Card>
              </ScrollReveal>

              <ScrollReveal delay={150}>
              <Card className="p-6 hover:shadow-glow transition-all hover:scale-[1.02]">
                <div className="flex items-start gap-4">
                  <div className="h-10 w-10 rounded-full bg-primary/10 flex items-center justify-center flex-shrink-0 text-primary font-bold">
                    2
                  </div>
                  <div>
                    <h3 className="font-semibold mb-2">Rate Your Experience</h3>
                    <p className="text-sm text-muted-foreground">
                      Rate 1-5 stars across categories: expertise, communication, motivation, results, and value.
                    </p>
                  </div>
                </div>
              </Card>
              </ScrollReveal>

              <ScrollReveal delay={200}>
              <Card className="p-6 hover:shadow-glow transition-all hover:scale-[1.02]">
                <div className="flex items-start gap-4">
                  <div className="h-10 w-10 rounded-full bg-primary/10 flex items-center justify-center flex-shrink-0 text-primary font-bold">
                    3
                  </div>
                  <div>
                    <h3 className="font-semibold mb-2">Verify & Submit</h3>
                    <p className="text-sm text-muted-foreground">
                      Upload proof (session photo, receipt) and verify via SMS or email. Anti-gaming measures in place.
                    </p>
                  </div>
                </div>
              </Card>
              </ScrollReveal>

              <ScrollReveal delay={250}>
              <Card className="p-6 hover:shadow-glow transition-all hover:scale-[1.02]">
                <div className="flex items-start gap-4">
                  <div className="h-10 w-10 rounded-full bg-primary/10 flex items-center justify-center flex-shrink-0 text-primary font-bold">
                    4
                  </div>
                  <div>
                    <h3 className="font-semibold mb-2">Watch the Leaderboard</h3>
                    <p className="text-sm text-muted-foreground">
                      Top-rated trainers rise to the top. Winners announced April 5th. Share your trainer's profile to help them climb.
                    </p>
                  </div>
                </div>
              </Card>
              </ScrollReveal>
            </div>
          </div>
        </div>
      </section>

      {/* Live Leaderboard */}
      <section id="leaderboard" className="py-20">
        <div className="container mx-auto px-4">
          <div className="max-w-4xl mx-auto">
            <ScrollReveal>
              <div className="flex items-center justify-between mb-8">
                <h2 className="text-3xl font-bold">Current Top 5</h2>
              <Badge variant="outline">
                <TrendingUp className="h-4 w-4 mr-2" />
                Updates Live
              </Badge>
              </div>
            </ScrollReveal>

            <div className="space-y-4">
              {leaderboardLoading ? (
                <div className="text-center py-8 text-muted-foreground">Loading leaderboard...</div>
              ) : displayTrainers.length === 0 ? (
                <Card className="p-8 text-center">
                  <p className="text-muted-foreground mb-4">No ratings submitted yet. Be the first!</p>
                  <Button onClick={() => navigate("/challenge/rate")}>
                    Submit First Rating
                  </Button>
                </Card>
              ) : (
                displayTrainers.map((trainer, index) => <ScrollReveal key={trainer.rank} delay={index * 100}>
                <Card className={`p-6 hover:border-primary/30 transition-all hover:scale-[1.01] ${trainer.rank <= 3 ? 'border-primary/20' : ''}`}>
                  <div className="flex items-center gap-6">
                    <div className="flex-shrink-0 text-center">
                      <div className="text-4xl mb-1">{trainer.badge || `#${trainer.rank}`}</div>
                      {trainer.rank <= 3 && <Badge className="text-xs">Top 3</Badge>}
                    </div>

                    <div className="flex-1">
                      <h3 className="text-lg font-semibold mb-1">{trainer.userName}</h3>
                      {(trainer.city || trainer.state) && (
                        <p className="text-sm text-muted-foreground mb-2">
                          {[trainer.city, trainer.state].filter(Boolean).join(", ")}
                        </p>
                      )}
                      <div className="flex items-center gap-4">
                        <div className="flex items-center gap-1">
                          <Star className="h-4 w-4 fill-warning text-warning" />
                          <span className="text-sm font-medium">{trainer.score}</span>
                        </div>
                        <span className="text-sm text-muted-foreground">{trainer.reviews} reviews</span>
                      </div>
                    </div>

                    <div className="flex-shrink-0 flex flex-col gap-2">
                      <Button size="sm" variant="outline" onClick={() => navigate(`/challenge/rate?trainerId=${leaderboardData?.[index]?.trainer_key}`)}>
                        Rate Trainer
                      </Button>
                      <TrainerClaimButton
                        trainerKey={leaderboardData?.[index]?.trainer_key || ''}
                        trainerName={trainer.userName}
                        isVerified={!!trainer.userId}
                        onClaim={() => {
                          setSelectedTrainer(leaderboardData?.[index]);
                          setClaimModalOpen(true);
                        }}
                      />
                    </div>
                  </div>
                </Card>
                </ScrollReveal>)
              )}
            </div>

            <div className="text-center mt-8">
              <Button variant="outline" size="lg" onClick={() => navigate("/challenge/rate")}>
                Submit Your Rating
              </Button>
            </div>
          </div>
        </div>
      </section>

      {/* Prizes */}
      <section className="py-20 bg-card/50">
        <div className="container mx-auto px-4">
          <div className="max-w-4xl mx-auto">
            <h2 className="text-3xl font-bold text-center mb-4">Prizes & Incentives</h2>
            <p className="text-center text-muted-foreground mb-12 max-w-2xl mx-auto">
              Top-rated trainers win cash, features, and free TrainU subscriptions
            </p>

            <div className="grid md:grid-cols-2 gap-6">
              {prizes.map((prize, index) => <Card key={index} className="p-6 text-center hover:border-primary/30 transition-all">
                  <div className="h-16 w-16 rounded-xl bg-primary/10 flex items-center justify-center mx-auto mb-4">
                    <prize.icon className="h-8 w-8 text-primary" />
                  </div>
                  <h3 className="font-semibold text-lg mb-2">{prize.place}</h3>
                  <p className="text-sm text-muted-foreground">{prize.prize}</p>
                </Card>)}
            </div>

            <Card className="mt-8 p-6 bg-gradient-to-br from-success/10 to-success/5 border-success/20">
              <div className="flex items-start gap-4">
                <Gift className="h-6 w-6 text-success flex-shrink-0 mt-1" />
                <div>
                  <h3 className="font-semibold mb-2">Bonus: Client Rewards</h3>
                  <p className="text-sm text-muted-foreground">
                    Submit a verified rating and get entered to win monthly prizes: gym equipment, supplements, and more. 50 winners selected randomly.
                  </p>
                </div>
              </div>
            </Card>
          </div>
        </div>
      </section>

      {/* UGC */}
      <section className="py-20">
        <div className="container mx-auto px-4">
          <div className="max-w-4xl mx-auto">
            <h2 className="text-3xl font-bold text-center mb-12">Community Reviews</h2>
            
            <div className="grid md:grid-cols-2 gap-6">
              <Card className="p-6">
                <div className="flex items-center gap-3 mb-4">
                  <div className="h-12 w-12 rounded-full bg-primary/10 flex items-center justify-center text-xl">
                    👤
                  </div>
                  <div>
                    <p className="font-semibold">Jamie L.</p>
                    <div className="flex items-center gap-1">
                      {[...Array(5)].map((_, i) => <Star key={i} className="h-3 w-3 fill-warning text-warning" />)}
                    </div>
                  </div>
                </div>
                <p className="text-sm text-muted-foreground italic">
                  "Sarah changed my life. Down 40 lbs, feeling stronger than ever. She's not just a trainer—she's a coach, therapist, and cheerleader all in one."
                </p>
                <p className="text-xs text-muted-foreground mt-3">Rating: Sarah Mitchell, Chicago</p>
              </Card>

              <Card className="p-6">
                <div className="flex items-center gap-3 mb-4">
                  <div className="h-12 w-12 rounded-full bg-primary/10 flex items-center justify-center text-xl">
                    👤
                  </div>
                  <div>
                    <p className="font-semibold">Michael R.</p>
                    <div className="flex items-center gap-1">
                      {[...Array(5)].map((_, i) => <Star key={i} className="h-3 w-3 fill-warning text-warning" />)}
                    </div>
                  </div>
                </div>
                <p className="text-sm text-muted-foreground italic">
                  "Marcus knows his stuff. Programming is always fresh, he actually listens to my goals, and I've hit PRs I never thought possible. Worth every penny."
                </p>
                <p className="text-xs text-muted-foreground mt-3">Rating: Marcus Rodriguez, Austin</p>
              </Card>
            </div>
          </div>
        </div>
      </section>

      {/* Anti-Gaming */}
      <section className="py-20 bg-card/50">
        <div className="container mx-auto px-4">
          <div className="max-w-3xl mx-auto">
            <h2 className="text-2xl font-bold text-center mb-6">Fair Play Rules</h2>
            <Card className="p-6">
              <p className="text-muted-foreground mb-4">
                We take integrity seriously. All ratings are verified to prevent gaming:
              </p>
              <ul className="space-y-2 text-sm text-muted-foreground">
                <li className="flex items-start gap-2">
                  <span className="text-primary font-bold mt-0.5">•</span>
                  <span>Phone or email verification required for all submissions</span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="text-primary font-bold mt-0.5">•</span>
                  <span>Proof of training relationship (photo, receipt, or booking confirmation)</span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="text-primary font-bold mt-0.5">•</span>
                  <span>Duplicate detection: same device/IP can't rate the same trainer twice</span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="text-primary font-bold mt-0.5">•</span>
                  <span>Manual review for trainers receiving 50+ ratings in 24 hours</span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="text-primary font-bold mt-0.5">•</span>
                  <span>Trainers caught gaming are disqualified and publicly flagged</span>
                </li>
              </ul>
            </Card>
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="py-20 relative overflow-hidden">
        <div className="absolute inset-0 opacity-20">
          <img src={trainerGroupImage} alt="" className="w-full h-full object-cover" />
        </div>
        <div className="container mx-auto px-4 relative z-10">
          <ScrollReveal>
          <div className="max-w-3xl mx-auto text-center p-12 rounded-2xl backdrop-blur-xl bg-card/90 border-primary/20 shadow-glow">
            <h2 className="text-4xl font-bold mb-4">Rate Your Trainer Today</h2>
            <p className="text-xl text-muted-foreground mb-8">
              Help them win. Takes 2 minutes. Every verified rating counts.
            </p>
            <Button size="lg" className="shadow-glow" onClick={() => navigate("/challenge/rate")}>
              <Star className="h-5 w-5 mr-2" />
              Submit Your Rating
            </Button>
            <p className="text-sm text-muted-foreground mt-4">
              Challenge ends March 31, 2025 at 11:59 PM CT
            </p>
          </div>
          </ScrollReveal>
        </div>
      </section>
      
      {selectedTrainer && (
        <TrainerClaimModal
          open={claimModalOpen}
          onOpenChange={setClaimModalOpen}
          trainerKey={selectedTrainer.trainer_key}
          trainerName={selectedTrainer.trainer_name}
          trainerCity={selectedTrainer.trainer_city}
          trainerState={selectedTrainer.trainer_state}
        />
      )}
    </LandingLayout>;
}