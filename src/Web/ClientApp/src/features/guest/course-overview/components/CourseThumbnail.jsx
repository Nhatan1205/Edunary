import { Card, CardMedia } from '@mui/material'

const CourseThumbnail = ({ image, title }) => {
  return (
    <Card 
      elevation={0}
      sx={{ 
        mb: 4, 
        position: 'relative',
        borderRadius: 2,
        overflow: 'hidden',
        border: '1px solid',
        borderColor: 'divider'
      }}
    >
      <CardMedia
        component="img"
        height="450"
        image={image}
        alt={title}
        sx={{
          objectFit: 'cover',
          width: '100%',
          maxHeight: { xs: 200, sm: 300, md: 450 },
          transition: 'transform 0.3s ease-in-out',
          '&:hover': {
            transform: 'scale(1.02)'
          }
        }}
      />
    </Card>
  )
}

export default CourseThumbnail