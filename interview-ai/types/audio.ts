export interface AudioMetrics {
  averageVolume: number;
  peakVolume: number;
  speakingDurationMs: number;
  silenceDurationMs: number;
  longPauseCount: number;
}

export interface PauseMetrics {
  totalPauses: number;
  longPauses: number;
  averagePauseMs: number;
  longestPauseMs: number;
}
