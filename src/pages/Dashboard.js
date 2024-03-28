import React, { useState } from "react";
import QRScanner from "./components/QRCodeScanner";
import Layout from "./components/Layout";

export default function Dashboard() {
  return (
    <div>
      <Layout>
        <QRScanner />
      </Layout>
    </div>
  );
}
