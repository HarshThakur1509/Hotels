import { useForm } from "react-hook-form";
import * as yup from "yup";
import { yupResolver } from "@hookform/resolvers/yup";
import { Link } from "react-router-dom";
import axios from "axios";

export const Register = () => {
  const schema = yup.object().shape({
    name: yup.string().required("Name required"),
    email: yup.string().email("Invalid email").required("Email required"),
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
    console.log("submitting");

    try {
      await axios.post("http://localhost:3000/users/signup", formdata, {
        withCredentials: true,
      });
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
        <h1 className="auth-title">Create Account</h1>
        <p className="auth-subtitle">Get started with us today</p>

        <form className="auth-form" onSubmit={handleSubmit(onSubmit)}>
          <div className="input-group">
            <label className="input-label">
              <input
                type="text"
                placeholder="Full name"
                {...register("name")}
                className={`input-field ${errors.name ? "input-error" : ""}`}
              />
            </label>
            {errors.name && (
              <p className="error-message">{errors.name.message}</p>
            )}
          </div>

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
            {isSubmitting ? "Creating account..." : "Sign Up"}
          </button>
        </form>

        <p className="auth-footer">
          Already have an account?{" "}
          <Link to="/login" className="auth-link">
            Sign in
          </Link>
        </p>
      </div>
    </div>
  );
};
