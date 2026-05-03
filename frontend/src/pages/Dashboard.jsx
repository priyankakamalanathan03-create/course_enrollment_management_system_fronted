import { useAuth } from "../context/AuthContext";
import Navbar from "../components/Navbar";
import StudentDashboard from "./StudentDashboard";
import InstructorDashboard from "./InstructorDashboard";

export default function Dashboard() {
  const { user } = useAuth();

  return (
    <div className="dashboard-container">
      <Navbar />
      
      {/* Role-based dashboard rendering */}
      {user?.role === "instructor" || user?.role === "admin" ? (
        <InstructorDashboard />
      ) : (
        <StudentDashboard />
      )}
    </div>
  );
}