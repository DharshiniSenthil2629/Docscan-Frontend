import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import {
  Container,
  Typography,
  Button,
  Box,
  Paper,
  CircularProgress,
  Alert,
  Divider,
  Card,
  CardContent,
  Radio,
  RadioGroup,
  FormControlLabel,
  FormControl,
  TextField,
} from '@mui/material';
import api from '../services/api';
import { useAuth } from '../contexts/AuthContext';
import confetti from '../utils/confetti';
import SummarizeIcon from '@mui/icons-material/Summarize';
import QuizIcon from '@mui/icons-material/Quiz';
import { Collapse, IconButton, List, ListItem, ListItemIcon, ListItemText, Dialog, DialogTitle, DialogContent, DialogActions, LinearProgress } from '@mui/material';
import ExpandMoreIcon from '@mui/icons-material/ExpandMore';
import ExpandLessIcon from '@mui/icons-material/ExpandLess';

function SummaryView({ text }) {
  const [open, setOpen] = React.useState(false);

  // try to split into executive summary and key points
  const splitMarker = text.indexOf('Key') >= 0 ? /Key\s?(concepts|points|Points|Concepts)\s?include:?/i : null;
  let exec = text;
  let points = [];
  if (splitMarker) {
    const parts = text.split(splitMarker);
    exec = parts[0]?.trim() || text;
    const tail = parts.slice(1).join(' ');
    // extract comma separated or bullet points
    points = tail.split(/[-•\n\r]+|,|;/).map(p => p.trim()).filter(Boolean).slice(0, 10);
  } else {
    // fallback: look for sentences that look like key points
    const sentences = text.split('.') .map(s => s.trim()).filter(Boolean);
    exec = sentences.slice(0, 3).join('. ') + (sentences.length > 3 ? '...' : '');
    points = sentences.slice(3, 8);
  }

  return (
    <div>
      <Typography variant="body1" sx={{ mb: 1 }}>{exec}</Typography>
      {points && points.length > 0 && (
        <div>
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
            <Typography variant="subtitle1">Key Points</Typography>
            <IconButton size="small" onClick={() => setOpen(o => !o)}>
              {open ? <ExpandLessIcon /> : <ExpandMoreIcon />}
            </IconButton>
          </Box>
          <Collapse in={open} timeout="auto">
            <List dense>
              {points.map((p, i) => (
                <ListItem key={i}>
                  <ListItemIcon sx={{ minWidth: 28 }}>•</ListItemIcon>
                  <ListItemText primary={p} />
                </ListItem>
              ))}
            </List>
          </Collapse>
        </div>
      )}
    </div>
  );
}

function DocumentDetail() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [document, setDocument] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [generatingSummary, setGeneratingSummary] = useState(false);
  const [generatingQuiz, setGeneratingQuiz] = useState(false);
  const [quizAnswers, setQuizAnswers] = useState({});
  const [quizSubmitted, setQuizSubmitted] = useState(false);
  const [score, setScore] = useState(null);
  const [coinBurst, setCoinBurst] = useState({ show: false, amount: 0 });
  const { refreshProfile, user: authUser } = useAuth();
  const [editingSummary, setEditingSummary] = useState(false);
  const [editedSummary, setEditedSummary] = useState('');
  const [confirmOpen, setConfirmOpen] = useState(false);
  const [encrypting, setEncrypting] = useState(false);

  useEffect(() => {
    fetchDocument();
  }, [id]);

  const fetchDocument = async () => {
    try {
      setLoading(true);
      const response = await api.get(`/api/documents/${id}`);
      setDocument(response.data);
      setError('');
    } catch (error) {
      setError('Failed to fetch document');
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  const handleGenerateSummary = async () => {
    try {
      setGeneratingSummary(true);
      setError('');
      const response = await api.post(`/api/documents/${id}/summary`);
      setDocument((prev) => ({ ...prev, summary: response.data.summary }));
    } catch (error) {
      let errorMessage = error.response?.data?.message || 
                        error.response?.data?.error || 
                        'Failed to generate summary.';
      
      // Provide more helpful message for specific error codes
      if (error.response?.data?.code === 'NO_TEXT_EXTRACTED') {
        errorMessage = 'Could not extract readable text from this PDF. The PDF may be corrupted, password-protected, or contain only images without text. Please try a different PDF file.';
      } else if (error.response?.data?.code === 'OCR_FAILED') {
        errorMessage = 'OCR processing failed. The PDF may be corrupted or unsupported. Please try a different PDF file.';
      }
      
      setError(errorMessage);
      console.error('Summary generation error:', error.response?.data || error.message);
    } finally {
      setGeneratingSummary(false);
    }
  };

  const handleGenerateQuiz = async () => {
    try {
      setGeneratingQuiz(true);
      setError('');
      const response = await api.post(`/api/documents/${id}/quiz`);
      setDocument((prev) => ({ ...prev, quiz: response.data.quiz }));
    } catch (error) {
      const errorMessage = error.response?.data?.message || 
                          error.response?.data?.error || 
                          'Failed to generate quiz. Please ensure a summary has been generated first.';
      setError(errorMessage);
      console.error('Quiz generation error:', error.response?.data || error.message);
    } finally {
      setGeneratingQuiz(false);
    }
  };

  const handleGenerateMcq = async () => {
    try {
      setGeneratingQuiz(true);
      setError('');
      const response = await api.post(`/api/documents/${id}/quiz?type=mcq`);
      setDocument((prev) => ({ ...prev, quiz: response.data.quiz }));
    } catch (error) {
      const errorMessage = error.response?.data?.message || 
                          error.response?.data?.error || 
                          'Failed to generate MCQ quiz. Please ensure a summary has been generated first.';
      setError(errorMessage);
      console.error('MCQ generation error:', error.response?.data || error.message);
    } finally {
      setGeneratingQuiz(false);
    }
  };

  const handleGenerateBoth = async () => {
    try {
      setGeneratingSummary(true);
      setGeneratingQuiz(true);
      setError('');
      const s = await api.post(`/api/documents/${id}/summary`);
      setDocument((prev) => ({ ...prev, summary: s.data.summary }));
      setGeneratingSummary(false);

      const q = await api.post(`/api/documents/${id}/quiz`);
      setDocument((prev) => ({ ...prev, quiz: q.data.quiz }));
    } catch (err) {
      console.error('Failed to generate both:', err);
      setError('Failed to generate summary and quiz.');
    } finally {
      setGeneratingSummary(false);
      setGeneratingQuiz(false);
    }
  };

  const startEditSummary = () => {
    setEditedSummary(document.summary || '');
    setEditingSummary(true);
  };

  const cancelEditSummary = () => {
    setEditedSummary('');
    setEditingSummary(false);
  };

  const saveEditedSummary = async () => {
    try {
      const res = await api.patch(`/api/documents/${id}/summary`, { summary: editedSummary });
      setDocument(prev => ({ ...prev, summary: res.data.summary }));
      setEditingSummary(false);
    } catch (err) {
      console.error('Failed to save summary:', err);
      setError('Failed to save summary');
    }
  };

  const handleQuizAnswerChange = (questionIndex, answer) => {
    setQuizAnswers((prev) => ({
      ...prev,
      [questionIndex]: answer,
    }));
  };

  const handleSubmitQuiz = async () => {
    if (!document.quiz || document.quiz.length === 0) return;

    // Prepare answers object keyed by question index
    const answersPayload = {};
    document.quiz.forEach((q, idx) => {
      answersPayload[idx] = (quizAnswers[idx] || '').toString();
    });

    try {
      const res = await api.post('/api/documents/save-score', { documentId: id, answers: answersPayload });
      const { obtained, total, percentage, coins } = res.data;
      setScore(percentage);
      setQuizSubmitted(true);
      setDocument((prev) => ({ ...prev, lastResult: { obtained, total, percentage } }));

      // Refresh profile to get latest coins and scores
      const beforeCoins = authUser?.coins || 0;
      const updated = await refreshProfile();
      const afterCoins = updated?.coins || 0;
      const earned = Math.max(0, afterCoins - beforeCoins);
      if (earned > 0) {
        setCoinBurst({ show: true, amount: earned });
        setTimeout(() => setCoinBurst({ show: false, amount: 0 }), 3000);
      }
      // celebratory confetti for high score
      if (percentage >= 80) confetti({ count: 80 });
    } catch (err) {
      console.error('Failed to save score:', err);
      setError('Failed to submit quiz.');
    }
  };

  const handleOpenConfirm = () => setConfirmOpen(true);
  const handleCancelConfirm = () => setConfirmOpen(false);
  const handleConfirmSubmit = async () => {
    // simulate encryption/progress
    setEncrypting(true);
    setTimeout(async () => {
      setEncrypting(false);
      setConfirmOpen(false);
      await handleSubmitQuiz();
    }, 900);
  };

  if (loading) {
    return (
      <Container maxWidth="lg" sx={{ mt: 4, textAlign: 'center' }}>
        <CircularProgress />
      </Container>
    );
  }

  if (error && !document) {
    return (
      <Container maxWidth="lg" sx={{ mt: 4 }}>
        <Alert severity="error">{error}</Alert>
        <Button onClick={() => navigate('/documents')} sx={{ mt: 2 }}>
          Back to Documents
        </Button>
      </Container>
    );
  }

  return (
    <Container maxWidth="lg" sx={{ mt: 4, mb: 4 }}>
      <Button onClick={() => navigate('/documents')} sx={{ mb: 2 }}>
        ← Back to Documents
      </Button>

      <Paper elevation={3} sx={{ p: 4, mb: 4 }}>
        <Typography variant="h4" component="h1" gutterBottom>
          {document.originalName}
        </Typography>
        <Typography variant="body2" color="text.secondary">
          Uploaded: {new Date(document.uploadDate).toLocaleString()}
        </Typography>
      </Paper>

      {error && (
        <Alert severity="error" sx={{ mb: 2 }}>
          {error}
        </Alert>
      )}

      {/* Summary Section */}
      <Paper elevation={3} sx={{ p: 4, mb: 4 }}>
        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
          <Typography variant="h5" component="h2">
            <SummarizeIcon sx={{ verticalAlign: 'middle', mr: 1 }} />
            Summary
          </Typography>
          <Box sx={{ display: 'flex', gap: 1 }}>
            {!document.summary && (
              <Button variant="contained" onClick={handleGenerateSummary} disabled={generatingSummary}>
                {generatingSummary ? 'Generating...' : 'Generate Summary'}
              </Button>
            )}
            <Button variant="outlined" onClick={handleGenerateBoth} disabled={generatingSummary || generatingQuiz}>
              {generatingSummary || generatingQuiz ? 'Generating...' : 'Generate Summary & Quiz'}
            </Button>
            <Button variant="outlined" onClick={handleGenerateMcq} disabled={generatingQuiz || !document.summary}>
              {generatingQuiz ? 'Generating...' : 'Generate MCQ Quiz'}
            </Button>
          </Box>
        </Box>
        <Divider sx={{ mb: 2 }} />
        {document.summary ? (
          editingSummary ? (
            <div>
              <TextField
                fullWidth
                multiline
                minRows={6}
                value={editedSummary}
                onChange={(e) => setEditedSummary(e.target.value)}
                sx={{ mb: 2 }}
              />
              <Box sx={{ display: 'flex', gap: 1 }}>
                <Button variant="contained" onClick={saveEditedSummary}>Save</Button>
                <Button variant="outlined" onClick={cancelEditSummary}>Cancel</Button>
              </Box>
            </div>
          ) : (
            <div>
              <SummaryView text={document.summary} />
              <Box sx={{ mt: 1 }}>
                <Button size="small" variant="text" onClick={startEditSummary}>Edit Summary</Button>
              </Box>
            </div>
          )
        ) : (
          <Typography variant="body2" color="text.secondary">
            No summary available. Click "Generate Summary" to create one.
          </Typography>
        )}
      </Paper>

      {/* Quiz Section */}
      <Paper elevation={3} sx={{ p: 4 }}>
        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
          <Typography variant="h5" component="h2">
            <QuizIcon sx={{ verticalAlign: 'middle', mr: 1 }} />
            Quiz
          </Typography>
          {!document.quiz || document.quiz.length === 0 ? (
            <Button variant="contained" onClick={handleGenerateQuiz} disabled={generatingQuiz || !document.summary}>
              {generatingQuiz ? 'Generating...' : 'Generate Quiz'}
            </Button>
          ) : (
            <Box sx={{ display: 'flex', gap: 1 }}>
              {!quizSubmitted && <Button variant="contained" onClick={handleSubmitQuiz}>Submit Quiz</Button>}
              <Button variant="outlined" onClick={() => navigate(`/documents/${id}/quiz`)}>Open Quiz View</Button>
            </Box>
          )}
        </Box>
        <Divider sx={{ mb: 2 }} />

        {document.quiz && document.quiz.length > 0 ? (
          <>
            {document.quiz.map((question, index) => (
              <Card key={index} sx={{ mb: 2 }}>
                <CardContent>
                  <Typography variant="h6" gutterBottom>
                    Question {index + 1}: {question.question}
                  </Typography>
                  {question.type === 'mcq' ? (
                    <FormControl component="fieldset" disabled={quizSubmitted}>
                      <RadioGroup
                        value={quizAnswers[index] || ''}
                        onChange={(e) => handleQuizAnswerChange(index, e.target.value)}
                      >
                        {question.options.map((option, optIndex) => (
                          <FormControlLabel
                            key={optIndex}
                            value={option}
                            control={<Radio />}
                            label={option}
                          />
                        ))}
                      </RadioGroup>
                    </FormControl>
                  ) : (
                    <Box>
                      <TextField
                        fullWidth
                        multiline
                        minRows={2}
                        value={quizAnswers[index] || ''}
                        onChange={(e) => handleQuizAnswerChange(index, e.target.value)}
                        disabled={quizSubmitted}
                        placeholder="Type your answer here"
                      />
                    </Box>
                  )}

                  {quizSubmitted && (
                    <Alert
                      severity={
                        (question.type === 'mcq' && quizAnswers[index] === question.correctAnswer) ||
                        (question.type === 'short' && (quizAnswers[index] || '').toString().trim().toLowerCase() === (question.answer || '').toString().trim().toLowerCase())
                          ? 'success'
                          : 'error'
                      }
                      sx={{ mt: 1 }}
                    >
                      {question.type === 'mcq' ? (
                        quizAnswers[index] === question.correctAnswer
                          ? 'Correct!'
                          : `Incorrect. Correct answer: ${question.correctAnswer}`
                      ) : (
                        (quizAnswers[index] || '').toString().trim().toLowerCase() === (question.answer || '').toString().trim().toLowerCase()
                          ? 'Correct!'
                          : `Answer: ${question.answer}`
                      )}
                    </Alert>
                  )}
                </CardContent>
              </Card>
            ))}
            {quizSubmitted && (
              <Alert severity={score >= 70 ? 'success' : 'info'} sx={{ mt: 2 }}>
                <Typography variant="h6">
                  Your Score: {score}%
                </Typography>
              </Alert>
            )}

            {/* Coin burst animation */}
            {coinBurst.show && (
              <Box sx={{ position: 'fixed', right: 24, bottom: 120, zIndex: 1400 }}>
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, p: 1, bgcolor: 'secondary.main', color: 'white', borderRadius: 2, boxShadow: 6, animation: 'pop 0.9s ease-out' }}>
                  <Box component="span" sx={{ fontWeight: 700 }}>{`+${coinBurst.amount}`}</Box>
                  <Box component="span">coins</Box>
                </Box>
              </Box>
            )}
          </>
        ) : (
          <Typography variant="body2" color="text.secondary">
            {!document.summary
              ? 'Please generate a summary first before creating a quiz.'
              : 'No quiz available. Click "Generate Quiz" to create one.'}
          </Typography>
        )}
      </Paper>
    </Container>
  );
}

export default DocumentDetail;

