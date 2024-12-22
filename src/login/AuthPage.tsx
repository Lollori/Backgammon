import { useState } from "react";
import Login from "./login";
import Register from "./registrazione";

const AuthPage = () => {
  const [isLogin, setIsLogin] = useState(true); // inizialmente mostra login

  // Funzioni per fare lo switch
  const switchToRegister = () => setIsLogin(false);
  const switchToLogin = () => setIsLogin(true);

  return (
    <div className="auth-page">
      {isLogin ? (
        <Login switchToRegister={switchToRegister} />
      ) : (
        <Register switchToLogin={switchToLogin} />
      )}
    </div>
  );
};

export default AuthPage;
