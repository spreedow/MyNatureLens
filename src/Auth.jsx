import { useState } from "react";
import { supabase } from "./supabaseClient";

function Auth() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [isLogin, setIsLogin] = useState(true);
  const [message, setMessage] = useState("");

  const handleSubmit = async (event) => {
    event.preventDefault();
    setMessage("");

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
      <h2>{isLogin ? "🌿 Login" : "🌿 Create Your Account"}</h2>

      <p>
        {isLogin
          ? "Login to share your nature photographs."
          : "Join the MyNatureLens community."}
      </p>

      <form onSubmit={handleSubmit}>
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

        <label>
          Password
          <input
            type="password"
            value={password}
            onChange={(event) => setPassword(event.target.value)}
            placeholder="Enter your password"
            minLength="6"
            required
          />
        </label>

        <button type="submit">
          {isLogin ? "Login" : "Create Account"}
        </button>
      </form>

      {message && <p className="auth-message">{message}</p>}

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
    </div>
  );
}

export default Auth;