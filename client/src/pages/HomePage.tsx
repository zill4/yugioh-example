import React from "react";
import Layout from "../components/Layout";

const HomePage = () => {
  return (
    <Layout header="LOADING CARD SHOP">
      <div className="border border-slate-700 p-8">
        <div className="flex items-center justify-center py-16">
          <div className="text-center">
            <div className="text-slate-300 text-sm mb-6 tracking-widest">
              Please wait while we prepare your experience
            </div>
            <div className="w-full max-w-3xl mx-auto aspect-video bg-black border border-slate-700 flex items-center justify-center">
              <div className="text-6xl">⚪</div>
            </div>
            <div className="mt-6 text-[10px] tracking-widest text-slate-400">
              {"#".repeat(60)}
            </div>
          </div>
        </div>
      </div>
    </Layout>
  );
};

export default HomePage;
