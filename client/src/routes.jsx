import { createBrowserRouter } from "react-router-dom";
import RootLayout from "./layouts/RootLayout";
import DashboardPage from "./pages/DashboardPage";
import InboxPage from "./pages/InboxPage";
import AutoBotPage from "./pages/AutoBotPage";
import ContactsPage from "./pages/ContactsPage";
import CalendarPage from "./pages/CalendarPage";
import BookingsPage from "./pages/BookingsPage";
import GalleryPage from "./pages/GalleryPage";
import RemindersPage from "./pages/RemindersPage";
import SettingsPage from "./pages/SettingsPage";
import Gallery from "./pages/gallery";
import Recipt from "./components/Recipt";
import HomePage from "./pages/HomePage";
import LoginPage from "./pages/loginPage";
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
    path: "/login",
    element: <LoginPage />,
  },

  {

    path: "/",
    element: <RootLayout />,
    children: [
      {
        path: "/",
        element: <DashboardPage />,
      },
      {
        path: "/",
        element: <HomePage />,
      },
      // {
      //   path: "inbox",
      //   element: <InboxPage />,
      // },
      // {
      //   path: "autobot",
      //   element: <AutoBotPage />,
      // },
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
      // {
      //   path: "gallery",
      //   element: <GalleryPage />,
      // },
      // {
      //   path: "reminders",
      //   element: <RemindersPage />,
      // },
      {
        path: "settings",
        element: <SettingsPage />,
      },
      {
        path: "gallery-page",
        element: <Gallery />,
      },
    ],
  },
]);
