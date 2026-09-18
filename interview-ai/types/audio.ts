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

export interface FillerWordItem {
  phrase: string;
  count: number;
}

export interface FillerWordResult {
  total: number;
  items: FillerWordItem[];
}
