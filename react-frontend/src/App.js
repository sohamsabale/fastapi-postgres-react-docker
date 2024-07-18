import React, { useEffect, useState } from 'react';
import { ThemeProvider, createTheme } from '@mui/material/styles';
import { Container, CssBaseline, AppBar, Toolbar, Tabs, Tab, Box, Grid, Card, CardContent, Typography, IconButton, TextField, Button, MenuItem, Select, FormControl, InputLabel } from '@mui/material';
import { ThumbUp, ThumbDown } from '@mui/icons-material';
import { format } from 'date-fns';
import logo from './logo.png';

const theme = createTheme({
  palette: {
    background: {
      default: '#f4f4f4',
    },
    primary: {
      main: '#ff9800',
    },
    secondary: {
      main: '#673ab7',
    },
    text: {
      primary: '#333',
      secondary: '#fff',
    },
  },
});

function App() {
  const [value, setValue] = useState(0);
  const [facts, setFacts] = useState([]);
  const [leaderboardFacts, setLeaderboardFacts] = useState([]);
  const [newFact, setNewFact] = useState('');
  const [userPrompt, setUserPrompt] = useState('');
  const [generatedText, setGeneratedText] = useState('');
  const [sortOption, setSortOption] = useState('Latest');
  const [error, setError] = useState(null);

  const apiUrl = process.env.REACT_APP_API_URL || 'http://localhost :8000';

  useEffect(() => {
    if (value === 0) {
      fetchLeaderboardFacts();
    } else if (value === 1) {
      fetchAllFacts();
    }
  }, [apiUrl, sortOption, value]);

  const fetchLeaderboardFacts = () => {
    fetch(`${apiUrl}/facts/top`)
      .then(response => response.json())
      .then(data => {
        setLeaderboardFacts(data);
        setError(null);
      })
      .catch(error => {
        console.error('Error fetching data:', error);
        setError('Failed to fetch facts. Please try again later.');
      });
  };

  const fetchAllFacts = () => {
    let endpoint;
    if (sortOption === 'Latest') {
      endpoint = `${apiUrl}/facts/latest/`;
    } else if (sortOption === 'Top') {
      endpoint = `${apiUrl}/facts/top`;
    } else if (sortOption === 'Best') {
      endpoint = `${apiUrl}/facts/best`;
    }

    fetch(endpoint)
      .then(response => response.json())
      .then(data => {
        setFacts(data);
        setError(null);
      })
      .catch(error => {
        console.error('Error fetching data:', error);
        setError('Failed to fetch facts. Please try again later.');
      });
  };

  const handleTabChange = (event, newValue) => {
    setValue(newValue);
  };

  const handleUpvote = (factId) => {
    fetch(`${apiUrl}/facts/${factId}/upvote`, {
      method: 'PUT',
    })
      .then(response => response.json())
      .then(updatedFact => {
        if (value === 0) {
          setLeaderboardFacts(prevFacts =>
            prevFacts.map(fact => (fact.id === updatedFact.id ? updatedFact : fact))
          );
        } else {
          setFacts(prevFacts =>
            prevFacts.map(fact => (fact.id === updatedFact.id ? updatedFact : fact))
          );
        }
      })
      .catch(error => {
        console.error('Error upvoting fact:', error);
        setError('Failed to upvote. Please try again later.');
      });
  };

  const handleDownvote = (factId) => {
    fetch(`${apiUrl}/facts/${factId}/downvote`, {
      method: 'PUT',
    })
      .then(response => response.json())
      .then(updatedFact => {
        if (value === 0) {
          setLeaderboardFacts(prevFacts =>
            prevFacts.map(fact => (fact.id === updatedFact.id ? updatedFact : fact))
          );
        } else {
          setFacts(prevFacts =>
            prevFacts.map(fact => (fact.id === updatedFact.id ? updatedFact : fact))
          );
        }
      })
      .catch(error => {
        console.error('Error downvoting fact:', error);
        setError('Failed to downvote. Please try again later.');
      });
  };

  const handleGenerateText = () => {
    fetch(`${apiUrl}/generate_text`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ prompt: userPrompt }),
    })
      .then(response => response.json())
      .then(data => {
        setGeneratedText(data.generated_text);
      })
      .catch(error => {
        console.error('Error generating text:', error);
        setError('Failed to generate text. Please try again later.');
      });
  };

  const handleSubmit = (event) => {
    event.preventDefault();
    setError(null);

    fetch(`${apiUrl}/facts`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ text: newFact }),
    })
      .then(response => {
        if (!response.ok) {
          return response.json().then(err => { throw new Error(err.detail) });
        }
        return response.json();
      })
      .then(data => {
        setFacts([...facts, data]);
        setNewFact('');
        setGeneratedText('');
        setUserPrompt('');
      })
      .catch(error => {
        console.error('Error submitting fact:', error);
        setError(error.message);
      });
  };

  const handleSortChange = (event) => {
    setSortOption(event.target.value);
  };

  return (
    <ThemeProvider theme={theme}>
      <CssBaseline />
      <AppBar position="static" color="primary">
        <Toolbar>
          <img src={logo} alt="Logo" style={{ height: '120px', width: '180px', marginRight: '16px' }} />
          <Tabs
            value={value}
            onChange={handleTabChange}
            centered
            TabIndicatorProps={{
              style: {
                backgroundColor: 'white',
              },
            }}
            style={{ flexGrow: 1 }}
          >
            <Tab label="Leaderboard" sx={{ '&.Mui-selected': { backgroundColor: 'white', color: 'black' } }} />
            <Tab label="All Facts" sx={{ '&.Mui-selected': { backgroundColor: 'white', color: 'black' } }} />
            <Tab label="Submit a Fact (🌠 AI powered Ooh!🌠)" sx={{ '&.Mui-selected': { backgroundColor: 'white', color: 'black' } }} />
          </Tabs>
          <Button variant="contained" color="secondary" style={{ marginLeft: 'auto', marginRight: '16px' }}>
            Fake Sign In Button
          </Button>
        </Toolbar>
      </AppBar>
      <Container>
        {error && (
          <Box p={2} mb={2} border={1} borderColor="red" borderRadius={4}>
            <Typography variant="body2" color="error" align="center">
              {error}
            </Typography>
          </Box>
        )}
        {value === 0 && (
          <Box p={3}>
            <Typography variant="h4" align="center">Top Facts Submitted by Users!</Typography>
            <Grid container spacing={4} justifyContent="left">
              {leaderboardFacts.slice(0, 9).map(fact => (
                <Grid item xs={12} sm={6} md={4} key={fact.id}>
                  <Card>
                    <CardContent>
                      <Typography variant="h5" align="left">{fact.text}</Typography>
                      <Typography variant="body2" color="textPrimary" align="left" style={{ fontSize: '1.2rem' }}>
                        Total Upvotes: {fact.upvotes}
                      </Typography>
                      <Typography variant="body2" align="left" style={{ color: '#808080' }}>
                        {`Submitted on: ${format(new Date(fact.created_at), 'PPpp')}`}
                      </Typography>
                    </CardContent>
                    <CardContent>
                      <IconButton aria-label="upvote" onClick={() => handleUpvote(fact.id)}>
                        <ThumbUp />
                      </IconButton>
                      <IconButton aria-label="downvote" onClick={() => handleDownvote(fact.id)}>
                        <ThumbDown />
                      </IconButton>
                    </CardContent>
                  </Card>
                </Grid>
              ))}
            </Grid>
          </Box>
        )}
        {value === 1 && (
          <Box p={3}>
            <Typography variant="h4" align="center">All Facts</Typography>
            <FormControl variant="outlined" fullWidth margin="normal">
              <InputLabel>Sort By</InputLabel>
              <Select value={sortOption} onChange={handleSortChange} label="Sort By">
                <MenuItem value="Latest">Latest</MenuItem>
                <MenuItem value="Top">Top</MenuItem>
                <MenuItem value="Best">Best</MenuItem>
              </Select>
            </FormControl>
            {facts.map(fact => (
              <Box key={fact.id} p={2} border={1} borderColor="grey.300" borderRadius={4} mb={2}>
                <Typography variant="h6">{fact.text}</Typography>
                <Typography variant="body2" color="textSecondary" style={{ color: '#808080' }}>
                  {`Submitted on: ${format(new Date(fact.created_at), 'PPpp')}`}
                </Typography>
                <Typography variant="body2" color="textPrimary" style={{ fontSize: '1.2rem' }} align="left">
                  Total Votes: {fact.upvotes - fact.downvotes}
                </Typography>
                <Box mt={1}>
                  <IconButton aria-label="upvote" onClick={() => handleUpvote(fact.id)}>
                    <ThumbUp />
                  </IconButton>
                  <IconButton aria-label="downvote" onClick={() => handleDownvote(fact.id)}>
                    <ThumbDown />
                  </IconButton>
                </Box>
              </Box>
            ))}
          </Box>
        )}
        {value === 2 && (
          <Box p={3}>
            <Typography variant="h4" align="center">Submit a Fact</Typography>
            <form onSubmit={handleSubmit}>
              <TextField
                label="Fact"
                variant="outlined"
                fullWidth
                value={newFact}
                onChange={(e) => setNewFact(e.target.value)}
                margin="normal"
              />
              {error && (
                <Typography variant="body2" color="error" align="center">
                  {error}
                </Typography>
              )}
              <Button type="submit" variant="contained" color="primary">
                Submit
              </Button>
            </form>
            <Box mt={4}>
              <Typography variant="h4" align="center">Can't think of One? Use AI to generate a fact</Typography>
              <Typography variant="h5" align="center">Enter your prompt below"</Typography>
              <Typography variant="h7" align="center">Cant think of anthing? Just make it up, type "Compare Dombivli and Manhattan"</Typography>
              <TextField
                label="Your Prompt"
                variant="outlined"
                fullWidth
                value={userPrompt}
                onChange={(e) => setUserPrompt(e.target.value)}
                margin="normal"
              />
              <Button variant="contained" color="primary" onClick={handleGenerateText}>
                Generate Text
              </Button>
              {generatedText && (
                <Box mt={3} p={2} border={1} borderColor="grey.300" borderRadius={4}>
                  <Typography variant="h6" align="center">{generatedText}</Typography>
                  <Button
                    variant="contained"
                    color="secondary"
                    onClick={() => setNewFact(generatedText)}
                    style={{ marginTop: 16, display: 'block', marginLeft: 'auto', marginRight: 'auto' }}
                  >
                    Use this Fact
                  </Button>
                </Box>
              )}
            </Box>
          </Box>
        )}
        {/* Footer Section */}
        <Box mt={4} mb={2} p={2} borderTop={1} borderColor="grey.300">
          <Typography variant="body2" color="textSecondary" align="center" style={{ color: '#808080' }}>
            Dive into Dombivli's Fake Facts - Read, Vote, Submit, and Laugh(?)!
          </Typography>
          <Typography variant="body2" color="textSecondary" align="center" style={{ color: '#808080' }}>
            © {new Date().getFullYear()} Dombivli Facts. All rights reserved.
          </Typography>
        </Box>
      </Container>
    </ThemeProvider>
  );
}

export default App;
