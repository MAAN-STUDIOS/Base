import { navigate } from "@utils/router.js";
import styles from "./styles/main.module.css";
import { register } from "../core/utils/apimanager.js";
import logger from "@utils/logger.js";

export default function () {
  const listener = () => {
    const createAccountForm = document.getElementById("create-account-form");
    const backToLoginBtn = document.getElementById("back-to-login-btn");
    const errorMessage = document.getElementById("error-message");
    const successMessage = document.getElementById("success-message");

    if (createAccountForm) {
      createAccountForm.addEventListener("submit", async (e) => {
        e.preventDefault();
        const username = document.getElementById("username").value;
        const email = document.getElementById("email").value;
        const password = document.getElementById("password").value;
        const confirmPassword = document.getElementById("confirmPassword").value;

        // Check if passwords match
        if (password !== confirmPassword) {
          errorMessage.textContent = "Passwords do not match";
          errorMessage.style.display = "block";
          successMessage.style.display = "none";
          return;
        }

        try {
          const response = await register(username, email, password, "");
          if (response) {
            // Save token and user info in localStorage
            localStorage.setItem('authToken', response.token);
            localStorage.setItem('userEmail', email);
            localStorage.setItem('username', username);
            
            // Show success message
            successMessage.textContent = "Account created successfully! Redirecting to login...";
            successMessage.style.display = "block";
            errorMessage.style.display = "none";
            
            logger.debug("Account created successfully", { email });
            
            setTimeout(() => {
              navigate("login");
            }, 2000);
          } else {
            errorMessage.textContent = "Failed to create account. Please try again.";
            errorMessage.style.display = "block";
            successMessage.style.display = "none";
          }
        } catch (error) {
          logger.error("Registration failed", error);
          // Show the actual error message from the backend if available
          errorMessage.textContent = error.message || "Registration failed. Please try again.";
          errorMessage.style.display = "block";
          successMessage.style.display = "none";
        }
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
          <div id="error-message" class="${styles.errorMessage}" style="display: none;"></div>
          <div id="success-message" class="${styles.successMessage}" style="display: none;"></div>
          
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
                placeholder="Choose a password"
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

          <button type="submit"  id="create-account-btn" class="${styles.loginButton}">
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