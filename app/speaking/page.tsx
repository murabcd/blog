import { SpeakingEvents } from "@/components/events";

export const metadata = {
  title: "Speaking",
  description: "Speaking engagements and events.",
};

export default function Page() {
  return (
    <section>
      <h1 className="font-semibold text-2xl mb-8 tracking-tighter">Speaking</h1>
      <SpeakingEvents />
    </section>
  );
}
