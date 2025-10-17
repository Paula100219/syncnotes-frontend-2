import React from "react";
import { Link } from "react-router-dom";

export default function AuthForm(props) {
  const fields = props.fields || [];
  const buttonText = props.buttonText || "Enviar";
  const onSubmit = props.onSubmit;
  const formData = props.formData || {};
  const onChange = props.onChange;
  const showForgotPassword = !!props.showForgotPassword;
  const linkText = props.linkText;
  const linkTo = props.linkTo;
  const linkLabel = props.linkLabel;
  const errors = props.errors || {};

  return (
    <form className="ns-form" onSubmit={onSubmit} noValidate>
      {fields.map(function (f) {
        var id = f.name;
        var errMsg = errors[id];
        var descId = errMsg ? id + "-error" : undefined;

        return (
          <div key={id}>
            {f.label ? (
              <label className="ns-label" htmlFor={id}>
                {f.label}
              </label>
            ) : null}

            {errMsg ? (
              <div id={descId} className="ns-field-error">
                {errMsg}
              </div>
            ) : null}

            <input
              id={id}
              name={id}
              type={f.type || "text"}
              placeholder={f.placeholder || ""}
              value={formData[id] != null ? formData[id] : ""}
              onChange={onChange}
              className={"ns-input" + (errMsg ? " ns-input--err" : "")}
              aria-invalid={!!errMsg}
              aria-describedby={descId}
               autoComplete={
                 id === "password"
                   ? "current-password"
                   : id === "username"
                   ? "username"
                   : undefined
               }
            />
          </div>
        );
      })}

      {showForgotPassword ? (
        <div className="ns-links-row">
          <Link to="/forgot" className="ns-link">
            ¿Olvidaste tu contraseña?
          </Link>
        </div>
      ) : null}

      <button type="submit" className="ns-button">
        {buttonText}
      </button>

      {linkText && linkLabel && linkTo ? (
        <p className="ns-small" style={{ marginTop: ".6rem" }}>
          {linkText} <Link to={linkTo} className="ns-link">{linkLabel}</Link>
        </p>
      ) : null}
    </form>
  );
}