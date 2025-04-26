import { TalksEvents } from "@/components/events";

export const metadata = {
  title: "Talk",
  description: "Talks and events.",
};

export default function Page() {
  return (
    <section>
      <h1 className="font-semibold text-2xl mb-8 tracking-tighter">Talk</h1>
      <TalksEvents />
    </section>
  );
}
