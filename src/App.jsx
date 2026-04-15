import { BrowserRouter, Routes, Route } from "react-router-dom";
import Login from "./pages/Login";
import Dashboard from "./pages/Dashboard";
import Teams from "./pages/Teams";
import Settings from "./pages/Settings";
import Reports from "./pages/Reports";
import Signup from "./pages/Signup";
import ProtectedRoute from "./components/ProtectedRoute";
import ProjectDetails from "./pages/ProjectDetails";
import Projects from "./pages/Projects";
import TeamDetails from "./pages/TeamDetails";
import Profile from "./pages/Profile";

const App = () => {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<Login />} />
        <Route path="/signup" element={<Signup />} />
        <Route path="/login" element={<Login />} />
        <Route
          path="/dashboard"
          element={
            <ProtectedRoute>
              <Dashboard />
            </ProtectedRoute>
          }
        />
        <Route path="/teams" element={<Teams />} />
        <Route path="/teams/:id" element={<TeamDetails />}></Route>
        <Route path="/project/:id" element={<ProjectDetails />} />
        <Route path="/projects" element={<Projects />}></Route>
        <Route path="/settings" element={<Settings />} />
        <Route path="/reports" element={<Reports />}></Route>
        <Route path="/profile" element={<Profile />}></Route>
      </Routes>
    </BrowserRouter>
  );
};

export default App;
