"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";

import {
  Bot,
  CalendarDays,
  ChevronDown,
  CircleHelp,
  Home,
  ListTodo,
  Settings,
  Sparkles,
  Upload,
  Users,
  Video,
  WandSparkles,
} from "lucide-react";

const mainNavigation = [
  {
    label: "Home",
    icon: Home,
    href: "/",
  },
  {
    label: "Meetings",
    icon: Video,
    href: "/",
  },
  {
    label: "Ask MeetMind",
    icon: Sparkles,
    href: "/ask",
  },
  {
    label: "Action Items",
    icon: ListTodo,
    href: "/action-items",
    badge: "12",
  },
  
];

const workspaceNavigation = [
  {
    label: "Team Workspace",
    icon: Users,
    href: "/workspace",
  },
  {
    label: "Integrations",
    icon: CalendarDays,
    href: "/integrations",
  },
];

export function Sidebar() {
  const pathname = usePathname();

  function isActive(
    label: string,
    href: string,
  ) {
    if (label === "Meetings") {
      return (
        pathname === "/" ||
        pathname.startsWith("/meetings")
      );
    }

    return pathname === href;
  }

  return (
    <aside className="sidebar">
      <Link
        href="/"
        className="brand"
      >
        <div className="brand-mark">
          <WandSparkles size={22} />
        </div>

        <div>
          <div className="brand-name">
            MeetMind
            <span>AI</span>
          </div>

          <p>Meeting intelligence</p>
        </div>
      </Link>

      <Link
        href="/upload"
        className="new-meeting-button"
      >
        <Upload size={17} />

        <span>
          Upload meeting
        </span>
      </Link>

      <nav className="sidebar-navigation">
        <div className="navigation-group">
          <p className="navigation-label">
            Workspace
          </p>

          {mainNavigation.map(
            (item) => {
              const Icon = item.icon;

              const active =
                isActive(
                  item.label,
                  item.href,
                );

              return (
                <Link
                  href={item.href}
                  className={`navigation-item ${
                    active
                      ? "active"
                      : ""
                  }`}
                  key={item.label}
                >
                  <Icon size={18} />

                  <span>
                    {item.label}
                  </span>

                  {item.badge && (
                    <small>
                      {item.badge}
                    </small>
                  )}
                </Link>
              );
            },
          )}
        </div>

        <div className="navigation-group">
          <p className="navigation-label">
            Library
          </p>

          {workspaceNavigation.map(
            (item) => {
              const Icon = item.icon;

              return (
                <Link
                  href={item.href}
                  className={`navigation-item ${
                    pathname ===
                    item.href
                      ? "active"
                      : ""
                  }`}
                  key={item.label}
                >
                  <Icon size={18} />

                  <span>
                    {item.label}
                  </span>
                </Link>
              );
            },
          )}
        </div>
      </nav>

      <div className="sidebar-promo">
        <div className="promo-icon">
          <Bot size={20} />
        </div>

        <strong>
          Unlock AI insights
        </strong>

        <p>
          Generate summaries,
          decisions, and follow-up
          tasks automatically.
        </p>

        <Link href="/ask">
          Explore AI features
        </Link>
      </div>

      <div className="sidebar-footer">
        

        <Link
          href="/settings"
          className="navigation-item"
        >
          <Settings size={18} />

          <span>
            Settings
          </span>
        </Link>

        <button
          className="profile-card"
          type="button"
        >
          <div className="profile-avatar">
            KK
          </div>

          <div>
            <strong>
              Kushi Kumbar
            </strong>

            <span>
              Personal workspace
            </span>
          </div>

          <ChevronDown size={16} />
        </button>
      </div>
    </aside>
  );
}