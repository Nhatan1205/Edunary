import { useMemo, useState } from 'react';
import { Container, Row, Col } from 'reactstrap';
import {
  Accordion,
  AccordionDetails,
  AccordionSummary,
  Box,
  Button,
  TextField,
  Typography
} from '@mui/material';
import BuildIcon from '@mui/icons-material/Build';
import CastForEducationIcon from '@mui/icons-material/CastForEducation';
import ExpandMoreIcon from '@mui/icons-material/ExpandMore';
import FactCheckOutlinedIcon from '@mui/icons-material/FactCheckOutlined';
import PaymentIcon from '@mui/icons-material/Payment';
import RocketLaunchIcon from '@mui/icons-material/RocketLaunch';
import SchoolIcon from '@mui/icons-material/School';
import faqimage from '../../../assets/images/faq-page.jpg';
import emptyFaqImg from '../../../assets/images/empty-faq.png';
import NoResult from '../../../components/NoResult';
import theme from '../../../theme/theme';
import { FAQ_DATA } from './faqdata';

const categories = [
  {
    id: 'getting-started',
    label: 'Getting Started',
    icon: <RocketLaunchIcon fontSize="small" />
  },
  {
    id: 'students',
    label: 'Students',
    icon: <SchoolIcon fontSize="small" />
  },
  {
    id: 'teachers',
    label: 'Teachers',
    icon: <CastForEducationIcon fontSize="small" />
  },
  {
    id: 'payments',
    label: 'Purchase & Payments',
    icon: <PaymentIcon fontSize="small" />
  },
  {
    id: 'troubleshooting',
    label: 'Troubleshooting',
    icon: <BuildIcon fontSize="small" />
  },
  {
    id: 'ai-quality',
    label: 'AI Quality Check',
    icon: <FactCheckOutlinedIcon fontSize="small" />
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
    const normalizedQuery = submittedQuery.trim().toLowerCase();

    return FAQ_DATA.filter((item) => {
      const matchesCategory = item.category === activeTab;
      const matchesSearch =
        item.question.toLowerCase().includes(normalizedQuery) ||
        item.answer.toLowerCase().includes(normalizedQuery);

      return matchesCategory && matchesSearch;
    });
  }, [submittedQuery, activeTab]);

  const submitSearch = () => {
    setSubmittedQuery(searchQuery);
    setExpanded([]);
  };

  return (
    <div style={{ minHeight: '100vh', backgroundColor: '#f5f5f5' }}>
      <div
        style={{
          position: 'relative',
          height: '500px',
          backgroundImage: `linear-gradient(rgba(0,0,0,0.5), rgba(0,0,0,0.5)),url(${faqimage})`,
          backgroundSize: 'cover',
          backgroundPosition: 'center',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          flexDirection: 'column'
        }}
      >
        <Container style={{ position: 'relative', zIndex: 1, textAlign: 'center' }}>
          <Typography
            variant="h2"
            sx={{
              fontWeight: 700,
              color: '#fff',
              mb: '30px',
              fontSize: { xs: '2rem', md: '2.5rem' }
            }}
          >
            Edunary Help Center
          </Typography>

          <Row className="justify-content-center">
            <Col xs={12} md={8} lg={6}>
              <Box
                component="form"
                onSubmit={(event) => {
                  event.preventDefault();
                  submitSearch();
                }}
                sx={{
                  display: 'flex',
                  gap: '10px',
                  flexDirection: { xs: 'column', sm: 'row' }
                }}
              >
                <TextField
                  fullWidth
                  variant="outlined"
                  value={searchQuery}
                  onChange={(event) => setSearchQuery(event.target.value)}
                  placeholder="Search"
                  size="medium"
                  sx={{
                    backgroundColor: '#fff',
                    borderRadius: '4px',
                    '& .MuiOutlinedInput-root': {
                      '& fieldset': { border: 'none' },
                      '&:hover fieldset': { border: 'none' },
                      '&.Mui-focused fieldset': { border: 'none' }
                    }
                  }}
                />
                <Button
                  type="submit"
                  variant="contained"
                  sx={{
                    bgcolor: 'brand.main',
                    color: '#fff',
                    textTransform: 'none',
                    fontSize: '16px',
                    fontWeight: 600,
                    px: '30px',
                    borderRadius: '4px',
                    boxShadow: 'none',
                    minWidth: '120px',
                    '&:hover': {
                      bgcolor: 'brand.dark',
                      boxShadow: 'none'
                    }
                  }}
                >
                  Search
                </Button>
              </Box>
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
              startIcon={category.icon}
              variant={activeTab === category.id ? 'contained' : 'text'}
              sx={{
                borderRadius: '30px',
                px: { xs: 2, md: 3 },
                py: 1,
                textTransform: 'none',
                fontSize: '1rem',
                fontWeight: 600,
                backgroundColor: activeTab === category.id ? 'brand.main' : '#fff',
                color: activeTab === category.id ? '#fff' : '#666',
                border: activeTab === category.id ? '1px solid transparent' : '1px solid #e0e0e0',
                '&:hover': {
                  backgroundColor: activeTab === category.id ? 'brand.dark' : '#f5f5f5',
                  color: activeTab === category.id ? '#fff' : 'brand.main'
                }
              }}
            >
              {category.label}
            </Button>
          ))}
        </Box>
      </Container>

      <Container className="pb-5">
        <Row className="justify-content-center">
          <Col xs={12} md={10} lg={8}>
            <Box mb={3} textAlign="center">
              <Typography variant="h6" color="text.secondary" sx={{ fontWeight: 500 }}>
                {submittedQuery ? (
                  <>
                    Search results for{' '}
                    <span style={{ color: theme.palette.secondaryBrand.main, fontWeight: 700 }}>
                      "{submittedQuery}"
                    </span>
                  </>
                ) : (
                  <>
                    Common questions about{' '}
                    <span style={{ color: theme.palette.secondaryBrand.main, fontWeight: 700 }}>
                      {categories.find((category) => category.id === activeTab)?.label}
                    </span>
                  </>
                )}
              </Typography>
            </Box>

            {filteredFAQs.length > 0 ? (
              <Box
                sx={{
                  bgcolor: '#fff',
                  borderRadius: '8px',
                  overflow: 'hidden',
                  boxShadow: '0 2px 8px rgba(0,0,0,0.05)'
                }}
              >
                {filteredFAQs.map((faq) => {
                  const isExpanded = expanded.includes(faq.id);

                  return (
                    <Accordion
                      key={faq.id}
                      expanded={isExpanded}
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
                        expandIcon={
                          <ExpandMoreIcon sx={{ color: isExpanded ? 'brand.main' : '#999' }} />
                        }
                        aria-controls={`panel${faq.id}-content`}
                        id={`panel${faq.id}-header`}
                        sx={{ px: 3, py: 1.25 }}
                      >
                        <Typography
                          sx={{
                            fontWeight: isExpanded ? 600 : 500,
                            color: isExpanded ? 'brand.main' : '#333',
                            fontSize: '1.05rem'
                          }}
                        >
                          {faq.question}
                        </Typography>
                      </AccordionSummary>
                      <AccordionDetails sx={{ px: 3, pt: 0, pb: 3 }}>
                        <Typography
                          component="div"
                          sx={{
                            color: '#666',
                            lineHeight: 1.6,
                            '& p': { mt: 0, mb: 1.5 },
                            '& p:last-child': { mb: 0 },
                            '& ul, & ol': { my: 1.5, pl: 3 },
                            '& li': { mb: 1 },
                            '& li:last-child': { mb: 0 },
                            '& strong': { color: '#333' }
                          }}
                          dangerouslySetInnerHTML={{ __html: faq.answer }}
                        />
                      </AccordionDetails>
                    </Accordion>
                  );
                })}
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
