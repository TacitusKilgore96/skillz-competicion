import React from "react";
import HomepagePage from "./homepage/page";
import LoginPage from "./login/page";
import StationPage from "./station/page";


export default function Home() {
  return (
    <main className="h-screen w-screen overflow-clip">
        <HomepagePage />
        <LoginPage />
        <StationPage />
    </main>
  );
}
