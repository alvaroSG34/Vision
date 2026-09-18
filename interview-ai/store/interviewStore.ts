import { create } from "zustand";

import { defaultInterview } from "@/config/interviews";
import type { InterviewAnswer, InterviewConfig, InterviewStatus } from "@/types/interview";

interface InterviewStore {
  config: InterviewConfig;
  status: InterviewStatus;
  currentQuestionIndex: number;
  answers: InterviewAnswer[];
  startedAt?: number;
  finishedAt?: number;
  selectInterview: (config: InterviewConfig) => void;
  setStatus: (status: InterviewStatus) => void;
  beginInterview: () => void;
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
    set({ config, status: "SETUP", currentQuestionIndex: 0, answers: [] }),
  setStatus: (status) => set({ status }),
  beginInterview: () =>
    set({
      status: "ASKING",
      currentQuestionIndex: 0,
      answers: [],
      startedAt: Date.now(),
      finishedAt: undefined,
    }),
  addAnswer: (answer) =>
    set((state) => ({
      answers: [...state.answers, answer],
      currentQuestionIndex: state.currentQuestionIndex + 1,
      status: "ASKING",
    })),
  finishInterview: () => set({ status: "FINISHED", finishedAt: Date.now() }),
  reset: () =>
    set({
      config: defaultInterview,
      status: "SETUP",
      currentQuestionIndex: 0,
      answers: [],
      startedAt: undefined,
      finishedAt: undefined,
    }),
}));
