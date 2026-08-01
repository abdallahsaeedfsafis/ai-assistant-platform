import { Routes, Route } from "react-router-dom";
import Sidebar from "./components/Sidebar";
import ChatPage from "./pages/ChatPage";
import AdminPage from "./pages/AdminPage";

export default function App() {
  return (
    <div className="bg-background text-on-background min-h-screen flex" dir="ltr">
      <Sidebar />
      <main className="flex-1 ml-0 md:ml-sidebar-width flex flex-col h-screen relative">
        <Routes>
          <Route path="/" element={<ChatPage />} />
          <Route path="/admin" element={<AdminPage />} />
        </Routes>
      </main>
    </div>
  );
}