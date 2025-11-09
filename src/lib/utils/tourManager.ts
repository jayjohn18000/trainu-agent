export type TourType = 'main' | 'ai-agent';

export function hasCompletedTour(tourType: TourType): boolean {
  const key = tourType === 'main' ? 'tourCompleted' : 'aiTourCompleted';
  return localStorage.getItem(key) === 'true';
}

export function markTourComplete(tourType: TourType): void {
  const key = tourType === 'main' ? 'tourCompleted' : 'aiTourCompleted';
  localStorage.setItem(key, 'true');
}

export function resetTour(tourType: TourType): void {
  const key = tourType === 'main' ? 'tourCompleted' : 'aiTourCompleted';
  localStorage.removeItem(key);
}

export function resetAllTours(): void {
  localStorage.removeItem('tourCompleted');
  localStorage.removeItem('aiTourCompleted');
}

export function shouldShowAiTour(): boolean {
  // Show AI tour if main tour is completed but AI tour is not
  return hasCompletedTour('main') && !hasCompletedTour('ai-agent');
}
