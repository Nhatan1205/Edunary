import { useState, useMemo } from 'react';
import { Container, Row, Col } from 'reactstrap';
import { TextField, Button, Typography } from '@mui/material';
import { Accordion, AccordionSummary, AccordionDetails, Box } from '@mui/material';
import ExpandMoreIcon from '@mui/icons-material/ExpandMore';
import faqimage from "../../../assets/images/faq-page.jpg";
import { FAQ_DATA } from './faqdata';
import SchoolIcon from '@mui/icons-material/School';
import CastForEducationIcon from '@mui/icons-material/CastForEducation';
import RocketLaunchIcon from '@mui/icons-material/RocketLaunch';
import PaymentIcon from '@mui/icons-material/Payment';
import BuildIcon from '@mui/icons-material/Build';
import NoResult from '../../../components/NoResult';
import emptyFaqImg from '../../../assets/images/empty-faq.png';

const categories = [
  {
    id: 'getting-started',
    label: 'Getting Started',
    icon: <RocketLaunchIcon fontSize="small" />
  },
  { id: 'students', label: 'Students', icon: <SchoolIcon fontSize="small" /> },
  { id: 'teachers', label: 'Teachers', icon: <CastForEducationIcon fontSize="small" /> },
  {
    id: 'payments',
    label: 'Purchase & Payments',
    icon: <PaymentIcon fontSize="small" />
  },
  {
    id: 'troubleshooting',
    label: 'Troubleshooting',
    icon: <BuildIcon fontSize="small" />
  }
];

function FAQPage() {
  const [searchQuery, setSearchQuery] = useState('');
  const [submittedQuery, setSubmittedQuery] = useState('');
  const [activeTab, setActiveTab] = useState('getting-started');
  const [expanded, setExpanded] = useState([]);

  const handleAccordionChange = (panelId) => (event, isExpanded) => {
    setExpanded(prev =>
      isExpanded
        ? [...prev, panelId]               // mở thêm panel
        : prev.filter(id => id !== panelId) // đóng panel đó
    );
  };

  // Filter logic
  const filteredFAQs = useMemo(() => {
    return FAQ_DATA.filter((item) => {
      const matchesCategory = item.category === activeTab;

      const matchesSearch =
        item.question.toLowerCase().includes(submittedQuery.toLowerCase()) ||
        item.answer.toLowerCase().includes(submittedQuery.toLowerCase());

      return matchesCategory && matchesSearch;
    });
  }, [submittedQuery, activeTab]);


  return (
    <div style={{ minHeight: '160vh', backgroundColor: '#f5f5f5' }}>
      <div
        style={{
          position: 'relative',
          height: '500px',
          backgroundImage: `linear-gradient(rgba(0,0,0,0.5), rgba(0,0,0,0.5)),url(${faqimage || 'https://via.placeholder.com/1500'})`,
          backgroundSize: 'cover',
          backgroundPosition: 'center',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          flexDirection: 'column',
        }}
      >
        <Container style={{ position: 'relative', zIndex: 1, textAlign: 'center' }}>
          <Typography
            variant="h2"
            style={{
              fontWeight: 700,
              color: '#fff',
              marginBottom: '30px',
              fontSize: '2.5rem'
            }}
          >
            Edunary Help Center
          </Typography>

          <Row className="justify-content-center">
            <Col xs={12} md={8} lg={6}>
              <div style={{ display: 'flex', gap: '10px' }}>
                <TextField
                  fullWidth
                  variant="outlined"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  placeholder="Search"
                  size="medium"
                  sx={{
                    backgroundColor: "#fff",
                    borderRadius: "4px",
                    "& .MuiOutlinedInput-root": {
                      "& fieldset": {
                        border: "none",
                      },
                      "&:hover fieldset": {
                        border: "none",
                      },
                      "&.Mui-focused fieldset": {
                        border: "none",
                      },
                    }
                  }}
                />
                <Button
                  variant="contained"
                  style={{
                    backgroundColor: 'brand.main',
                    color: '#fff',
                    textTransform: 'none',
                    fontSize: '16px',
                    fontWeight: 600,
                    padding: '10px 30px',
                    borderRadius: '4px',
                    boxShadow: 'none',
                    minWidth: '120px'
                  }}
                  onClick={() => setSubmittedQuery(searchQuery)}
                >
                  Search
                </Button>
              </div>
            </Col>
          </Row>
        </Container>
      </div>

      <Container style={{ marginTop: '40px', marginBottom: '40px' }}>
        <Box sx={{ display: 'flex', justifyContent: 'center', gap: 2, flexWrap: 'wrap' }}>
          {categories.map((category) => (
            <Button
              key={category.id}
              onClick={() => {
                setActiveTab(category.id);
                setExpanded([]);
              }}
              startIcon={activeTab !== category.id ? category.icon : null}
              variant={activeTab === category.id ? "contained" : "text"}
              sx={{
                borderRadius: '30px',
                padding: '8px 24px',
                textTransform: 'none',
                fontSize: '1rem',
                fontWeight: 600,
                backgroundColor: activeTab === category.id ? 'brand.main' : '#fff',
                color: activeTab === category.id ? '#fff' : '#666',
                border: activeTab === category.id ? 'none' : '1px solid #e0e0e0',
                '&:hover': {
                  backgroundColor: activeTab === category.id ? 'brand.dark' : '#f5f5f5',
                  color: activeTab === category.id ? '#fff' : 'brand.main',
                }
              }}
            >
              {/* Hiển thị icon bên cạnh text khi active */}
              {activeTab === category.id && <span style={{ marginRight: 8, display: 'flex' }}>{category.icon}</span>}
              {category.label}
            </Button>
          ))}
        </Box>
      </Container>

      {/* --- FAQ LIST SECTION (Logic thêm vào) --- */}
      <Container className="pb-5">
        <Row className="justify-content-center">
          <Col xs={12} md={10} lg={8}>

            {/* Tiêu đề nhỏ cho phần danh sách */}
            <Box mb={3} textAlign="center">
              <Typography variant="h6" color="text.secondary" sx={{ fontWeight: 500 }}>
                {submittedQuery
                  ? <>Search results for <span style={{ color: '#3FCCB2', fontWeight: 700 }}>"{submittedQuery}"</span></>
                  : <>Common questions about <span style={{ color: '#3FCCB2', fontWeight: 700 }}>{categories.find(c => c.id === activeTab)?.label}</span></>
                }
              </Typography>
            </Box>

            {filteredFAQs.length > 0 ? (
              <Box sx={{ bgcolor: '#fff', borderRadius: '8px', overflow: 'hidden', boxShadow: '0 2px 8px rgba(0,0,0,0.05)' }}>
                {filteredFAQs.map((faq) => (
                  <Accordion
                    key={faq.id}
                    expanded={expanded.includes(faq.id)}
                    onChange={handleAccordionChange(faq.id)}
                    disableGutters
                    elevation={0}
                    sx={{
                      '&:before': { display: 'none' },
                      borderBottom: '1px solid #eee',
                      '&:last-child': { borderBottom: 'none' },
                      '&:hover': { backgroundColor: '#fafafa' }
                    }}
                  >
                    <AccordionSummary
                      expandIcon={<ExpandMoreIcon sx={{ color: expanded === faq.id ? 'brand.main' : '#999' }} />}
                      aria-controls={`panel${faq.id}-content`}
                      id={`panel${faq.id}-header`}
                      sx={{ padding: '10px 24px' }}
                    >
                      <Typography
                        sx={{
                          fontWeight: expanded === faq.id ? 600 : 500,
                          color: expanded === faq.id ? 'brand.main' : '#333',
                          fontSize: '1.05rem'
                        }}
                      >
                        {faq.question}
                      </Typography>
                    </AccordionSummary>
                    <AccordionDetails sx={{ padding: '0 24px 24px 24px' }}>
                      <Typography
                        sx={{ color: '#666', lineHeight: 1.6 }}
                        dangerouslySetInnerHTML={{ __html: faq.answer }}
                      />
                    </AccordionDetails>
                  </Accordion>
                ))}
              </Box>
            ) : (
              <NoResult
                image={emptyFaqImg}
                title="No questions found"
                description={`No questions found matching "${submittedQuery}". Try a different keyword.`}
                sx={{ py: 4 }}
              />
            )}
          </Col>
        </Row>
      </Container>
    </div>
  );
}

export default FAQPage;