import { createBrowserRouter } from "react-router-dom";

import Login from "./features/auth/pages/Login.jsx";
import Register from "./features/auth/pages/Register.jsx";
import Protected from "./features/auth/components/Protected.jsx";
import FaceExpression from "./features/Expressions/components/FaceExpression.jsx";

const router = createBrowserRouter([
  {
    path: "/",
    element: (
      <Protected>
        <FaceExpression />
      </Protected>
    ),
  },
  {
    path: "/login",
    element: <Login />,
  },
  {
    path: "/register",
    element: <Register />,
  },
]);

export default router;
