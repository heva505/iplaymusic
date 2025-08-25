"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { m as motion } from "framer-motion";
import Icons from "@/utils/icons";

const LINKS = [
  { href: "/albums", Icon: Icons.pulse, size: 25 },
  { href: "/playlists", Icon: Icons.microphone, size: 25 },
  {
    href: "/",
    Icon: Icons.events,
    size: 30,
    emphasize: true,
  },
  { href: "/theme", Icon: Icons.playlist, size: 25 },
  { href: "/categories", Icon: Icons.settings, size: 25 },
];

const isActivePath = (pathname, href) => {
  if (pathname === href) return true;
  if (!href.endsWith("/")) href += "/";
  return pathname.startsWith(href);
};

export default function Dock() {
  const pathname = usePathname();

  return (
    <nav className='dock' aria-label='Bottom navigation'>
      <ul className='dock__list'>
        {LINKS.map(({ href, label, Icon, size, emphasize }) => {
          const active = isActivePath(pathname, href);
          return (
            <li
              key={href}
              className='dock__item'
              data-emphasize={emphasize || undefined}
              data-active={active || undefined}
            >
              <Link
                href={href}
                className='dock__link'
                aria-current={active ? "page" : undefined}
                prefetch
              >
                {active && (
                  <motion.span
                    layoutId='dock-active'
                    className='dock__active'
                    transition={{
                      type: "spring",
                      stiffness: 500,
                      damping: 40,
                      mass: 0.4,
                    }}
                  />
                )}

                <span className='dock__icon' aria-hidden='true'>
                  <Icon size={size} />
                </span>
              </Link>
            </li>
          );
        })}
      </ul>
    </nav>
  );
}
