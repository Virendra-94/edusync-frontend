import React, { useEffect, useState } from "react";
import { api } from '../config/api';
import { useAuth } from "../Context/AuthContext";
import { useNavigate } from "react-router-dom";
import LogoutButton from "../Components/LogoutButton";
import StudentAssessmentList from "../Components/StudentAssessmentList";
import StudentProgressTracker from "../Components/StudentProgressTracker";
import LoadingSpinner from "../Components/LoadingSpinner";
import Notification from "../Components/Notification";
import { Container, Row, Col, Card, Button, Modal, Spinner, Alert, Collapse, Navbar, NavDropdown, Badge, ListGroup } from 'react-bootstrap';
import { BiBook, BiListUl, BiBarChart, BiUserCircle, BiChevronDown, BiShow, BiFile, BiDownload, BiX } from 'react-icons/bi';

const StudentDashboard = () => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const studentName = user?.name || "Student";
  const studentRole = user?.role || "Student";
  const [courses, setCourses] = useState([]);
  const [loading, setLoading] = useState(true);
  const [openSection, setOpenSection] = useState(null);
  const [notification, setNotification] = useState(null);
  const [viewCourse, setViewCourse] = useState(null);

  useEffect(() => {
    fetchCourses();
    // eslint-disable-next-line
  }, []);

  const fetchCourses = async () => {
    try {
      setLoading(true);
      const res = await api.get('/Course');
      
      // Check for new courses
      if (courses.length > 0 && res.data.length > courses.length) {
        const newCourse = res.data.find(course => !courses.some(c => c.courseId === course.courseId));
        if (newCourse) {
          showNotification(`New course "${newCourse.title}" is now available!`);
        }
      }
      
      setCourses(res.data);
    } catch (error) {
      console.error("Error fetching courses:", error);
      if (error.response?.status === 401) {
        // alert("Your session has expired. Please log in again."); // Use toast instead
        showNotification("Your session has expired. Please log in again.", 'danger');
        navigate('/login', { replace: true });
      }
      setCourses([]);
    } finally {
      setLoading(false);
    }
  };

  const showNotification = (message, type = 'success') => {
    setNotification({ message, type });
  };

  const handleNewAssessment = (assessment) => {
    showNotification(`New assessment "${assessment.title}" is now available!`);
  };

  const handleSectionToggle = (section) => {
    setOpenSection(openSection === section ? null : section);
  };
  
   // Get initials for avatar
  const getInitials = (name) => {
    if (!name) return "U";
    const parts = name.split(" ");
    return parts.length === 1
      ? parts[0][0].toUpperCase()
      : (parts[0][0] + parts[parts.length - 1][0]).toUpperCase();
  };

  const handleViewCourse = (course) => {
    setViewCourse(course);
  };

  const getFileIcon = (fileType) => {
    switch (fileType?.toLowerCase()) {
      case 'pdf': return '📄';
      case 'docx': return '📝';
      case 'pptx': return '📊';
      case 'mp4': return '🎥';
      case 'jpg':
      case 'jpeg':
      case 'png': return '🖼️';
      default: return '📎';
    }
  };

  return (
    <div className="bg-light min-vh-100">
      {notification && (
        <Notification
          message={notification.message}
          type={notification.type}
          onClose={() => setNotification(null)}
        />
      )}
      
      {/* Header Bar */}
       <Navbar bg="white" expand="lg" className="shadow-sm">
        <Container>
          <Navbar.Brand href="#" className="text-primary fw-bold">Student Dashboard</Navbar.Brand>
          <Navbar.Toggle aria-controls="basic-navbar-nav" />
          <Navbar.Collapse id="basic-navbar-nav">
            <div className="flex-grow-1"></div> {/* Spacer */}
            <NavDropdown
              title={
                <div className="d-flex align-items-center">
                  <div className="bg-primary text-white rounded-circle d-flex align-items-center justify-content-center me-2" style={{ width: '35px', height: '35px' }}>
                    {getInitials(studentName)}
                  </div>
                  <span className="d-none d-lg-inline me-1 text-dark">{studentName}</span>
                   <BiChevronDown className="text-muted"/>
                </div>
              }
              id="avatar-dropdown"
              align="end"
            >
               <NavDropdown.ItemText>
                <div className="fw-bold">{studentName}</div>
                <div className="text-muted small">{studentRole}</div>
              </NavDropdown.ItemText>
              <NavDropdown.Divider />
              <NavDropdown.Item as="div">
                 <LogoutButton variant="link" className="text-danger w-100 text-start">Logout</LogoutButton>
              </NavDropdown.Item>
            </NavDropdown>
          </Navbar.Collapse>
        </Container>
      </Navbar>

      {/* Main Dashboard Content */}
      <Container className="py-4">
        <h2 className="text-primary mb-4">Welcome, {studentName}!</h2>
        <p className="text-muted mb-4">Explore and learn from available courses.</p>

        {/* Available Courses Section */}
        <Card className="mb-3 border-0 shadow-sm">
          <Card.Header className="bg-light d-flex justify-content-between align-items-center cursor-pointer" onClick={() => handleSectionToggle('courses')}>
             <span className="d-flex align-items-center gap-2 text-primary fw-bold">
                <BiBook size={20}/>
                Available Courses
             </span>
             <BiChevronDown className={`text-muted ${openSection === 'courses' ? 'rotate-180' : ''}`} style={{ transition: 'transform 0.3s ease' }}/>
          </Card.Header>
          <Collapse in={openSection === 'courses'}>
            <Card.Body>
              {loading ? (
                 <div className="text-center py-3">
                  <Spinner animation="border" variant="primary" style={{ color: '#1a73e8' }} />
                  <p className="mt-2 text-primary">Loading courses...</p>
                 </div>
              ) : courses.length === 0 ? (
                <Alert variant="info" className="text-center py-4">
                  No courses available at the moment.
                </Alert>
              ) : (
                <Row className="g-4">
                  {courses.map((course) => (
                    <Col key={course.courseId} md={6} lg={4}>
                      <Card className="h-100 border-0 shadow-sm">
                        <Card.Body className="d-flex flex-column">
                          <Card.Title as="h5" className="text-primary mb-2">{course.title}</Card.Title>
                          <Card.Text className="text-muted flex-grow-1 mb-3">
                            {course.description}
                          </Card.Text>

                          {/* Course Materials Preview */}
                          {course.materials && course.materials.length > 0 && (
                            <div className="mb-3">
                              <Badge bg="light" text="dark" className="mb-2">
                                {course.materials.length} Material{course.materials.length !== 1 ? 's' : ''}
                              </Badge>
                              <ListGroup variant="flush" className="border rounded">
                                {course.materials.slice(0, 2).map((material) => (
                                  <ListGroup.Item key={material.materialId} className="d-flex align-items-center py-2">
                                    <span className="me-2">{getFileIcon(material.fileType)}</span>
                                    <small className="text-truncate">{material.fileName}</small>
                                  </ListGroup.Item>
                                ))}
                                {course.materials.length > 2 && (
                                  <ListGroup.Item className="text-center py-1 text-muted">
                                    <small>+{course.materials.length - 2} more</small>
                                  </ListGroup.Item>
                                )}
                              </ListGroup>
                            </div>
                          )}

                          {course.materials && course.materials.length === 0 && (
                             <Alert variant="info" className="py-2 px-3 mb-3">No materials yet.</Alert>
                          )}
                           <div className="mt-auto">
                                <Button
                                    variant="primary"
                                    size="sm"
                                    onClick={() => handleViewCourse(course)}
                                    className="w-100 d-flex align-items-center justify-content-center gap-1"
                                >
                                    <BiShow /> View Details
                                </Button>
                           </div>

                        </Card.Body>
                      </Card>
                    </Col>
                  ))}
                </Row>
              )}
            </Card.Body>
          </Collapse>
        </Card>

        {/* Available Assessments Section */}
        <Card className="mb-3 border-0 shadow-sm">
          <Card.Header className="bg-light d-flex justify-content-between align-items-center cursor-pointer" onClick={() => handleSectionToggle('assessments')}>
             <span className="d-flex align-items-center gap-2 text-primary fw-bold">
                <BiListUl size={20}/>
                Available Assessments
             </span>
             <BiChevronDown className={`text-muted ${openSection === 'assessments' ? 'rotate-180' : ''}`} style={{ transition: 'transform 0.3s ease' }}/>
          </Card.Header>
          <Collapse in={openSection === 'assessments'}>
            <Card.Body>
              {loading ? (
                 <div className="text-center py-3">
                  <Spinner animation="border" variant="primary" style={{ color: '#1a73e8' }} />
                  <p className="mt-2 text-primary">Loading assessments...</p>
                 </div>
              ) : (
                <StudentAssessmentList onNewAssessment={handleNewAssessment} />
              )}
            </Card.Body>
          </Collapse>
        </Card>

        {/* Your Progress Section */}
        <Card className="mb-3 border-0 shadow-sm">
          <Card.Header className="bg-light d-flex justify-content-between align-items-center cursor-pointer" onClick={() => handleSectionToggle('progress')}>
             <span className="d-flex align-items-center gap-2 text-primary fw-bold">
                <BiBarChart size={20}/>
                Your Progress
             </span>
             <BiChevronDown className={`text-muted ${openSection === 'progress' ? 'rotate-180' : ''}`} style={{ transition: 'transform 0.3s ease' }}/>
          </Card.Header>
          <Collapse in={openSection === 'progress'}>
            <Card.Body>
              {loading ? (
                 <div className="text-center py-3">
                  <Spinner animation="border" variant="primary" style={{ color: '#1a73e8' }} />
                  <p className="mt-2 text-primary">Loading progress tracker...</p>
                 </div>
              ) : (
                 openSection === 'progress' && <StudentProgressTracker />
              )}
            </Card.Body>
          </Collapse>
        </Card>

      </Container>

      {/* Course Details Modal */}
      <Modal
        show={!!viewCourse}
        onHide={() => setViewCourse(null)}
        size="lg"
        centered
      >
        <Modal.Header className="border-0 pb-0">
          <Modal.Title className="text-primary">{viewCourse?.title}</Modal.Title>
          <Button
            variant="link"
            className="text-muted p-0 ms-auto"
            onClick={() => setViewCourse(null)}
          >
            <BiX size={24} />
          </Button>
        </Modal.Header>
        <Modal.Body>
          {viewCourse && (
            <Container fluid>
              <Row>
                <Col>
                  {/* Course Description */}
                  <h3 className="h5 text-secondary mb-2">Description</h3>
                  <p className="text-muted mb-4">{viewCourse.description}</p>

                  {/* Course Materials Section */}
                  {viewCourse.materials && viewCourse.materials.length > 0 ? (
                    <div>
                      <h3 className="h5 text-secondary mb-3">Course Materials</h3>
                      <ListGroup>
                        {viewCourse.materials.map((material) => (
                          <ListGroup.Item key={material.materialId} className="d-flex justify-content-between align-items-center">
                            <div className="d-flex align-items-center">
                               <span className="me-2">{getFileIcon(material.fileType)}</span>
                               <div>
                                  <div className="fw-medium">{material.fileName}</div>
                                  {material.description && (
                                    <small className="text-muted">{material.description}</small>
                                  )}
                               </div>
                            </div>
                            <Button
                              variant="link"
                              size="sm"
                              href={material.fileUrl}
                              target="_blank"
                              rel="noopener noreferrer"
                              className="text-primary d-flex align-items-center gap-1"
                            >
                              <BiDownload />
                              Download
                            </Button>
                          </ListGroup.Item>
                        ))}
                      </ListGroup>
                    </div>
                  ) : (
                    <Alert variant="info">No course materials available for this course.</Alert>
                  )}
                </Col>
              </Row>
            </Container>
          )}
        </Modal.Body>
        <Modal.Footer className="border-0 pt-0">
           <Button variant="secondary" onClick={() => setViewCourse(null)}>Close</Button>
        </Modal.Footer>
      </Modal>

      {/* Delete Confirmation Modal */}
      {/* Assuming you don't need delete confirmation for students viewing courses */}

    </div>
  );
};

export default StudentDashboard;
