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
        borderColor: 'divider',
        aspectRatio: '16/9' // Maintain consistent aspect ratio
      }}
    >
      <CardMedia
        component="img"
        image={image}
        alt={title}
        sx={{
          objectFit: 'cover',
          width: '100%',
          height: '100%',
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