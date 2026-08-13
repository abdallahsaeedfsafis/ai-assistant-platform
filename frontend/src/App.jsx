import { Routes, Route } from "react-router-dom";
import { AuthProvider } from "./context/AuthContext";
import ProtectedRoute from "./components/ProtectedRoute";
import Sidebar from "./components/Sidebar";
import ChatPage from "./pages/ChatPage";
import AdminPage from "./pages/AdminPage";
import PlaygroundPage from "./pages/PlaygroundPage";
import LoginPage from "./pages/LoginPage";
import SignupPage from "./pages/SignupPage";
import HomeRedirect from "./components/HomeRedirect";

export default function App() {
  return (
    <AuthProvider>
      <div className="bg-background text-on-background min-h-screen flex" dir="ltr">
        <Routes>
          <Route path="/login" element={<LoginPage />} />
          <Route path="/signup" element={<SignupPage />} />
          <Route
            path="/*"
            element={
              <ProtectedRoute>
                <>
                  <Sidebar />
                  <main className="flex-1 ml-0 md:ml-sidebar-width flex flex-col h-screen relative">
                    <Routes>
                      <Route path="/" element={<HomeRedirect />} />
                      <Route path="/c/:conversationId" element={<ChatPage />} />
                      <Route path="/admin" element={<AdminPage />} />
                      <Route path="/playground" element={<PlaygroundPage />} />
                    </Routes>
                  </main>
                </>
              </ProtectedRoute>
            }
          />
        </Routes>
      </div>
    </AuthProvider>
  );
}