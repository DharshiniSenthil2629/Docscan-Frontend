import React, { useState, useEffect } from 'react';
import {
  Container,
  Grid,
  Card,
  CardContent,
  Typography,
  Box,
  Avatar,
  LinearProgress,
  Paper,
  List,
  ListItem,
  ListItemText,
  ListItemIcon,
  Chip,
  Button,
  useTheme,
} from '@mui/material';
import { useNavigate } from 'react-router-dom';
import {
  UploadFile,
  Summarize,
  Quiz,
  TrendingUp,
  Assessment,
  Description,
  Schedule,
  Star,
  BarChart,
  PieChart,
  Timeline,
} from '@mui/icons-material';
import { useAuth } from '../contexts/AuthContext';
import api from '../services/api';

function Dashboard() {
  const { user } = useAuth();
  const theme = useTheme();
  const navigate = useNavigate();
  const [stats, setStats] = useState({
    totalDocuments: 0,
    totalSummaries: 0,
    totalQuizzes: 0,
    averageScore: 0,
    recentActivity: [],
    scoreHistory: [],
  });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchDashboardData();
  }, []);

  const fetchDashboardData = async () => {
    try {
      const response = await api.get('/api/documents');
      const documents = response.data;
      // Ensure documents are ordered by uploadDate desc
      const sortedDocs = documents.slice().sort((a, b) => new Date(b.uploadDate) - new Date(a.uploadDate));

      // Calculate stats
      const totalDocuments = documents.length;
      const totalSummaries = documents.filter(doc => doc.summary).length;
      const totalQuizzes = documents.filter(doc => doc.quiz && doc.quiz.length > 0).length;
      
      // Calculate average score from user scores (scores stored as percentage or legacy numeric)
      let averageScore = 0;
      if (user && user.scores && user.scores.length > 0) {
        const totalScore = user.scores.reduce((sum, s) => sum + ((s.percentage != null) ? s.percentage : (s.score || 0)), 0);
        averageScore = Math.round(totalScore / user.scores.length);
      }

      // Recent activity
      const recentActivity = sortedDocs.slice(0, 5).map(doc => ({
        id: doc._id,
        name: doc.originalName,
        date: doc.uploadDate ? new Date(doc.uploadDate).toLocaleString() : '—',
        action: doc.summary ? 'Processed' : 'Uploaded',
      }));

      // Score history: map user scores to document names when possible
      const scoreHistory = (user && user.scores || []).map(s => {
        const doc = documents.find(d => d._id === (s.documentId || ''));
        // prefer explicit percentage, fall back to score; treat missing as null
        const score = (s.percentage != null) ? s.percentage : (s.score != null ? s.score : null);
        // normalize date safely
        let dateStr = '—';
        try {
          const dateVal = s.date || s.createdAt || s.timestamp || null;
          dateStr = dateVal ? new Date(dateVal).toLocaleString() : '—';
        } catch (e) {
          dateStr = '—';
        }

        return {
          documentId: s.documentId,
          documentName: doc ? doc.originalName : 'Removed document',
          score,
          date: dateStr,
        };
      }).slice().reverse();

      setStats({
        totalDocuments,
        totalSummaries,
        totalQuizzes,
        averageScore,
        recentActivity,
        scoreHistory,
      });
    } catch (error) {
      console.error('Error fetching dashboard data:', error);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <Container maxWidth="lg" sx={{ mt: 4, mb: 4 }}>
        <LinearProgress />
      </Container>
    );
  }

  return (
    <Container maxWidth="lg" sx={{ mt: 4, mb: 4 }}>
      <Paper
        sx={{
          p: 3,
          mb: 4,
          borderRadius: 3,
          background: `linear-gradient(90deg, ${theme.palette.primary.light}22 0%, ${theme.palette.secondary.light}11 100%)`,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
        }}
      >
        <Box>
          <Typography variant="h3" component="h1" sx={{ fontWeight: 800 }}>
            Welcome back, {user?.username || 'User'}!
          </Typography>
          <Typography variant="subtitle1" color="text.secondary" sx={{ mt: 1 }}>
            Here's your document analysis overview
          </Typography>
          <Box sx={{ display: 'flex', gap: 1, mt: 2 }}>
            <Chip label={`${stats.totalDocuments} Documents`} color="primary" />
            <Chip label={`${stats.totalSummaries} Summaries`} color="secondary" />
            <Chip label={`${stats.totalQuizzes} Quizzes`} sx={{ bgcolor: 'success.main', color: 'white' }} />
          </Box>
        </Box>
        <Avatar sx={{ width: 80, height: 80, bgcolor: theme.palette.primary.main, fontSize: 28 }}>
          {user?.username ? user.username.charAt(0).toUpperCase() : 'U'}
        </Avatar>
      </Paper>

      {/* Stats Cards */}
      <Grid container spacing={3} sx={{ mb: 4 }}>
        <Grid item xs={12} sm={6} md={3}>
          <Card
            sx={{
              background: `linear-gradient(135deg, ${theme.palette.primary.main} 0%, ${theme.palette.primary.dark} 100%)`,
              color: 'white',
              position: 'relative',
              overflow: 'hidden',
              borderRadius: 3,
              boxShadow: 3,
            }}
          >
            <CardContent>
              <Box sx={{ position: 'relative', zIndex: 1 }}>
                <Avatar sx={{ bgcolor: 'rgba(255,255,255,0.2)', mb: 2 }}>
                  <Description />
                </Avatar>
                <Typography variant="h4" component="div" sx={{ fontWeight: 'bold' }}>
                  {stats.totalDocuments}
                </Typography>
                <Typography variant="body2">
                  Total Documents
                </Typography>
              </Box>
              <Box
                sx={{
                  position: 'absolute',
                  top: -20,
                  right: -20,
                  width: 100,
                  height: 100,
                  borderRadius: '50%',
                  bgcolor: 'rgba(255,255,255,0.1)',
                }}
              />
            </CardContent>
          </Card>
        </Grid>

        <Grid item xs={12} sm={6} md={3}>
          <Card
            sx={{
              background: `linear-gradient(135deg, ${theme.palette.secondary.main} 0%, ${theme.palette.secondary.dark} 100%)`,
              color: 'white',
              position: 'relative',
              overflow: 'hidden',
              borderRadius: 3,
              boxShadow: 3,
            }}
          >
            <CardContent>
              <Box sx={{ position: 'relative', zIndex: 1 }}>
                <Avatar sx={{ bgcolor: 'rgba(255,255,255,0.2)', mb: 2 }}>
                  <Summarize />
                </Avatar>
                <Typography variant="h4" component="div" sx={{ fontWeight: 'bold' }}>
                  {stats.totalSummaries}
                </Typography>
                <Typography variant="body2">
                  Summaries Generated
                </Typography>
              </Box>
              <Box
                sx={{
                  position: 'absolute',
                  top: -20,
                  right: -20,
                  width: 100,
                  height: 100,
                  borderRadius: '50%',
                  bgcolor: 'rgba(255,255,255,0.1)',
                }}
              />
            </CardContent>
          </Card>
        </Grid>

        <Grid item xs={12} sm={6} md={3}>
          <Card
            sx={{
              background: `linear-gradient(135deg, #10b981 0%, #059669 100%)`,
              color: 'white',
              position: 'relative',
              overflow: 'hidden',
              borderRadius: 3,
              boxShadow: 3,
            }}
          >
            <CardContent>
              <Box sx={{ position: 'relative', zIndex: 1 }}>
                <Avatar sx={{ bgcolor: 'rgba(255,255,255,0.2)', mb: 2 }}>
                  <Quiz />
                </Avatar>
                <Typography variant="h4" component="div" sx={{ fontWeight: 'bold' }}>
                  {stats.totalQuizzes}
                </Typography>
                <Typography variant="body2">
                  Quizzes Created
                </Typography>
              </Box>
              <Box
                sx={{
                  position: 'absolute',
                  top: -20,
                  right: -20,
                  width: 100,
                  height: 100,
                  borderRadius: '50%',
                  bgcolor: 'rgba(255,255,255,0.1)',
                }}
              />
            </CardContent>
          </Card>
        </Grid>

        <Grid item xs={12} sm={6} md={3}>
          <Card
            sx={{
              background: `linear-gradient(135deg, #f59e0b 0%, #d97706 100%)`,
              color: 'white',
              position: 'relative',
              overflow: 'hidden',
              borderRadius: 3,
              boxShadow: 3,
            }}
          >
            <CardContent>
              <Box sx={{ position: 'relative', zIndex: 1 }}>
                <Avatar sx={{ bgcolor: 'rgba(255,255,255,0.2)', mb: 2 }}>
                  <TrendingUp />
                </Avatar>
                <Typography variant="h4" component="div" sx={{ fontWeight: 'bold' }}>
                  {stats.averageScore}%
                </Typography>
                <Typography variant="body2">
                  Average Score
                </Typography>
              </Box>
              <Box
                sx={{
                  position: 'absolute',
                  top: -20,
                  right: -20,
                  width: 100,
                  height: 100,
                  borderRadius: '50%',
                  bgcolor: 'rgba(255,255,255,0.1)',
                }}
              />
            </CardContent>
          </Card>
        </Grid>
      </Grid>

      {/* Main Content Grid */}
      <Grid container spacing={3}>
        {/* Recent Activity */}
        <Grid item xs={12} md={6}>
          <Paper sx={{ p: 3, height: '400px', borderRadius: 3, boxShadow: 3 }}>
            <Box sx={{ display: 'flex', alignItems: 'center', mb: 3 }}>
              <Timeline sx={{ mr: 2, color: theme.palette.primary.main }} />
              <Typography variant="h6" sx={{ fontWeight: 600 }}>
                Recent Activity
              </Typography>
            </Box>
            <List sx={{ maxHeight: '300px', overflow: 'auto' }}>
              {stats.recentActivity.length > 0 ? (
                stats.recentActivity.map((activity, index) => (
                  <ListItem key={activity.id} sx={{ mb: 1 }}>
                    <ListItemIcon>
                      <Avatar sx={{ width: 40, height: 40, bgcolor: theme.palette.primary.main }}>
                        <Description sx={{ fontSize: 20 }} />
                      </Avatar>
                    </ListItemIcon>
                    <ListItemText
                      primary={activity.name}
                      secondary={
                        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                          <Typography variant="body2" color="text.secondary">
                            {activity.date}
                          </Typography>
                          <Chip
                            label={activity.action}
                            size="small"
                            color={activity.action === 'Processed' ? 'success' : 'default'}
                          />
                        </Box>
                      }
                    />
                  </ListItem>
                ))
              ) : (
                <ListItem>
                  <ListItemText
                    primary="No recent activity"
                    secondary="Upload and process documents to see activity here"
                  />
                </ListItem>
              )}
            </List>
          </Paper>
        </Grid>

        {/* Score History */}
        <Grid item xs={12} md={6}>
          <Paper sx={{ p: 3, height: '400px', borderRadius: 3, boxShadow: 3 }}>
            <Box sx={{ display: 'flex', alignItems: 'center', mb: 3 }}>
              <BarChart sx={{ mr: 2, color: theme.palette.primary.main }} />
              <Typography variant="h6" sx={{ fontWeight: 600 }}>
                Score History
              </Typography>
            </Box>
            <List sx={{ maxHeight: '300px', overflow: 'auto' }}>
              {stats.scoreHistory && stats.scoreHistory.length > 0 ? (
                stats.scoreHistory.map((item, idx) => (
                  <ListItem key={`${item.documentId}-${idx}`} sx={{ mb: 1 }}>
                    <ListItemIcon>
                      <Avatar sx={{ width: 40, height: 40, bgcolor: theme.palette.secondary.main }}>
                        <Star sx={{ fontSize: 20 }} />
                      </Avatar>
                    </ListItemIcon>
                    <ListItemText
                      primary={item.documentName}
                      secondary={
                        <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
                          <Typography variant="body2" color="text.secondary">{item.date}</Typography>
                          <Chip
                            label={item.score != null ? `${item.score}%` : 'N/A'}
                            size="small"
                            color={item.score != null && item.score >= 70 ? 'success' : 'default'}
                          />
                        </Box>
                      }
                    />
                  </ListItem>
                ))
              ) : (
                <ListItem>
                  <ListItemText primary="No score history" secondary="Complete quizzes to build your history" />
                </ListItem>
              )}
            </List>
          </Paper>
        </Grid>

        {/* Quick Actions */}
        <Grid item xs={12} md={6}>
          <Paper sx={{ p: 3, height: '400px', borderRadius: 3, boxShadow: 3 }}>
            <Box sx={{ display: 'flex', alignItems: 'center', mb: 3 }}>
              <Assessment sx={{ mr: 2, color: theme.palette.secondary.main }} />
              <Typography variant="h6" sx={{ fontWeight: 600 }}>
                Quick Actions
              </Typography>
            </Box>
            <Grid container spacing={2}>
              <Grid item xs={12}>
                <Button
                  variant="contained"
                  fullWidth
                  startIcon={<UploadFile />}
                  sx={{
                    py: 2,
                    background: `linear-gradient(135deg, ${theme.palette.primary.main} 0%, ${theme.palette.primary.dark} 100%)`,
                  }}
                  onClick={() => navigate('/documents')}
                >
                  Upload New Document
                </Button>
              </Grid>
              <Grid item xs={12}>
                <Button
                  variant="outlined"
                  fullWidth
                  startIcon={<Description />}
                  sx={{ py: 2 }}
                  onClick={() => navigate('/documents')}
                >
                  View All Documents
                </Button>
              </Grid>
              <Grid item xs={12}>
                <Button
                  variant="outlined"
                  fullWidth
                  startIcon={<BarChart />}
                  sx={{ py: 2 }}
                  onClick={() => navigate('/documents')}
                >
                  View Analytics
                </Button>
              </Grid>
              <Grid item xs={12}>
                <Button
                  variant="outlined"
                  fullWidth
                  startIcon={<Schedule />}
                  sx={{ py: 2 }}
                  onClick={() => navigate('/documents')}
                >
                  Processing History
                </Button>
              </Grid>
            </Grid>
          </Paper>
        </Grid>

        {/* Progress Overview */}
        <Grid item xs={12}>
          <Paper sx={{ p: 3, borderRadius: 3, boxShadow: 3 }}>
            <Box sx={{ display: 'flex', alignItems: 'center', mb: 3 }}>
              <PieChart sx={{ mr: 2, color: theme.palette.success.main }} />
              <Typography variant="h6" sx={{ fontWeight: 600 }}>
                Processing Progress
              </Typography>
            </Box>
            <Grid container spacing={3}>
              <Grid item xs={12} md={4}>
                <Box sx={{ mb: 2 }}>
                  <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 1 }}>
                    <Typography variant="body2">Documents Uploaded</Typography>
                    <Typography variant="body2" sx={{ fontWeight: 600 }}>
                      {stats.totalDocuments}
                    </Typography>
                  </Box>
                  <LinearProgress
                    variant="determinate"
                    value={stats.totalDocuments > 0 ? 100 : 0}
                    sx={{ height: 8, borderRadius: 4 }}
                  />
                </Box>
              </Grid>
              <Grid item xs={12} md={4}>
                <Box sx={{ mb: 2 }}>
                  <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 1 }}>
                    <Typography variant="body2">Summaries Generated</Typography>
                    <Typography variant="body2" sx={{ fontWeight: 600 }}>
                      {stats.totalSummaries}
                    </Typography>
                  </Box>
                  <LinearProgress
                    variant="determinate"
                    value={stats.totalDocuments > 0 ? (stats.totalSummaries / stats.totalDocuments) * 100 : 0}
                    sx={{ height: 8, borderRadius: 4, bgcolor: theme.palette.secondary.light }}
                    color="secondary"
                  />
                </Box>
              </Grid>
              <Grid item xs={12} md={4}>
                <Box sx={{ mb: 2 }}>
                  <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 1 }}>
                    <Typography variant="body2">Quizzes Created</Typography>
                    <Typography variant="body2" sx={{ fontWeight: 600 }}>
                      {stats.totalQuizzes}
                    </Typography>
                  </Box>
                  <LinearProgress
                    variant="determinate"
                    value={stats.totalDocuments > 0 ? (stats.totalQuizzes / stats.totalDocuments) * 100 : 0}
                    sx={{ height: 8, borderRadius: 4, bgcolor: theme.palette.success.light }}
                    color="success"
                  />
                </Box>
              </Grid>
            </Grid>
          </Paper>
        </Grid>
      </Grid>
    </Container>
  );
}

export default Dashboard;
