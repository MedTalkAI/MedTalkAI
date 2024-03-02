"use client";

import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import Image from "next/image";
import styles from "./home.module.css";
import hapvida from "../assets/hapvida.png";
import insight from "../assets/insight.webp";
import { jwtDecode } from "jwt-decode";

import { ToastContainer, toast } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";

export default function Home() {
  const router = useRouter();

  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [isLoading, setIsLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsLoading(true);

    const formData = new FormData();
    formData.append("username", username);
    formData.append("password", password);

    try {
      const response = await fetch("http://127.0.0.1:5000/auth/login", {
        method: "POST",
        body: formData,
      });

      if (response.ok) {
        const data = await response.json();
        if (typeof window !== "undefined" && window.localStorage)
          localStorage.setItem("access_token", data.access_token);
        console.log(data);

        const user = jwtDecode(data.access_token).sub;

        if (typeof window !== "undefined" && window.localStorage)
          localStorage.setItem("user", JSON.stringify(user));
        if (user.type == 0) {
          if (typeof window !== "undefined" && window.localStorage)
            localStorage.setItem("user_type", "doctor");
          router.push("/transcription");
        } else if (user.type == 1) {
          // router.push("/dashboard");
        } else if (user.type == 2) {
          // router.push("/record-anamnesis");
        }
      } else {
        toast.error("Invalid credentials! Please try again.");
      }
    } catch (error) {
      toast.error("unespected error: " + error.message);
    }

    setIsLoading(false);
  };

  return (
    <main className={styles.container}>
      <ToastContainer />
      <div className={styles.description}>
        <p className={styles.subtitle}>Welcome to</p>
        <h1 className={styles.title}>MedTalkAI</h1>
        <p className={styles.text}>
          Introducing MedTalkAI, a tool designed to assist medical documentation
          for healthcare professionals. This solution leverages speech-to-text
          technology, allowing medical staff to effortlessly transcribe crucial
          patient information with accuracy and efficiency.
        </p>
        <div className={styles.logos}>
          <Image src={hapvida} alt="hapvida logo" width={150} />
          <Image src={insight} alt="insight logo" width={150} />
        </div>
      </div>
      <div className={styles.login}>
        <form className={styles.form} onSubmit={handleSubmit}>
          <h2>Login</h2>
          <p>Sign in to access the plataform</p>
          <div className={styles.input}>
            <label htmlFor="username">Username:</label>
            <input
              type="text"
              id="username"
              name="username"
              onChange={(e) => setUsername(e.target.value)}
              required
            />
          </div>

          <div className={styles.input}>
            <label htmlFor="password">Password:</label>
            <input
              type="password"
              id="password"
              name="password"
              onChange={(e) => setPassword(e.target.value)}
              required
            />
          </div>
          <button type="submit" disabled={isLoading}>
            {isLoading && <span>Loging...</span>}
            {!isLoading && <span>Login</span>}
          </button>
        </form>
      </div>
    </main>
  );
}
