import { useForm } from "react-hook-form";
import * as yup from "yup";
import { yupResolver } from "@hookform/resolvers/yup";
import { Link } from "react-router-dom";
import axios from "axios";

export const Login = () => {
  const schema = yup.object().shape({
    email: yup.string().email("Invalid email").required("Email is required"),
    password: yup.string().min(4).max(20).required("Password is required"),
  });

  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm({
    resolver: yupResolver(schema),
  });

  const onSubmit = async (formdata) => {
    try {
      await axios.post("http://localhost:3000/users/login", formdata, {
        withCredentials: true,
      });
      const user = await axios.get("http://localhost:3000/users/me", {
        withCredentials: true,
      });

      localStorage.setItem("user", JSON.stringify(user.data));
      window.location.reload();
    } catch (err) {
      console.log(err);
    }
  };

  return (
    <div className="auth-container">
      <div className="auth-card">
        <h1 className="auth-title">Welcome Back</h1>
        <p className="auth-subtitle">Sign in to continue</p>

        <form className="auth-form" onSubmit={handleSubmit(onSubmit)}>
          <div className="input-group">
            <label className="input-label">
              <input
                type="email"
                placeholder="Email address"
                {...register("email")}
                className={`input-field ${errors.email ? "input-error" : ""}`}
              />
            </label>
            {errors.email && (
              <p className="error-message">{errors.email.message}</p>
            )}
          </div>

          <div className="input-group">
            <label className="input-label">
              <input
                type="password"
                placeholder="Password"
                {...register("password")}
                className={`input-field ${
                  errors.password ? "input-error" : ""
                }`}
              />
            </label>
            {errors.password && (
              <p className="error-message">{errors.password.message}</p>
            )}
          </div>

          <button className="auth-button" type="submit" disabled={isSubmitting}>
            {isSubmitting ? "Signing in..." : "Sign In"}
          </button>
        </form>

        <p className="auth-footer">
          {" "}
          <Link to="/register" className="auth-link">
            Create account
          </Link>
        </p>
      </div>
    </div>
  );
};
