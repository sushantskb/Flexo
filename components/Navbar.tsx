import { BsBell, BsChevronDown, BsSearch } from "react-icons/bs";
import MobileMenu from "./MobileMenu";
import { useCallback, useEffect, useState } from "react";
import AccountMenu from "./AccountMenu";
import { useSelectionStore } from "@/zustand/useSelectStore";
import Link from "next/link";
import { useRouter } from "next/router";

const TOP_OFFSET = 66;

const NAV_ITEMS = [
  { label: "Home", href: "/" },
  { label: "Movies", href: "/movies" },
  { label: "TV Shows", href: "/series" },
  { label: "Anime", href: "/anime" },
];

const Navbar = () => {
  const [showMobile, setShowMobile] = useState(false);
  const [showAccount, setShowAccount] = useState(false);
  const [showBackground, setShowBackground] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const router = useRouter();

  // Keep input in sync with the URL when landing on /search directly
  useEffect(() => {
    if (router.pathname === "/search" && typeof router.query.q === "string") {
      setSearchQuery(router.query.q);
    }
  }, [router.pathname, router.query.q]);

  const toggleMobileMenu = useCallback(() => {
    setShowMobile((current) => !current);
  }, []);

  const toggleAccountMenu = useCallback(() => {
    setShowAccount((current) => !current);
  }, []);

  const handleSearchChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;
    setSearchQuery(value);
    router.push(
      { pathname: "/search", query: { q: value } },
      undefined,
      { shallow: true }
    );
  };

  useEffect(() => {
    const handleScroll = () => {
      setShowBackground(window.scrollY >= TOP_OFFSET);
    };
    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  const { profile, user } = useSelectionStore();

  const isActive = (href: string) =>
    href === "/" ? router.pathname === "/" : router.pathname.startsWith(href);

  return (
    <nav className="w-full fixed top-0 z-40">
      <div
        className={`px-4 md:px-8 flex items-center gap-6 h-20 transition-all duration-500 ${
          showBackground
            ? "bg-black/80 backdrop-blur-xl border-b border-white/5"
            : "bg-gradient-to-b from-black/80 to-transparent"
        }`}
      >
        {/* LEFT: Logo + desktop nav */}
        <div className="flex items-center gap-10">
          <Link href="/">
            <img
              src="/logo.png"
              alt="Flixo"
              className="h-12 md:h-14 w-auto object-contain cursor-pointer"
            />
          </Link>

          <div className="hidden lg:flex items-center gap-8">
            {NAV_ITEMS.map((item) => (
              <Link key={item.label} href={item.href}>
                <div className="relative py-1 group">
                  <span
                    className={`text-[15px] font-medium transition ${
                      isActive(item.href)
                        ? "text-white"
                        : "text-neutral-400 hover:text-white"
                    }`}
                  >
                    {item.label}
                  </span>
                  <span
                    className={`absolute -bottom-1 left-0 h-0.5 rounded-full bg-gradient-to-r from-fuchsia-500 to-pink-500 transition-all duration-300 ${
                      isActive(item.href) ? "w-full" : "w-0 group-hover:w-full"
                    }`}
                  />
                </div>
              </Link>
            ))}
          </div>

          {/* Mobile browse toggle */}
          <div className="lg:hidden flex items-center">
            <div
              onClick={toggleMobileMenu}
              className="flex items-center cursor-pointer gap-1 relative"
            >
              <p className="text-white text-sm">Browse</p>
              <BsChevronDown
                className={`text-white transition ${showMobile ? "rotate-180" : ""}`}
              />
              <MobileMenu visible={showMobile} />
            </div>
          </div>
        </div>

        {/* RIGHT: search + bell + avatar */}
        <div className="flex items-center gap-4 md:gap-6 ml-auto">
          {/* Search pill */}
          <div className="hidden sm:flex items-center gap-2 bg-white/5 border border-white/10 rounded-full px-4 py-2.5 w-44 md:w-72 focus-within:border-white/25 focus-within:bg-white/10 transition">
            <input
              type="text"
              value={searchQuery}
              onChange={handleSearchChange}
              placeholder="Search..."
              className="bg-transparent text-white text-sm focus:outline-none w-full placeholder-neutral-500"
            />
            <BsSearch className="text-neutral-400 text-base shrink-0" />
          </div>

          {/* Mobile search icon */}
          <Link href="/search" className="sm:hidden text-neutral-200">
            <BsSearch className="text-lg" />
          </Link>

          <button className="text-neutral-300 hover:text-white transition">
            <BsBell className="text-xl" />
          </button>

          <div
            onClick={toggleAccountMenu}
            className="flex items-center gap-2 cursor-pointer relative"
          >
            <div className="w-9 h-9 rounded-full overflow-hidden ring-2 ring-white/10 hover:ring-fuchsia-500/50 transition">
              <img
                className="w-full h-full object-cover"
                src={user?.image || profile?.image || "/images/default-avatar.png"}
                alt="avatar"
              />
            </div>
            <AccountMenu visible={showAccount} />
          </div>
        </div>
      </div>
    </nav>
  );
};

export default Navbar;
