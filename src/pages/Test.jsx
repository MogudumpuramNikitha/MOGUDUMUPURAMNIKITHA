import React, { useState, useEffect, useCallback } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import axios from 'axios';

function Test() {
  const { testId } = useParams();
  const navigate = useNavigate();
  const [test, setTest] = useState(null);
  const [currentQuestion, setCurrentQuestion] = useState(0);
  const [answers, setAnswers] = useState({});
  const [timeLeft, setTimeLeft] = useState(null);

  useEffect(() => {
    const fetchTest = async () => {
      try {
        const token = localStorage.getItem('token');
        const response = await axios.get(`http://localhost:5000/api/tests/${testId}`, {
          headers: { Authorization: `Bearer ${token}` }
        });
        setTest(response.data);
        setTimeLeft(response.data.duration * 60); // Convert minutes to seconds
      } catch (error) {
        console.error('Error fetching test:', error);
        navigate('/dashboard');
      }
    };

    fetchTest();
  }, [testId, navigate]);

  useEffect(() => {
    if (timeLeft === null) return;

    const timer = setInterval(() => {
      setTimeLeft(prev => {
        if (prev <= 1) {
          clearInterval(timer);
          handleSubmit();
          return 0;
        }
        return prev - 1;
      });
    }, 1000);

    return () => clearInterval(timer);
  }, [timeLeft, handleSubmit]);

  const handleAnswer = (questionId, answer) => {
    setAnswers(prev => ({
      ...prev,
      [questionId]: answer
    }));
  };

  const handleSubmit = useCallback(async () => {
    try {
      const token = localStorage.getItem('token');
      await axios.post(`http://localhost:5000/api/tests/${testId}/submit`, {
        answers
      }, {
        headers: { Authorization: `Bearer ${token}` }
      });
      navigate('/dashboard');
    } catch (error) {
      console.error('Error submitting test:', error);
    }
  }, [testId, answers, navigate]);

  if (!test) return <div>Loading...</div>;

  return (
    <div style={{ display: 'flex', height: '100vh' }}>
      {/* Question Area */}
      <div style={{ flex: '1', padding: '20px', overflowY: 'auto' }}>
        <div style={{ 
          position: 'sticky', 
          top: 0, 
          backgroundColor: 'white', 
          padding: '10px 0', 
          borderBottom: '1px solid #ddd',
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center'
        }}>
          <h2>Section {test.questions[currentQuestion].section}</h2>
          <div style={{ fontSize: '20px', fontWeight: 'bold' }}>
            Time Left: {Math.floor(timeLeft / 60)}:{(timeLeft % 60).toString().padStart(2, '0')}
          </div>
        </div>

        <div style={{ marginTop: '20px' }}>
          <div style={{ marginBottom: '20px' }}>
            <h3>Question {currentQuestion + 1}</h3>
            <p>{test.questions[currentQuestion].text}</p>
          </div>

          {test.questions[currentQuestion].type === 'MCQ' ? (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
              {test.questions[currentQuestion].options.map((option, index) => (
                <label
                  key={index}
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    padding: '10px',
                    border: '1px solid #ddd',
                    borderRadius: '4px',
                    cursor: 'pointer',
                    backgroundColor: answers[test.questions[currentQuestion].id] === index ? '#e3f2fd' : 'white'
                  }}
                >
                  <input
                    type="radio"
                    name={`question-${currentQuestion}`}
                    checked={answers[test.questions[currentQuestion].id] === index}
                    onChange={() => handleAnswer(test.questions[currentQuestion].id, index)}
                  />
                  <span style={{ marginLeft: '10px' }}>{option}</span>
                </label>
              ))}
            </div>
          ) : (
            <div style={{ marginTop: '20px' }}>
              <input
                type="number"
                value={answers[test.questions[currentQuestion].id] || ''}
                onChange={(e) => handleAnswer(test.questions[currentQuestion].id, e.target.value)}
                style={{
                  width: '200px',
                  padding: '10px',
                  fontSize: '16px',
                  border: '1px solid #ddd',
                  borderRadius: '4px'
                }}
              />
            </div>
          )}
        </div>
      </div>

      {/* Question Navigation Panel */}
      <div style={{
        width: '250px',
        backgroundColor: '#f5f5f5',
        padding: '20px',
        borderLeft: '1px solid #ddd',
        display: 'flex',
        flexDirection: 'column'
      }}>
        <h3>Question Navigator</h3>
        <div style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(4, 1fr)',
          gap: '10px',
          marginTop: '20px'
        }}>
          {test.questions.map((question, index) => (
            <button
              key={index}
              onClick={() => setCurrentQuestion(index)}
              style={{
                width: '40px',
                height: '40px',
                border: 'none',
                borderRadius: '4px',
                cursor: 'pointer',
                backgroundColor: answers[question.id] ? '#4caf50' : 
                              currentQuestion === index ? '#2196f3' : '#fff',
                color: (answers[question.id] || currentQuestion === index) ? 'white' : 'black',
                boxShadow: '0 2px 4px rgba(0,0,0,0.1)'
              }}
            >
              {index + 1}
            </button>
          ))}
        </div>

        <button
          onClick={handleSubmit}
          style={{
            marginTop: 'auto',
            padding: '15px',
            backgroundColor: '#4caf50',
            color: 'white',
            border: 'none',
            borderRadius: '4px',
            cursor: 'pointer',
            fontSize: '16px'
          }}
        >
          Submit Test
        </button>
      </div>
    </div>
  );
}

export default Test;