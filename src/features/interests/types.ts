/**
 * Types and constants for the interests / channel-follow feature.
 */

/** A YouTube channel entry in the curated recommended list. */
export interface RecommendedChannel {
  handle: string;
  displayName: string;
}

/**
 * Curated list of high-quality educational YouTube channels.
 * Used in the "Recommended for Study" section of manage-interests.
 */
export const RECOMMENDED_STUDY_CHANNELS: RecommendedChannel[] = [
  { handle: "3blue1brown", displayName: "3Blue1Brown" },
  { handle: "crashcourse", displayName: "CrashCourse" },
  { handle: "khanacademy", displayName: "Khan Academy" },
  { handle: "freecodecamp", displayName: "freeCodeCamp.org" },
  { handle: "teded", displayName: "TED-Ed" },
  { handle: "veritasium", displayName: "Veritasium" },
  { handle: "mit", displayName: "MIT OpenCourseWare" },
  { handle: "statquest", displayName: "StatQuest" },
  { handle: "numberphile", displayName: "Numberphile" },
  { handle: "computerphile", displayName: "Computerphile" },
];
