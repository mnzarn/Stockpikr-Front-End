import { Box, Button, Container, Typography } from '@mui/material';
import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import landingPageImage from '../assets/images/image-landing-page.jpg';
import investmentPlanningImage from '../assets/images/investment-planning.png';
import priceTrackingImage from '../assets/images/price-tracking.png';
import stockAnalysisImage from '../assets/images/stock-analysis.png';
import stockFilterImage from '../assets/images/stock-filter.png';
import '../index.css';

interface Feature {
  id: string;
  title: string;
  description: string;
  icon: string;
  image: string;
}

const LandingPage: React.FC = () => {
  const [isVisible, setIsVisible] = useState<{ [key: string]: boolean }>({});

  useEffect(() => {
    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.target.id) {
            setIsVisible(prev => ({
              ...prev,
              [entry.target.id]: entry.isIntersecting
            }));
          }
        });
      },
      {
        threshold: 0.1,
        rootMargin: '0px 0px -100px 0px'
      }
    );

    document.querySelectorAll('.reveal-section').forEach((el) => {
      observer.observe(el);
    });

    return () => observer.disconnect();
  }, []);

  const features: Feature[] = [
    {
      id: 'filtering',
      title: 'Easy Filtering & Viewing',
      description: 'Streamline your stock analysis with intuitive filtering tools. Quickly sort and view your watchlists based on multiple criteria, making it easier than ever to track your potential investments.',
      icon: '✨',
      image: stockFilterImage
    },
    {
      id: 'tracking',
      title: 'Real-Time Price Tracking',
      description: 'Stay on top of market movements with our comprehensive price tracking feature. Monitor multiple stocks simultaneously and never miss an important price change.',
      icon: '📈',
      image: priceTrackingImage
    },
    {
      id: 'analysis',
      title: 'Deep Stock Analysis',
      description: 'Get detailed insights into stock performance with our advanced analysis tools. From technical indicators to fundamental metrics, make informed decisions with comprehensive data.',
      icon: '📊',
      image: stockAnalysisImage
    },
    {
      id: 'planning',
      title: 'Investment Planning',
      description: 'Build and refine your investment strategy with our planning tools. Set goals, track performance, and adjust your approach based on real market data.',
      icon: '📝',
      image: investmentPlanningImage
    }
  ];

  return (
    <Box sx={{
      position: 'relative',
      overflowX: 'hidden',
      width: '100%'
    }}>
      <Box
        sx={{
          minHeight: '90vh',
          display: 'flex',
          alignItems: 'center',
          paddingTop: '40px',
          background: `linear-gradient(180deg, var(--main-bg-color) 0%, var(--background-light) 100%)`,
          width: '100%'
        }}
      >
        <Container
          sx={{
            display: 'flex',
            flexDirection: { xs: 'column', md: 'row' },
            alignItems: 'center',
            gap: 4,
            py: 4,
            maxWidth: '1200px !important',
            px: { xs: 2, sm: 3, md: 4 }
          }}
        >
          <Box sx={{ flex: 1, textAlign: { xs: 'center', md: 'left' } }}>
            <Typography
              variant="h1"
              sx={{
                fontSize: { xs: '2.5rem', md: '3.5rem' },
                fontWeight: 800,
                color: 'var(--primary-blue)',
                mb: 3,
                fontFamily: 'var(--font-family)'
              }}
            >
              Create Your<br />Watchlists
            </Typography>
            <Typography
              variant="h2"
              sx={{
                fontSize: { xs: '1.2rem', md: '1.5rem' },
                color: 'var(--secondary-blue)',
                mb: 4,
                fontWeight: 500,
                fontFamily: 'var(--font-family)'
              }}
            >
              Build, track, and analyze your stock portfolio with powerful tools designed for modern investors.
            </Typography>
            <Button
              variant="contained"
              component={Link}
              to="/signin"
              sx={{
                backgroundColor: 'var(--primary-blue)',
                color: 'var(--text-color)',
                borderRadius: '12px',
                padding: '16px 32px',
                fontSize: '1.1rem',
                fontWeight: 'bold',
                border: '2px solid var(--primary-blue)',
                transition: 'all 0.3s ease',
                '&:hover': {
                  backgroundColor: 'var(--secondary-blue)',
                  transform: 'translateY(-2px)',
                  boxShadow: '0 6px 12px var(--border-color)'
                }
              }}
            >
              Get Started Now →
            </Button>
          </Box>
          <Box sx={{ flex: 1 }}>
            <img
              src={landingPageImage}
              alt="StockPikr Dashboard"
              style={{
                width: '100%',
                maxWidth: '600px',
                height: 'auto',
                borderRadius: '12px',
                boxShadow: `0 8px 24px var(--border-color)`
              }}
            />
          </Box>
        </Container>
      </Box>

      {features.map((feature, index) => (
        <Box
          key={feature.id}
          id={feature.id}
          className="reveal-section"
          sx={{
            minHeight: '90vh',
            display: 'flex',
            alignItems: 'center',
            background: index % 2 === 0
              ? 'linear-gradient(0deg, #E5EFF8 0%, #F0F7FF 100%)'
              : '#ffffff',
            opacity: isVisible[feature.id] ? 1 : 0,
            transform: isVisible[feature.id]
              ? 'translateX(0)'
              : `translateX(${index % 2 === 0 ? '-100px' : '100px'})`,
            transition: 'all 0.6s cubic-bezier(0.4, 0, 0.2, 1)',
            willChange: 'transform, opacity',
            position: 'relative',
            width: '100%',
            overflow: 'hidden'
          }}
        >
          <Container
            sx={{
              display: 'flex',
              flexDirection: { xs: 'column', md: index % 2 === 0 ? 'row' : 'row-reverse' },
              alignItems: 'center',
              gap: 6,
              py: 4,
              maxWidth: '1200px !important',
              px: { xs: 2, sm: 3, md: 4 }
            }}
          >
            <Box sx={{ flex: 1, textAlign: { xs: 'center', md: 'left' } }}>
              <Typography
                variant="h2"
                sx={{
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: { xs: 'center', md: 'flex-start' },
                  gap: 2,
                  fontSize: { xs: '2rem', md: '2.5rem' },
                  fontWeight: 700,
                  color: 'var(--primary-blue)',
                  mb: 3,
                  fontFamily: 'var(--font-family)',
                  width: '100%'
                }}
              >
                <span style={{ fontSize: '2.5rem' }}>{feature.icon}</span>
                {feature.title}
              </Typography>
              <Typography
                variant="body1"
                sx={{
                  fontSize: '1.1rem',
                  color: 'var(--secondary-blue)',
                  mb: 4,
                  lineHeight: 1.6,
                  fontFamily: 'var(--font-family)'
                }}
              >
                {feature.description}
              </Typography>
            </Box>
            <Box sx={{ flex: 1 }}>
              <img
                src={feature.image}
                alt={feature.title}
                style={{
                  width: '100%',
                  maxWidth: '600px',
                  height: 'auto',
                  borderRadius: '12px',
                  boxShadow: `0 8px 24px var(--border-color)`
                }}
              />
            </Box>
          </Container>
        </Box>
      ))}

      <Box
        sx={{
          py: 12,
          background: 'var(--navbar-bg-color)',
          width: '100%'
        }}
      >
        <Container maxWidth="md">
          <Typography
            variant="h2"
            sx={{
              fontSize: { xs: '2rem', md: '2.5rem' },
              fontWeight: 700,
              mb: 3,
              fontFamily: 'var(--font-family)',
              color: 'var(--text-color)'
            }}
          >
            Ready to Start Your Investment Journey?
          </Typography>
          <Typography
            variant="h3"
            sx={{
              fontSize: { xs: '1.2rem', md: '1.5rem' },
              fontWeight: 400,
              mb: 4,
              opacity: 0.9,
              fontFamily: 'var(--font-family)',
              color: 'var(--text-color)'
            }}
          >
            Join the team of investors who trust StockPikr for their market analysis
          </Typography>
          <Button
            variant="contained"
            component={Link}
            to="/signin"
            sx={{
              backgroundColor: 'var(--secondary-button-bg-color)',
              color: 'var(--text-color)',
              borderRadius: '12px',
              padding: '16px 32px',
              fontSize: '1.1rem',
              fontWeight: 'bold',
              transition: 'all 0.3s ease',
              '&:hover': {
                backgroundColor: 'var(--secondary-blue)',
                transform: 'translateY(-2px)',
                boxShadow: '0 6px 12px var(--border-color)'
              }
            }}
          >
            Access Your Dashboard →
          </Button>
        </Container>
      </Box>
    </Box>
  );
};

export default LandingPage;
