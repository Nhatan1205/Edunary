import { Col, Container, Row } from "reactstrap";
import SearchCourseCard from "./SearchCourseCard";

const courses = [
    {
      id: 1,
      title: "AI Engineer Core Track: LLM Engineering, RAG, QLoRA, Agents",
      description: "Become an LLM Engineer in 8 weeks: Build and deploy 8 LLM apps, mastering Generative AI, RAG, LoRA and...",
      instructor: "Ligency, Ed Donner",
      image: "https://images.unsplash.com/photo-1633356122544-f134324a6cee?w=400&h=200&fit=crop",
      rating: 4.7,
      ratingsCount: "21,242 ratings",
      duration: "46.5 total hours",
      lectures: "361 lectures",
      level: "All Levels",
      price: 309000,
      originalPrice: 1299000,
      isBestseller: true
    },
    {
      id: 2,
      title: "AI Engineer Agentic Track: The Complete Agent & MCP Course",
      description: "Build and train LLM NLP transformers and attention mechanisms (PyTorch). Explore with mechanistic...",
      instructor: "Ed Donner, Ligency",
      image: "https://images.unsplash.com/photo-1620712943543-bcc4688e7485?w=400&h=200&fit=crop",
      rating: 4.7,
      ratingsCount: "20,419 ratings",
      duration: "17 total hours",
      lectures: "109 lectures",
      level: "Intermediate",
      price: 309000,
      originalPrice: 409000,
      isBestseller: true
    },
    {
      id: 3,
      title: "A deep understanding of AI large language model mechanisms",
      description: "Build and train LLM NLP transformers and attention mechanisms (PyTorch). Explore with mechanistic...",
      instructor: "Mike X Cohen",
      image: "https://images.unsplash.com/photo-1677442136019-21780ecad995?w=400&h=200&fit=crop",
      rating: 4.8,
      ratingsCount: "391 ratings",
      duration: "31 total hours",
      lectures: "209 lectures",
      level: "All Levels",
      price: 299000,
      originalPrice: 399000,
      isBestseller: true
    },
    {
      id: 4,
      title: "Machine Learning A-Z: AI, Python & R + ChatGPT Prize",
      description: "Learn to create Machine Learning Algorithms in Python and R from two Data Science experts...",
      instructor: "Kirill Eremenko, Hadelin de Ponteves",
      image: "https://images.unsplash.com/photo-1555949963-aa79dcee981c?w=400&h=200&fit=crop",
      rating: 4.5,
      ratingsCount: "180,234 ratings",
      duration: "44 total hours",
      lectures: "321 lectures",
      level: "All Levels",
      price: 309000,
      originalPrice: 1299000,
      isBestseller: true
    },
    {
      id: 5,
      title: "Deep Learning Specialization: Neural Networks & AI",
      description: "Master Deep Learning with TensorFlow, Keras, PyTorch. Build Neural Networks, CNNs, RNNs...",
      instructor: "Andrew Ng",
      image: "https://images.unsplash.com/photo-1515879218367-8466d910aaa4?w=400&h=200&fit=crop",
      rating: 4.9,
      ratingsCount: "95,432 ratings",
      duration: "52 total hours",
      lectures: "412 lectures",
      level: "Intermediate",
      price: 329000,
      originalPrice: 1499000,
      isBestseller: true
    },
    {
      id: 6,
      title: "Complete Web Development Bootcamp 2024",
      description: "Learn web development from scratch with HTML, CSS, JavaScript, React, Node.js, MongoDB...",
      instructor: "Angela Yu",
      image: "https://images.unsplash.com/photo-1498050108023-c5249f4df085?w=400&h=200&fit=crop",
      rating: 4.8,
      ratingsCount: "245,678 ratings",
      duration: "62 total hours",
      lectures: "485 lectures",
      level: "Beginner",
      price: 299000,
      originalPrice: 1199000,
      isBestseller: true
    }
  ];

function SearchSection() {
  return (
    <Container>
        <Row>
            {courses.map((course) => (
                <Col key={course.id} xs={12} md={6} lg={4} className="mb-4">
                    <SearchCourseCard course={course} />
                </Col>
        ))}
        </Row>
    </Container>
  )
}

export default SearchSection;
