import { create } from "zustand";

import { defaultInterview } from "@/config/interviews";
import type { InterviewAnswer, InterviewConfig, InterviewStatus } from "@/types/interview";
import type { VisionMetrics } from "@/types/vision";

function stopMediaStream(stream?: MediaStream) {
  stream?.getTracks().forEach((track) => track.stop());
}

interface InterviewStore {
  config: InterviewConfig;
  status: InterviewStatus;
  currentQuestionIndex: number;
  answers: InterviewAnswer[];
  startedAt?: number;
  finishedAt?: number;
  mediaStream?: MediaStream;
  visionMetrics?: VisionMetrics;
  selectInterview: (config: InterviewConfig) => void;
  setStatus: (status: InterviewStatus) => void;
  beginInterview: () => void;
  setMediaStream: (stream: MediaStream) => void;
  clearMediaStream: () => void;
  setVisionMetrics: (metrics: VisionMetrics) => void;
  addAnswer: (answer: InterviewAnswer) => void;
  finishInterview: () => void;
  reset: () => void;
}

export const useInterviewStore = create<InterviewStore>((set) => ({
  config: defaultInterview,
  status: "SETUP",
  currentQuestionIndex: 0,
  answers: [],
  selectInterview: (config) =>
    set((state) => {
      stopMediaStream(state.mediaStream);
      return { config, status: "SETUP", currentQuestionIndex: 0, answers: [], mediaStream: undefined, visionMetrics: undefined };
    }),
  setStatus: (status) => set({ status }),
  beginInterview: () =>
    set({
      status: "ASKING",
      currentQuestionIndex: 0,
      answers: [],
      startedAt: Date.now(),
      finishedAt: undefined,
      visionMetrics: undefined,
    }),
  setMediaStream: (mediaStream) => set({ mediaStream }),
  clearMediaStream: () =>
    set((state) => {
      stopMediaStream(state.mediaStream);
      return { mediaStream: undefined };
    }),
  setVisionMetrics: (visionMetrics) => set({ visionMetrics }),
  addAnswer: (answer) =>
    set((state) => ({
      answers: [...state.answers, answer],
      currentQuestionIndex: state.currentQuestionIndex + 1,
      status: "ASKING",
    })),
  finishInterview: () => set({ status: "FINISHED", finishedAt: Date.now() }),
  reset: () =>
    set((state) => {
      stopMediaStream(state.mediaStream);
      return {
        config: defaultInterview,
        status: "SETUP",
        currentQuestionIndex: 0,
        answers: [],
        startedAt: undefined,
        finishedAt: undefined,
        mediaStream: undefined,
        visionMetrics: undefined,
      };
    }),
}));
