import React from "react";
import CardShop from "../components/CardShop";
import Layout from "../components/Layout";

const CardshopPage = () => {
  return (
    <Layout header="CARD SHOP">
      <div className="border border-slate-700 p-8">
        <CardShop />
      </div>
    </Layout>
  );
};

export default CardshopPage;
