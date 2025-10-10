import styled from 'styled-components';

const InputContainer = styled.div`
  margin-bottom: 1.5rem;
`;

const Label = styled.label`
  display: block;
  color: #e0e0e0;
  font-size: 0.9rem;
  font-weight: 500;
  margin-bottom: 0.5rem;
`;

const InputWrapper = styled.div`
  position: relative;
`;

const StyledInput = styled.input`
  width: 100%;
  padding: 0.75rem 1rem;
  background-color: #0f3460;
  border: 2px solid #0f3460;
  border-radius: 0.5rem;
  color: white;
  font-size: 1rem;
  transition: all 0.3s ease;
  outline: none;

  &::placeholder {
    color: #a0a0a0;
  }

  &:focus {
    border-color: #1677ff;
    box-shadow: 0 0 0 3px rgba(22, 119, 255, 0.2);
    background-color: #1a1a2e;
  }

  &:hover {
    border-color: #1677ff;
  }
`;

const ForgotPasswordLink = styled.a`
  position: absolute;
  right: 1rem;
  top: 50%;
  transform: translateY(-50%);
  color: #1677ff;
  text-decoration: none;
  font-size: 0.8rem;
  transition: color 0.3s ease;

  &:hover {
    color: #0056cc;
    text-decoration: underline;
  }
`;

const Input = ({ label, type, name, value, onChange, placeholder, showForgotPassword }) => {
  return (
    <InputContainer>
      <Label htmlFor={name}>{label}</Label>
      <InputWrapper>
        <StyledInput
          id={name}
          type={type}
          name={name}
          value={value}
          onChange={onChange}
          placeholder={placeholder}
        />
        {showForgotPassword && (
          <ForgotPasswordLink href="/forgot-password">
            ¿Olvidaste tu contraseña?
          </ForgotPasswordLink>
        )}
      </InputWrapper>
    </InputContainer>
  );
};

export default Input;
