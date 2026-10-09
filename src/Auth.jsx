import { useEffect, useState } from "react";
import { supabase } from "./supabaseClient";

function Auth() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [isLogin, setIsLogin] = useState(true);
  const [isReset, setIsReset] = useState(false);
  const [isUpdatingPassword, setIsUpdatingPassword] = useState(false);
  const [message, setMessage] = useState("");

  useEffect(() => {
  const checkRecovery = async () => {
    const { data } = await supabase.auth.getSession();

    if (
      data.session &&
      (window.location.hash.includes("type=recovery") ||
        new URLSearchParams(window.location.search).get("type") === "recovery")
    ) {
      setIsUpdatingPassword(true);
      setIsReset(false);
      setIsLogin(false);
    }
  };

  checkRecovery();

  const {
    data: { subscription },
  } = supabase.auth.onAuthStateChange((event) => {
    if (event === "PASSWORD_RECOVERY") {
      setIsUpdatingPassword(true);
      setIsReset(false);
      setIsLogin(false);
    }
  });

  return () => subscription.unsubscribe();
}, []);

  const handleSubmit = async (event) => {
    event.preventDefault();
    setMessage("");

    if (isUpdatingPassword) {
      const { error } = await supabase.auth.updateUser({
        password,
      });

      if (error) {
        setMessage(error.message);
      } else {
        setMessage("Password updated successfully! You can now log in.");
        setPassword("");
        setIsUpdatingPassword(false);
        setIsLogin(true);
        window.history.replaceState({}, document.title, window.location.pathname);
      }

      return;
    }

    if (isReset) {
      const { error } = await supabase.auth.resetPasswordForEmail(email, {
        redirectTo: window.location.origin,
      });

      if (error) {
        setMessage(error.message);
      } else {
        setMessage("Password reset email sent! Please check your inbox.");
      }

      return;
    }

    if (isLogin) {
      const { error } = await supabase.auth.signInWithPassword({
        email,
        password,
      });

      if (error) {
        setMessage(error.message);
      } else {
        setMessage("Login successful!");
      }
    } else {
      const { error } = await supabase.auth.signUp({
        email,
        password,
      });

      if (error) {
        setMessage(error.message);
      } else {
        setMessage(
          "Account created! Please check your email to confirm your account."
        );
      }
    }
  };

  return (
    <div className="auth-box">
      <h2>
        {isUpdatingPassword
          ? "🌿 Set New Password"
          : isReset
          ? "🌿 Reset Password"
          : isLogin
          ? "🌿 Login"
          : "🌿 Create Your Account"}
      </h2>

      <p>
        {isUpdatingPassword
          ? "Enter your new password below."
          : isReset
          ? "Enter your email and we'll send you a password reset link."
          : isLogin
          ? "Login to share your nature photographs."
          : "Join the MyNatureLens community."}
      </p>

      <form onSubmit={handleSubmit}>
        {!isUpdatingPassword && (
          <label>
            Email
            <input
              type="email"
              value={email}
              onChange={(event) => setEmail(event.target.value)}
              placeholder="Enter your email"
              required
            />
          </label>
        )}

        {!isReset && (
          <label>
            {isUpdatingPassword ? "New Password" : "Password"}
            <input
              type="password"
              value={password}
              onChange={(event) => setPassword(event.target.value)}
              placeholder={
                isUpdatingPassword
                  ? "Enter your new password"
                  : "Enter your password"
              }
              minLength="6"
              required
            />
          </label>
        )}

        <button type="submit">
          {isUpdatingPassword
            ? "Update Password"
            : isReset
            ? "Send Reset Link"
            : isLogin
            ? "Login"
            : "Create Account"}
        </button>
      </form>

      {message && <p className="auth-message">{message}</p>}

      {!isUpdatingPassword && isLogin && (
        <button
          type="button"
          className="auth-switch"
          onClick={() => {
            setIsReset(true);
            setMessage("");
          }}
        >
          Forgot your password?
        </button>
      )}

      {!isUpdatingPassword && isReset && (
        <button
          type="button"
          className="auth-switch"
          onClick={() => {
            setIsReset(false);
            setMessage("");
          }}
        >
          Back to Login
        </button>
      )}

      {!isUpdatingPassword && !isReset && (
        <button
          type="button"
          className="auth-switch"
          onClick={() => {
            setIsLogin(!isLogin);
            setMessage("");
          }}
        >
          {isLogin
            ? "Don't have an account? Create one"
            : "Already have an account? Login"}
        </button>
      )}
    </div>
  );
}

export default Auth;