"use client";

import "./Navbar.css";
import insight from "../../assets/insight_mini.png";
import Image from "next/image";
import Link from "next/link";
import { useEffect } from "react";

const Navbar = () => {
  let doctor = false;

  const storedUser = localStorage.getItem("user");
  if (storedUser) {
    const user = JSON.parse(storedUser);
    doctor = user.type === "doctor";
  }

  return (
    <nav className="navbar">
      <div className="left-side">
        <Link href="/transcription">Transcription</Link>
        {/* <Link href="/history">History</Link> */}
        {!doctor && <Link href="/statistics">Models Statistcs</Link>}
      </div>
      <div className="right-side">
        <Image src={insight} alt="insight logo" />
      </div>
    </nav>
  );
};

export default Navbar;
