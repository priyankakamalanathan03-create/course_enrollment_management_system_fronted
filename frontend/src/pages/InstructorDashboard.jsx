import { useState, useEffect } from "react";
import api from "../services/api";
import { useAuth } from "../context/AuthContext";
import { motion, AnimatePresence } from "framer-motion";
import { Plus, X, Users, Download, BookOpen, Layers, BarChart, Database, Layout } from "lucide-react";
import toast from "react-hot-toast";

export default function InstructorDashboard() {
  const [courses, setCourses] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [selectedCourseStudents, setSelectedCourseStudents] = useState({ id: null, students: [] });
  
  const [formData, setFormData] = useState({
    title: '', description: '', category: 'Web Development', level: 'Beginner', capacity: 30, startDate: '', endDate: ''
  });

  const { user } = useAuth();

  useEffect(() => {
    fetchCourses();
  }, []);

  const fetchCourses = async () => {
    try {
      const res = await api.get("/courses");
      const myCreatedCourses = res.data.courses.filter(
        (course) => course.instructorId?._id === user?._id || course.instructorId === user?._id
      );
      setCourses(myCreatedCourses);
    } catch (err) {
      toast.error("Failed to load courses");
    } finally {
      setLoading(false);
    }
  };

  const handleCreateCourse = async (e) => {
    e.preventDefault();
    try {
      await api.post("/courses", formData);
      toast.success("Course created successfully! 🚀");
      setShowForm(false);
      fetchCourses();
    } catch (err) {
      toast.error(err.response?.data?.message || "Failed to create course");
    }
  };

  const handleViewStudents = async (courseId) => {
    if (selectedCourseStudents.id === courseId) {
      setSelectedCourseStudents({ id: null, students: [] });
      return;
    }
    try {
      const res = await api.get(`/enroll/course/${courseId}`);
      setSelectedCourseStudents({ id: courseId, students: res.data });
    } catch (err) {
      toast.error(err.response?.data?.message || "Failed to fetch students");
    }
  };

  const handleUpdateStudent = async (enrollmentId, newProgress, newGrade) => {
    try {
      await api.put(`/enroll/${enrollmentId}`, { progress: newProgress, grade: newGrade });
      toast.success("Student updated successfully! ✅");
      const res = await api.get(`/enroll/course/${selectedCourseStudents.id}`);
      setSelectedCourseStudents({ id: selectedCourseStudents.id, students: res.data });
    } catch (err) {
      toast.error(err.response?.data?.message || "Failed to update student");
    }
  };

  const downloadCSV = (courseTitle) => {
    if (!selectedCourseStudents.students.length) {
      toast.error("No students to export.");
      return;
    }

    const headers = "Student Name,Email,Status,Progress,Grade\n";
    const csvRows = selectedCourseStudents.students.map(enrollment => {
      const name = enrollment.studentId?.name || 'Unknown';
      const email = enrollment.studentId?.email || 'N/A';
      return `"${name}","${email}","${enrollment.status}","${enrollment.progress}%","${enrollment.grade || 'N/A'}"`;
    }).join("\n");

    const csvContent = "data:text/csv;charset=utf-8," + headers + csvRows;
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement("a");
    link.setAttribute("href", encodedUri);
    link.setAttribute("download", `${courseTitle.replace(/\s+/g, '_')}_Students.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    toast.success("CSV Downloaded Successfully! 📊");
  };

  const getCategoryIcon = (category) => {
    if (!category) return <BookOpen size={24} color="#3b82f6" />;
    const cat = category.toLowerCase();
    if (cat.includes('web') || cat.includes('react')) return <Layout size={24} color="#3b82f6" />;
    if (cat.includes('data') || cat.includes('sql')) return <Database size={24} color="#3b82f6" />;
    if (cat.includes('design') || cat.includes('ui')) return <Layers size={24} color="#3b82f6" />;
    return <BookOpen size={24} color="#3b82f6" />;
  };

  if (loading) return (
    <div className="flex-center" style={{minHeight: '50vh'}}>
      <motion.div animate={{ rotate: 360 }} transition={{ repeat: Infinity, duration: 1 }} className="loading-spinner">
        <BookOpen size={48} color="#3b82f6" />
      </motion.div>
    </div>
  );

  const totalStudents = courses.reduce((acc, curr) => acc + curr.enrolledCount, 0);
  const totalCapacity = courses.reduce((acc, curr) => acc + curr.capacity, 0);

  return (
    <motion.div 
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      className="dashboard-content"
    >
      
      <div className="analytics-grid">
        <motion.div whileHover={{ y: -5 }} className="glass-panel analytics-card">
          <div className="flex justify-between">
            <h4 className="analytics-label">Active Courses</h4>
            <BookOpen size={20} color="#3b82f6" />
          </div>
          <p className="analytics-value">{courses.length}</p>
        </motion.div>
        <motion.div whileHover={{ y: -5 }} className="glass-panel analytics-card" style={{borderTopColor: 'var(--success)'}}>
          <div className="flex justify-between">
            <h4 className="analytics-label">Total Enrolled</h4>
            <Users size={20} color="#10b981" />
          </div>
          <p className="analytics-value">{totalStudents}</p>
        </motion.div>
        <motion.div whileHover={{ y: -5 }} className="glass-panel analytics-card" style={{borderTopColor: 'var(--warning)'}}>
          <div className="flex justify-between">
            <h4 className="analytics-label">Total Capacity</h4>
            <BarChart size={20} color="#f59e0b" />
          </div>
          <p className="analytics-value">{totalCapacity}</p>
        </motion.div>
      </div>

      <div className="dashboard-header-action mt-8">
        <h2 className="section-title" style={{marginTop: 0, border: 'none'}}>My Instructor Panel</h2>
        <motion.button 
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
          className="btn-primary flex items-center gap-2" 
          onClick={() => setShowForm(!showForm)}
        >
          {showForm ? <><X size={18} /> Cancel</> : <><Plus size={18} /> Create New Course</>}
        </motion.button>
      </div>

      <AnimatePresence>
        {showForm && (
          <motion.div 
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            exit={{ opacity: 0, height: 0 }}
            className="glass-panel overflow-hidden" style={{marginBottom: '2rem'}}
          >
            <h3 style={{marginBottom: '1.5rem', fontSize: '1.2rem', fontWeight: '600'}}>Create a New Course</h3>
            <form onSubmit={handleCreateCourse} style={{display: 'flex', flexDirection: 'column', gap: '1.25rem'}}>
              <input className="input-field" placeholder="Course Title" required 
                     value={formData.title} onChange={e => setFormData({...formData, title: e.target.value})} />
              
              <textarea className="input-field" placeholder="Description" required rows="3"
                     value={formData.description} onChange={e => setFormData({...formData, description: e.target.value})} />
              
              <div style={{display: 'flex', gap: '1rem', flexWrap: 'wrap'}}>
                <input className="input-field" placeholder="Category" style={{flex: 1, minWidth: '200px'}} required
                       value={formData.category} onChange={e => setFormData({...formData, category: e.target.value})} />
                
                <select className="input-field" style={{flex: 1, minWidth: '150px'}}
                        value={formData.level} onChange={e => setFormData({...formData, level: e.target.value})}>
                  <option value="Beginner">Beginner</option>
                  <option value="Intermediate">Intermediate</option>
                  <option value="Advanced">Advanced</option>
                </select>
                
                <input type="number" className="input-field" placeholder="Capacity" style={{flex: 1, minWidth: '100px'}} required
                       value={formData.capacity} onChange={e => setFormData({...formData, capacity: e.target.value})} />
              </div>

              <div style={{display: 'flex', gap: '1rem', flexWrap: 'wrap'}}>
                <div style={{flex: 1, minWidth: '200px'}}>
                  <label style={{fontSize: '0.85rem', color: 'var(--text-secondary)', marginBottom: '0.5rem', display: 'block'}}>Start Date</label>
                  <input type="date" className="input-field" style={{width: '100%'}} required
                         value={formData.startDate} onChange={e => setFormData({...formData, startDate: e.target.value})} />
                </div>
                <div style={{flex: 1, minWidth: '200px'}}>
                  <label style={{fontSize: '0.85rem', color: 'var(--text-secondary)', marginBottom: '0.5rem', display: 'block'}}>End Date</label>
                  <input type="date" className="input-field" style={{width: '100%'}} required
                         value={formData.endDate} onChange={e => setFormData({...formData, endDate: e.target.value})} />
                </div>
              </div>
              
              <button type="submit" className="btn-primary mt-2">Publish Course</button>
            </form>
          </motion.div>
        )}
      </AnimatePresence>

      <div className="grid-container">
        {courses.map((course) => (
          <motion.div 
            layout
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            key={course._id} 
            className="glass-panel course-card flex flex-col"
          >
            <div className="course-icon-wrapper">
              {getCategoryIcon(course.category)}
            </div>
            <div className="course-header">
              <h3 className="course-title">{course.title}</h3>
              <span className={`status-badge ${course.status === 'Published' ? 'status-completed' : 'status-waitlisted'}`}>
                {course.status}
              </span>
            </div>
            <p className="course-desc">{course.description}</p>
            
            <div className="course-meta">
              <span>Capacity: {course.enrolledCount} / {course.capacity}</span>
              <span>Level: {course.level}</span>
            </div>
            <div className="course-meta">
              <span>Starts: {course.startDate ? new Date(course.startDate).toLocaleDateString() : 'N/A'}</span>
            </div>

            <div style={{ marginTop: 'auto', display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
              <button className="btn-primary flex items-center justify-center gap-2" style={{width: '100%', background: 'var(--glass-bg)', color: 'white', border: '1px solid var(--glass-border)'}}
                      onClick={() => handleViewStudents(course._id)}>
                <Users size={16} />
                {selectedCourseStudents.id === course._id ? 'Hide Students' : 'View Enrolled Students'}
              </button>
              
              <AnimatePresence>
                {selectedCourseStudents.id === course._id && (
                  <motion.div 
                    initial={{ opacity: 0, height: 0 }}
                    animate={{ opacity: 1, height: 'auto' }}
                    exit={{ opacity: 0, height: 0 }}
                    style={{background: 'rgba(0,0,0,0.2)', padding: '1rem', borderRadius: '8px', marginTop: '0.5rem', overflow: 'hidden'}}
                  >
                    <div style={{display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.75rem'}}>
                      <h4 style={{fontSize: '0.9rem', color: 'var(--text-secondary)', margin: 0}}>Enrolled Students</h4>
                      {selectedCourseStudents.students.length > 0 && (
                        <button 
                          onClick={() => downloadCSV(course.title)}
                          className="flex items-center gap-1"
                          style={{background: 'transparent', border: '1px solid var(--accent-color)', color: 'var(--accent-color)', padding: '0.25rem 0.5rem', borderRadius: '4px', fontSize: '0.75rem', cursor: 'pointer'}}
                        >
                          <Download size={12} /> Export CSV
                        </button>
                      )}
                    </div>

                    {selectedCourseStudents.students.length === 0 ? (
                      <p style={{fontSize: '0.85rem', color: 'var(--text-secondary)'}}>No students enrolled yet.</p>
                    ) : (
                      <ul style={{listStyle: 'none', padding: 0, margin: 0, fontSize: '0.85rem', display: 'flex', flexDirection: 'column', gap: '0.5rem'}}>
                        {selectedCourseStudents.students.map(enrollment => (
                           <li key={enrollment._id} style={{display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '0.75rem', background: 'rgba(255,255,255,0.03)', borderRadius: '6px', border: '1px solid var(--glass-border)'}}>
                             <div style={{flex: 1}}>
                               <span style={{fontWeight: '600', display: 'block', marginBottom: '4px'}}>{enrollment.studentId?.name || 'Unknown'}</span>
                               <span className={`status-badge status-${enrollment.status}`} style={{fontSize: '0.65rem'}}>{enrollment.status}</span>
                             </div>
                             
                             <div style={{display: 'flex', gap: '0.75rem', alignItems: 'flex-end'}}>
                               <div style={{display: 'flex', flexDirection: 'column', gap: '4px'}}>
                                 <label style={{fontSize: '0.65rem', color: 'var(--text-secondary)'}}>Progress (%)</label>
                                 <input type="number" min="0" max="100" defaultValue={enrollment.progress} 
                                        id={`prog-${enrollment._id}`}
                                        style={{width: '60px', padding: '0.3rem', background: 'rgba(15, 23, 42, 0.6)', border: '1px solid var(--glass-border)', color: 'white', borderRadius: '4px'}} />
                               </div>
                               
                               <div style={{display: 'flex', flexDirection: 'column', gap: '4px'}}>
                                 <label style={{fontSize: '0.65rem', color: 'var(--text-secondary)'}}>Grade</label>
                                 <select defaultValue={enrollment.grade || ''} id={`grade-${enrollment._id}`}
                                         style={{padding: '0.3rem', background: 'rgba(15, 23, 42, 0.6)', border: '1px solid var(--glass-border)', color: 'white', borderRadius: '4px'}}>
                                   <option value="">-</option>
                                   <option value="A">A</option>
                                   <option value="B">B</option>
                                   <option value="C">C</option>
                                   <option value="D">D</option>
                                   <option value="F">F</option>
                                 </select>
                               </div>

                               <button 
                                 onClick={() => {
                                   const p = document.getElementById(`prog-${enrollment._id}`).value;
                                   const g = document.getElementById(`grade-${enrollment._id}`).value;
                                   handleUpdateStudent(enrollment._id, p, g);
                                 }}
                                 style={{background: 'var(--accent-color)', color: 'white', border: 'none', padding: '0.4rem 0.8rem', borderRadius: '4px', cursor: 'pointer', fontSize: '0.75rem', fontWeight: '500'}}
                               >
                                 Save
                               </button>
                             </div>
                           </li>
                        ))}
                      </ul>
                    )}
                  </motion.div>
                )}
              </AnimatePresence>
            </div>

          </motion.div>
        ))}
      </div>
    </motion.div>
  );
}
