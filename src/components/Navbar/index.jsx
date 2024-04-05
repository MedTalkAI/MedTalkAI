import { useState, useEffect } from "react";
import Image from "next/image";
import Link from "next/link";
import insight from "../../assets/insight_mini.png";
import "./Navbar.css";

const Navbar = ({ path }) => {
  const [userType, setUserType] = useState(null);

  useEffect(() => {
    const userTypeFromStorage = localStorage.getItem("user_type");
    setUserType(userTypeFromStorage);
  }, []);

  return (
    <nav className="navbar">
      <div className="left-side">
        <Image src={insight} alt="insight logo" />
        <h1>MedTalkAI</h1>
      </div>
      <div className="right-side">
        {userType === "doctor" && (
          <>
            <Link
              href="/transcription"
              className={path === "/transcription" ? "selected" : ""}
            >
              <span>Transcription</span>
            </Link>
            <Link href="/my-anamnesis">
              <span className={path === "/my-anamnesis" ? "selected" : ""}>
                My Anamnesis
              </span>
            </Link>
          </>
        )}
        {userType === "data_scientist" && (
          <>
            <Link href="/dashboard">
              <span className={path === "/dashboard" ? "selected" : ""}>
                Model Dashboard
              </span>
            </Link>
            <Link href="/anamnesis">
              <span className={path === "/anamnesis" ? "selected" : ""}>
                Anamnesis
              </span>
            </Link>
          </>
        )}
        {userType === "intern" && (
          <>
            <Link href="/recording-anamnesis">
              <span
                className={path === "/recording-anamnesis" ? "selected" : ""}
              >
                Record Anamnesis
              </span>
            </Link>
            <Link href="/my-anamnesis">
              <span className={path === "/my-anamnesis" ? "selected" : ""}>
                My Anamnesis
              </span>
            </Link>
          </>
        )}

        <Link href="/my-profile">
          <span className={path === "/my-profile" ? "selected" : ""}>
            My Profile
          </span>
        </Link>
      </div>
    </nav>
  );
};

export default Navbar;
