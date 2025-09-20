import React from "react";
import { getXRPropsSimple } from "../utils/xr";
import CardShop from "../components/CardShop";
import Layout from "../components/Layout";

const CardshopPage = () => {
  return (
    <Layout header="CARD SHOP">
      <div {...getXRPropsSimple()}>
        <CardShop />
      </div>
    </Layout>
  );
};

export default CardshopPage;
