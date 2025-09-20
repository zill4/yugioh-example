import React from "react";
import { Link, NavLink } from "react-router-dom";
import { useAuth } from "../contexts/UserContext";
import { getXRProps } from "../utils/xr";

interface LayoutProps {
  header?: string;
  children?: React.ReactNode;
}

const Layout: React.FC<LayoutProps> = ({ header, children }) => {
  const { isAuthenticated, user, logout } = useAuth();

  return (
    <div
      {...getXRProps()}
      className="min-h-screen bg-black text-slate-100 flex"
    >
      {/* Left Navigation */}
      <aside
        {...getXRProps()}
        className="w-56 shrink-0 border-r border-slate-700 p-8"
      >
        <div {...getXRProps()} className="space-y-6 select-none">
          <NavLink
            to="/cardshop"
            {...getXRProps()}
            className={({ isActive }) =>
              `block text-3xl leading-tight tracking-wider font-extrabold ${
                isActive ? "text-white" : "text-slate-300 hover:text-white"
              }`
            }
          >
            CARD SHOP
          </NavLink>
          <NavLink
            to="/deckbuilder"
            {...getXRProps()}
            className={({ isActive }) =>
              `block text-3xl leading-tight tracking-wider font-extrabold ${
                isActive ? "text-white" : "text-slate-300 hover:text-white"
              }`
            }
          >
            DECK BUILDER
          </NavLink>
          <NavLink
            to="/game"
            {...getXRProps()}
            className={({ isActive }) =>
              `block text-3xl leading-tight tracking-wider font-extrabold ${
                isActive ? "text-white" : "text-slate-300 hover:text-white"
              }`
            }
          >
            PLAY
          </NavLink>
        </div>
      </aside>

      {/* Main */}
      <div {...getXRProps()} className="flex-1 flex flex-col">
        {/* Top Right Auth */}
        <div {...getXRProps()} className="flex items-center justify-end p-6">
          {isAuthenticated && user ? (
            <div {...getXRProps()} className="flex items-center gap-4 text-sm">
              <span className="text-slate-400">{user.profile.displayName}</span>
              <button
                onClick={logout}
                {...getXRProps()}
                className="px-3 py-1 border border-slate-700 text-slate-200 hover:bg-slate-900"
              >
                LOGOUT
              </button>
            </div>
          ) : (
            <Link
              to="/auth"
              {...getXRProps()}
              className="text-slate-200 hover:text-white tracking-wider"
            >
              SIGN-UP / LOGIN
            </Link>
          )}
        </div>

        {/* Content */}
        <main {...getXRProps()} className="flex-1 px-8 pb-12">
          {header && (
            <div
              {...getXRProps()}
              className="mb-4 text-sm tracking-widest text-slate-400"
            >
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
