import React from "react";
import { NavLink } from "react-router-dom";
import { isXREnvironment } from "../utils/xr";

interface LayoutProps {
  header?: string;
  children?: React.ReactNode;
}

const Layout: React.FC<LayoutProps> = ({ header, children }) => {
  return (
    <div className="layout-container min-h-screen text-slate-100 flex">
      {/* Left Navigation */}
      {!isXREnvironment() && (
        <aside className="layout-nav w-32 shrink-0 border-r border-slate-700 p-8">
          <div className="space-y-6 select-none">
            <NavLink
              to="/cardshop"
              className={`block text-xl leading-tight tracking-wider font-extrabold no-underline cursor-pointer transition-colors`}
            >
              CARD SHOP
            </NavLink>
            <NavLink
              to="/deckbuilder"
              className={`block text-xl leading-tight tracking-wider font-extrabold no-underline cursor-pointer transition-colors`}
            >
              DECK BUILDER
            </NavLink>
            <NavLink
              to="/cardcreator"
              className={`block text-xl leading-tight tracking-wider font-extrabold no-underline cursor-pointer transition-colors`}
            >
              CARD CREATOR
            </NavLink>
            <NavLink
              to="/game"
              className={`block text-xl leading-tight tracking-wider font-extrabold no-underline cursor-pointer transition-colors`}
            >
              PLAY
            </NavLink>
            <div className="pt-4 border-t border-slate-800">
              <NavLink
                to="/support"
                className={`block text-sm leading-tight tracking-wider font-bold no-underline cursor-pointer transition-colors text-slate-400 hover:text-slate-200`}
              >
                SUPPORT
              </NavLink>
            </div>
            <NavLink
              to="/privacy"
              className={`block text-sm leading-tight tracking-wider font-bold no-underline cursor-pointer transition-colors text-slate-400 hover:text-slate-200`}
            >
              PRIVACY
            </NavLink>
          </div>
        </aside>
      )}

      {/* Main Content Area */}
      <div className="flex-1 flex flex-col">
        {/* Content */}
        <main className="layout-main flex-1 px-8 pb-12">
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
