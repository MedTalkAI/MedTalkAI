"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";
import Image from "next/image";
import styles from "./home.module.css";
import hapvida from "../assets/hapvida.png";
import insight from "../assets/insight.webp";
import data from "../data/db.json";

export default function Home() {
  const router = useRouter();

  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [isLoading, setIsLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsLoading(true);

    await new Promise((resolve) => setTimeout(resolve, 1000));

    const user = { username, password };
    const foundUser = data.users.find(
      (u) => u.username === user.username && u.password === user.password
    );
    if (foundUser) {
      localStorage.setItem(
        "user",
        JSON.stringify({
          name: foundUser.name,
          email: foundUser.email,
          type: foundUser.type,
        })
      );
      router.push("/Transcription");
    } else {
      // Login error
    }
    setIsLoading(false);
  };
  return (
    <main className={styles.container}>
      <div className={styles.description}>
        <p className={styles.subtitle}>Welcome to</p>
        <h1 className={styles.title}>MedTalk AI</h1>
        <p className={styles.text}>
          Introducing MedTalk AI, a tool designed to assist medical
          documentation for healthcare professionals. This solution leverages
          speech-to-text technology, allowing medical staff to effortlessly
          transcribe crucial patient information with accuracy and efficiency.
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
