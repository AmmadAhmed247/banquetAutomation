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

export const router = createBrowserRouter([
  {
    path: "/",
    element: <RootLayout />,
    children: [
      {
        path: "/",
        element: <DashboardPage />,
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
        element: <ContactsPage />,
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
