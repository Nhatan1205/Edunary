import { Container, Row, Col, Table, Nav, NavItem, NavLink, Card, CardBody } from 'reactstrap';
import 'bootstrap/dist/css/bootstrap.min.css';

function PolicyPage() {
  return (
    <div style={{ minHeight: '100vh', paddingTop: '2rem', paddingBottom: '4rem' }}>
      <Container>
        <Row>
          <Col lg="12">
            <div style={{ 
              backgroundColor: 'white', 
              padding: '3rem', 
              borderRadius: '8px',
            }}>
              {/* Header */}
              <div style={{ borderBottom: '2px solid', paddingBottom: '1.5rem', marginBottom: '2rem' }}>
                <h1 style={{ color: '#333', marginBottom: '0.5rem' }}>Edunary Privacy Policy</h1>
                <p style={{ color: '#666', fontStyle: 'italic', marginBottom: 0 }}>
                  Last updated November 22, 2025.
                </p>
              </div>

              {/* Introduction */}
              <div style={{ marginBottom: '2rem', lineHeight: '1.8' }}>
                <p>Thank you for joining Edunary. We at Edunary respect your privacy and want you to understand how we collect, use, and share data about you. This Privacy Policy covers our data collection practices and describes your rights regarding your personal data.</p>
                
                <p>Unless we link to a different policy or state otherwise, this Privacy Policy applies when you visit or use Edunary websites, mobile applications, APIs, or related services (the "Services"). It also applies to prospective customers of our business and enterprise products. If you are using Edunary as part of your employer's Edunary Business learning and development program, you can consult our Edunary Business Privacy Statement.</p>
                
                <p><strong>By using the Services, you agree to the terms of this Privacy Policy. You may not use the Services if you don't agree with this Privacy Policy or any other agreement that governs your use of the Services.</strong></p>
              </div>

              {/* Table of Contents */}
              <Card style={{ backgroundColor: '#f8f9fa', marginBottom: '3rem' }}>
                <CardBody>
                  <h3 style={{ marginBottom: '1.5rem', color: '#333' }}>Table of Contents</h3>
                  <Nav vertical>
                    <NavItem>
                      <NavLink 
                        onClick={() => document.getElementById("section1").scrollIntoView({ behavior: "smooth" })}
                        style={{ color: '#00b190', cursor: 'pointer', padding: '0.5rem 0', textDecoration: "underline" }}
                      >
                        1. What Data We Get
                      </NavLink>
                    </NavItem>
                    <NavItem>
                      <NavLink 
                        onClick={() => document.getElementById("section2").scrollIntoView({ behavior: "smooth" })}
                        style={{ color: '#00b190', cursor: 'pointer', padding: '0.5rem 0', textDecoration: "underline" }}>
                        2. How We Get Data About You
                      </NavLink>
                    </NavItem>
                    <NavItem>
                      <NavLink 
                      onClick={() => document.getElementById("section3").scrollIntoView({ behavior: "smooth" })} 
                      style={{ color: '#00b190', cursor: 'pointer', padding: '0.5rem 0' , textDecoration: "underline"}}>
                        3. What We Use Your Data For
                      </NavLink>
                    </NavItem>
                    <NavItem>
                      <NavLink 
                        onClick={() => document.getElementById("section4").scrollIntoView({ behavior: "smooth" })}
                        style={{ color: '#00b190', cursor: 'pointer', padding: '0.5rem 0', textDecoration: "underline" }}>
                        4. Who We Share Your Data With
                      </NavLink>
                    </NavItem>
                    <NavItem>
                      <NavLink 
                        onClick={() => document.getElementById("section5").scrollIntoView({ behavior: "smooth" })}
                        style={{ color: '#00b190', cursor: 'pointer', padding: '0.5rem 0', textDecoration: "underline" }}>
                        5. Security
                      </NavLink>
                    </NavItem>
                  </Nav>
                </CardBody>
              </Card>

              {/* Section 1 */}
              <section id="section1" style={{ marginBottom: '3rem', scrollMarginTop: '2rem' }}>
                <h2 style={{ color: '#00b190', borderBottom: '2px solid #00b190', paddingBottom: '0.5rem', marginBottom: '1.5rem' }}>
                  1. What Data We Get
                </h2>
                <p style={{ lineHeight: '1.8' }}>
                  We collect certain data from you directly, like information you enter yourself, data about your consumption of content, and data from third-party platforms you connect with Edunary. We also collect some data automatically, like information about your device and what parts of our Services you interact with or spend time using. All data listed in this section is subject to the following processing activities: collecting, recording, structuring, storing, altering, retrieving, encrypting, pseudonymizing, erasing, combining, and transmitting.
                </p>

                {/* Section 1.1 */}
                <div id="section1-1" style={{ marginTop: '2rem', scrollMarginTop: '2rem' }}>
                  <h3 style={{ color: '#333', marginBottom: '1rem' }}>1.1 Data You Provide to Us</h3>
                  <p style={{ lineHeight: '1.8', marginBottom: '1.5rem' }}>
                    We may collect different data from or about you depending on how you use the Services. Below are some examples to help you better understand the data we collect.
                  </p>
                  <p style={{ lineHeight: '1.8', marginBottom: '1.5rem' }}>
                    When you create an account and use the Services, including through a third-party platform, we collect any data you provide directly, including:
                  </p>

                  <div style={{ overflowX: 'auto', marginBottom: '2rem' }}>
                    <Table bordered responsive style={{ backgroundColor: 'white' }}>
                      <thead style={{ backgroundColor: '#00b190', color: 'white' }}>
                        <tr>
                          <th style={{ width: '20%' }}>Category of Personal Data</th>
                          <th style={{ width: '60%' }}>Description</th>
                          <th style={{ width: '20%' }}>Legal Basis for Processing</th>
                        </tr>
                      </thead>
                      <tbody>
                        <tr>
                          <td><strong>Account Data</strong></td>
                          <td>In order to use certain features (like accessing content), you need to create a user account, which requires us to collect and store your email address, password, and account settings. To create an instructor account, we collect and store your name, email address, password, and account settings. As you use certain features on the site, you may be prompted to submit additional information. For example, you may choose to provide your phone number for authentication purposes or information relevant to your learning interests, including occupation and skill interests, and if you apply to become an instructor, we may collect government ID information, verification photo, date of birth, race/ethnicity, and phone number. Upon account creation, we assign you a unique identifying number.</td>
                          <td>Performance of contract; Legitimate interests (service provisioning, identity verification, fraud prevention and security, communication, marketing and advertising)</td>
                        </tr>
                        <tr>
                          <td><strong>Profile Data</strong></td>
                          <td>You can also choose to provide profile information like a photo, headline, biography, language, website link, social media profiles, country, or other data. Your Profile Data will be publicly viewable by others.</td>
                          <td>Performance of contract; Legitimate interests (enhanced platform functionality, convey content source information)</td>
                        </tr>
                        <tr>
                          <td><strong>Shared Content</strong></td>
                          <td>Parts of the Services let you interact with other users or share content publicly, including by uploading courses and other content, posting reviews about content, asking or answering questions, sending messages to students or instructors, or posting photos or other work you upload. Such shared content may be publicly viewable by others and may be shared in accordance with the Terms of Use (Section 5. "Edunary's Rights to Content You Post.")</td>
                          <td>Performance of contract; Legitimate interests (service provisioning, enhanced platform functionality, marketing)</td>
                        </tr>
                        <tr>
                          <td><strong>Learning Data</strong></td>
                          <td>When you access content, we collect certain data including which courses, assignments, labs, workspaces, and quizzes you've started and completed; content and subscription purchases and credits; subscriptions; completion certificates; badges; your exchanges with instructors, teaching assistants, and other students; and essays, answers to questions, and other items submitted to satisfy course and related content requirements.</td>
                          <td>Performance of contract; Legitimate interests (service provisioning, enhanced platform functionality, fraud prevention and security, marketing and advertising)</td>
                        </tr>
                        <tr>
                          <td><strong>Student Payment Data</strong></td>
                          <td>If you make purchases, we collect certain data about your purchase (such as your name, billing address, and ZIP code) as necessary to process your order and which may optionally be saved to process future orders. You must provide certain payment and billing data directly to our payment service providers, including your name, credit card information, billing address, and ZIP code. We may also receive limited information, like the fact that you have a new card and the last four digits of that card, from payment service providers to facilitate payments. For security, Edunary does not collect or store sensitive cardholder data, such as full credit card numbers or card authentication data.</td>
                          <td>Performance of contract; Legal obligation; Legitimate interests (payment facilitation, fraud prevention and security, compliance)</td>
                        </tr>
                        <tr>
                          <td><strong>Instructor Payment Data</strong></td>
                          <td>If you are an instructor, you can link your PayPal, Payoneer, Tipalti, or other payment account to the Services to receive payments. When you set up a payment account, we collect and use certain information, including your payment account email address, account ID, physical address, or other data necessary for us to send payments to your account. In some instances, we may collect ACH or wire information to send payments to your account. In order to comply with applicable laws, we also work with trusted third parties who collect tax information as legally required. This tax information may include residency information, tax identification numbers, biographical information, and other personal information necessary for taxation purposes. For security, Edunary does not collect or store sensitive bank account information. The collection, use, and disclosure of your payment, billing, and taxation data is subject to the privacy policy and other terms of your payment account provider.</td>
                          <td>Performance of contract; Legal obligation; Legitimate interests (service provisioning, payment facilitation, fraud prevention and security, compliance)</td>
                        </tr>
                        <tr>
                          <td><strong>Data About Your Accounts on Other Services</strong></td>
                          <td>We may obtain certain information through your social media or other online accounts if they are connected to your Edunary account. If you login to Edunary via Facebook or another third-party platform or service, those platforms and services make information available to us through their APIs. The information we receive depends on what information you (via your privacy settings) or the platform or service decide to give us and usually consists of your first and last name, user identification number, and email address. If you access or use our Services through a third-party platform or service your data will also be subject to the privacy policies and other agreements of that third party.</td>
                          <td>Legitimate interests (identity verification, user experience improvement)</td>
                        </tr>
                        <tr>
                          <td><strong>Promotions, and Surveys</strong></td>
                          <td>We may invite you to complete a survey or participate in a promotion (like a contest, sweepstakes, or challenge), either through the Services or a third-party platform. If you participate, we will collect and store the data you provide as part of participating, such as your name, email address, postal address, date of birth, or phone number. That data is subject to this Privacy Policy unless otherwise stated in the official rules of the promotion or in another privacy policy. The data collected will be used to administer the promotion or survey, including for notifying winners and distributing rewards. To receive a reward, you may be required to allow us to post some of your information publicly (like on a winner's page). Where we use a third-party platform to administer a survey or promotion, the third party's privacy policy will apply.</td>
                          <td>Performance of contract; Legitimate interests (promotions administration, prize delivery, compliance)</td>
                        </tr>
                        <tr>
                          <td><strong>Communications and Support</strong></td>
                          <td>If you contact us for support or to report a problem or concern (regardless of whether you have created an account), including through our AI virtual assistant, we collect and store your contact information, messages, and other data about you like your name, email address, location, Edunary user ID, refund transaction IDs, and any other data you provide or that we collect through automated means (which we cover below). We use this data to respond to you and research your question or concern.</td>
                          <td>Legitimate interests (customer and technical support, fraud prevention and security)</td>
                        </tr>
                      </tbody>
                    </Table>
                  </div>

                  <p style={{ lineHeight: '1.8', fontStyle: 'italic', color: '#666' }}>
                    The data listed above is stored by us and associated with your account. Edunary's use and transfer to any other app of information received from Google APIs, like instructor uploaded content, will adhere to Google API Services User Data Policy, including the Limited Use requirements.
                  </p>
                </div>

                {/* Section 1.2 */}
                <div id="section1-2" style={{ marginTop: '2rem', scrollMarginTop: '2rem' }}>
                  <h3 style={{ color: '#333', marginBottom: '1rem' }}>1.2 Data We Collect through Automated Means</h3>
                  <p style={{ lineHeight: '1.8', marginBottom: '1.5rem' }}>
                    When you access the Services (including browsing content), we collect certain data by automated means, including:
                  </p>

                  <div style={{ overflowX: 'auto', marginBottom: '2rem' }}>
                    <Table bordered responsive style={{ backgroundColor: 'white' }}>
                      <thead style={{ backgroundColor: '#00b190', color: 'white' }}>
                        <tr>
                          <th style={{ width: '20%' }}>Category of Personal Data</th>
                          <th style={{ width: '60%' }}>Description</th>
                          <th style={{ width: '20%' }}>Legal Basis for Processing</th>
                        </tr>
                      </thead>
                      <tbody>
                        <tr>
                          <td><strong>System Data</strong></td>
                          <td>Technical data about your computer or device, like your IP address; device type; operating system type and version; unique device identifiers, including mobile advertising identifiers; browser; browser language; domain and other systems data; and platform types.</td>
                          <td>Performance of contract; Legitimate interests (service provisioning, customer and technical support, fraud prevention and security, communication, product improvement, marketing and advertising)</td>
                        </tr>
                        <tr>
                          <td><strong>Usage Data</strong></td>
                          <td>Usage statistics about your interactions with the Services, including content accessed, time spent on pages or the Service, pages visited, features used, your search queries, click data, date and time, referrer, and other data regarding your use of the Services.</td>
                          <td>Legitimate interests (service provisioning, user experience improvement, product improvement, fraud prevention and security, marketing and advertising)</td>
                        </tr>
                        <tr>
                          <td><strong>Approximate Geographic Data</strong></td>
                          <td>An approximate geographic location, including information like country, city, and geographic coordinates, calculated based on your IP address.</td>
                          <td>Legitimate interests (user experience improvement, fraud prevention and security, compliance, marketing and advertising)</td>
                        </tr>
                      </tbody>
                    </Table>
                  </div>

                  <p style={{ lineHeight: '1.8', fontStyle: 'italic', color: '#666' }}>
                    The data listed above ("Cookie Data") is collected through the use of server log files and tracking technologies, as detailed in the "Cookies and Data Collection Tools" section below. It is stored by us and associated with your account. Depending on your cookie and browser settings, the data listed above may also transmitted to Google for advertising purposes, as provided in more detail below.
                  </p>
                </div>

                {/* Section 1.3 */}
                <div id="section1-3" style={{ marginTop: '2rem', scrollMarginTop: '2rem' }}>
                  <h3 style={{ color: '#333', marginBottom: '1rem' }}>1.3 Data From Third Parties</h3>
                  <p style={{ lineHeight: '1.8' }}>
                    If you are a Edunary Business enterprise or corporate prospect, in addition to information you submit to us, we may collect certain business contact information from third-party commercial sources.
                  </p>
                </div>
              </section>

              {/* Section 2 */}
              <section id="section2" style={{ marginBottom: '3rem', scrollMarginTop: '2rem' }}>
                <h2 style={{ color: '#00b190', borderBottom: '2px solid #00b190', paddingBottom: '0.5rem', marginBottom: '1.5rem' }}>
                  2. How We Get Data About You
                </h2>
                <p style={{ lineHeight: '1.8' }}>
                  We use tools like cookies, web beacons, and similar tracking technologies to gather the data listed above. Some of these tools offer you the ability to opt out of data collection.
                </p>

                {/* Section 2.1 */}
                <div id="section2-1" style={{ marginTop: '2rem', scrollMarginTop: '2rem' }}>
                  <h3 style={{ color: '#333', marginBottom: '1rem' }}>2.1 Cookies and Data Collection Tools</h3>
                  <p style={{ lineHeight: '1.8', marginBottom: '1rem' }}>
                    We use cookies, which are small text files stored by your browser, to collect, store, and share data about your activities across websites, including on Edunary. They allow us to remember things about your visits to Edunary, like your preferred language, and to make the site easier to use. To learn more about cookies, visit https://cookiepedia.co.uk/all-about-cookies. We may also use clear pixels in emails to track deliverability and open rates.
                  </p>
                  <p style={{ lineHeight: '1.8' }}>
                    Edunary and service providers acting on our behalf (like Google Analytics and third-party advertisers) use server log files and automated data collection tools like cookies, tags, scripts, customized links, device or browser fingerprints, and web beacons (together, "Data Collection Tools") when you access and use the Services. These Data Collection Tools automatically track and collect certain System Data, Usage Data, and Approximate Geographic Data (as detailed in Section 1) when you use the Services. In some cases, we tie data gathered through those Data Collection Tools to other data that we collect as described in this Privacy Policy.
                  </p>
                </div>

                {/* Section 2.2 */}
                <div id="section2-2" style={{ marginTop: '2rem', scrollMarginTop: '2rem' }}>
                  <h3 style={{ color: '#333', marginBottom: '1rem' }}>2.2 Why We Use Data Collection Tools</h3>
                  <p style={{ lineHeight: '1.8', marginBottom: '1rem' }}>
                    Edunary uses the following types of Data Collection Tools for the purposes described:
                  </p>
                  <ul style={{ lineHeight: '1.8', marginBottom: '1rem' }}>
                    <li style={{ marginBottom: '1rem' }}>
                      <strong>Strictly Necessary:</strong> These Data Collection Tools enable you to access the site, provide basic functionality (like logging in or accessing content), secure the site, protect against fraudulent logins, and detect and prevent abuse or unauthorized use of your account. These are required for the Services to work properly, so if you disable them, parts of the site will break or be unavailable.
                    </li>
                    <li style={{ marginBottom: '1rem' }}>
                      <strong>Functional:</strong> These Data Collection Tools remember data about your browser and your preferences, provide additional site functionality, customize content to be more relevant to you, and remember settings affecting the appearance and behavior of the Services (like your preferred language or volume level for video playback).
                    </li>
                    <li style={{ marginBottom: '1rem' }}>
                      <strong>Performance:</strong> These Data Collection Tools help measure and improve the Services by providing usage and performance data, visit counts, traffic sources, or where an application was downloaded from. These tools can help us test different versions of Edunary to see which features or content users prefer and determine which email messages are opened.
                    </li>
                    <li style={{ marginBottom: '1rem' }}>
                      <strong>Advertising:</strong> These Data Collection Tools are used to deliver relevant ads (on the site and/or other sites) based on things we know about you like your Usage and System Data (as detailed in Section 1), and things that the ad service providers know about you based on their tracking data. The ads can be based on your recent activity or activity over time and across other sites and services. To help deliver tailored advertising, we may provide these service providers with a hashed, anonymized version of your email address (in a non-human-readable form) and content that you share publicly on the Services.
                    </li>
                    <li style={{ marginBottom: '1rem' }}>
                      <strong>Social Media:</strong> These Data Collection Tools enable social media functionality, like sharing content with friends and networks. These cookies may track a user or device across other sites and build a profile of user interests for targeted advertising purposes.
                    </li>
                  </ul>
                  <p style={{ lineHeight: '1.8' }}>
                    You can set your web browser to alert you about attempts to place cookies on your computer, limit the types of cookies you allow, or refuse cookies altogether. If you do, you may not be able to use some or all features of the Services, and your experience may be different or less functional. To learn more about managing Data Collection Tools, refer to Section 6.1 (Your Choices About the Use of Your Data) below.
                  </p>
                </div>
              </section>

              {/* Section 3 */}
              <section id="section3" style={{ marginBottom: '3rem', scrollMarginTop: '2rem' }}>
                <h2 style={{ color: '#00b190', borderBottom: '2px solid #00b190', paddingBottom: '0.5rem', marginBottom: '1.5rem' }}>
                  3. What We Use Your Data For
                </h2>
                <p style={{ lineHeight: '1.8', marginBottom: '1rem' }}>
                  We use your data to do things like provide our Services, communicate with you, troubleshoot issues, secure against fraud and abuse, improve and update our Services, analyze how people use our Services, serve personalized advertising, and as required by law or necessary for safety and integrity. We retain your data for as long as it is needed to serve the purposes for which it was collected. If you have a Edunary account, we will delete your data following account termination, or longer as required by law or necessary for safety and integrity.
                </p>
                <p style={{ lineHeight: '1.8', marginBottom: '1rem' }}>
                  We use the data we collect through your use of the Services to:
                </p>
                <ul style={{ lineHeight: '1.8' }}>
                  <li style={{ marginBottom: '0.8rem' }}>Provide and administer the Services, including to facilitate participation in content, issue completion certificates, display customized content, and facilitate communication with other users (<em>Account Data; Shared Content; Learning Data; System Data; Usage Data; Approximate Geographic Data</em>);</li>
                  <li style={{ marginBottom: '0.8rem' }}>Process payments to instructors and other third parties (<em>Student Payment Data; Instructor Payment Data</em>);</li>
                  <li style={{ marginBottom: '0.8rem' }}>Process your requests and orders for content, products, specific services, information, or features; confirm delivery; detect fraud or abuse; and enforce Edunary policies (<em>Account Data; Learning Data; Student Payment Data; System Data; Usage Data; Communications and Support</em>);</li>
                  <li style={{ marginBottom: '0.8rem' }}>
                    Communicate with you about your account by (<em>Account Data; Shared Content; Learning Data; Promotions, and Surveys; System Data; Communications and Support</em>):
                    <ul style={{ marginTop: '0.5rem' }}>
                      <li style={{ marginBottom: '0.5rem' }}>Responding to your questions and concerns;</li>
                      <li style={{ marginBottom: '0.5rem' }}>Sending you administrative messages and information, including messages from instructors, students, and teaching assistants; notifications about changes to our Service; and updates to our agreements;</li>
                      <li style={{ marginBottom: '0.5rem' }}>Sending you information, such as by email or text messages, about your progress in courses and related content, rewards programs, new services, new features, promotions, newsletters, and other available instructor-created content (which you can opt out of at any time);</li>
                      <li style={{ marginBottom: '0.5rem' }}>Sending push notifications to your wireless device to provide updates and other relevant messages (which you can manage from the "options" or "settings" page of the mobile app);</li>
                    </ul>
                  </li>
                  <li style={{ marginBottom: '0.8rem' }}>Manage your account and account preferences and personalize your experience (<em>Account Data; Learning Data; Student Payment Data; Instructor Payment Data; System Data, Usage Data, Cookie Data</em>);</li>
                  <li style={{ marginBottom: '0.8rem' }}>Facilitate the Services' technical functioning, including troubleshooting and resolving issues, securing the Services, and preventing fraud and abuse (<em>Account Data; Student Payment Data; Instructor Payment Data; Communications and Support; System Data; Approximate Geographic Location</em>);</li>
                  <li style={{ marginBottom: '0.8rem' }}>Verify the identity of instructors (<em>Account Data; Instructor Payment Data</em>);</li>
                  <li style={{ marginBottom: '0.8rem' }}>Solicit feedback from users (<em>Account Data; Communications and Support</em>);</li>
                  <li style={{ marginBottom: '0.8rem' }}>Market products, services, surveys, and promotions (<em>Account Data; Learning Data; Promotions and Surveys; System Data; Usage Data; Approximate Geographic Data; Cookie Data</em>);</li>
                  <li style={{ marginBottom: '0.8rem' }}>Market Subscription Plans to prospective customers (<em>Account Data; Learning Data; Cookie Data</em>);</li>
                  <li style={{ marginBottom: '0.8rem' }}>Learn more about you by linking your data with additional data through third-party data providers and/or analyzing the data with the help of analytics service providers (<em>Account Data; Data About Your Accounts on Other Services; Usage Data; Cookie Data</em>);</li>
                  <li style={{ marginBottom: '0.8rem' }}>Identify unique users across devices (<em>Account Data; System Data; Cookie Data</em>);</li>
                  <li style={{ marginBottom: '0.8rem' }}>Display and tailor advertisements shown in the Services, including across devices (<em>Cookie Data</em>);</li>
                  <li style={{ marginBottom: '0.8rem' }}>Improve our Services and develop new products, services, and features (all data categories), including through the use of AI consistent with the Instructor GenAI Policy (<em>Instructor Shared Content</em>);</li>
                  <li style={{ marginBottom: '0.8rem' }}>Analyze trends and traffic, track purchases, and track usage data (<em>Account Data; Learning Data; Student Payment Data; Communications and Support; System Data; Usage Data; Approximate Geographic Data; Cookie Data</em>);</li>
                </ul>
              </section>

                {/* Section 4 */}
              <section id="section4" style={{ marginBottom: '3rem', scrollMarginTop: '2rem' }}>
                <h2 style={{ color: '#00b190', borderBottom: '2px solid #00b190', paddingBottom: '0.5rem', marginBottom: '1.5rem' }}>
                  4. Who We Share Your Data With
                </h2>
                <p style={{ lineHeight: '1.8', marginBottom: '1rem' }}>
                  We share certain data about you with instructors, other students, companies performing services for us, Edunary affiliates, our business partners, analytics and data enrichment providers, your social media providers, companies helping us run promotions and surveys, and advertising companies who help us promote our Services. We may also share your data as needed for security, legal compliance, or as part of a corporate restructuring. Lastly, we can share data in other ways if it is aggregated or de-identified or if we get your consent.
                </p>
                <p style={{ lineHeight: '1.8', marginBottom: '1rem' }}>
                  We may share your data with third parties under the following circumstances or as otherwise described in this Privacy Policy:
                </p>
                <ul style={{ lineHeight: '1.8' }}>
                  <li style={{ marginBottom: '1rem' }}>
                    <strong>With Your Instructors:</strong> We share data that we have about you (except your email address) with instructors or teaching assistants for content you access or request information about, so they can improve their content for you and other students. This data may include things like your country, browser language, operating system, device settings, the site that brought you to Edunary, and certain activities on Edunary, like enrolled courses and course review. We will not share your email address with instructors or teaching assistants. (<em>Account Data; System Data; Usage Data; Approximate Geographic Data</em>)
                  </li>
                  <li style={{ marginBottom: '1rem' }}>
                    <strong>With Other Students and Instructors:</strong> Depending on your settings, your Shared Content and profile data may be publicly viewable, including to other students and instructors. If you ask a question to an instructor or teaching assistant, your information (including your name) may also be publicly viewable. (<em>Account Data; Profile Data; Shared Content</em>)
                  </li>
                  <li style={{ marginBottom: '1rem' }}>
                    <strong>With Service Providers, Contractors, and Agents:</strong> We share your data with third-party companies who perform services on our behalf, like payment processing, fraud and abuse prevention, data analysis, marketing and advertising services (including retargeted advertising and affiliate marketing), email and hosting services, and customer services and support. These service providers may access your personal data and are required to use it solely as we direct, to provide our requested service. We require service providers to protect data at a level consistent with this Privacy Policy. (<em>All data categories</em>)
                  </li>
                  <li style={{ marginBottom: '1rem' }}>
                    <strong>With Edunary Affiliates:</strong> We may share your data within our corporate family of companies that are related by common ownership or control to enable or support us in providing the Services. (<em>All data categories</em>)
                  </li>
                  <li style={{ marginBottom: '1rem' }}>
                    <strong>With Business Partners:</strong> We have agreements with other websites and platforms to distribute our Services and drive traffic to Edunary. Depending on your location, we may share your data with these trusted partners. (<em>Account Data; Learning Data; Communications and Support; System Data</em>)
                  </li>
                  <li style={{ marginBottom: '1rem' }}>
                    <strong>With Credit-Granting Organizations for Continuing Education:</strong> If you take a course to fulfill a continuing professional education requirement, we may share that information upon request of the organization granting the continuing education credit. (<em>Account Data; Learning Data</em>)
                  </li>
                  <li style={{ marginBottom: '1rem' }}>
                    <strong>With Analytics and Data Enrichment Services:</strong> As part of our use of third-party analytics tools like Google Analytics and data enrichment services like ZoomInfo, we share certain contact information or de-identified data. De-identified data means data where we've removed things like your name and email address and replaced it with a token ID. This allows these providers to provide analytics services or match your data with publicly-available database information (including contact and social information from other sources). We do this to communicate with you in a more effective and customized manner and for marketing purposes. (<em>Account Data; System Data; Usage Data; Cookie Data</em>)
                  </li>
                  <li style={{ marginBottom: '1rem' }}>
                    <strong>To Power Social Media Features:</strong> The social media features in the Services may allow the third-party social media provider to collect things like your IP address and which page of the Services you're visiting, and to set a cookie to enable the feature. Your interactions with these features are governed by the third-party company's privacy policy. (<em>System Data; Usage Data; Cookie Data</em>)
                  </li>
                  <li style={{ marginBottom: '1rem' }}>
                    <strong>To Administer Promotions and Surveys:</strong> We may share your data as necessary to administer, market, or sponsor promotions and surveys you choose to participate in, as required by applicable law (like to provide a winners list or make required filings), or in accordance with the rules of the promotion or survey. (<em>Account Data; Promotions and Surveys</em>)
                  </li>
                  <li style={{ marginBottom: '1rem' }}>
                    <strong>For Advertising:</strong> We may use and share certain Cookie Data with third-party advertisers and networks to show general demographic and preference information among our users. We may also allow advertisers to collect Cookie Data through Data Collection Tools (as detailed in Section 2.1), to use this data to offer you targeted ad delivery to personalize your user experience (through behavioral advertising) and to undertake web analytics. Advertisers may also share with us the data they collect about you. To learn more or opt out from participating ad networks' behavioral advertising, see Section 6.1 (Your Choices About the Use of Your Data) below. Note that if you opt out, you'll continue to be served generic ads. (<em>Cookie Data</em>)
                  </li>
                  <li style={{ marginBottom: '1rem' }}>
                    <strong>Google as a Data Controller:</strong> Google Ads may use cookies to serve ads based on user profiles from visits to our site and/or other sites on the Internet as well as to measure advertising campaign performance. You can opt out at https://adssettings.google.com. (<em>Cookie Data</em>)
                  </li>
                  <li style={{ marginBottom: '1rem' }}>
                    <strong>For Security and Legal Compliance:</strong> We may disclose your data (<em>all data categories</em>) to third parties if we (in our sole discretion) have a good faith belief that the disclosure is:
                    <ul style={{ marginTop: '0.5rem' }}>
                      <li style={{ marginBottom: '0.5rem' }}>Requested as part of a judicial, governmental, or legal inquiry, order, or proceeding;</li>
                      <li style={{ marginBottom: '0.5rem' }}>Reasonably necessary as part of a valid subpoena, warrant, or other legally-valid request;</li>
                      <li style={{ marginBottom: '0.5rem' }}>Reasonably necessary to enforce our Terms of Use, Privacy Policy, and other legal agreements;</li>
                      <li style={{ marginBottom: '0.5rem' }}>Required to detect, prevent, or address fraud, abuse, misuse, potential violations of law (or rule or regulation), or security or technical issues;</li>
                      <li style={{ marginBottom: '0.5rem' }}>Reasonably necessary in our discretion to protect against harm to the rights, property, or safety of Edunary, our users, employees, members of the public, or our Services;</li>
                      <li style={{ marginBottom: '0.5rem' }}>We may also disclose data about you to our auditors and legal advisors in order to assess our disclosure obligations and rights under this Privacy Policy; or</li>
                      <li style={{ marginBottom: '0.5rem' }}>Required or permitted by law.</li>
                    </ul>
                  </li>
                  <li style={{ marginBottom: '1rem' }}>
                    <strong>During a Change in Control:</strong> If Edunary undergoes a business transaction like a merger, acquisition, corporate divestiture, or dissolution (including bankruptcy), or a sale of all or some of its assets, we may share, disclose, or transfer all of your data to the successor organization during such transition or in contemplation of a transition (including during due diligence). (<em>All data categories</em>)
                  </li>
                  <li style={{ marginBottom: '1rem' }}>
                    <strong>After Aggregation/De-identification:</strong> We may disclose or use aggregated or de-identified data for any purpose.
                  </li>
                  <li style={{ marginBottom: '1rem' }}>
                    <strong>With Your Permission:</strong> With your consent, we may share data to third parties outside the scope of this Privacy Policy. (<em>All data categories</em>)
                  </li>
                </ul>
                <p style={{ lineHeight: '1.8', marginTop: '1rem' }}>
                  If you click on any links to third-party sites, the collection, use, and disclosure of your personal data is governed by the third-party's privacy policy.
                </p>
              </section>

              {/* Section 5 */}
              <section id="section5" style={{ marginBottom: '3rem', scrollMarginTop: '2rem' }}>
                <h2 style={{ color: '#00b190', borderBottom: '2px solid #00b190', paddingBottom: '0.5rem', marginBottom: '1.5rem' }}>
                  5. Security
                </h2>
                <p style={{ lineHeight: '1.8', marginBottom: '1rem' }}>
                  We use appropriate security based on the type and sensitivity of data being stored. As with any internet-enabled system, there is always a risk of unauthorized access, so it's important to protect your password and to contact us if you suspect any unauthorized access to your account.
                </p>
                <p style={{ lineHeight: '1.8' }}>
                  Edunary takes appropriate security measures to protect against unauthorized access, alteration, disclosure, or destruction of your personal data that we collect and store. These measures vary based on the type and sensitivity of the data. Unfortunately, however, no system can be 100% secured, so we cannot guarantee that communications between you and Edunary, the Services, or any information provided to us in connection with the data we collect through the Services will be free from unauthorized access by third parties. Your password is an important part of our security system, and it is your responsibility to protect it. You should not share your password with any third party, and if you believe your password or account has been compromised, you should change it immediately and contact our Support Team with any concerns.
                </p>
              </section>
            </div>
          </Col>
        </Row>  
        </Container>
        </div>
    );
};
export default PolicyPage;