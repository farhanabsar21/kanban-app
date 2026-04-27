import { createBrowserRouter } from "react-router-dom";
import { HomePage } from "../pages/home-page";
import { LoginPage } from "../pages/login-page";
import { RegisterPage } from "../pages/register-page";
import { BoardPage } from "../pages/board-page";

export const router = createBrowserRouter([
  { path: "/", element: <HomePage /> },
  { path: "/login", element: <LoginPage /> },
  { path: "/register", element: <RegisterPage /> },
  { path: "/boards/:boardId", element: <BoardPage /> },
]);
