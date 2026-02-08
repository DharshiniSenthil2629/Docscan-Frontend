import React from 'react';
import { Link } from 'react-router-dom';
import {
  Container,
  Typography,
  Button,
  Box,
  Paper,
  Grid,
  Avatar,
  useTheme,
} from '@mui/material';
import { useAuth } from '../contexts/AuthContext';
import UploadFileIcon from '@mui/icons-material/UploadFile';
import SummarizeIcon from '@mui/icons-material/Summarize';
import QuizIcon from '@mui/icons-material/Quiz';
import AutoAwesomeIcon from '@mui/icons-material/AutoAwesome';
import SpeedIcon from '@mui/icons-material/Speed';
import SecurityIcon from '@mui/icons-material/Security';

function Home() {
  const { user } = useAuth();
  const theme = useTheme();

  return (
    <>
      {/* Hero Section */}
      <Box
        sx={{
          background: `linear-gradient(135deg, ${theme.palette.primary.main} 0%, ${theme.palette.secondary.main} 100%)`,
          color: 'white',
          py: { xs: 8, md: 12 },
          position: 'relative',
          overflow: 'hidden',
        }}
      >
        <Container maxWidth="lg">
          <Box sx={{ textAlign: 'center', position: 'relative', zIndex: 1 }}>
            <Typography
              variant="h1"
              component="h1"
              sx={{
                fontWeight: 800,
                fontSize: { xs: '3rem', md: '4rem' },
                mb: 2,
                textShadow: '0 2px 4px rgba(0,0,0,0.1)',
              }}
            >
              DocuScan
            </Typography>
            <Typography
              variant="h4"
              sx={{
                fontWeight: 300,
                mb: 3,
                opacity: 0.9,
                fontSize: { xs: '1.5rem', md: '2rem' },
              }}
            >
              AI-Powered Document Analysis Platform
            </Typography>
            <Typography
              variant="h6"
              sx={{
                mb: 4,
                opacity: 0.8,
                maxWidth: '600px',
                mx: 'auto',
                lineHeight: 1.6,
              }}
            >
              Transform your PDF documents into intelligent summaries and interactive quizzes with our advanced AI technology
            </Typography>
            {!user && (
              <Box sx={{ mt: 4 }}>
                <Button
                  variant="contained"
                  size="large"
                  component={Link}
                  to="/signup"
                  sx={{
                    mr: 2,
                    px: 4,
                    py: 1.5,
                    fontSize: '1.1rem',
                    backgroundColor: 'white',
                    color: 'primary.main',
                    '&:hover': {
                      backgroundColor: 'grey.100',
                      transform: 'translateY(-2px)',
                    },
                  }}
                >
                  Get Started Free
                </Button>
                <Button
                  variant="outlined"
                  size="large"
                  component={Link}
                  to="/login"
                  sx={{
                    px: 4,
                    py: 1.5,
                    fontSize: '1.1rem',
                    borderColor: 'white',
                    color: 'white',
                    '&:hover': {
                      borderColor: 'white',
                      backgroundColor: 'rgba(255, 255, 255, 0.1)',
                    },
                  }}
                >
                  Sign In
                </Button>
              </Box>
            )}
            {user && (
              <Button
                variant="contained"
                size="large"
                component={Link}
                to="/dashboard"
                sx={{
                  px: 4,
                  py: 1.5,
                  fontSize: '1.1rem',
                  backgroundColor: 'white',
                  color: 'primary.main',
                  '&:hover': {
                    backgroundColor: 'grey.100',
                    transform: 'translateY(-2px)',
                  },
                }}
              >
                Go to Dashboard
              </Button>
            )}
          </Box>
        </Container>
        {/* Background decoration */}
        <Box
          sx={{
            position: 'absolute',
            top: 0,
            left: 0,
            right: 0,
            bottom: 0,
            opacity: 0.1,
            backgroundImage: 'radial-gradient(circle at 20% 50%, white 0%, transparent 50%), radial-gradient(circle at 80% 80%, white 0%, transparent 50%)',
          }}
        />
      </Box>

      {/* Features Section */}
      <Container maxWidth="lg" sx={{ py: { xs: 8, md: 12 } }}>
        <Box sx={{ textAlign: 'center', mb: 8 }}>
          <Typography variant="h2" gutterBottom>
            Powerful Features
          </Typography>
          <Typography variant="h6" color="text.secondary" sx={{ maxWidth: '600px', mx: 'auto' }}>
            Everything you need to analyze, understand, and test your knowledge from documents
          </Typography>
        </Box>

        <Grid container spacing={4}>
          <Grid item xs={12} md={4}>
            <Paper
              component={Link}
              to="/documents"
              className="card-hover fade-in"
              sx={{
                p: 4,
                textAlign: 'center',
                height: '100%',
                background: 'linear-gradient(145deg, #ffffff 0%, #f8fafc 100%)',
                textDecoration: 'none',
                color: 'inherit'
              }}
            >
              <Avatar
                sx={{
                  width: 80,
                  height: 80,
                  bgcolor: 'primary.main',
                  mx: 'auto',
                  mb: 3,
                }}
              >
                <UploadFileIcon sx={{ fontSize: 40 }} />
              </Avatar>
              <Typography variant="h5" gutterBottom sx={{ fontWeight: 600 }}>
                Smart Upload
              </Typography>
              <Typography variant="body2" color="text.secondary" sx={{ lineHeight: 1.6 }}>
                Upload PDF documents with a simple drag-and-drop or file-selection interface. Files are processed securely and prepared for analysis.
              </Typography>
            </Paper>
          </Grid>
          <Grid item xs={12} md={4}>
            <Paper
              component={Link}
              to="/documents"
              className="card-hover fade-in"
              sx={{
                p: 4,
                textAlign: 'center',
                height: '100%',
                background: 'linear-gradient(145deg, #ffffff 0%, #f8fafc 100%)',
                textDecoration: 'none',
                color: 'inherit'
              }}
            >
              <Avatar
                sx={{
                  width: 80,
                  height: 80,
                  bgcolor: 'secondary.main',
                  mx: 'auto',
                  mb: 3,
                }}
              >
                <SummarizeIcon sx={{ fontSize: 40 }} />
              </Avatar>
              <Typography variant="h5" gutterBottom sx={{ fontWeight: 600 }}>
                AI Summaries
              </Typography>
              <Typography variant="body2" color="text.secondary" sx={{ lineHeight: 1.6 }}>
                Receive concise, formally phrased summaries that distill key points and principal conclusions from your documents.
              </Typography>
            </Paper>
          </Grid>
          <Grid item xs={12} md={4}>
            <Paper
              component={Link}
              to="/documents"
              className="card-hover fade-in"
              sx={{
                p: 4,
                textAlign: 'center',
                height: '100%',
                background: 'linear-gradient(145deg, #ffffff 0%, #f8fafc 100%)',
                textDecoration: 'none',
                color: 'inherit'
              }}
            >
              <Avatar
                sx={{
                  width: 80,
                  height: 80,
                  bgcolor: 'success.main',
                  mx: 'auto',
                  mb: 3,
                }}
              >
                <QuizIcon sx={{ fontSize: 40 }} />
              </Avatar>
              <Typography variant="h5" gutterBottom sx={{ fontWeight: 600 }}>
                Interactive Quizzes
              </Typography>
              <Typography variant="body2" color="text.secondary" sx={{ lineHeight: 1.6 }}>
                Assess comprehension with automatically generated multiple-choice items and short-answer prompts; answers and scores are recorded to your profile history.
              </Typography>
            </Paper>
          </Grid>
        </Grid>
      </Container>

      {/* Benefits Section */}
      <Box sx={{ backgroundColor: 'grey.50', py: { xs: 8, md: 12 } }}>
        <Container maxWidth="lg">
          <Box sx={{ textAlign: 'center', mb: 8 }}>
            <Typography variant="h2" gutterBottom>
              Why Choose DocuScan?
            </Typography>
          </Box>
          <Grid container spacing={4}>
            <Grid item xs={12} md={4}>
              <Box sx={{ textAlign: 'center' }}>
                <Avatar
                  sx={{
                    width: 60,
                    height: 60,
                    bgcolor: 'primary.main',
                    mx: 'auto',
                    mb: 2,
                  }}
                >
                  <SpeedIcon />
                </Avatar>
                <Typography variant="h6" gutterBottom sx={{ fontWeight: 600 }}>
                  Lightning Fast
                </Typography>
                <Typography variant="body2" color="text.secondary">
                  Process documents and generate insights in seconds, not minutes
                </Typography>
              </Box>
            </Grid>
            <Grid item xs={12} md={4}>
              <Box sx={{ textAlign: 'center' }}>
                <Avatar
                  sx={{
                    width: 60,
                    height: 60,
                    bgcolor: 'secondary.main',
                    mx: 'auto',
                    mb: 2,
                  }}
                >
                  <AutoAwesomeIcon />
                </Avatar>
                <Typography variant="h6" gutterBottom sx={{ fontWeight: 600 }}>
                  Smart Analysis
                </Typography>
                <Typography variant="body2" color="text.secondary">
                  Advanced algorithms extract key information and generate meaningful content
                </Typography>
              </Box>
            </Grid>
            <Grid item xs={12} md={4}>
              <Box sx={{ textAlign: 'center' }}>
                <Avatar
                  sx={{
                    width: 60,
                    height: 60,
                    bgcolor: 'success.main',
                    mx: 'auto',
                    mb: 2,
                  }}
                >
                  <SecurityIcon />
                </Avatar>
                <Typography variant="h6" gutterBottom sx={{ fontWeight: 600 }}>
                  Secure & Private
                </Typography>
                <Typography variant="body2" color="text.secondary">
                  Your documents are processed securely with enterprise-grade protection
                </Typography>
              </Box>
            </Grid>
          </Grid>
        </Container>
      </Box>
    </>
  );
}

export default Home;

