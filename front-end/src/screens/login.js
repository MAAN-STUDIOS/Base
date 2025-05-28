import { navigate } from "@utils/router.js";
import styles from "./styles/main.module.css";

export default function () {
  const listener = () => {
    const loginForm = document.getElementById("login-form");
    const createAccountBtn = document.getElementById("create-account-btn");

    if (loginForm) {
      loginForm.addEventListener("submit", (e) => {
        e.preventDefault();
        const email = document.getElementById("email").value;
        const password = document.getElementById("password").value;
        
        // TODO: Add actual login logic here (database connection)
        console.log("Login attempt:", { email, password });
        navigate("play");
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
          <!-- new section grouping just the credentials -->
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
