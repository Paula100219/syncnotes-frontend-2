import styled from 'styled-components';

const StyledButton = styled.button`
  width: 100%;
  padding: 0.75rem 1rem;
  background-color: #1677ff;
  color: white;
  border: 2px solid #1677ff;
  border-radius: 0.5rem;
  font-size: 1rem;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.3s ease;
  outline: none;

  &:hover {
    background-color: #0056cc;
    border-color: #0056cc;
    transform: translateY(-2px);
    box-shadow: 0 4px 12px rgba(22, 119, 255, 0.3);
  }

  &:active {
    transform: translateY(0);
    box-shadow: 0 2px 6px rgba(22, 119, 255, 0.3);
  }

  &:disabled {
    background-color: #666;
    border-color: #666;
    cursor: not-allowed;
    transform: none;
    box-shadow: none;
  }
`;

const Button = ({ type, text, onClick, disabled }) => {
  return (
    <StyledButton type={type} onClick={onClick} disabled={disabled}>
      {text}
    </StyledButton>
  );
};

export default Button;
