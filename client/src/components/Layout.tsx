import React from "react";
import { Link, NavLink } from "react-router-dom";
import { useAuth } from "../contexts/UserContext";
import { getXRProps, getXRInteractiveProps, getXRBackgroundStyles } from "../utils/xr";

interface LayoutProps {
  header?: string;
  children?: React.ReactNode;
}

const Layout: React.FC<LayoutProps> = ({ header, children }) => {
  const { isAuthenticated, user, logout } = useAuth();

  return (
    <div
      {...getXRProps("min-h-screen text-slate-100 flex")}
      style={getXRBackgroundStyles()}
    >
      {/* Left Navigation */}
      <aside
        {...getXRProps("w-32 shrink-0 border-r border-slate-700 p-8")}
        style={getXRBackgroundStyles()}
      >
        <div className="space-y-6 select-none">
          <NavLink
            to="/cardshop"
            {...getXRInteractiveProps("")}
            className={({ isActive }) =>
              `block text-xl leading-tight tracking-wider font-extrabold no-underline cursor-pointer ${
                isActive ? "text-red-500" : "text-slate-300 hover:text-white"
              }`
            }
          >
            CARD SHOP
          </NavLink>
          <NavLink
            to="/deckbuilder"
            {...getXRInteractiveProps("")}
            className={({ isActive }) =>
              `block text-xl leading-tight tracking-wider font-extrabold no-underline cursor-pointer ${
                isActive ? "text-red-500" : "text-slate-300 hover:text-white"
              }`
            }
          >
            DECK BUILDER
          </NavLink>
          <NavLink
            to="/game"
            {...getXRInteractiveProps("")}
            className={({ isActive }) =>
              `block text-xl leading-tight tracking-wider font-extrabold no-underline cursor-pointer ${
                isActive ? "text-red-500" : "text-slate-300 hover:text-white"
              }`
            }
          >
            PLAY
          </NavLink>
        </div>
      </aside>

      {/* Main */}
      <div className="flex-1 flex flex-col">
        {/* Top Right Auth */}
        <div className="flex items-center justify-end p-6">
          {isAuthenticated && user ? (
            <div className="flex items-center gap-4 text-sm">
              <span className="text-slate-400">{user.profile.displayName}</span>
              <button
                onClick={logout}
                {...getXRInteractiveProps("px-3 py-1 border border-slate-700 text-slate-200 hover:bg-slate-900")}
                style={getXRBackgroundStyles()}
              >
                LOGOUT
              </button>
            </div>
          ) : (
            <Link
              to="/auth"
              {...getXRInteractiveProps("text-slate-200 hover:text-white tracking-wider")}
            >
              SIGN-UP / LOGIN
            </Link>
          )}
        </div>

        {/* Content */}
        <main className="flex-1 px-8 pb-12">
          {header && (
            <div className="mb-4 text-sm tracking-widest text-slate-400">
              {header}
            </div>
          )}
          {children}
        </main>
      </div>
    </div>
  );
};

export default Layout;
