import styles from "./home.module.css";

export default function Home() {
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
      </div>
      <div className={styles.login}>
        <h2>Login</h2>
        <form action="#" method="post" className={styles.form}>
          {/* Your login form fields go here */}
          <label htmlFor="username">Username:</label>
          <input type="text" id="username" name="username" required />

          <label htmlFor="password">Password:</label>
          <input type="password" id="password" name="password" required />

          <button type="submit">Login</button>
        </form>
      </div>
    </main>
  );
}
