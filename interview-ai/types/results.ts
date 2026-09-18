import type { InterviewAnswer } from "@/types/interview";
import type { AudioMetrics, PauseMetrics } from "@/types/audio";
import type { VisionMetrics } from "@/types/vision";

export interface InterviewResult {
  interviewTitle: string;
  durationSeconds: number;
  audio: AudioMetrics & {
    wordsPerMinute: number;
    fillerCount: number;
    pauses: PauseMetrics;
  };
  video: VisionMetrics;
  answers: InterviewAnswer[];
  summary: string;
  recommendations: string[];
}
