import { navigate } from "@utils/router.js";
import styles from "./styles/main.module.css";
import { authenticate, verifyToken } from "@utils/apimanager.js";
import logger from "@utils/logger.js";


export default function () {
  verifyToken(localStorage.getItem("authToken")).then(valid => {
    if (valid) navigate("menu");
  });

  const listener = () => {
    const loginForm = document.getElementById("login-form");
    const createAccountBtn = document.getElementById("create-account-btn");
    const errorMessage = document.getElementById("error-message");

    if (loginForm) {
      loginForm.addEventListener("submit", async (e) => {
        e.preventDefault();
        const email = document.getElementById("email").value;
        const password = document.getElementById("password").value;
        
        try {
          const response = await authenticate(email, password);
          if (response && response.token) {
            // Store token and user info in localStorage
            localStorage.setItem('authToken', response.token);
            localStorage.setItem('userEmail', response.user.email);
            localStorage.setItem('username', response.user.name);
            localStorage.setItem('userID', response.user.id);

            // Log successful login
            logger.debug("Login successful", { email: response.user.email });
            
            navigate("join-game");
          } else {
            errorMessage.textContent = "Invalid email or password";
            errorMessage.style.display = "block";
          }
        } catch (error) {
          logger.error("Login failed", error);
          errorMessage.textContent = error.message || "Login failed. Please try again.";
          errorMessage.style.display = "block";
        }
      });
    }

    if (createAccountBtn) {
      createAccountBtn.addEventListener("click", () =>
        navigate("create-account")
      );
    }
  };

  return [
    listener,
    `
    <section class="${styles.screen} ${styles.loginScreen}">
      <div class="${styles.loginContainer}">
        <h1>Login</h1>

        <form id="login-form" class="${styles.loginForm}">
          <div id="error-message" class="${styles.errorMessage}" style="display: none;"></div>
          
          <section class="${styles.credentialsSection}">
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
                placeholder="Enter your password"
              />
            </div>
          </section>

          <button type="submit" id="login-btn" class="${styles.loginButton}">
            Login
          </button>
        </form>

        <div class="${styles.divider}">
          <span>or</span>
        </div>

        <button id="create-account-btn" class="${styles.createAccountButton}">
          Create New Account
        </button>
      </div>
    </section>
  `,
  ];
}