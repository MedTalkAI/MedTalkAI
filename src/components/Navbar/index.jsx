"use client";

import "./Navbar.css";
import insight from "../../assets/insight_mini.png";
import Image from "next/image";
import Link from "next/link";

const Navbar = ({ path }) => {
  let isDoctor = false;
  let isDataScientist = false;
  let isIntern = false;

  const user_type =
    typeof window !== "undefined" && window.localStorage
      ? localStorage.getItem("user_type")
      : null;
  if (user_type) {
    isDoctor = user_type === "doctor";
    isDataScientist = user_type === "data_scientist";
    isIntern = user_type === "health_intern";
  }

  return (
    <nav className="navbar">
      <div className="left-side">
        <Image src={insight} alt="insight logo" />
        <h1>MedTalkAI</h1>
      </div>
      <div className="right-side">
        {isDoctor && (
          <>
            <Link
              href="/transcription"
              className={path === "/transcription" ? "selected" : ""}
            >
              Transcription
            </Link>
            <Link
              href="/my-anamnesis"
              className={path === "/my-anamnesis" ? "selected" : ""}
            >
              My Anamnesis
            </Link>
          </>
        )}
        {isDataScientist && (
          <>
            <Link
              href="/model-dashboard"
              className={path === "/model-dashboard" ? "selected" : ""}
            >
              Model Dashboard
            </Link>
            <Link
              href="/anamnesis"
              className={path === "/anamnesis" ? "selected" : ""}
            >
              Anamnesis
            </Link>
          </>
        )}
        {isIntern && (
          <>
            <Link
              href="/record-anamnesis"
              className={path === "/record-anamnesis" ? "selected" : ""}
            >
              Record Anamnesis
            </Link>
          </>
        )}
        <Link
          href="/my-profile"
          className={path === "/my-profile" ? "selected" : ""}
        >
          My Profile
        </Link>
      </div>
    </nav>
  );
};

export default Navbar;
