import { BrowserRouter, Routes, Route } from "react-router-dom";
import { AuthProvider } from "./context/AuthContext";
import { Sidebar } from "./components/Sidebar";
import { Dashboard } from "./pages/Dashboard";
import { Enclosures } from "./pages/Enclosures";
import { FeedingSchedule } from "./pages/FeedingSchedule";
import { FoodSummary } from "./pages/FoodSummary";
import { Backup } from "./pages/Backup";
import { Login } from "./pages/Login";
import { Header } from "./components/Header";
import "./App.css";

function Layout({ children }: { children: React.ReactNode }) {
  return (
    <div className="app-shell">
      <Sidebar />
      <div className="app-main">
        <Header />
        <main>{children}</main>
      </div>
    </div>
  );
}

export default function App() {
  return (
    <AuthProvider>
      <BrowserRouter>
        <Routes>
          <Route
            path="/login"
            element={
              <Layout>
                <Login />
              </Layout>
            }
          />
          <Route
            path="/"
            element={
              <Layout>
                <Dashboard />
              </Layout>
            }
          />
          <Route
            path="/enclosures"
            element={
              <Layout>
                <Enclosures />
              </Layout>
            }
          />
          <Route
            path="/feeding-schedule"
            element={
              <Layout>
                <FeedingSchedule />
              </Layout>
            }
          />
          <Route
            path="/food-summary"
            element={
              <Layout>
                <FoodSummary />
              </Layout>
            }
          />
          <Route
            path="/backup"
            element={
              <Layout>
                <Backup />
              </Layout>
            }
          />
        </Routes>
      </BrowserRouter>
    </AuthProvider>
  );
}
