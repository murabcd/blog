import Link from "next/link";

export const metadata = {
  title: "Code",
  description: "Check out some of the code I've worked on.",
};

export default function Page() {
  return (
    <section>
      <h1 className="font-semibold text-2xl mb-8 tracking-tighter">Code</h1>
      <ul className="space-y-4">
        <li>
          <Link
            href="https://github.com/murabcd/openchat"
            target="_blank"
            rel="noopener noreferrer"
            className="underline"
          >
            AI Chatbot
          </Link>
        </li>
        <li>
          <Link
            href="https://github.com/murabcd/voice-agent"
            target="_blank"
            rel="noopener noreferrer"
            className="underline"
          >
            Realtime AI Voice Agent
          </Link>
        </li>
        <li>
          <Link
            href="https://github.com/murabcd/forms-ai"
            target="_blank"
            rel="noopener noreferrer"
            className="underline"
          >
            Forms Builder with AI
          </Link>
        </li>
      </ul>
    </section>
  );
}
