import { useState, useEffect } from "react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Play, Pause, RotateCcw } from "lucide-react";

type Props = {
  open: boolean;
  onOpenChange: (open: boolean) => void;
};

export function RestTimer({ open, onOpenChange }: Props) {
  const [duration, setDuration] = useState(90); // seconds
  const [timeLeft, setTimeLeft] = useState(90);
  const [isRunning, setIsRunning] = useState(false);

  useEffect(() => {
    let interval: NodeJS.Timeout;

    if (isRunning && timeLeft > 0) {
      interval = setInterval(() => {
        setTimeLeft((prev) => {
          if (prev <= 1) {
            setIsRunning(false);
            // Play sound or notification
            return 0;
          }
          return prev - 1;
        });
      }, 1000);
    }

    return () => clearInterval(interval);
  }, [isRunning, timeLeft]);

  const handleStart = () => {
    if (timeLeft === 0) {
      setTimeLeft(duration);
    }
    setIsRunning(true);
  };

  const handlePause = () => {
    setIsRunning(false);
  };

  const handleReset = () => {
    setIsRunning(false);
    setTimeLeft(duration);
  };

  const handleSetDuration = (seconds: number) => {
    setDuration(seconds);
    setTimeLeft(seconds);
    setIsRunning(false);
  };

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, "0")}`;
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>Rest Timer</DialogTitle>
        </DialogHeader>

        <div className="space-y-6">
          <div className="text-center">
            <div className="text-6xl font-bold mb-4">{formatTime(timeLeft)}</div>
            <div className="flex justify-center gap-2">
              {!isRunning ? (
                <Button onClick={handleStart} size="lg">
                  <Play className="h-5 w-5 mr-2" />
                  Start
                </Button>
              ) : (
                <Button onClick={handlePause} size="lg" variant="outline">
                  <Pause className="h-5 w-5 mr-2" />
                  Pause
                </Button>
              )}
              <Button onClick={handleReset} size="lg" variant="outline">
                <RotateCcw className="h-5 w-5" />
              </Button>
            </div>
          </div>

          <div className="space-y-2">
            <label className="text-sm font-medium">Quick Set</label>
            <div className="grid grid-cols-4 gap-2">
              {[30, 60, 90, 120].map((seconds) => (
                <Button
                  key={seconds}
                  variant="outline"
                  onClick={() => handleSetDuration(seconds)}
                  className={duration === seconds ? "border-primary" : ""}
                >
                  {seconds < 60 ? `${seconds}s` : `${seconds / 60}m`}
                </Button>
              ))}
            </div>
          </div>

          <div className="space-y-2">
            <label className="text-sm font-medium">Custom Duration (seconds)</label>
            <Input
              type="number"
              value={duration}
              onChange={(e) => handleSetDuration(parseInt(e.target.value) || 0)}
              placeholder="Enter seconds"
            />
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
