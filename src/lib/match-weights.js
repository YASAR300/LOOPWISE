/**
 * Matching Algorithm Weights Configuration
 * All component weights sum to 100 points for a clean 0-100 score.
 * Admin-tunable and explainable in match breakdown bars.
 */
export const DEFAULT_MATCH_WEIGHTS = {
  skillCoverage: 30, // Direct overlap of required & preferred skills + skill levels
  specializationAlignment: 15, // Alignment with workflow category / agent architecture
  budgetFit: 15, // Hourly or retainer rate within client's budget band
  availabilityFit: 10, // Weekly hours available vs. required hours
  timezoneOverlap: 10, // Working hours overlap based on declared timezones
  industryRelevance: 10, // Case studies or past projects in client's industry
  ratingAndVerification: 5, // Platform rating score (1-5) + verified assessment badges
  responseTimeHistory: 5, // Historical responsiveness to briefs & invitations
};

export function getMatchWeights() {
  // In future prompts, this can read from DB or FeatureFlag; defaults to static baseline
  return { ...DEFAULT_MATCH_WEIGHTS };
}
