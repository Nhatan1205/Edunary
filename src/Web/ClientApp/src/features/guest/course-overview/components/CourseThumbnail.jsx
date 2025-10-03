import { Card, CardMedia } from '@mui/material'

const CourseThumbnail = ({ image, title }) => {
  return (
    <Card sx={{ mb: 3, position: 'relative' }}>
      <CardMedia
        component="img"
        height="450"
        image={image}
        alt={title}
        sx={{
          objectFit: 'cover',
          width: '100%',
          maxHeight: { xs: 200, sm: 300, md: 450 },
        }}
      />
    </Card>
  )
}

export default CourseThumbnail