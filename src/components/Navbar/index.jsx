"use client";

import "./Navbar.css";
import insight from "../../assets/insight_mini.png";
import Image from "next/image";

const Navbar = () => {
  return (
    <nav className="navbar">
      <div className="left-side">
        <button className="hamburger-button">&#9776;</button>
      </div>
      <div className="right-side">
        <Image src={insight} alt="insight logo" />
      </div>
    </nav>
  );
};

export default Navbar;
