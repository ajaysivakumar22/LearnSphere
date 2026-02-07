import { type ClassValue, clsx } from "clsx"
import { twMerge } from "tailwind-merge"

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

// Badge level calculator
export function getBadgeLevel(points: number): string {
  if (points >= 500) return 'Legend';
  if (points >= 350) return 'Master';
  if (points >= 250) return 'Expert';
  if (points >= 150) return 'Specialist';
  if (points >= 80) return 'Achiever';
  if (points >= 40) return 'Explorer';
  if (points >= 10) return 'Newbie';
  return 'Starter';
}

// Calculate quiz points based on attempt
export function calculateQuizPoints(
  attemptNumber: number,
  firstTry: number,
  secondTry: number,
  thirdTry: number
): number {
  if (attemptNumber === 1) return firstTry;
  if (attemptNumber === 2) return secondTry;
  if (attemptNumber === 3) return thirdTry;
  return 0;
}

// Format duration
export function formatDuration(minutes: number): string {
  const hours = Math.floor(minutes / 60);
  const mins = minutes % 60;
  
  if (hours > 0) {
    return `${hours}h ${mins}m`;
  }
  return `${mins}m`;
}

// Get course button text
export function getCourseButtonText(
  isLoggedIn: boolean,
  isEnrolled: boolean,
  isStarted: boolean,
  isCompleted: boolean,
  accessRule: string,
  price: number | null
): string {
  if (!isLoggedIn) return 'Join Course';
  if (accessRule === 'payment' && !isEnrolled) return `Buy Course (₹${price})`;
  if (isCompleted) return 'Completed';
  if (isStarted) return 'Continue';
  if (isEnrolled) return 'Start';
  return 'Enroll Now';
}
