export const FAQ_DATA = [
  // Getting Started
  {
    id: 1,
    category: 'getting-started',
    question: 'What is Edunary?',
    answer: '<p>Edunary is an online learning marketplace where instructors create courses and learners build skills through structured lessons and practice activities.</p><p>The platform also provides career paths, course progress tracking, certificates, instructor tools, and AI-assisted course quality feedback.</p>'
  },
  {
    id: 2,
    category: 'getting-started',
    question: 'What can an Edunary course include?',
    answer: '<p>A course can include video lectures, written articles, quizzes, assignments, captions, and downloadable learning resources. Available content varies by course and is shown on the course page before enrollment.</p>'
  },
  {
    id: 3,
    category: 'getting-started',
    question: 'Where can I access Edunary?',
    answer: '<p>Edunary is a web application. You can use it in a modern browser on a desktop, laptop, tablet, or mobile device. Edunary does not currently provide a separate iOS or Android application.</p>'
  },
  {
    id: 4,
    category: 'getting-started',
    question: 'How do I create or log in to my account?',
    answer: '<p>Select <strong>Register</strong> to create an account with your name, email address, phone number, and password. Standard registrations require email verification. You can also sign in with Google.</p><p>Returning users can select <strong>Login</strong>. If you forget your password, use the password reset option on the login page.</p>'
  },
  {
    id: 5,
    category: 'getting-started',
    question: 'How do I find a course?',
    answer: '<p>Use the search bar to search by keyword, browse available categories, or explore Edunary career paths. Search results can be opened to review the course curriculum, instructor, price, learning objectives, and included features.</p>'
  },
  {
    id: 6,
    category: 'getting-started',
    question: 'Can I preview a course before purchasing?',
    answer: '<p>Yes, when an instructor marks a video lecture as a free preview. Open the course page and select an available preview lecture to watch it before enrolling.</p>'
  },

  // Students
  {
    id: 10,
    category: 'students',
    question: 'How do I start or continue a course?',
    answer: '<p>After enrollment, open <strong>My Learning</strong> and select the course card. Edunary opens the course player and saves your completed items and video position so you can continue later.</p>'
  },
  {
    id: 11,
    category: 'students',
    question: 'Do I have to complete a course by a deadline?',
    answer: '<p>Edunary courses currently have no platform-enforced completion deadline. A course purchase is a one-time purchase with lifetime access while the course and your account remain available.</p>'
  },
  {
    id: 12,
    category: 'students',
    question: 'What learning features are available?',
    answer: '<p>Depending on the course, you may have video and article lessons, captions, quizzes, assignments, downloadable resources, announcements, course Q&amp;A, ratings, and progress tracking. Check the course page and curriculum for the features included in a specific course.</p>'
  },
  {
    id: 13,
    category: 'students',
    question: 'Can I download course videos?',
    answer: '<p>Yes. Enrolled learners can use the download control in the web course player when the video file is available. The file is downloaded to your device; Edunary does not currently provide an in-app offline viewing mode.</p>'
  },
  {
    id: 14,
    category: 'students',
    question: 'How do I earn and access a certificate?',
    answer: '<p>You can request a certificate after completing all required lectures and quizzes in an enrolled course. Your certificates appear under <strong>My Learning &gt; Certifications</strong>, where you can view or download the PDF.</p><p>Each certificate has a public verification number that can be checked from the certificate verification page.</p>'
  },

  // Teachers
  {
    id: 20,
    category: 'teachers',
    question: 'How do I start teaching on Edunary?',
    answer: '<p>Sign in, open your profile menu, and select <strong>Teaching On Edunary</strong>. From Courses Management, you can create your first course and begin adding its landing-page details and curriculum. There is no separate fee to open the instructor workspace.</p>'
  },
  {
    id: 21,
    category: 'teachers',
    question: 'How do I create and publish a course?',
    answer: '<p>Create a course from the instructor Courses Management area, then complete its landing page, pricing, intended learners, messages, curriculum, captions, and settings. You can preview the course while editing.</p><p>When it is ready, submit it for admin review. An admin can approve the course or request changes before it becomes public.</p>'
  },
  {
    id: 22,
    category: 'teachers',
    question: 'What quality requirements should my course meet?',
    answer: '<p>Course claims, learning objectives, intended learners, category, topics, curriculum, lectures, quizzes, and assignments should be accurate, complete, safe, and aligned with one another. The admin review remains the publishing decision.</p><p>Edunary also provides AI policy checks and deterministic pre-flight checks. Pre-flight checks can flag issues such as a missing cover image or intended-learner details, a curriculum with fewer than two sections or five lecture items, short articles, missing video captions, weak quiz setup, or assignments without instructions.</p>'
  },
  {
    id: 23,
    category: 'teachers',
    question: 'How do I update my instructor profile and payout details?',
    answer: '<p>Use the account settings pages to update your profile, photo, security settings, and tax profile. Bank account details for instructor withdrawals are managed from the Revenue area.</p>'
  },
  {
    id: 24,
    category: 'teachers',
    question: 'How are instructor earnings, revenue shares, and withdrawals calculated?',
    answer: '<p>The current revenue shares are:</p><ul><li><strong>Purchase without a coupon:</strong> the instructor share is 37%, and the platform share is 63%.</li><li><strong>Purchase with a platform-funded coupon:</strong> the instructor share is 37%, and the platform share is 63%.</li><li><strong>Purchase with an instructor-funded coupon:</strong> the instructor share is 97%, and the platform share is 3%.</li></ul><p>These percentages are applied to the course price after any coupon discount and before VAT. A free enrollment therefore produces no instructor earnings. The 37% or 97% instructor share is the total instructor pool for the sale. If the course has accepted collaborators with revenue shares, their portions are paid from that pool and the course owner receives the remainder.</p><p>Instructors can review their wallet balance under <strong>Performance &gt; Revenue</strong>. Withholding tax is not deducted from each course sale; it is calculated when an instructor requests a withdrawal. To withdraw, first add a bank name, account number, and account holder. Edunary previews the withholding tax and net payout before the request is submitted for admin processing. A completed tax profile can provide the country-specific withholding rate; otherwise, the platform default applies. Withdrawals are not tied to a fixed monthly schedule.</p>'
  },
  {
    id: 25,
    category: 'teachers',
    question: 'Can I create coupons or join platform promotions?',
    answer: '<p>Yes. Instructors can create coupons for their courses from the Coupons area. A course can also allow Edunary-funded platform coupon campaigns from its Pricing settings without disabling the instructor&apos;s own coupons.</p>'
  },

  // Purchase and Payments
  {
    id: 30,
    category: 'payments',
    question: 'How do I pay for a course?',
    answer: '<p>Add the course to your cart or select <strong>Buy Now</strong>, then complete the secure Stripe checkout. Edunary creates charges in USD, and the payment options displayed inside Stripe depend on the checkout configuration and your payment details.</p>'
  },
  {
    id: 31,
    category: 'payments',
    question: 'How do coupon codes work?',
    answer: '<p>Enter a valid coupon before checkout. Coupons may be funded by an instructor or by Edunary and can provide a percentage discount, fixed discount, custom price, or free enrollment. A coupon can have course, date, and redemption limits.</p>'
  },
  {
    id: 32,
    category: 'payments',
    question: 'Why did a course price change?',
    answer: '<p>Instructors set their course prices and can change a price at most once every seven days. A displayed total can also change when a coupon is applied, expires, reaches its redemption limit, or no longer applies to the selected course.</p>'
  },
  {
    id: 33,
    category: 'payments',
    question: 'Is a course purchase a one-time payment?',
    answer: '<p>Yes. Edunary currently sells individual courses as one-time purchases rather than subscriptions. After a successful purchase, the course is added to <strong>My Learning</strong>.</p>'
  },
  {
    id: 34,
    category: 'payments',
    question: 'Will tax be added to my purchase?',
    answer: '<p>Applicable VAT is calculated from the billing country selected at checkout and is shown in the order summary before payment. Edunary uses the active rate configured for that country or the platform default VAT rate when no active country rate is available.</p>'
  },
  {
    id: 35,
    category: 'payments',
    question: 'What should I do if checkout fails?',
    answer: '<p>Review the message shown at checkout, confirm your billing country and payment details, and retry after checking your connection. You cannot purchase your own course or repurchase a course already enrolled in.</p><p>If Stripe declines the payment, contact your card issuer or try another payment option offered by the Stripe payment form.</p>'
  },

  // Troubleshooting
  {
    id: 40,
    category: 'troubleshooting',
    question: 'What should I try if Edunary is not working?',
    answer: '<ol><li>Refresh the page and confirm your internet connection.</li><li>Use an up-to-date browser and sign in again.</li><li>Try a private or incognito window.</li><li>Clear Edunary cookies and cached site data, then restart the browser.</li><li>Temporarily disable browser extensions that may block scripts, media, or authentication.</li><li>Try another browser or network to identify whether the issue is device-specific.</li></ol>'
  },
  {
    id: 41,
    category: 'troubleshooting',
    question: 'Why is a purchased course missing?',
    answer: '<p>Open <strong>My Learning &gt; All courses</strong> and confirm you are signed in with the same account used at checkout. Also confirm that the payment completed successfully.</p><p>If the course still does not appear, contact Edunary support with your account email and payment or order details.</p>'
  },
  {
    id: 42,
    category: 'troubleshooting',
    question: 'How can I fix audio or video playback issues?',
    answer: '<ol><li>Refresh the lesson and verify that your connection is stable.</li><li>Try a different quality level in the video player.</li><li>Disable extensions that block media requests.</li><li>Try another current browser or an incognito window.</li><li>Confirm the tab and device are not muted.</li></ol><p>If streaming remains unreliable, enrolled learners can use the video download control when the source file is available.</p>'
  },
  {
    id: 43,
    category: 'troubleshooting',
    question: 'I cannot sign in or verify my account',
    answer: '<p>Check that you are using the correct email address and authentication method. Email registrations must be verified before normal login. You can resend the verification email from the registration flow or use <strong>Forgot password</strong> to reset a password.</p><p>If you registered with Google, use the Google sign-in option for that account.</p>'
  },

  // AI Quality Check
  {
    id: 60,
    category: 'ai-quality',
    question: 'What does AI Quality Check review?',
    answer: '<p>AI Quality Check helps instructors identify course-design and content issues before or during admin review. It examines course metadata, category and topics, intended learners, learning objectives, curriculum structure, lecture content, quizzes, and assignments.</p><p>The report contains an overall summary and supported issues with a severity, location, description, evidence, and suggested improvement. It is advisory: it does not automatically approve, reject, publish, or edit a course.</p><p>Before the AI analysis, Edunary also runs deterministic pre-flight checks for measurable conditions such as missing fields, curriculum size, article length, captions, and assessment setup. Those code-based checks are separate from the AI policies listed below.</p>'
  },
  {
    id: 61,
    category: 'ai-quality',
    question: 'How do instructors run and review an AI quality check?',
    answer: '<p>Open a course in Courses Management, select <strong>AI Course Review</strong>, and choose <strong>Run AI Quality Check</strong>. Progress is displayed while the report is generated.</p><p>Instructor checks are limited to one run per course every seven days. Completed reports remain in report history, where instructors can open the latest or an earlier report and review its summary and issues.</p>'
  },
  {
    id: 62,
    category: 'ai-quality',
    question: 'Which landing-page policies does the AI evaluate?',
    answer: '<ul><li><strong>LP-01 - Honest &amp; Accurate Marketing</strong> <em>(Critical)</em>: Course title, subtitle, and description must be honest, accurate, and non-misleading. No clickbait, exaggerated promises, or fake outcomes.</li><li><strong>LP-02 - Title &amp; Subtitle Quality</strong> <em>(Warning)</em>: The title must clearly identify the primary topic. The subtitle must expand on it, such as target outcomes, key skills, or audience. Generic sales slogans should be avoided.</li><li><strong>LP-03 - Informational Course</strong> <em>(Warning)</em>: The course description must be informational and professional. Promotional spam, coupons, affiliate links, or aggressive sales pitches are strictly prohibited.</li><li><strong>LP-04 - Material Disclosures</strong> <em>(Warning)</em>: The course must disclose key student requirements, such as paid software, subscriptions, or AI-generated content.</li><li><strong>LP-05 - Target Audience &amp; Requirements</strong> <em>(Warning)</em>: Target audience and requirements cannot be empty. They must be specific and actionable for students to evaluate suitability. Vague statements such as &quot;for everyone&quot; are prohibited.</li><li><strong>LP-06 - Landing Page to Curriculum Alignment</strong> <em>(Critical)</em>: High-level promises, tools, or major skills mentioned in the landing page must be covered in the actual curriculum.</li><li><strong>LP-07 - Course Image</strong> <em>(Warning)</em>: The course must have a high-quality cover image to display professionally on the marketplace.</li><li><strong>LP-08 - Category &amp; Topic Accuracy</strong> <em>(Warning)</em>: The assigned category and topics must accurately represent the actual subject and content of the course.</li></ul>'
  },
  {
    id: 63,
    category: 'ai-quality',
    question: 'Which learning-objective and assessment policies does the AI evaluate?',
    answer: '<ul><li><strong>LO-01 - Measurable Learning Objectives</strong> <em>(Critical)</em>: Every objective must start with a measurable action verb, such as Create, Analyze, Explain, or Design. Vague or passive verbs such as &quot;Understand&quot;, &quot;Learn&quot;, or &quot;Know&quot; are strictly prohibited.</li><li><strong>LO-02 - Section-Level Objective Consistency</strong> <em>(Critical)</em>: Section objectives must also start with measurable action verbs and directly support the course-level objectives.</li><li><strong>LO-03 - Learner-Centered &amp; Distinct</strong> <em>(Warning)</em>: Objectives must focus on what the learner can perform. Each objective must be unique, specific, and not duplicate other objectives in different words.</li><li><strong>LO-04 - Objective-Level Alignment</strong> <em>(Warning)</em>: Objectives must match the expected course level. For example, a beginner course should not promise master-level execution outcomes without introductory steps.</li><li><strong>LO-05 - Constructive Alignment</strong> <em>(Critical)</em>: There must be a clear path of alignment: objectives must directly map to sections, lectures, activities, and assessments in the curriculum.</li></ul>'
  },
  {
    id: 64,
    category: 'ai-quality',
    question: 'Which curriculum and compliance policies does the AI evaluate?',
    answer: '<ul><li><strong>CU-01 - Topic Relevance &amp; Focus</strong> <em>(Warning)</em>: Curriculum content, explanations, and examples must stay relevant to the course subject without filler or conversational noise.</li><li><strong>CU-02 - Logical Learning Flow</strong> <em>(Warning)</em>: Concepts and skills must follow a clear, progressive sequence.</li><li><strong>CU-03 - Focused Scope</strong> <em>(Suggestion)</em>: Each section should have one primary goal, and each lecture should focus on a specific concept or skill.</li><li><strong>CU-04 - Practice Opportunities</strong> <em>(Warning)</em>: Each major section should include a quiz or assignment that reinforces learning.</li><li><strong>CU-05 - External Tools &amp; Links Quality</strong> <em>(Critical)</em>: External tools and sites must support the objectives, and paid tools or required accounts must be disclosed. Affiliate marketing and unauthorized promotions are prohibited.</li><li><strong>CU-07 - Safe Content &amp; Policy Compliance</strong> <em>(Critical)</em>: Content must not contain profanity, vulgarity, hate, discrimination, violent imagery, illegal instructions, or dangerous advice.</li><li><strong>CU-08 - Sensitive Data &amp; Privacy</strong> <em>(Critical)</em>: Content must not expose personal information or secrets such as emails, phone numbers, API keys, passwords, credentials, or private addresses.</li><li><strong>CU-10 - Current Practices &amp; Technical Relevance</strong> <em>(Warning)</em>: Course content should use current standards and tools rather than severely outdated software, obsolete methods, or deprecated libraries.</li><li><strong>CU-11 - Current Practices &amp; Technical Relevance</strong> <em>(Warning)</em>: Content must reflect contemporary standards. Severely outdated software versions, obsolete methods, or deprecated libraries will be flagged.</li><li><strong>CU-12 - Practice Opportunities</strong> <em>(Warning)</em>: Each major section should feature at least one practical activity, such as a Quiz or Assignment, to reinforce learning.</li><li><strong>CU-13 - Quiz Accuracy</strong> <em>(Critical)</em>: Every quiz question must have at least one correct choice marked. Otherwise, students cannot pass.</li><li><strong>CU-14 - Assessment Instructions</strong> <em>(Warning)</em>: Every assignment/quiz must have clear, detailed student instructions explaining exactly what is expected. It cannot be empty.</li><li><strong>CU-15 - Curricular Coherence</strong> <em>(Critical)</em>: Course content must be logically connected. Concepts taught in earlier sections must not be contradicted or changed in later sections. Unnecessary repetition of previously covered content should be avoided unless it serves a clear learning purpose.</li><li><strong>CU-16 - Constructive Alignment</strong> <em>(Critical)</em>: Quizzes and assignments must perfectly match the instructional materials. Students cannot be tested on concepts that were not taught in the lectures.</li></ul>'
  }
];
