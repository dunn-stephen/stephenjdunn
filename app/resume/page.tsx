import type { Metadata } from "next";
import { ResumeView } from "@/components/resume/ResumeView";

export const metadata: Metadata = {
  title: "Resume",
  description: "Experience, technical strengths, and background for Stephen J. Dunn."
};

export default function ResumePage() {
  return <ResumeView />;
}
