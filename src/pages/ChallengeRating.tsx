import { useState } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import { ArrowLeft, Star, CheckCircle, Share2, Mail } from "lucide-react";
import { MOCK_TRAINERS } from "@/fixtures/trainers";
import { InputOTP, InputOTPGroup, InputOTPSlot } from "@/components/ui/input-otp";

type RatingData = {
  trainerId?: string;
  trainerName: string;
  trainerGym?: string;
  trainerCity: string;
  trainerState: string;
  trainerSlug?: string;
  raterName: string;
  raterEmail: string;
  raterPhone?: string;
  verificationMethod: "email" | "phone";
  ratingExpertise: number;
  ratingCommunication: number;
  ratingMotivation: number;
  ratingResults: number;
  ratingValue: number;
  reviewText?: string;
};

export default function ChallengeRating() {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const prefilledTrainerId = searchParams.get("trainerId");
  
  const [step, setStep] = useState(1);
  const [loading, setLoading] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [ratingId, setRatingId] = useState<string>("");
  const [verificationCode, setVerificationCode] = useState("");
  
  const [data, setData] = useState<RatingData>({
    trainerName: "",
    trainerCity: "",
    trainerState: "",
    raterName: "",
    raterEmail: "",
    verificationMethod: "email",
    ratingExpertise: 0,
    ratingCommunication: 0,
    ratingMotivation: 0,
    ratingResults: 0,
    ratingValue: 0,
  });

  const filteredTrainers = MOCK_TRAINERS.filter(t =>
    t.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    t.city?.toLowerCase().includes(searchQuery.toLowerCase()) ||
    t.state?.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const selectTrainer = (trainer: typeof MOCK_TRAINERS[0]) => {
    setData({
      ...data,
      trainerId: trainer.id,
      trainerName: trainer.name,
      trainerCity: trainer.city || "",
      trainerState: trainer.state || "",
      trainerSlug: trainer.slug,
    });
    setStep(2);
  };

  const handleCustomTrainer = () => {
    if (!data.trainerName.trim()) {
      toast.error("Please enter your trainer's name");
      return;
    }
    if (!data.trainerCity.trim()) {
      toast.error("Please enter the trainer's city");
      return;
    }
    if (!data.trainerState.trim()) {
      toast.error("Please enter the trainer's state");
      return;
    }
    setStep(2);
  };

  const handleRatingSubmit = async () => {
    if (data.ratingExpertise === 0 || data.ratingCommunication === 0 || 
        data.ratingMotivation === 0 || data.ratingResults === 0 || data.ratingValue === 0) {
      toast.error("Please rate all categories");
      return;
    }
    
    if (!data.raterName || !data.raterEmail) {
      toast.error("Please provide your name and email");
      return;
    }

    setLoading(true);
    try {
      const { data: result, error } = await supabase.functions.invoke("submit-challenge-rating", {
        body: {
          ...data,
          domain: "trainu.us",
        },
      });

      if (error) throw error;
      
      setRatingId(result.ratingId);
      toast.success("Verification code sent to your email!");
      setStep(3);
    } catch (error: any) {
      toast.error(error.message || "Failed to submit rating");
    } finally {
      setLoading(false);
    }
  };

  const handleVerifyCode = async () => {
    if (verificationCode.length !== 6) {
      toast.error("Please enter the 6-digit code");
      return;
    }

    setLoading(true);
    try {
      const { error } = await supabase.functions.invoke("verify-challenge-rating", {
        body: {
          ratingId,
          verificationCode,
        },
      });

      if (error) throw error;
      
      toast.success("Rating verified successfully!");
      setStep(4);
    } catch (error: any) {
      toast.error(error.message || "Invalid or expired verification code");
    } finally {
      setLoading(false);
    }
  };

  const shareUrl = `https://trainu.us/challenge/rate${data.trainerId ? `?trainerId=${data.trainerId}` : ""}`;
  const shareText = `I just rated ${data.trainerName} in the #TrainU2025 Challenge! Help them win - rate your trainer: ${shareUrl}`;

  return (
    <div className="min-h-screen bg-background py-12">
      <div className="container mx-auto px-4 max-w-2xl">
        <Button
          variant="ghost"
          onClick={() => step > 1 ? setStep(step - 1) : navigate("/challenge")}
          className="mb-6"
        >
          <ArrowLeft className="mr-2 h-4 w-4" />
          Back
        </Button>

        <div className="mb-8">
          <h1 className="text-3xl font-bold mb-2">Rate Your Trainer</h1>
          <div className="flex gap-2">
            {[1, 2, 3, 4].map(s => (
              <div
                key={s}
                className={`h-2 flex-1 rounded-full ${
                  s <= step ? "bg-primary" : "bg-muted"
                }`}
              />
            ))}
          </div>
        </div>

        <Card className="p-6">
          {/* Step 1: Trainer Selection */}
          {step === 1 && (
            <div className="space-y-6">
              <div>
                <h2 className="text-2xl font-bold mb-4">Find Your Trainer</h2>
                <Input
                  placeholder="Search by name, city, or state..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="mb-4"
                />
              </div>

              <div className="space-y-2 max-h-96 overflow-y-auto">
                {filteredTrainers.slice(0, 10).map(trainer => (
                  <button
                    key={trainer.id}
                    onClick={() => selectTrainer(trainer)}
                    className="w-full p-4 rounded-lg border hover:border-primary hover:bg-accent transition-colors text-left"
                  >
                    <div className="flex items-center gap-3">
                      <img
                        src={trainer.avatarUrl || "https://i.pravatar.cc/150"}
                        alt={trainer.name}
                        className="w-12 h-12 rounded-full object-cover"
                      />
                      <div>
                        <p className="font-semibold">{trainer.name}</p>
                        <p className="text-sm text-muted-foreground">
                          {[trainer.city, trainer.state].filter(Boolean).join(", ")}
                        </p>
                      </div>
                    </div>
                  </button>
                ))}
              </div>

              <div className="pt-4 border-t">
                <Label>Trainer not listed? Enter their information:</Label>
                <div className="space-y-3 mt-2">
                  <Input
                    value={data.trainerName}
                    onChange={(e) => setData({ ...data, trainerName: e.target.value })}
                    placeholder="Trainer name *"
                  />
                  <Input
                    value={data.trainerCity}
                    onChange={(e) => setData({ ...data, trainerCity: e.target.value })}
                    placeholder="City *"
                  />
                  <Input
                    value={data.trainerState}
                    onChange={(e) => setData({ ...data, trainerState: e.target.value })}
                    placeholder="State *"
                  />
                </div>
                <Button onClick={handleCustomTrainer} className="mt-4 w-full">
                  Continue with Custom Trainer
                </Button>
              </div>
            </div>
          )}

          {/* Step 2: Rating Form */}
          {step === 2 && (
            <div className="space-y-6">
              <h2 className="text-2xl font-bold">Rate {data.trainerName}</h2>
              <p className="text-sm text-muted-foreground">
                {data.trainerCity}, {data.trainerState}
              </p>
              
              {[
                { key: "ratingExpertise", label: "Expertise & Knowledge" },
                { key: "ratingCommunication", label: "Communication & Responsiveness" },
                { key: "ratingMotivation", label: "Motivation & Encouragement" },
                { key: "ratingResults", label: "Results Achieved" },
                { key: "ratingValue", label: "Value for Money" },
              ].map(({ key, label }) => (
                <div key={key}>
                  <Label className="mb-2 block">{label}</Label>
                  <div className="flex gap-2">
                    {[1, 2, 3, 4, 5].map(rating => (
                      <button
                        key={rating}
                        onClick={() => setData({ ...data, [key]: rating })}
                        className="transition-transform hover:scale-110"
                      >
                        <Star
                          className={`h-8 w-8 ${
                            rating <= (data[key as keyof RatingData] as number)
                              ? "fill-yellow-400 text-yellow-400"
                              : "text-muted-foreground"
                          }`}
                        />
                      </button>
                    ))}
                  </div>
                </div>
              ))}

              <div>
                <Label>Review (Optional)</Label>
                <Textarea
                  value={data.reviewText}
                  onChange={(e) => setData({ ...data, reviewText: e.target.value })}
                  placeholder="Share your experience..."
                  maxLength={500}
                  className="mt-2"
                />
              </div>

              <div>
                <Label>Your Name</Label>
                <Input
                  value={data.raterName}
                  onChange={(e) => setData({ ...data, raterName: e.target.value })}
                  placeholder="Your full name"
                  className="mt-2"
                />
              </div>

              <div>
                <Label>Email</Label>
                <Input
                  type="email"
                  value={data.raterEmail}
                  onChange={(e) => setData({ ...data, raterEmail: e.target.value })}
                  placeholder="your@email.com"
                  className="mt-2"
                />
              </div>

              <Button onClick={handleRatingSubmit} disabled={loading} className="w-full">
                {loading ? "Submitting..." : "Submit Rating"}
              </Button>
            </div>
          )}

          {/* Step 3: Verify Email */}
          {step === 3 && (
            <div className="space-y-6 text-center">
              <Mail className="h-16 w-16 text-primary mx-auto" />
              <h2 className="text-2xl font-bold">Check Your Email</h2>
              <p className="text-muted-foreground">
                We've sent a 6-digit verification code to <strong>{data.raterEmail}</strong>
              </p>

              <div className="flex flex-col items-center gap-4">
                <Label>Enter Verification Code</Label>
                <InputOTP 
                  maxLength={6} 
                  value={verificationCode}
                  onChange={setVerificationCode}
                >
                  <InputOTPGroup>
                    <InputOTPSlot index={0} />
                    <InputOTPSlot index={1} />
                    <InputOTPSlot index={2} />
                    <InputOTPSlot index={3} />
                    <InputOTPSlot index={4} />
                    <InputOTPSlot index={5} />
                  </InputOTPGroup>
                </InputOTP>
              </div>

              <Button onClick={handleVerifyCode} disabled={loading || verificationCode.length !== 6} className="w-full">
                {loading ? "Verifying..." : "Verify Code"}
              </Button>

              <p className="text-xs text-muted-foreground">
                Code expires in 15 minutes. Didn't receive it? Check your spam folder.
              </p>
            </div>
          )}

          {/* Step 4: Success */}
          {step === 4 && (
            <div className="space-y-6 text-center">
              <CheckCircle className="h-16 w-16 text-green-500 mx-auto" />
              <h2 className="text-2xl font-bold">Rating Verified!</h2>
              <p className="text-muted-foreground">
                Thank you for rating {data.trainerName}. Your rating will help them in the challenge!
              </p>

              <div className="space-y-3">
                <Button onClick={() => navigate("/challenge")} variant="outline" className="w-full">
                  View Leaderboard
                </Button>
                <Button
                  onClick={() => {
                    navigator.clipboard.writeText(shareText);
                    toast.success("Share text copied!");
                  }}
                  className="w-full"
                >
                  <Share2 className="mr-2 h-4 w-4" />
                  Share on Social Media
                </Button>
              </div>
            </div>
          )}
        </Card>
      </div>
    </div>
  );
}