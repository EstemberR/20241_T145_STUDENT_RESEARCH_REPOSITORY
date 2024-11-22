import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import Sidebar from './resources/Sidebar';
import Header from './resources/Header';
import { getUserName, getToken } from './resources/Utils';
import 'bootstrap/dist/css/bootstrap.min.css';
import '../css/Dashboard.css';
import '../css/FAQ.css';

const FAQ = () => {
  const navigate = useNavigate();
  const [userName] = useState(getUserName());
  const [faqs, setFaqs] = useState([]);

  useEffect(() => {
    // Fetch FAQ data from the backend API
    const token = getToken();
    if (!token) {
      alert('Please log in first.');
      localStorage.removeItem('userName');
      localStorage.removeItem('token');
      navigate('/');ame(storedName);
    }
    const fetchFAQs = async () => {
      try {
        const response = await fetch('http://localhost:8000/student/faqs'); 
        const data = await response.json();
        setFaqs(data); // Set the FAQs to the state
      } catch (error) {
        console.error('Error fetching FAQs:', error);
      }
    };
    fetchFAQs();
  }, [navigate]);

  if (!faqs) {
    return <div>Loading...</div>;
  }

  return (
    <div className="dashboard-container d-flex">
      <Sidebar />
      <div className="main-section col-10 d-flex flex-column">
        <Header userName={userName} />
        {/* Main Content Area */}
        <main className="main-content p-3">
        <div className="card shadow-sm">
          <h4 className="mb-3">FREQUENTLY ASKED QUESTIONS</h4>
          <div className="accordion" id="faqAccordion">
            {faqs.map((faq, index) => (
              <div className="accordion-item" key={index}>
                <h2 className="accordion-header" id={`heading${index}`}>
                  <button
                    className="accordion-button"
                    type="button"
                    data-bs-toggle="collapse"
                    data-bs-target={`#collapse${index}`}
                    aria-expanded="true"
                    aria-controls={`collapse${index}`}
                  >
                    {faq.question}
                  </button>
                </h2>
                <div
                  id={`collapse${index}`}
                  className="accordion-collapse collapse"
                  aria-labelledby={`heading${index}`}
                  data-bs-parent="#faqAccordion"
                >
                  <div className="accordion-body">
                    {faq.answer}
                  </div>
                </div>
              </div>
            ))}
          </div>
          </div>
        </main>
      </div>
    </div>
  );
};

export default FAQ;
