import React, { useState } from 'react';
import { Container, Paper, Typography, Box, List, ListItem, ListItemText, Chip, Avatar, Button, TextField } from '@mui/material';
import { useAuth } from '../contexts/AuthContext';
import { Link } from 'react-router-dom';
import api from '../services/api';

export default function Profile() {
  const { user, loading } = useAuth();
  const { refreshProfile } = useAuth();
  const [editing, setEditing] = useState(false);
  const [username, setUsername] = useState(user?.username || '');
  const [email, setEmail] = useState(user?.email || '');
  const [error, setError] = useState('');

  if (loading) return <Container sx={{ mt: 6 }}>Loading...</Container>;
  if (!user) return <Container sx={{ mt: 6 }}>Not logged in.</Container>;

  const startEdit = () => {
    setUsername(user.username);
    setEmail(user.email);
    setEditing(true);
  };

  const saveProfile = async () => {
    try {
      setError('');
      const res = await api.patch('/api/auth/profile', { username, email });
      await refreshProfile();
      setEditing(false);
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to update profile');
    }
  };

  return (
    <Container maxWidth="md" sx={{ mt: 4 }}>
      <Paper sx={{ p: 4 }} elevation={3}>
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 2, mb: 2 }}>
          <Avatar sx={{ bgcolor: 'primary.main' }}>{(user.username || 'U').charAt(0).toUpperCase()}</Avatar>
          <Box>
            {editing ? (
              <div>
                <TextField label="Username" value={username} onChange={(e) => setUsername(e.target.value)} sx={{ mb: 1 }} />
                <TextField label="Email" value={email} onChange={(e) => setEmail(e.target.value)} />
              </div>
            ) : (
              <>
                <Typography variant="h5">{user.username}</Typography>
                <Typography variant="body2" color="text.secondary">{user.email}</Typography>
              </>
            )}
          </Box>
          <Box sx={{ ml: 'auto' }}>
            <Chip label={`${user.coins || 0} coins`} color="secondary" />
          </Box>
        </Box>

        {error && <Typography color="error" sx={{ mb: 1 }}>{error}</Typography>}
        <Box sx={{ mb: 2 }}>
          {editing ? (
            <>
              <Button variant="contained" onClick={saveProfile} sx={{ mr: 1 }}>Save</Button>
              <Button variant="outlined" onClick={() => setEditing(false)}>Cancel</Button>
            </>
          ) : (
            <Button variant="outlined" onClick={startEdit}>Edit Profile</Button>
          )}
        </Box>

        <Typography variant="h6" sx={{ mt: 2, mb: 1 }}>Milestones</Typography>
        <Box sx={{ display: 'flex', gap: 1, mb: 2 }}>
          {/* simple badges based on coins */}
          {user.coins >= 100 && <Chip label="Gold Learner" color="warning" />}
          {user.coins >= 50 && user.coins < 100 && <Chip label="Silver Learner" color="info" />}
          {user.coins >= 10 && user.coins < 50 && <Chip label="Bronze Learner" color="success" />}
          {user.coins < 10 && <Chip label="New Learner" />}
        </Box>

        <Typography variant="h6" sx={{ mt: 2, mb: 1 }}>Quiz History</Typography>
        <List>
          {(user.scores || []).length === 0 && <Typography color="text.secondary">No quiz attempts yet.</Typography>}
          {(user.scores || []).map((s, idx) => (
            <ListItem key={idx} secondaryAction={<Chip label={`${s.percentage || 0}%`} />}>
              <ListItemText
                primary={s.documentId ? <Link to={`/documents/${s.documentId._id}`}>{s.documentId.originalName}</Link> : 'Document'}
                secondary={new Date(s.date).toLocaleString()}
              />
            </ListItem>
          ))}
        </List>
      </Paper>
    </Container>
  );
}
