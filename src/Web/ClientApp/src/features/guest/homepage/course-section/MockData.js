const completeCourses = [
  {
    image: "https://picsum.photos/seed/java/400/250",
    title: "Java Programming Beginner",
    level: "Beginner",
    videosCompleted: 4,
    totalVideos: 19,
    isCompleted: false,
    progressPercentage: "40",
  },
  {
    image: "https://picsum.photos/seed/swift/400/250",
    title: "iOS 13 & Swift 5 - Complete iOS App Development",
    level: "Intermediate",
    videosCompleted: 32,
    totalVideos: 40,
    isCompleted: false,
    progressPercentage: "80",
  },
];

const kitaniStudioCourses = [
  {
    id: 1,
    image: "https://picsum.photos/seed/vue/400/250",
    title: "VUE JS SCRATCH COURSE",
    price: "24.92",
    level: "Beginner",
    instructor: "Kitani Studio",
    rating: "4.8 (1.3K)",
    duration: "12 hours",
    description:
      "Master Vue.js from the ground up with hands-on projects. Learn reactive programming, component architecture, and state management to build modern web applications.",
    features: [
      "Vue 3 Composition API",
      "Component Development",
      "State Management",
      "Project-based Learning",
      "Lifetime Access",
    ],
    isFavorite: false,
  },
  {
    id: 2,
    image: "https://picsum.photos/seed/ui/400/250",
    title: "UI DESIGN FOR BEGINNERS",
    price: "24.92",
    level: "Beginner",
    instructor: "Kitani Studio",
    rating: "4.7 (2.1K)",
    duration: "8 hours",
    description:
      "Learn essential UI design principles, color theory, typography, and layout techniques. Create stunning user interfaces using industry-standard design tools.",
    features: [
      "Design Principles",
      "Color Theory",
      "Typography",
      "Figma Basics",
      "Portfolio Projects",
    ],
    isFavorite: false,
  },
  {
    id: 3,
    image: "https://picsum.photos/seed/reactnative/400/250",
    title: "MOBILE DEV REACT NATIVE",
    price: "24.92",
    level: "Intermediate",
    instructor: "Kitani Studio",
    rating: "4.9 (1.8K)",
    duration: "16 hours",
    description:
      "Build cross-platform mobile apps with React Native. Learn navigation, API integration, device features, and deployment to App Store and Google Play.",
    features: [
      "Cross-platform Development",
      "Navigation Systems",
      "API Integration",
      "Native Features",
      "App Store Deployment",
    ],
    isFavorite: true,
  },
  {
    id: 4,
    image: "https://picsum.photos/seed/website/400/250",
    title: "WEBSITE DEV ZERO TO HERO",
    price: "24.92",
    level: "Advanced",
    instructor: "Kitani Studio",
    rating: "4.8 (2.3K)",
    duration: "24 hours",
    description:
      "Complete web development bootcamp covering HTML, CSS, JavaScript, React, Node.js, databases, and deployment. Build full-stack applications from scratch.",
    features: [
      "Full-stack Development",
      "React & Node.js",
      "Database Integration",
      "Authentication",
      "Production Deployment",
    ],
    isFavorite: false,
  },
];

const trendingCourses = [
  {
    id: 5,
    image: "https://picsum.photos/seed/illustrator/400/250",
    title:
      "Adobe Illustrator Scratch Course - iOS 13 & Swift 5 - Complete iOS App Development",
    price: "24.92",
    level: "Beginner",
    instructor: "Development Expert",
    rating: "4.9 (1.5K)",
    duration: "20 hours",
    description:
      "Master Adobe Illustrator for digital design and learn iOS app development with Swift 5. Create beautiful graphics and build native iOS applications.",
    features: [
      "Adobe Illustrator Mastery",
      "Swift 5 Programming",
      "iOS 13 Features",
      "App Store Publishing",
      "Vector Graphics",
    ],
    isFavorite: true,
  },
  {
    id: 6,
    image: "https://picsum.photos/seed/vuebootcamp/400/250",
    title: "Bootcamp Vue.js Web Framework",
    price: "24.92",
    level: "Intermediate",
    instructor: "Web Expert",
    rating: "4.7 (1.2K)",
    duration: "14 hours",
    description:
      "Intensive Vue.js bootcamp covering advanced concepts, routing, state management with Vuex, and modern development practices for scalable applications.",
    features: [
      "Advanced Vue.js",
      "Vue Router",
      "Vuex State Management",
      "Testing",
      "Performance Optimization",
    ],
    isFavorite: false,
  },
  {
    id: 7,
    image: "https://picsum.photos/seed/design/400/250",
    title: "Design Fundamentals",
    price: "24.92",
    level: "Beginner",
    instructor: "Design Pro",
    rating: "4.8 (1.9K)",
    duration: "10 hours",
    description:
      "Essential design principles for digital products. Learn layout, composition, visual hierarchy, and user experience fundamentals through practical exercises.",
    features: [
      "Design Theory",
      "Visual Hierarchy",
      "Layout Principles",
      "UX Basics",
      "Design Tools",
    ],
    isFavorite: false,
  },
  {
    id: 8,
    image: "https://picsum.photos/seed/ionic/400/250",
    title: "Ionic - Build iOS, Android & Web Apps",
    price: "24.92",
    level: "Advanced",
    instructor: "Mobile Expert",
    rating: "4.6 (1.1K)",
    duration: "18 hours",
    description:
      "Build hybrid mobile applications with Ionic framework. Learn to create apps that run on iOS, Android, and web using a single codebase with Angular integration.",
    features: [
      "Ionic Framework",
      "Angular Integration",
      "Hybrid App Development",
      "Native Plugins",
      "Multi-platform Deployment",
    ],
    isFavorite: true,
  },
];

export { completeCourses, kitaniStudioCourses, trendingCourses };
