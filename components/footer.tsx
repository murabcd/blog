function ArrowIcon() {
  return (
    <svg
      width="10"
      height="10"
      viewBox="0 0 12 12"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
    >
      <path
        d="M2.07102 11.3494L0.963068 10.2415L9.2017 1.98864H2.83807L2.85227 0.454545H11.8438V9.46023H10.2955L10.3097 3.09659L2.07102 11.3494Z"
        fill="currentColor"
      />
    </svg>
  );
}

export default function Footer() {
  return (
    <footer className="mb-6">
      <ul className="font-sm mt-8 flex flex-row space-x-4 space-y-0 text-neutral-800 dark:text-neutral-200">
        <li>
          <a
            className="flex items-center transition-all hover:text-neutral-900 dark:hover:text-neutral-100"
            rel="noopener noreferrer"
            target="_blank"
            href="/api/rss"
          >
            <ArrowIcon />
            <p className="ml-2 h-7">rss</p>
          </a>
        </li>
        <li>
          <a
            className="flex items-center transition-all hover:text-neutral-900 dark:hover:text-neutral-100"
            rel="noopener noreferrer"
            target="_blank"
            href="https://x.com/murabcd"
          >
            <ArrowIcon />
            <p className="ml-2 h-7">x</p>
          </a>
        </li>
        <li>
          <a
            className="flex items-center transition-all hover:text-neutral-900 dark:hover:text-neutral-100"
            rel="noopener noreferrer"
            target="_blank"
            href="https://www.linkedin.com/in/murabcd/"
          >
            <ArrowIcon />
            <p className="ml-2 h-7">li</p>
          </a>
        </li>
        <li>
          <a
            className="flex items-center transition-all hover:text-neutral-900 dark:hover:text-neutral-100"
            rel="noopener noreferrer"
            target="_blank"
            href="https://github.com/murabcd"
          >
            <ArrowIcon />
            <p className="ml-2 h-7">git</p>
          </a>
        </li>
      </ul>
      <p className="mt-8 text-neutral-800 dark:text-neutral-200">
        © {new Date().getFullYear()} Murad Abdulkadyrov&apos;s blog
      </p>
    </footer>
  );
}
