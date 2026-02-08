import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { Container, Typography, Paper, Button, Card, CardContent, FormControl, RadioGroup, FormControlLabel, Radio, TextField, Alert, Box } from '@mui/material';
import api from '../services/api';
import confetti from '../utils/confetti';
import { useAuth } from '../contexts/AuthContext';

export default function QuizOnly() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [document, setDocument] = useState(null);
  const [loading, setLoading] = useState(true);
  const [answers, setAnswers] = useState({});
  const [submitted, setSubmitted] = useState(false);
  const [score, setScore] = useState(null);
  const { refreshProfile, user: authUser } = useAuth();

  useEffect(() => { fetchDoc(); }, [id]);

  const fetchDoc = async () => {
    try {
      setLoading(true);
      const res = await api.get(`/api/documents/${id}`);
      setDocument(res.data);
    } catch (err) {
      console.error(err);
    } finally { setLoading(false); }
  };

  const handleChange = (idx, val) => setAnswers(prev => ({ ...prev, [idx]: val }));

  const handleSubmit = async () => {
    if (!document?.quiz) return;
    try {
      const payload = {};
      document.quiz.forEach((q, i) => payload[i] = (answers[i] || '').toString());
      const res = await api.post('/api/documents/save-score', { documentId: id, answers: payload });
      const { percentage } = res.data;
      setScore(percentage);
      setSubmitted(true);
      await refreshProfile();
      if (percentage >= 80) confetti();
    } catch (err) { console.error(err); }
  };

  if (loading) return <Container sx={{ mt: 6 }}>Loading...</Container>;
  if (!document) return <Container sx={{ mt: 6 }}>Document not found.</Container>;

  return (
    <Container maxWidth="md" sx={{ mt: 4 }}>
      <Button onClick={() => navigate(`/documents/${id}`)} sx={{ mb: 2 }}>← Back</Button>
      <Paper sx={{ p: 3 }}>
        <Typography variant="h5" gutterBottom>{document.originalName} — Quiz</Typography>
        {(!document.quiz || document.quiz.length === 0) && (
          <Alert severity="info">No quiz available. Generate one from the document page.</Alert>
        )}
        {(document.quiz || []).map((q, idx) => (
          <Card key={idx} sx={{ mb: 2 }}>
            <CardContent>
              <Typography variant="subtitle1">{idx+1}. {q.question}</Typography>
              {q.type === 'mcq' ? (
                <FormControl>
                  <RadioGroup value={answers[idx] || ''} onChange={(e) => handleChange(idx, e.target.value)}>
                    {q.options.map((opt, oi) => <FormControlLabel key={oi} value={opt} control={<Radio />} label={opt} />)}
                  </RadioGroup>
                </FormControl>
              ) : (
                <TextField fullWidth multiline minRows={3} value={answers[idx] || ''} onChange={(e) => handleChange(idx, e.target.value)} />
              )}
            </CardContent>
          </Card>
        ))}
        <Box sx={{ display: 'flex', gap: 2, mt: 2 }}>
          <Button variant="contained" onClick={handleSubmit} disabled={submitted || !(document.quiz && document.quiz.length)}>Submit Quiz</Button>
        </Box>
        {submitted && <Alert sx={{ mt: 2 }}>{`Your score: ${score}%`}</Alert>}
      </Paper>
    </Container>
  );
}
