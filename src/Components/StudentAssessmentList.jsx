import React, { useEffect, useState } from "react";
import axios from "axios";
import { useAuth } from "../Context/AuthContext";
import { useNavigate } from "react-router-dom";
import { Container, Row, Col, Card, Button, ListGroup, Badge, Alert, Spinner } from "react-bootstrap";
import { BiArrowBack, BiCheckCircle } from "react-icons/bi";

const API_URL = "https://edusyncvirendrabackend-g2gyedfxasagg2dt.centralindia-01.azurewebsites.net/api";

function StudentAssessmentList({ onNewAssessment }) {
  const { user } = useAuth();
  const [assessments, setAssessments] = useState([]);
  const [courses, setCourses] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedAssessment, setSelectedAssessment] = useState(null);
  const [answers, setAnswers] = useState({});
  const [result, setResult] = useState(null);

  useEffect(() => {
    fetchAssessments();
    fetchCourses();
  }, []);

  const fetchCourses = async () => {
    try {
      const res = await axios.get(`${API_URL}/Course`);
      setCourses(res.data);
    } catch (error) {
      console.error("Error fetching courses:", error);
      setCourses([]);
    }
  };

  const fetchAssessments = async () => {
    try {
      setLoading(true);
      const res = await axios.get(`${API_URL}/Assessment`);
      setAssessments(res.data);
    } catch (error) {
      console.error("Error fetching assessments:", error);
      if (error.response?.status === 401) {
        alert("Your session has expired. Please log in again.");
      }
      setAssessments([]);
    } finally {
      setLoading(false);
    }
  };

  const handleAttempt = async (assessment) => {
    try {
      const res = await axios.get(`${API_URL}/Assessment/${assessment.assessmentId}`);
      setSelectedAssessment(res.data);
      setAnswers({});
      setResult(null);
    } catch (error) {
      alert("Error loading assessment. Please try again.");
    }
  };

  const handleAnswerSelect = (questionIndex, optionIndex) => {
    setAnswers(prev => ({
      ...prev,
      [questionIndex]: optionIndex
    }));
  };

  const handleSubmit = async () => {
    if (!selectedAssessment) return;

    try {
      // Convert answers object to array of selected answers
      const selectedAnswers = Object.entries(answers).map(([_, optionIndex]) => optionIndex);

      const payload = {
        assessmentId: selectedAssessment.assessmentId,
        userId: user.userId,
        selectedAnswers: selectedAnswers
      };

      console.log('Submitting assessment with payload:', payload);
      const res = await axios.post(`${API_URL}/Result/attempt`, payload);
      console.log('Assessment submission response:', res.data);
      
      // Calculate percentage
      const questions = JSON.parse(selectedAssessment.questions);
      const percentage = Math.round((res.data.score / questions.length) * 100);
      
      setResult({
        ...res.data,
        percentage,
        maxScore: questions.length
      });
    } catch (error) {
      console.error("Error submitting assessment:", error);
      if (error.response) {
        console.error("Error response:", error.response.data);
        console.error("Error status:", error.response.status);
      }
      alert("Error submitting assessment. Please try again.");
    }
  };

  if (loading) {
    return (
      <Container className="text-center py-5">
        <Spinner animation="border" variant="primary" />
        <p className="mt-3 text-primary">Loading assessments...</p>
      </Container>
    );
  }

  if (selectedAssessment) {
    const questions = JSON.parse(selectedAssessment.questions);
    return (
      <Container className="py-4">
        <div className="d-flex justify-content-between align-items-center mb-4">
          <h2 className="text-primary mb-0">{selectedAssessment.title}</h2>
          <Button
            variant="outline-primary"
            onClick={() => setSelectedAssessment(null)}
            className="d-flex align-items-center gap-2"
          >
            <BiArrowBack />
            Back to List
          </Button>
        </div>

        {result ? (
          <Card className="border-0 shadow-sm">
            <Card.Body className="text-center py-5">
              <h3 className="text-primary mb-4">Assessment Result</h3>
              <div className="mb-4">
                <h4 className="display-4 text-primary mb-2">{result.percentage}%</h4>
                <p className="text-muted">Score: {result.score}/{selectedAssessment.maxScore}</p>
              </div>
              <Button
                variant="primary"
                onClick={() => {
                  setSelectedAssessment(null);
                  setResult(null);
                }}
                className="px-4"
              >
                Back to Assessments
              </Button>
            </Card.Body>
          </Card>
        ) : (
          <div className="assessment-questions">
            {questions.map((question, qIndex) => (
              <Card key={qIndex} className="mb-4 border-0 shadow-sm">
                <Card.Body>
                  <h3 className="h5 mb-3">
                    <Badge bg="primary" className="me-2">Q{qIndex + 1}</Badge>
                    {question.question}
                  </h3>
                  <ListGroup>
                    {question.options.map((option, oIndex) => (
                      <ListGroup.Item
                        key={oIndex}
                        action
                        onClick={() => handleAnswerSelect(qIndex, oIndex)}
                        className={`d-flex align-items-center gap-2 ${
                          answers[qIndex] === oIndex ? 'active' : ''
                        }`}
                      >
                        <span className="fw-bold">{String.fromCharCode(65 + oIndex)}.</span>
                        {option}
                        {answers[qIndex] === oIndex && (
                          <BiCheckCircle className="ms-auto text-primary" />
                        )}
                      </ListGroup.Item>
                    ))}
                  </ListGroup>
                </Card.Body>
              </Card>
            ))}
            <div className="text-center mt-4">
              <Button
                variant="primary"
                size="lg"
                onClick={handleSubmit}
                disabled={Object.keys(answers).length !== questions.length}
                className="px-5"
              >
                Submit Assessment
              </Button>
            </div>
          </div>
        )}
      </Container>
    );
  }

  return (
    <Container className="py-4">
      <h2 className="text-primary mb-4">Available Assessments</h2>
      {assessments.length === 0 ? (
        <Alert variant="info" className="text-center py-4">
          No assessments available at the moment.
        </Alert>
      ) : (
        <Row className="g-4">
          {assessments.map((assessment) => (
            <Col key={assessment.assessmentId} md={6} lg={4}>
              <Card className="h-100 border-0">
                <Card.Header className="bg-light">
                  <h3 className="h5 mb-0 text-primary">{assessment.title}</h3>
                </Card.Header>
                <Card.Body>
                  <Badge bg="info" className="mb-3">
                    {courses.find(c => c.courseId === assessment.courseId)?.title || 'Unknown Course'}
                  </Badge>
                  <ListGroup variant="flush" className="mb-3">
                    <ListGroup.Item className="border-0 px-0">
                      <small className="text-muted">Instructor:</small>
                      <div>{assessment.instructorName || 'Unknown'}</div>
                    </ListGroup.Item>
                    <ListGroup.Item className="border-0 px-0">
                      <small className="text-muted">Total Questions:</small>
                      <div>{JSON.parse(assessment.questions).length}</div>
                    </ListGroup.Item>
                    <ListGroup.Item className="border-0 px-0">
                      <small className="text-muted">Maximum Score:</small>
                      <div>{assessment.maxScore}</div>
                    </ListGroup.Item>
                  </ListGroup>
                </Card.Body>
                <Card.Footer className="bg-white border-0">
                  <Button
                    variant="danger"
                    onClick={() => handleAttempt(assessment)}
                    className="w-100"
                    style={{ backgroundColor: '#e91e63', borderColor: '#e91e63' }}
                  >
                    Attempt Assessment
                  </Button>
                </Card.Footer>
              </Card>
            </Col>
          ))}
        </Row>
      )}
    </Container>
  );
}

export default StudentAssessmentList; 
