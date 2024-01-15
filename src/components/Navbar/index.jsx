"use client";

import "./Navbar.css";
import insight from "../../assets/insight_mini.png";
import Image from "next/image";
import Link from "next/link";

const Navbar = () => {
  const storedUser = localStorage.getItem("user");

  let showThirdLink = false;

  if (storedUser) {
    const user = JSON.parse(storedUser);
    showThirdLink = user.type !== "doctor";
  }
  return (
    <nav className="navbar">
      <div className="left-side">
        <Link href="/transcription">Transcription</Link>
        <Link href="/history">History</Link>
        {showThirdLink && <Link href="">Models Statistcs</Link>}
      </div>
      <div className="right-side">
        <Image src={insight} alt="insight logo" />
      </div>
    </nav>
  );
};

export default Navbar;
