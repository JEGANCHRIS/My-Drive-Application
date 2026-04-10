import React from "react";
import { useNavigate } from "react-router-dom";
import { FiArrowLeft } from "react-icons/fi";
import "./TermsOfService.css";

function TermsOfService() {
  const navigate = useNavigate();

  return (
    <div className="terms-of-service-page">
      <button className="back-btn" onClick={() => navigate("/drive")}>
        <FiArrowLeft /> Back to My Drive
      </button>

      <div className="policy-content">
        <h1>Terms of Service</h1>
        <p className="last-updated">Last Updated: April 10, 2026</p>

        <p>
          Welcome to My Drive. By accessing or using our web application, you
          agree to be bound by these Terms of Service ("Terms"). If you do not
          agree to these Terms, please do not use the application.
        </p>

        <h2>1. Acceptance of Terms</h2>
        <p>
          By creating an account, submitting forms, uploading files, or
          otherwise using My Drive ("the Service"), you acknowledge that you
          have read, understood, and agree to be bound by these Terms. These
          Terms constitute a legally binding agreement between you and My Drive.
        </p>
        <p>
          We reserve the right to modify these Terms at any time. Continued use
          of the Service after changes constitutes acceptance of the updated
          Terms.
        </p>

        <h2>2. Description of Service</h2>
        <p>My Drive provides the following services:</p>
        <ul>
          <li>
            Form submission with personal information (name, email, phone,
            height, weight)
          </li>
          <li>File upload and temporary storage on our servers</li>
          <li>
            Optional integration with Google Drive to upload files to your
            Google account
          </li>
          <li>File management, preview, and organization features</li>
          <li>User account management and storage tracking</li>
        </ul>
        <p>
          The Service is provided solely for personal and organizational use.
          Commercial resale or redistribution of the Service is prohibited
          without explicit written consent.
        </p>

        <h2>3. User Responsibilities</h2>
        <p>As a user of My Drive, you are solely responsible for:</p>
        <ul>
          <li>
            <strong>Account Security:</strong> Maintaining the confidentiality
            of your account credentials and all activities that occur under your
            account.
          </li>
          <li>
            <strong>Content Accuracy:</strong> Ensuring that all information
            provided in form submissions is accurate and truthful.
          </li>
          <li>
            <strong>Uploaded Content:</strong> All files and data you upload to
            the Service. You must have the legal right to upload such content.
          </li>
          <li>
            <strong>Compliance with Laws:</strong> Complying with all applicable
            local, state, national, and international laws and regulations when
            using the Service.
          </li>
        </ul>

        <h2>4. Prohibited Activities</h2>
        <p>
          You agree not to use the Service to upload, store, or distribute
          content that:
        </p>
        <ul>
          <li>Is illegal, fraudulent, defamatory, or harmful to others</li>
          <li>Infringes on the intellectual property rights of others</li>
          <li>Contains malware, viruses, or other malicious code</li>
          <li>
            Violates the privacy or publicity rights of any individual or entity
          </li>
          <li>
            Contains sensitive personal data of third parties without their
            explicit consent
          </li>
          <li>Is obscene, offensive, or promotes hate or violence</li>
        </ul>
        <p>
          We reserve the right to remove any content that violates these Terms
          and to suspend or terminate accounts that engage in prohibited
          activities, without prior notice.
        </p>

        <h2>5. File Upload Policy</h2>
        <p>
          My Drive allows users to upload files through form submissions and
          direct uploads. By using these features, you agree to the following:
        </p>

        <h3>5.1 Storage and Retention</h3>
        <ul>
          <li>
            Uploaded files are temporarily stored on our servers for processing
            and service delivery.
          </li>
          <li>
            Files remain stored until you delete them via the application's Bin
            feature or permanently remove them.
          </li>
          <li>
            We do not guarantee indefinite retention of uploaded files. You are
            responsible for maintaining your own backups of important files.
          </li>
        </ul>

        <h3>5.2 Google Drive Integration</h3>
        <ul>
          <li>
            Google Drive upload is an optional feature that requires explicit
            user consent through Google OAuth authentication.
          </li>
          <li>
            When you choose to upload files to Google Drive, you authorize My
            Drive to access your Google Drive account solely for the purpose of
            uploading files on your behalf.
          </li>
          <li>
            My Drive does not access, read, modify, or share any existing files
            in your Google Drive.
          </li>
          <li>
            Google's Terms of Service and Privacy Policy apply to content stored
            in your Google Drive account.
          </li>
        </ul>

        <h3>5.3 File Size and Format Limitations</h3>
        <ul>
          <li>Maximum file size per upload is limited to 500 MB.</li>
          <li>
            We reserve the right to modify size limits and supported file
            formats at our discretion.
          </li>
          <li>
            My Drive is not liable for any data loss resulting from file format
            incompatibilities or upload failures.
          </li>
        </ul>

        <h2>6. Intellectual Property</h2>
        <p>
          You retain all rights to the content you upload to My Drive. However,
          by uploading content, you grant us a limited, non-exclusive,
          royalty-free license to store, process, and display your content
          solely for the purpose of providing the Service.
        </p>
        <p>
          The My Drive application, including its design, code, graphics, and
          functionality, is the exclusive property of My Drive and is protected
          by intellectual property laws.
        </p>

        <h2>7. Limitation of Liability</h2>
        <div className="highlight-box">
          <p>
            <strong>
              THE SERVICE IS PROVIDED "AS IS" AND "AS AVAILABLE" WITHOUT
              WARRANTIES OF ANY KIND.
            </strong>
          </p>
        </div>
        <p>To the maximum extent permitted by law:</p>
        <ul>
          <li>
            My Drive does not guarantee that the Service will be uninterrupted,
            error-free, or secure.
          </li>
          <li>
            We are not liable for any data loss, corruption, or unauthorized
            access to your uploaded content.
          </li>
          <li>
            We shall not be liable for any indirect, incidental, special,
            consequential, or punitive damages arising from your use of the
            Service.
          </li>
          <li>
            Our total liability shall not exceed the amount you have paid (if
            any) to use the Service.
          </li>
          <li>
            You are solely responsible for maintaining backups of your uploaded
            files and data.
          </li>
        </ul>
        <p>
          We do not warrant that the Service will meet your specific
          requirements or that any defects will be corrected.
        </p>

        <h2>8. Service Availability</h2>
        <p>
          My Drive strives to provide reliable service, but we do not guarantee
          uninterrupted or error-free operation. We may:
        </p>
        <ul>
          <li>
            Suspend or terminate access to the Service for maintenance,
            upgrades, or emergency repairs
          </li>
          <li>Modify or discontinue features with or without notice</li>
          <li>
            Impose storage limits or usage restrictions to ensure fair access
            for all users
          </li>
        </ul>
        <p>
          We will make reasonable efforts to notify users of planned maintenance
          or service interruptions when possible.
        </p>

        <h2>9. Third-Party Services</h2>
        <p>
          My Drive integrates with third-party services, including but not
          limited to:
        </p>
        <ul>
          <li>
            <strong>Google Drive API:</strong> Used for optional file uploads to
            your Google Drive account. Google's Terms of Service and Privacy
            Policy apply.
          </li>
          <li>
            <strong>MongoDB:</strong> Used for storing form data and user
            account information.
          </li>
        </ul>
        <p>
          We are not responsible for the availability, content, or privacy
          practices of these third-party services. Use of third-party services
          is at your own risk.
        </p>

        <h2>10. Account Termination</h2>
        <p>
          We reserve the right to suspend or terminate your access to the
          Service:
        </p>
        <ul>
          <li>
            If you violate any provision of these Terms or our Privacy Policy
          </li>
          <li>Upon request by law enforcement or government agencies</li>
          <li>If we suspect fraudulent or abusive behavior</li>
          <li>At our sole discretion, with or without cause</li>
        </ul>
        <p>
          Upon termination, your right to use the Service will cease
          immediately. We may delete your data and files within a reasonable
          time frame after termination.
        </p>

        <h2>11. Indemnification</h2>
        <p>
          You agree to indemnify, defend, and hold harmless My Drive and its
          officers, directors, employees, and agents from any claims,
          liabilities, damages, losses, and expenses (including reasonable
          attorneys' fees) arising out of or related to:
        </p>
        <ul>
          <li>Your use of the Service</li>
          <li>Content you upload or submit</li>
          <li>Your violation of these Terms or any applicable laws</li>
          <li>Your violation of any third-party rights</li>
        </ul>

        <h2>12. Changes to Terms</h2>
        <p>
          We reserve the right to modify or replace these Terms at any time. If
          a revision is material, we will provide at least 30 days' notice prior
          to the new terms taking effect. What constitutes a material change is
          determined at our sole discretion.
        </p>
        <p>
          By continuing to access or use our Service after any revisions become
          effective, you agree to be bound by the revised terms. If you do not
          agree to the new terms, you must stop using the Service.
        </p>
        <p>
          The "Last Updated" date at the top of this page indicates when these
          Terms were last revised.
        </p>

        <h2>13. Governing Law</h2>
        <p>
          These Terms shall be governed by and construed in accordance with the
          laws of the jurisdiction in which My Drive operates, without regard to
          conflict of law principles.
        </p>
        <p>
          Any disputes arising from these Terms or your use of the Service shall
          be resolved through good-faith negotiation or, if necessary, in the
          appropriate courts of that jurisdiction.
        </p>

        <h2>14. Contact Information</h2>
        <p>
          If you have any questions about these Terms of Service, please contact
          us:
        </p>

        <div className="contact-info">
          <p>
            <strong>My Drive Support</strong>
          </p>
          <p>Email: [your-email@domain.com]</p>
        </div>

        <p className="footer-note">
          By using My Drive, you acknowledge that you have read, understood, and
          agree to be bound by these Terms of Service.
        </p>
      </div>
    </div>
  );
}

export default TermsOfService;
