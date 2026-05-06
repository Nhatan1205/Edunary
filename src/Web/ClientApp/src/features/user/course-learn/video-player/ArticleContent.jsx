import { Box, Typography, Container, Checkbox, FormControlLabel } from "@mui/material";

const ArticleContent = ({ item, onMarkAsComplete }) => {
  if (!item) return null;

  return (
    <Box sx={{
      width: '100%',
      height: '100%',
      overflowY: 'auto',
      bgcolor: '#fff',
      color: '#000',
      display: 'flex',
      flexDirection: 'column'
    }}>
      <Container maxWidth="lg" sx={{ py: 6, flexGrow: 1 }}>
        <Typography variant="h4" component="h1" gutterBottom sx={{ fontWeight: 'bold' }}>
          {item.title}
        </Typography>
        
        <Box 
          sx={{ 
            fontSize: '1.1rem',
            lineHeight: 1.8,
            '& img': { maxWidth: '100%', height: 'auto', borderRadius: 1, my: 2 },
            '& p': { mb: 2 },
            '& h1, & h2, & h3, & h4, & h5, & h6': { mt: 4, mb: 2, fontWeight: 600 }
          }}
          dangerouslySetInnerHTML={{ __html: item.content }} 
        />
      </Container>
      
      <Box sx={{ 
        width: '100%', 
        p: 3, 
        borderTop: '1px solid #E0E0E0', 
        bgcolor: 'background.alt',
        display: 'flex', 
        justifyContent: 'center',
        mt: 'auto'
      }}>
        <FormControlLabel
          control={
            <Checkbox
              checked={item.isCompleted || false}
              onChange={onMarkAsComplete}
              size="large"
              sx={{
                color: "text.disabled",
                "&.Mui-checked": {
                  color: "brand.main",
                },
              }}
            />
          }
          label={
            <Typography variant="body1" sx={{ fontWeight: 600, color: "text.primary" }}>
              {item.isCompleted ? "Marked as completed" : "Mark as complete"}
            </Typography>
          }
        />
      </Box>
    </Box>
  );
};

export default ArticleContent;
