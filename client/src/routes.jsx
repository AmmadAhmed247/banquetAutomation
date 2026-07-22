import { createBrowserRouter } from "react-router-dom";
import RootLayout from "./layouts/RootLayout";
import DashboardPage from "./pages/DashboardPage";
import ContactsPage from "./pages/ContactsPage";
import CalendarPage from "./pages/CalendarPage";
import BookingsPage from "./pages/BookingsPage";
import SettingsPage from "./pages/SettingsPage";
import Recipt from "./components/Recipt";
import HomePage from "./pages/HomePage";
import LoginPage from "./pages/loginPage";
import Management from "./pages/Management";
const ComingSoon = ({ pageName }) => {
  return (
    <div className="flex items-center justify-center h-[80vh]">
      <div className="text-center">
        <h1 className="text-4xl font-bold mb-4">{pageName}</h1>
        <p className="text-gray-500 text-lg">Releasing Soon </p>
      </div>
    </div>
  );
};
export const router = createBrowserRouter([
  {
    path: "/",
    element: <HomePage />,
  },
  {
    path: "/login",
    element: <LoginPage />,
  },
  {
    path: "/dashboard",
    element: <RootLayout />, 
    children: [
      {
        index: true, 
        element: <DashboardPage />,
      },
      {
        path: "contacts",
        element: <ComingSoon pageName="Contacts Page" />,
      },
      {
        path: "recipt",
        element: <Recipt />,
      },
      {
        path: "calendar",
        element: <CalendarPage />,
      },
      {
        path: "bookings",
        element: <BookingsPage />,
      },
      {
        path: "settings",
        element: <ComingSoon pageName="Settings Page" />,
      },
      {
        path: "management",
        element: <Management />,
      },
    ],
  },
]);
