import { Card, CardMedia } from '@mui/material'

const CourseThumbnail = ({ image, title }) => {
  return (
    <Card sx={{ mb: 3, position: 'relative' }}>
      <CardMedia
        component="img"
        height="300"
        image={image}
        alt={title}
        sx={{ objectFit: 'cover' }}
      />
    </Card>
  )
}

export default CourseThumbnail