import Link from "next/link";
import { SearchCommand } from "@/components/search-command";

const navItems = {
  "/": {
    name: "home",
  },
  "/blog": {
    name: "blog",
  },
  "/talk": {
    name: "talk",
  },
  "/code": {
    name: "code",
  },
};

export function Navbar() {
  return (
    <aside className="-ml-[8px] mb-16 tracking-tight">
      <div className="lg:sticky lg:top-20">
        <nav
          className="flex flex-row items-start justify-between relative px-2 md:px-0 pb-0 fade md:overflow-auto scroll-pr-6 md:relative mt-6"
          id="nav"
        >
          <div className="flex flex-row space-x-0">
            {Object.entries(navItems).map(([path, { name }]) => {
              return (
                <Link
                  key={path}
                  href={path}
                  className="transition-all hover:text-foreground flex align-middle relative py-1 m-1"
                >
                  {name}
                </Link>
              );
            })}
          </div>
          <SearchCommand />
        </nav>
      </div>
    </aside>
  );
}
