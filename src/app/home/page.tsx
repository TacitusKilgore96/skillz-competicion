import React from "react";
import Link from "next/link";

export default function HomepagePage() {
  return (
    <main className="min-h-screen ">
        <video className="w-full h-full object-cover  brightness-40" role={"presentation"} autoPlay= {true} muted={true} playsInline={true} loop= {true} src="https://skillsdenmark.dk/wp-content/uploads/Videoloop_15sec_-SkillsDenmark_med-sosu-web.mp4#t=0,15">
        </video>
        <img className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-1/3 h-auto" src="https://skillsdenmark.dk/wp-content/uploads/Skills-Denmark-logo-hvid.svg" alt="Logo" />
        <Link href="/login" className="absolute top-3/4 left-1/2 transform -translate-x-1/2 -translate-y-1/2 text-white border border-white py-2 px-4 rounded-md hover:bg-white hover:text-black transition duration-300 hover:scale-125">
          Log in
        </Link>
    </main>
  );
}