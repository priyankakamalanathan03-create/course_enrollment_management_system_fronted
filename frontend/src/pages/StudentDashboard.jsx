import { useState, useEffect } from "react";
import api from "../services/api";
import { motion, AnimatePresence } from "framer-motion";
import { BookOpen, Search, XCircle, Award, Database, Layers, Layout, Clock, CheckCircle } from "lucide-react";
import toast from "react-hot-toast";

export default function StudentDashboard() {
  const [courses, setCourses] = useState([]);
  const [myCourses, setMyCourses] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState("");

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      setLoading(true);
      const [allCoursesRes, myCoursesRes] = await Promise.all([
        api.get("/courses"),
        api.get("/enroll/my-courses")
      ]);
      
      setCourses(allCoursesRes.data.courses || []);
      setMyCourses(myCoursesRes.data || []);
    } catch (err) {
      toast.error("Failed to load dashboard data");
    } finally {
      setLoading(false);
    }
  };

  const handleEnroll = async (courseId) => {
    try {
      const res = await api.post(`/enroll/${courseId}`);
      toast.success(res.data.message);
      fetchData(); // Refresh UI
    } catch (err) {
      toast.error(err.response?.data?.message || "Error enrolling");
    }
  };

  const handleDropCourse = async (courseId) => {
    if(!window.confirm("Are you sure you want to drop this course?")) return;
    try {
      await api.delete(`/enroll/${courseId}`);
      toast.success("Successfully dropped the course.");
      fetchData(); // Refresh UI
    } catch (err) {
      toast.error(err.response?.data?.message || "Error dropping course");
    }
  };

  const downloadCertificate = (courseTitle, grade) => {
    const certContent = `
=========================================
      CERTIFICATE OF COMPLETION      
=========================================

This certifies that you have successfully
completed the course:

${courseTitle}

Final Grade: ${grade || 'Pass'}
Date: ${new Date().toLocaleDateString()}

=========================================
`;
    const encodedUri = encodeURI("data:text/plain;charset=utf-8," + certContent);
    const link = document.createElement("a");
    link.setAttribute("href", encodedUri);
    link.setAttribute("download", `${courseTitle.replace(/\s+/g, '_')}_Certificate.txt`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    toast.success("Certificate Downloaded! 🎓");
  };

  const getEnrollmentStatus = (courseId) => {
    const enrollment = myCourses.find(e => e.courseId._id === courseId);
    return enrollment ? enrollment.status : null;
  };

  const getCategoryIcon = (category) => {
    if(!category) return <BookOpen size={24} color="#3b82f6" />;
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

  const filteredCourses = courses.filter(course => {
    const titleMatch = course.title?.toLowerCase().includes(searchQuery.toLowerCase());
    const categoryMatch = course.category?.toLowerCase().includes(searchQuery.toLowerCase());
    return titleMatch || categoryMatch;
  });

  return (
    <motion.div 
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      className="dashboard-content"
    >
      <h2 className="section-title" style={{marginTop: 0}}>
        <BookOpen className="inline-block mr-2" size={24} /> My Learning Path
      </h2>
      
      {myCourses.length === 0 ? (
        <div className="glass-panel text-center" style={{padding: '3rem'}}>
          <BookOpen size={48} color="var(--text-secondary)" style={{margin: '0 auto 1rem'}} />
          <p style={{color: 'var(--text-secondary)', fontSize: '1.1rem'}}>You are not enrolled in any courses yet.</p>
          <p style={{color: 'var(--text-secondary)', fontSize: '0.9rem'}}>Explore the available courses below and start your journey!</p>
        </div>
      ) : (
        <div className="grid-container">
          <AnimatePresence>
            {myCourses.map((enrollment) => (
              <motion.div 
                layout
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.9 }}
                key={enrollment._id} 
                className="glass-panel course-card flex flex-col"
              >
                <div className="course-icon-wrapper">
                  {getCategoryIcon(enrollment.courseId.category)}
                </div>
                <div className="course-header">
                  <h3 className="course-title">{enrollment.courseId.title}</h3>
                  <span className={`status-badge status-${enrollment.status}`}>
                    {enrollment.status}
                  </span>
                </div>
                <p className="course-desc">{enrollment.courseId.description}</p>
                
                <div style={{marginTop: 'auto'}}>
                  <div className="course-meta">
                    <span>Progress</span>
                    <span style={{fontWeight: '600', color: enrollment.progress >= 100 ? '#10b981' : 'white'}}>
                      {enrollment.progress}%
                    </span>
                  </div>
                  <div className="progress-bar" style={{marginBottom: '1rem'}}>
                    <div className="progress-fill" style={{ width: `${enrollment.progress}%`, background: enrollment.progress >= 100 ? '#10b981' : 'var(--accent-color)' }}></div>
                  </div>
                  
                  {enrollment.progress >= 100 ? (
                    <motion.button 
                      whileHover={{ scale: 1.02 }}
                      whileTap={{ scale: 0.98 }}
                      onClick={() => downloadCertificate(enrollment.courseId.title, enrollment.grade)}
                      className="flex items-center justify-center gap-2"
                      style={{width: '100%', background: 'linear-gradient(90deg, #10b981 0%, #059669 100%)', border: 'none', color: 'white', padding: '0.6rem', borderRadius: '6px', cursor: 'pointer', fontWeight: 'bold'}}
                    >
                      <Award size={18} /> Download Certificate
                    </motion.button>
                  ) : (
                    <motion.button 
                      whileHover={{ scale: 1.02, backgroundColor: 'rgba(239, 68, 68, 0.1)' }}
                      whileTap={{ scale: 0.98 }}
                      onClick={() => handleDropCourse(enrollment.courseId._id)}
                      className="flex items-center justify-center gap-2"
                      style={{width: '100%', background: 'transparent', border: '1px solid #ef4444', color: '#ef4444', padding: '0.5rem', borderRadius: '6px', cursor: 'pointer', transition: 'all 0.2s'}}
                    >
                      <XCircle size={16} /> Drop Course
                    </motion.button>
                  )}
                </div>
              </motion.div>
            ))}
          </AnimatePresence>
        </div>
      )}

      <div style={{ display: 'flex', flexWrap: 'wrap', gap: '1rem', justifyContent: 'space-between', alignItems: 'center', marginTop: '3rem', marginBottom: '1.5rem', borderBottom: '1px solid var(--glass-border)', paddingBottom: '0.5rem' }}>
        <h2 className="section-title" style={{borderBottom: 'none', margin: 0, padding: 0}}>Available Courses</h2>
        <div className="input-wrapper" style={{maxWidth: '300px', width: '100%'}}>
          <Search className="input-icon" size={18} />
          <input 
            type="text" 
            placeholder="Search courses..." 
            className="input-field with-icon"
            style={{ width: '100%', margin: 0 }}
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
          />
        </div>
      </div>

      <div className="grid-container">
        {filteredCourses.length === 0 ? (
          <p style={{color: 'var(--text-secondary)'}}>No courses match your search.</p>
        ) : filteredCourses.map((course) => {
          const status = getEnrollmentStatus(course._id);
          const isFull = course.enrolledCount >= course.capacity;

          return (
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
                <span className="course-category">{course.category}</span>
              </div>
              <p className="course-desc">{course.description}</p>
              
              <div className="course-meta">
                <span>Level: {course.level}</span>
                <span>Students: {course.enrolledCount} / {course.capacity}</span>
              </div>
              <div className="course-meta">
                <span>Starts: {course.startDate ? new Date(course.startDate).toLocaleDateString() : 'N/A'}</span>
              </div>

              <div style={{ marginTop: 'auto' }}>
                {status ? (
                  <button className="btn-primary flex justify-center items-center gap-2" style={{width: '100%', background: 'var(--glass-bg)', cursor: 'default', color: 'var(--text-secondary)'}} disabled>
                    {status === 'waitlisted' ? <Clock size={16} /> : <CheckCircle size={16} color="#10b981" />}
                    {status === 'waitlisted' ? 'On Waitlist' : 'Already Enrolled'}
                  </button>
                ) : course.startDate && new Date() > new Date(course.startDate) ? (
                  <button className="btn-primary flex justify-center items-center gap-2" style={{width: '100%', background: 'rgba(239, 68, 68, 0.1)', color: '#fca5a5', cursor: 'not-allowed', border: '1px solid rgba(239, 68, 68, 0.2)'}} disabled>
                    <XCircle size={16} /> Registration Closed
                  </button>
                ) : (
                  <motion.button 
                    whileHover={{ scale: 1.02 }}
                    whileTap={{ scale: 0.98 }}
                    className="btn-primary" 
                    style={{width: '100%', background: isFull ? 'var(--warning)' : 'linear-gradient(135deg, var(--accent-color) 0%, var(--accent-hover) 100%)'}}
                    onClick={() => handleEnroll(course._id)}
                  >
                    {isFull ? 'Join Waitlist' : 'Enroll Now'}
                  </motion.button>
                )}
              </div>
            </motion.div>
          );
        })}
      </div>
    </motion.div>
  );
}
