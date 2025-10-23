import { useRef, useState } from 'react';
import type { TouchEvent } from 'react';

interface TouchGestureOptions {
  onSwipeLeft?: () => void;
  onSwipeRight?: () => void;
  onSwipeUp?: () => void;
  onSwipeDown?: () => void;
  threshold?: number;
  velocityThreshold?: number;
}

export function useTouchGestures(options: TouchGestureOptions) {
  const {
    onSwipeLeft,
    onSwipeRight,
    onSwipeUp,
    onSwipeDown,
    threshold = 50,
    velocityThreshold = 0.3,
  } = options;

  const touchStart = useRef<{ x: number; y: number; time: number } | null>(null);
  const [swiping, setSwiping] = useState(false);
  const [swipeDirection, setSwipeDirection] = useState<'left' | 'right' | 'up' | 'down' | null>(null);
  const [swipeProgress, setSwipeProgress] = useState(0);

  const handleTouchStart = (e: TouchEvent<HTMLElement>) => {
    const touch = e.touches[0];
    touchStart.current = {
      x: touch.clientX,
      y: touch.clientY,
      time: Date.now(),
    };
    setSwiping(false);
    setSwipeDirection(null);
    setSwipeProgress(0);
  };

  const handleTouchMove = (e: TouchEvent<HTMLElement>) => {
    if (!touchStart.current) return;

    const touch = e.touches[0];
    const deltaX = touch.clientX - touchStart.current.x;
    const deltaY = touch.clientY - touchStart.current.y;
    const absDeltaX = Math.abs(deltaX);
    const absDeltaY = Math.abs(deltaY);

    // Determine if this is a horizontal or vertical swipe
    if (absDeltaX > absDeltaY && absDeltaX > threshold / 2) {
      setSwiping(true);
      setSwipeDirection(deltaX > 0 ? 'right' : 'left');
      setSwipeProgress(Math.min(Math.abs(deltaX) / threshold, 1));
    } else if (absDeltaY > absDeltaX && absDeltaY > threshold / 2) {
      setSwiping(true);
      setSwipeDirection(deltaY > 0 ? 'down' : 'up');
      setSwipeProgress(Math.min(Math.abs(deltaY) / threshold, 1));
    }
  };

  const handleTouchEnd = (e: TouchEvent<HTMLElement>) => {
    if (!touchStart.current) return;

    const touch = e.changedTouches[0];
    const deltaX = touch.clientX - touchStart.current.x;
    const deltaY = touch.clientY - touchStart.current.y;
    const deltaTime = Date.now() - touchStart.current.time;
    
    const velocityX = Math.abs(deltaX) / deltaTime;
    const velocityY = Math.abs(deltaY) / deltaTime;
    
    const absDeltaX = Math.abs(deltaX);
    const absDeltaY = Math.abs(deltaY);

    // Check if swipe meets threshold requirements
    if (absDeltaX > absDeltaY) {
      // Horizontal swipe
      if (absDeltaX >= threshold && velocityX >= velocityThreshold) {
        if (deltaX > 0 && onSwipeRight) {
          onSwipeRight();
        } else if (deltaX < 0 && onSwipeLeft) {
          onSwipeLeft();
        }
      }
    } else {
      // Vertical swipe
      if (absDeltaY >= threshold && velocityY >= velocityThreshold) {
        if (deltaY > 0 && onSwipeDown) {
          onSwipeDown();
        } else if (deltaY < 0 && onSwipeUp) {
          onSwipeUp();
        }
      }
    }

    touchStart.current = null;
    setSwiping(false);
    setSwipeDirection(null);
    setSwipeProgress(0);
  };

  return {
    handlers: {
      onTouchStart: handleTouchStart,
      onTouchMove: handleTouchMove,
      onTouchEnd: handleTouchEnd,
    },
    swiping,
    swipeDirection,
    swipeProgress,
  };
}
