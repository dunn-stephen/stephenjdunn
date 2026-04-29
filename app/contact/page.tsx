import type { Metadata } from "next";
import { ContactView } from "@/components/contact/ContactView";

export const metadata: Metadata = {
  title: "Contact",
  description: "How to contact Stephen J. Dunn and Apollo Labs."
};

export default function ContactPage() {
  return <ContactView />;
}
