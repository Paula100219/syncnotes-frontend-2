import React from "react";
import { Link } from "react-router-dom";

export default function AuthForm({
  fields = [],
  buttonText = "Enviar",
  onSubmit,
  formData = {},
  onChange,
  showForgotPassword = false,
  linkText,
  linkTo,
  linkLabel
}) {
  return (
    <form className="ns-form" onSubmit={onSubmit}>
      {fields.map((f) => (
        <div key={f.name}>
          {f.label && (
            <label className="ns-label" htmlFor={f.name}>
              {f.label}
            </label>
          )}
          <input
            id={f.name}
            name={f.name}
            type={f.type || "text"}
            placeholder={f.placeholder || ""}
            value={formData[f.name] ?? ""}
            onChange={onChange}
            className="ns-input"
            autoComplete={
              f.name === "password"
                ? "current-password"
                : f.name === "username"
                ? "username"
                : undefined
            }
          />
        </div>
      ))}

      {showForgotPassword && (
        <div className="ns-links-row">
          <Link to="/forgot" className="ns-link">
            ¿Olvidaste tu contraseña?
          </Link>
        </div>
      )}

      <button type="submit" className="ns-button">
        {buttonText}
      </button>

      {linkText && linkLabel && linkTo && (
        <p className="ns-small" style={{ marginTop: ".6rem" }}>
          {linkText}{" "}
          <Link to={linkTo} className="ns-link">
            {linkLabel}
          </Link>
        </p>
      )}
    </form>
  );
}
