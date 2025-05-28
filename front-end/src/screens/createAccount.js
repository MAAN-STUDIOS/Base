import { navigate } from "@utils/router.js";
import styles from "./styles/main.module.css";

export default function () {
  const listener = () => {
    const createAccountForm = document.getElementById("create-account-form");
    const backToLoginBtn = document.getElementById("back-to-login-btn");

    if (createAccountForm) {
      createAccountForm.addEventListener("submit", (e) => {
        e.preventDefault();
        const username = document.getElementById("username").value;
        const email = document.getElementById("email").value;
        const password = document.getElementById("password").value;
        
        // TODO: Add actual account creation logic (check if password and confirm password match)
        console.log("Create account attempt:", { username, email, password });
        navigate("play");
      });
    }

    if (backToLoginBtn) {
      backToLoginBtn.addEventListener("click", () => navigate("login"));
    }
  };

  return [
    listener,
    `
    <section class="${styles.screen} ${styles.loginScreen}">
      <div class="${styles.loginContainer}">
        <h1>Create Account</h1>

        <form id="create-account-form" class="${styles.loginForm}">
          <section class="${styles.credentialsSection}">
            <div class="${styles.formGroup}">
              <label for="username">Username</label>
              <input 
                type="text" 
                id="username" 
                name="username" 
                required 
                placeholder="Choose a username"
              />
            </div>

            <div class="${styles.formGroup}">
              <label for="email">Email</label>
              <input 
                type="email" 
                id="email" 
                name="email" 
                required 
                placeholder="Enter your email"
              />
            </div>
            
            <div class="${styles.formGroup}">
              <label for="password">Password</label>
              <input 
                type="password" 
                id="password" 
                name="password" 
                required 
                placeholder="Create a password"
              />
            </div>

            <div class="${styles.formGroup}">
              <label for="confirmPassword">Confirm Password</label>
              <input 
                type="password" 
                id="confirmPassword" 
                name="confirmPassword" 
                required
                placeholder="Confirm your password"
              />
            </div>
          </section>
          <button type="submit" id="create-account-btn" class="${styles.loginButton}">
            Create Account
          </button>
        </form>

        <div class="${styles.divider}">
          <span>or</span>
        </div>

        <button id="back-to-login-btn" class="${styles.createAccountButton}">
          Back to Login
        </button>
      </div>
    </section>
  `,
  ];
} 