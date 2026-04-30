import React, { useState } from "react";
import "../syles/login.scss";
import FormGroup from "../components/FormGroup";
import { Link } from "react-router";
import { useAuth } from "../hooks/useAuth";
import { useNavigate } from "react-router";

const Login = () => {
  const { loading, handleLogin } = useAuth();

  const navigate = useNavigate();

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");

  async function handleSubmit(e) {
    e.preventDefault();

    await handleLogin({ email, password });
    navigate("/");
    console.log("done");
  }

  return (
    <main className="login-page">
      <div className="form-container">
        <h1>Login</h1>
        <form onSubmit={handleSubmit}>
          <FormGroup
            label="Email"
            value={email}
            onChange={(e) => {
              setEmail(e.target.value);
            }}
            placeholder="Enter your email"
          />
          <FormGroup
            label="password"
            value={password}
            onChange={(e) => {
              setPassword(e.target.value);
            }}
            placeholder=""
            Enter
            Your
            Password
          />
          <button type="submit">Login</button>
        </form>
      </div>
    </main>
  );
};

export default Login;
