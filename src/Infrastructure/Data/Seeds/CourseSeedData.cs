using Edunary.Domain.Entities;
using Edunary.Domain.Enums;
using Edunary.Infrastructure.Data;
using Microsoft.EntityFrameworkCore;

namespace Edunary.Infrastructure.Data.Seeds;

public static class CourseSeedData
{
    public static async Task<List<Course>> SeedCoursesAsync(
        ApplicationDbContext ctx,
        int catWeb, int catDS, int catCloud,
        int tPy, int tJS, int tReact, int tNode, int tSQL,
        int tDocker, int tAWS, int tML, int tDL, int tCS, int tDA, int tTS,
        string ins1, string ins2, string ins3)
    {
        // Guard: re-use existing seeded courses if already present (check by known seed title)
        const string seedMarker = "HTML & CSS Fundamentals";
        if (await ctx.Courses.AnyAsync(c => c.Title == seedMarker))
        {
            // Return seeded courses in insertion order (by CreatedBy = ins1/ins2/ins3, then Id)
            return await ctx.Courses
                .Where(c => c.CreatedBy == ins1 || c.CreatedBy == ins2 || c.CreatedBy == ins3)
                .OrderBy(c => c.Id)
                .ToListAsync();
        }

        // Helper: obj(title,subtitle,level,rating,students,categoryId,createdBy,objectives,topicIds...)
        var all = new List<Course>();

        Course C(string title, string sub, CourseLevel lvl, float rat, int stu,
                 int cat, string by, string obj, params int[] tIds)
        {
            var c = new Course
            {
                Title = title,
                Subtitle = sub,
                Level = lvl,
                Status = CourseStatus.Public,
                Ratings = rat,
                TotalStudents = stu,
                TotalRatingStudent = stu > 0 ? stu / 10 : 1,
                TotalRating = (int)(rat * (stu > 0 ? stu / 10 : 1)),
                CategoryId = cat,
                CreatedBy = by,
                LastModifiedBy = by,
                Price = 0f,
                LearningObjectives = obj,
                Requirements = "[]",
                TargetAudience = "[]",
                Description = $"A comprehensive course on {title}.",
                Content = "", // set after SaveChangesAsync when Id is populated
            };
            foreach (var tid in tIds.Where(t => t > 0))
            {
                var topic = ctx.Topics.Local.FirstOrDefault(t => t.Id == tid)
                            ?? ctx.Topics.Find(tid);
                if (topic != null) { c.Topics.Add(topic); }
            }
            all.Add(c);
            return c;
        }

        // ── Cat 1: Web Development (40 courses, ins1 = Alex Chen) ─────────────
        C("HTML & CSS Fundamentals", "Master the building blocks of the web", CourseLevel.Beginner, 4.5f, 500, catWeb, ins1,
          "[\"Semantic HTML\",\"Flexbox & Grid\",\"Responsive design\"]", tJS);
        C("JavaScript for Beginners", "Write your first JS programs from scratch", CourseLevel.Beginner, 4.3f, 420, catWeb, ins1,
          "[\"Variables & types\",\"Functions\",\"DOM manipulation\"]", tJS);
        C("Advanced JavaScript ES6+", "Master modern JavaScript features", CourseLevel.Intermediate, 4.6f, 310, catWeb, ins1,
          "[\"Promises & async/await\",\"Modules\",\"Closures\"]", tJS);
        C("React Complete Guide", "Build real apps with React from scratch", CourseLevel.Intermediate, 4.7f, 380, catWeb, ins1,
          "[\"Components & hooks\",\"State management\",\"React Router\"]", tJS, tReact);
        C("React Advanced Patterns", "Take your React skills to the next level", CourseLevel.Advanced, 4.4f, 150, catWeb, ins1,
          "[\"HOC\",\"Render props\",\"Performance optimization\"]", tReact);
        C("Node.js & Express", "Build scalable backend APIs with Node", CourseLevel.Intermediate, 4.5f, 290, catWeb, ins1,
          "[\"REST API\",\"Middleware\",\"Authentication\"]", tJS, tNode);
        C("Full-Stack MERN Project", "Build and deploy a full-stack application", CourseLevel.Advanced, 4.6f, 200, catWeb, ins1,
          "[\"End-to-end app\",\"MongoDB\",\"Deployment\"]", tJS, tReact, tNode);
        C("TypeScript Essentials", "Add type safety to your JavaScript projects", CourseLevel.Intermediate, 4.3f, 250, catWeb, ins1,
          "[\"Type system\",\"Interfaces\",\"Generics\"]", tJS, tTS);
        C("Next.js & SSR", "Build production-ready apps with Next.js", CourseLevel.Advanced, 4.5f, 180, catWeb, ins1,
          "[\"SSR vs SSG\",\"API routes\",\"Deployment\"]", tJS, tReact);
        C("CSS Animations & SASS", "Create stunning animations and organized CSS", CourseLevel.Beginner, 4.1f, 320, catWeb, ins1,
          "[\"Keyframes\",\"Transitions\",\"SCSS variables\"]", tJS);
        C("Web Performance Optimization", "Make your websites blazing fast", CourseLevel.Advanced, 4.2f, 100, catWeb, ins1,
          "[\"Lighthouse audit\",\"Lazy loading\",\"Caching\"]", tJS);
        C("Tailwind CSS Mastery", "Style your apps faster with utility-first CSS", CourseLevel.Beginner, 4.4f, 280, catWeb, ins1,
          "[\"Utility-first CSS\",\"Responsive\",\"Components\"]", tJS);
        C("Vue.js Fundamentals", "Learn the progressive JavaScript framework", CourseLevel.Intermediate, 4.3f, 200, catWeb, ins1,
          "[\"Composition API\",\"Vuex\",\"Vue Router\"]", tJS);
        C("Angular Complete Course", "Master the full Angular framework", CourseLevel.Intermediate, 4.1f, 170, catWeb, ins1,
          "[\"Components\",\"Services\",\"RxJS\",\"Forms\"]", tJS);
        C("Web Accessibility (a11y)", "Build websites everyone can use", CourseLevel.Beginner, 4.0f, 90, catWeb, ins1,
          "[\"ARIA roles\",\"Screen readers\",\"WCAG 2.1\"]", tJS);
        C("Python Web with Django", "Build full-featured web apps with Django", CourseLevel.Intermediate, 4.5f, 300, catWeb, ins1,
          "[\"Django ORM\",\"Templates\",\"REST framework\"]", tPy);
        C("Python Web with Flask", "Build lightweight web apps with Flask", CourseLevel.Beginner, 4.3f, 260, catWeb, ins1,
          "[\"Routing\",\"Jinja2\",\"SQLAlchemy basics\"]", tPy);
        C("GraphQL with Node.js", "Build modern APIs with GraphQL", CourseLevel.Intermediate, 4.2f, 130, catWeb, ins1,
          "[\"Schema design\",\"Resolvers\",\"Apollo Server\"]", tJS, tNode);
        C("REST API Design Best Practices", "Design clean and scalable REST APIs", CourseLevel.Intermediate, 4.4f, 220, catWeb, ins1,
          "[\"Resource naming\",\"Versioning\",\"Error handling\"]", tJS, tNode);
        C("JavaScript Testing (Jest)", "Write reliable tests for your JS code", CourseLevel.Intermediate, 4.3f, 180, catWeb, ins1,
          "[\"Unit testing\",\"Mocking\",\"TDD workflow\"]", tJS);
        C("React Testing Library", "Test your React components with confidence", CourseLevel.Intermediate, 4.2f, 140, catWeb, ins1,
          "[\"Component testing\",\"User event\",\"Integration\"]", tJS, tReact);
        C("Progressive Web Apps", "Build app-like experiences on the web", CourseLevel.Intermediate, 4.1f, 110, catWeb, ins1,
          "[\"Service workers\",\"Offline\",\"Push notifications\"]", tJS);
        C("Webpack & Build Tools", "Master the JavaScript build ecosystem", CourseLevel.Intermediate, 4.0f, 95, catWeb, ins1,
          "[\"Bundling\",\"Loaders\",\"Code splitting\"]", tJS);
        C("Svelte for Beginners", "Build fast UIs with less code", CourseLevel.Beginner, 4.4f, 160, catWeb, ins1,
          "[\"Reactivity\",\"Components\",\"Stores\"]", tJS);
        C("Frontend System Design", "Design scalable frontend architectures", CourseLevel.Advanced, 4.6f, 120, catWeb, ins1,
          "[\"Architecture\",\"State patterns\",\"Scalability\"]", tJS, tReact);
        C("C# Fundamentals", "Start your journey with C# programming", CourseLevel.Beginner, 4.5f, 400, catWeb, ins1,
          "[\"Syntax\",\"OOP basics\",\"Collections\"]", tCS);
        C("ASP.NET Core Web API", "Build professional APIs with .NET", CourseLevel.Intermediate, 4.6f, 300, catWeb, ins1,
          "[\"Controllers\",\"Dependency injection\",\"Entity Framework\"]", tCS);
        C("C# Advanced (LINQ, Async)", "Level up your C# with advanced features", CourseLevel.Advanced, 4.5f, 200, catWeb, ins1,
          "[\"LINQ\",\"Async patterns\",\"Generics\"]", tCS);
        C("Clean Architecture .NET", "Build maintainable enterprise applications", CourseLevel.Advanced, 4.7f, 180, catWeb, ins1,
          "[\"CQRS\",\"MediatR\",\"Domain-driven design\"]", tCS);
        C("Blazor Web Development", "Build web UIs with C# instead of JavaScript", CourseLevel.Intermediate, 4.2f, 140, catWeb, ins1,
          "[\"Components\",\"Routing\",\"JS interop\"]", tCS);
        C("SQL Masterclass", "Master SQL from zero to hero", CourseLevel.Beginner, 4.7f, 500, catWeb, ins1,
          "[\"SELECT/JOIN\",\"Subqueries\",\"Indexing\"]", tSQL);
        C("PostgreSQL Deep Dive", "Advanced PostgreSQL for developers", CourseLevel.Intermediate, 4.4f, 250, catWeb, ins1,
          "[\"Advanced queries\",\"Partitioning\",\"Performance\"]", tSQL);
        C("MongoDB Complete Guide", "Master NoSQL database with MongoDB", CourseLevel.Intermediate, 4.5f, 280, catWeb, ins1,
          "[\"CRUD\",\"Aggregation\",\"Indexing\"]", tNode);
        C("Redis & Caching", "Speed up apps with Redis caching", CourseLevel.Advanced, 4.3f, 150, catWeb, ins1,
          "[\"Data structures\",\"Pub/Sub\",\"Cache strategies\"]", tSQL);
        C("Database Design", "Design efficient and normalized databases", CourseLevel.Beginner, 4.3f, 300, catWeb, ins1,
          "[\"Normalization\",\"ER diagrams\",\"Constraints\"]", tSQL);
        C("Entity Framework Core", "ORM for .NET developers", CourseLevel.Intermediate, 4.4f, 220, catWeb, ins1,
          "[\"Migrations\",\"Relationships\",\"LINQ queries\"]", tCS, tSQL);
        C("Git & Version Control", "Collaborate like a pro with Git", CourseLevel.Beginner, 4.5f, 500, catWeb, ins1,
          "[\"Branching\",\"Merging\",\"Pull requests\"]");
        C("OOP with Python", "Master object-oriented programming", CourseLevel.Beginner, 4.4f, 350, catWeb, ins1,
          "[\"Classes\",\"Inheritance\",\"Polymorphism\"]", tPy);
        C("Data Structures & Algorithms", "Crack coding interviews with confidence", CourseLevel.Beginner, 4.6f, 400, catWeb, ins1,
          "[\"Arrays\",\"Trees\",\"Sorting\",\"Big-O\"]", tPy);
        C("Design Patterns (Python)", "Write flexible and reusable code", CourseLevel.Intermediate, 4.4f, 250, catWeb, ins1,
          "[\"Singleton\",\"Factory\",\"Observer\",\"Strategy\"]", tPy);

        // ── Cat 2: Data Science & AI (35 courses, ins2 = Sarah Nguyen) ─────────
        C("Python for Data Science", "The complete Python toolkit for data", CourseLevel.Beginner, 4.7f, 600, catDS, ins2,
          "[\"NumPy basics\",\"Pandas intro\",\"Jupyter\"]", tPy, tDA);
        C("Statistics & Probability", "Build your math foundation for data science", CourseLevel.Beginner, 4.3f, 350, catDS, ins2,
          "[\"Distributions\",\"Hypothesis testing\",\"Bayes\"]", tDA);
        C("Pandas & NumPy Mastery", "Power data manipulation with Python", CourseLevel.Intermediate, 4.5f, 400, catDS, ins2,
          "[\"DataFrame ops\",\"Vectorization\",\"Cleaning\"]", tPy, tDA);
        C("Data Visualization (Matplotlib)", "Tell stories with beautiful charts", CourseLevel.Intermediate, 4.4f, 280, catDS, ins2,
          "[\"Line/bar/scatter\",\"Seaborn\",\"Dashboard\"]", tPy, tDA);
        C("SQL for Data Analysts", "Query databases like a pro analyst", CourseLevel.Beginner, 4.6f, 450, catDS, ins2,
          "[\"Analytic functions\",\"Window functions\",\"CTEs\"]", tSQL, tDA);
        C("Power BI Complete", "Create professional dashboards with Power BI", CourseLevel.Intermediate, 4.3f, 220, catDS, ins2,
          "[\"Data modeling\",\"DAX\",\"Interactive dashboards\"]", tDA);
        C("Tableau Dashboards", "Visualize data with Tableau", CourseLevel.Intermediate, 4.2f, 200, catDS, ins2,
          "[\"Calculated fields\",\"Maps\",\"Stories\"]", tDA);
        C("R Programming Basics", "Start data analysis with R", CourseLevel.Beginner, 4.0f, 150, catDS, ins2,
          "[\"Vectors\",\"Data frames\",\"ggplot2\"]", tDA);
        C("Time Series Analysis", "Forecast the future with time series models", CourseLevel.Advanced, 4.4f, 130, catDS, ins2,
          "[\"ARIMA\",\"Seasonality\",\"Forecasting\"]", tPy, tDA);
        C("A/B Testing & Experiments", "Make data-driven decisions", CourseLevel.Intermediate, 4.1f, 100, catDS, ins2,
          "[\"Sample size\",\"Significance\",\"Bayesian AB\"]", tDA);
        C("Data Engineering Python", "Build scalable data pipelines", CourseLevel.Advanced, 4.5f, 170, catDS, ins2,
          "[\"ETL pipelines\",\"Airflow\",\"Data warehousing\"]", tPy, tSQL);
        C("Big Data with Spark", "Process massive datasets with Apache Spark", CourseLevel.Advanced, 4.3f, 140, catDS, ins2,
          "[\"RDDs\",\"DataFrames\",\"Spark SQL\"]", tPy);
        C("Web Scraping Python", "Collect data from the web automatically", CourseLevel.Beginner, 4.4f, 300, catDS, ins2,
          "[\"BeautifulSoup\",\"Selenium\",\"APIs\"]", tPy);
        C("Excel for Data Analysis", "Analyze data with Excel like a pro", CourseLevel.Beginner, 4.5f, 500, catDS, ins2,
          "[\"Pivot tables\",\"VLOOKUP\",\"Charts\"]", tDA);
        C("Feature Engineering", "Build better ML models with smarter features", CourseLevel.Intermediate, 4.3f, 170, catDS, ins2,
          "[\"Encoding\",\"Scaling\",\"Feature selection\"]", tPy, tML, tDA);
        C("Machine Learning Fundamentals", "Your gateway to the world of AI", CourseLevel.Beginner, 4.7f, 550, catDS, ins2,
          "[\"Regression\",\"Classification\",\"Evaluation\"]", tPy, tML);
        C("Supervised Learning (sklearn)", "Master classification and regression", CourseLevel.Intermediate, 4.5f, 320, catDS, ins2,
          "[\"Decision trees\",\"SVM\",\"Ensemble methods\"]", tPy, tML);
        C("Unsupervised Learning", "Find hidden patterns in data", CourseLevel.Intermediate, 4.3f, 200, catDS, ins2,
          "[\"K-means\",\"PCA\",\"DBSCAN\"]", tPy, tML);
        C("Deep Learning TensorFlow", "Build neural networks with TensorFlow", CourseLevel.Advanced, 4.6f, 280, catDS, ins2,
          "[\"Neural networks\",\"CNNs\",\"Transfer learning\"]", tPy, tDL);
        C("Deep Learning PyTorch", "Build and train models with PyTorch", CourseLevel.Advanced, 4.5f, 250, catDS, ins2,
          "[\"Tensors\",\"Autograd\",\"Model training\"]", tPy, tDL);
        C("NLP Fundamentals", "Process and understand human language", CourseLevel.Intermediate, 4.4f, 210, catDS, ins2,
          "[\"Tokenization\",\"Word embeddings\",\"Transformers\"]", tPy, tML);
        C("Computer Vision OpenCV", "See the world through machine eyes", CourseLevel.Intermediate, 4.3f, 180, catDS, ins2,
          "[\"Image processing\",\"Object detection\",\"CNNs\"]", tPy, tDL);
        C("Generative AI & LLMs", "Master the art of prompt engineering and LLMs", CourseLevel.Advanced, 4.8f, 400, catDS, ins2,
          "[\"Prompt engineering\",\"Fine-tuning\",\"RAG\"]", tPy, tML, tDL);
        C("MLOps & Model Deployment", "Ship ML models to production", CourseLevel.Advanced, 4.4f, 150, catDS, ins2,
          "[\"MLflow\",\"Docker for ML\",\"CI/CD\"]", tPy, tML, tDocker);
        C("Reinforcement Learning", "Train agents to make decisions", CourseLevel.Advanced, 4.2f, 100, catDS, ins2,
          "[\"Q-learning\",\"Policy gradient\",\"OpenAI Gym\"]", tPy, tML);
        C("AI Ethics & Responsible AI", "Build ethical and fair AI systems", CourseLevel.Beginner, 4.0f, 130, catDS, ins2,
          "[\"Bias\",\"Fairness\",\"Explainability\"]", tML);
        C("Math for Machine Learning", "The math you need to understand ML", CourseLevel.Beginner, 4.5f, 300, catDS, ins2,
          "[\"Linear algebra\",\"Calculus\",\"Probability\"]", tML);
        C("Recommender Systems", "Build systems that know what users want", CourseLevel.Advanced, 4.2f, 90, catDS, ins2,
          "[\"Collaborative filtering\",\"Content-based\",\"Hybrid\"]", tPy, tML);
        C("AI with Python (Beginner)", "Start your AI journey today", CourseLevel.Beginner, 4.6f, 450, catDS, ins2,
          "[\"AI concepts\",\"sklearn intro\",\"Simple projects\"]", tPy, tML);
        C("Advanced NLP", "Master BERT, GPT and beyond", CourseLevel.Advanced, 4.5f, 160, catDS, ins2,
          "[\"BERT\",\"GPT\",\"Sentiment analysis\"]", tPy, tML, tDL);
        C("Data Storytelling", "Turn data into compelling narratives", CourseLevel.Beginner, 4.3f, 200, catDS, ins2,
          "[\"Narrative structure\",\"Visualization\",\"Presenting\"]", tDA);
        C("Python Automation Scripts", "Automate boring tasks with Python", CourseLevel.Beginner, 4.4f, 350, catDS, ins2,
          "[\"File handling\",\"Email automation\",\"Scheduling\"]", tPy);
        C("Bayesian Statistics", "Advanced probabilistic reasoning", CourseLevel.Advanced, 4.1f, 80, catDS, ins2,
          "[\"Priors\",\"MCMC\",\"PyMC3\"]", tPy, tDA);
        C("Deep Reinforcement Learning", "Combine deep learning with RL", CourseLevel.Advanced, 4.3f, 70, catDS, ins2,
          "[\"DQN\",\"A3C\",\"AlphaGo concepts\"]", tPy, tDL);
        C("Data Mining Techniques", "Extract insights from complex datasets", CourseLevel.Intermediate, 4.2f, 160, catDS, ins2,
          "[\"Association rules\",\"Anomaly detection\",\"Clustering\"]", tPy, tML, tDA);

        // ── Cat 3: Cloud & DevOps (25 courses, ins3 = James Park) ─────────────
        C("Docker Fundamentals", "Containerize everything with Docker", CourseLevel.Beginner, 4.6f, 400, catCloud, ins3,
          "[\"Containers\",\"Images\",\"Compose\"]", tDocker);
        C("Kubernetes in Practice", "Orchestrate containers at scale", CourseLevel.Intermediate, 4.5f, 250, catCloud, ins3,
          "[\"Pods\",\"Services\",\"Deployments\",\"Helm\"]", tDocker);
        C("AWS Cloud Practitioner", "Start your cloud journey with AWS", CourseLevel.Beginner, 4.7f, 500, catCloud, ins3,
          "[\"EC2\",\"S3\",\"IAM\",\"Billing\"]", tAWS);
        C("AWS Solutions Architect", "Design resilient cloud architectures", CourseLevel.Intermediate, 4.6f, 320, catCloud, ins3,
          "[\"VPC\",\"Lambda\",\"DynamoDB\",\"Architecture\"]", tAWS);
        C("AWS Developer Associate", "Build cloud-native applications on AWS", CourseLevel.Advanced, 4.5f, 200, catCloud, ins3,
          "[\"API Gateway\",\"SQS/SNS\",\"CloudFormation\"]", tAWS);
        C("CI/CD GitHub Actions", "Automate your software delivery pipeline", CourseLevel.Intermediate, 4.3f, 180, catCloud, ins3,
          "[\"Workflows\",\"Testing\",\"Deployment\"]", tDocker);
        C("Terraform Infrastructure", "Manage cloud infrastructure as code", CourseLevel.Intermediate, 4.4f, 150, catCloud, ins3,
          "[\"HCL\",\"Modules\",\"State management\"]", tAWS);
        C("Linux System Admin", "Master the Linux command line", CourseLevel.Beginner, 4.5f, 350, catCloud, ins3,
          "[\"Shell commands\",\"Permissions\",\"Services\"]");
        C("Azure Fundamentals", "Get started with Microsoft Azure", CourseLevel.Beginner, 4.3f, 270, catCloud, ins3,
          "[\"Azure services\",\"Pricing\",\"Identity\"]", tAWS);
        C("Google Cloud Essentials", "Explore Google Cloud Platform", CourseLevel.Beginner, 4.2f, 200, catCloud, ins3,
          "[\"Compute Engine\",\"BigQuery\",\"IAM\"]", tAWS);
        C("Monitoring & Observability", "Keep your systems healthy with monitoring", CourseLevel.Advanced, 4.1f, 100, catCloud, ins3,
          "[\"Prometheus\",\"Grafana\",\"ELK stack\"]", tDocker, tAWS);
        C("Site Reliability Engineering", "Build reliable systems at scale", CourseLevel.Advanced, 4.4f, 120, catCloud, ins3,
          "[\"SLOs\",\"Incident management\",\"Capacity\"]", tDocker, tAWS);
        C("Ansible Automation", "Automate IT infrastructure with Ansible", CourseLevel.Intermediate, 4.3f, 140, catCloud, ins3,
          "[\"Playbooks\",\"Roles\",\"Inventory\"]", tAWS);
        C("Networking Fundamentals", "Understand how the internet works", CourseLevel.Beginner, 4.4f, 300, catCloud, ins3,
          "[\"TCP/IP\",\"DNS\",\"HTTP\",\"Firewalls\"]");
        C("Serverless Architecture", "Build without managing servers", CourseLevel.Intermediate, 4.3f, 170, catCloud, ins3,
          "[\"Lambda\",\"API Gateway\",\"DynamoDB\"]", tAWS);
        C("Microservices with Docker", "Design and run microservices", CourseLevel.Advanced, 4.4f, 160, catCloud, ins3,
          "[\"Service mesh\",\"API gateway\",\"Distributed tracing\"]", tDocker);
        C("Cloud Security Basics", "Secure your cloud infrastructure", CourseLevel.Intermediate, 4.2f, 130, catCloud, ins3,
          "[\"IAM best practices\",\"Encryption\",\"Compliance\"]", tAWS);
        C("Jenkins Pipeline", "Build CI/CD pipelines with Jenkins", CourseLevel.Intermediate, 4.1f, 110, catCloud, ins3,
          "[\"Pipeline as code\",\"Shared libraries\",\"Agents\"]", tDocker);
        C("GitOps with ArgoCD", "Manage deployments the GitOps way", CourseLevel.Advanced, 4.3f, 90, catCloud, ins3,
          "[\"Declarative\",\"Sync policies\",\"Rollbacks\"]", tDocker, tAWS);
        C("Helm Charts Deep Dive", "Package Kubernetes apps with Helm", CourseLevel.Intermediate, 4.2f, 100, catCloud, ins3,
          "[\"Chart structure\",\"Values\",\"Dependencies\"]", tDocker);
        C("AWS Security Specialty", "Secure AWS environments at expert level", CourseLevel.Advanced, 4.5f, 110, catCloud, ins3,
          "[\"KMS\",\"WAF\",\"CloudTrail\",\"GuardDuty\"]", tAWS);
        C("Cloud Cost Optimization", "Reduce your cloud bill without sacrificing performance", CourseLevel.Intermediate, 4.1f, 80, catCloud, ins3,
          "[\"Reserved instances\",\"Spot\",\"Right-sizing\"]", tAWS);
        C("Docker Swarm", "Cluster management with Docker Swarm", CourseLevel.Intermediate, 4.0f, 70, catCloud, ins3,
          "[\"Swarm mode\",\"Services\",\"Overlay networks\"]", tDocker);
        C("Istio Service Mesh", "Manage microservice communication with Istio", CourseLevel.Advanced, 4.3f, 60, catCloud, ins3,
          "[\"Traffic management\",\"mTLS\",\"Observability\"]", tDocker);
        C("Platform Engineering", "Build internal developer platforms", CourseLevel.Advanced, 4.5f, 80, catCloud, ins3,
          "[\"Internal dev platforms\",\"Golden paths\",\"Self-service\"]", tDocker, tAWS);

        ctx.Courses.AddRange(all);
        await ctx.SaveChangesAsync(); // EF populates Id on each Course object

        // Fix Content JSON (requires course.Id — must be after first SaveChanges)
        foreach (var course in all)
        {
            course.Content = BuildContent(course.Id, course.Title);
        }
        await ctx.SaveChangesAsync(); // saves Content

        // Fix CreatedBy & LastModifiedBy:
        // AuditableEntityInterceptor overwrites these with _user.Id = null during seeding.
        // ExecuteUpdateAsync sends direct SQL UPDATE — bypasses the interceptor entirely.
        var ins1Ids = all.Take(40).Select(c => c.Id).ToList();
        var ins2Ids = all.Skip(40).Take(35).Select(c => c.Id).ToList();
        var ins3Ids = all.Skip(75).Select(c => c.Id).ToList();

        await ctx.Courses
            .Where(c => ins1Ids.Contains(c.Id))
            .ExecuteUpdateAsync(s => s
                .SetProperty(c => c.CreatedBy, ins1)
                .SetProperty(c => c.LastModifiedBy, ins1));

        await ctx.Courses
            .Where(c => ins2Ids.Contains(c.Id))
            .ExecuteUpdateAsync(s => s
                .SetProperty(c => c.CreatedBy, ins2)
                .SetProperty(c => c.LastModifiedBy, ins2));

        await ctx.Courses
            .Where(c => ins3Ids.Contains(c.Id))
            .ExecuteUpdateAsync(s => s
                .SetProperty(c => c.CreatedBy, ins3)
                .SetProperty(c => c.LastModifiedBy, ins3));

        return all;

    }

    private static string BuildContent(int courseId, string title)
    {
        // Matches exact format produced by CreateCourseCommand handler
        var defaultSection = new
        {
            sectionId = "section-1",
            title = "Introduction",
            learningObjectives = "",
            items = new[]
            {
                new
                {
                    itemId        = "item-1",
                    title         = "Introduction",
                    description   = "",
                    content       = "",
                    type          = "lecture",
                    isPendingType = false,
                    downloadable  = false,
                    resources     = Array.Empty<object>(),
                }
            },
            isEditMode = false,
            published = false,
        };

        var courseContent = new
        {
            id = courseId.ToString(),
            title = title,
            contents = new[] { defaultSection },
            nextSectionId = 2,
            nextItemId = 2,
        };

        return System.Text.Json.JsonSerializer.Serialize(courseContent);
    }
}
