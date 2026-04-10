import React from "react";
import { useNavigate } from "react-router-dom";
import { FiArrowLeft } from "react-icons/fi";
import "./PrivacyPolicy.css";

function PrivacyPolicy() {
  const navigate = useNavigate();

  return (
    <div className="privacy-policy-page">
      <button className="back-btn" onClick={() => navigate("/drive")}>
        <FiArrowLeft /> Back to My Drive
      </button>

      <div className="policy-content">
        <h1>Privacy Policy</h1>
        <p className="last-updated">Last Updated: April 10, 2026</p>

        <p>
          My Drive ("we," "our," or "us") is committed to protecting your
          privacy. This Privacy Policy explains how we collect, use, store, and
          safeguard your information when you use our web application.
        </p>

        <p>
          By using My Drive, you agree to the practices described in this
          policy. If you do not agree, please do not use our application.
        </p>

        <h2>1. Data Collection</h2>
        <p>
          We collect only the information necessary to provide our services:
        </p>
        <ul>
          <li>
            <strong>Information You Provide:</strong> When you submit a form, we
            collect your name, email address, phone number, height, weight, and
            any file you upload.
          </li>
          <li>
            <strong>Uploaded Files:</strong> Files you upload are temporarily
            stored on our servers to facilitate processing and optional Google
            Drive upload.
          </li>
          <li>
            <strong>Account Information:</strong> If you authenticate via Google
            OAuth, we receive basic profile information (email address and name)
            necessary to identify your account.
          </li>
          <li>
            <strong>Technical Data:</strong> We may collect standard server
            logs, including IP address and browser information, solely for
            security and operational purposes.
          </li>
        </ul>

        <h2>2. How Data Is Used</h2>
        <p>Your data is used exclusively for the following purposes:</p>
        <ul>
          <li>To process and store your form submissions</li>
          <li>
            To upload files to your Google Drive account (only when you
            explicitly opt in)
          </li>
          <li>
            To manage your account and provide core application functionality
          </li>
          <li>To track your storage usage within the application</li>
          <li>To maintain security and prevent unauthorized access</li>
        </ul>

        <h3>2.1 No Sale or Sharing of Data</h3>
        <div className="highlight-box">
          <p>
            <strong>
              We do not sell, rent, trade, license, or otherwise share your
              personal data — including Google user data — with any third
              parties for any purpose.
            </strong>
          </p>
        </div>
        <p>This includes, but is not limited to:</p>
        <ul>
          <li>We do not sell data to data brokers or information resellers</li>
          <li>
            We do not share data with advertising networks or marketing
            platforms
          </li>
          <li>We do not share data with affiliate companies or subsidiaries</li>
          <li>We do not monetize user data in any form</li>
        </ul>
        <p>
          The only exception is when you explicitly request Google Drive upload
          functionality, in which case we transmit only the specific file you
          uploaded to your own Google Drive account. This is a service you
          request, not a sale or sharing of data.
        </p>

        <h2>3. Google Drive Access & OAuth Token Handling</h2>
        <p>
          If you choose to upload files to Google Drive, we use Google OAuth to
          request access to your Google account. This section explains exactly
          how we handle your Google account data and OAuth tokens.
        </p>

        <h3>3.1 Explicit User Consent</h3>
        <ul>
          <li>
            <strong>Opt-In Only:</strong> Google Drive access is never initiated
            without your explicit action. You must check the "Upload to Google
            Drive" option and complete the Google OAuth authorization flow.
          </li>
          <li>
            <strong>Clear Purpose:</strong> At the time of authorization, you
            are shown exactly what permissions we are requesting and why.
          </li>
          <li>
            <strong>Revocable Anytime:</strong> You may revoke our access at any
            time through your Google Account settings under "Third-party apps
            with account access." Upon revocation, we will no longer be able to
            access your Google Drive.
          </li>
        </ul>

        <h3>3.2 Limited Use of Google User Data</h3>
        <div className="highlight-box">
          <p>
            <strong>
              We use Google user data obtained through Google APIs solely for
              the purpose of uploading your files to your Google Drive account.
            </strong>
          </p>
        </div>
        <p>Specifically, we:</p>
        <ul>
          <li>
            <strong>DO NOT</strong> use Google user data for any purpose other
            than file uploads you explicitly request.
          </li>
          <li>
            <strong>DO NOT</strong> access, read, view, modify, delete, or share
            any files already stored in your Google Drive.
          </li>
          <li>
            <strong>DO NOT</strong> use Google user data to determine
            eligibility for any service, benefit, or pricing.
          </li>
          <li>
            <strong>DO NOT</strong> share, sell, rent, trade, or license Google
            user data to any third party for any purpose, including advertising
            or marketing.
          </li>
          <li>
            <strong>DO NOT</strong> use Google user data to build, improve, or
            train any machine learning models or algorithms.
          </li>
          <li>
            <strong>ONLY</strong> create new files in your Google Drive with the
            specific files you upload through our application.
          </li>
        </ul>

        <h3>3.3 OAuth Token Security</h3>
        <ul>
          <li>
            <strong>Session-Only Storage:</strong> OAuth access tokens and
            refresh tokens are stored only in server memory during the active
            upload session. They are never written to disk or persisted in any
            database.
          </li>
          <li>
            <strong>Immediate Cleanup:</strong> After your file upload completes
            (or fails), the OAuth tokens are immediately discarded and cannot be
            reused.
          </li>
          <li>
            <strong>Server Memory Only:</strong> Tokens are held in an in-memory
            Map data structure that is cleared on server restart and
            inaccessible across sessions.
          </li>
          <li>
            <strong>No Token Sharing:</strong> OAuth tokens are never
            transmitted to any third party, embedded in logs, or exposed in
            client-side code.
          </li>
          <li>
            <strong>Encrypted Transport:</strong> All token exchanges with
            Google's servers occur over HTTPS with TLS encryption.
          </li>
        </ul>

        <h3>3.4 Google Drive API Scope</h3>
        <p>We request the following OAuth scopes:</p>
        <ul>
          <li>
            <code>https://www.googleapis.com/auth/drive.file</code> — View and
            manage Google Drive files that this app has installed or created.
            This scope limits our access to only files created by My Drive, not
            your entire Drive.
          </li>
        </ul>
        <p>
          We do not request broader Drive scopes such as full Drive read/write
          access.
        </p>

        <h3>3.5 Compliance with Google Policies</h3>
        <p>
          Google user data obtained through Google APIs is handled in strict
          accordance with the{" "}
          <a
            href="https://developers.google.com/terms/api-services-user-data-policy"
            target="_blank"
            rel="noopener noreferrer"
          >
            Google API Services User Data Policy
          </a>
          . We undergo regular internal reviews to ensure ongoing compliance
          with all applicable Google policies and requirements.
        </p>

        <h2>4. Data Security</h2>
        <p>
          We implement reasonable technical and organizational measures to
          protect your information:
        </p>
        <ul>
          <li>
            <strong>Temporary Storage:</strong> Uploaded files are stored on our
            servers only temporarily and are processed for deletion once the
            upload is complete or the session ends.
          </li>
          <li>
            <strong>Encrypted Communication:</strong> All data transmitted
            between your browser and our servers is protected via standard
            encryption protocols.
          </li>
          <li>
            <strong>Authentication:</strong> User accounts are secured with
            JWT-based authentication tokens.
          </li>
          <li>
            <strong>MongoDB Storage:</strong> Form data (name, email, file
            references) is stored in MongoDB with standard database security
            practices, including access controls and authentication.
          </li>
        </ul>

        <p>
          While we strive to protect your data, no method of transmission over
          the Internet or electronic storage is 100% secure. We cannot guarantee
          absolute security but follow industry-standard practices to minimize
          risks.
        </p>

        <h2>5. User Rights & Data Control</h2>
        <p>You have the following rights regarding your personal data:</p>
        <ul>
          <li>
            <strong>Access:</strong> You may view your personal data and
            uploaded files within the application interface.
          </li>
          <li>
            <strong>Deletion:</strong> You can permanently delete your uploaded
            files and form submissions through the application's Bin feature.
          </li>
          <li>
            <strong>Revocation of Google Access:</strong> You may revoke Google
            Drive access at any time through your Google Account settings under
            "Third-party apps with account access."
          </li>
          <li>
            <strong>Correction:</strong> You may update your profile information
            through the application settings.
          </li>
          <li>
            <strong>Export:</strong> You may request a copy of your personal
            data by contacting us.
          </li>
        </ul>

        <h3>5.1 Google User Data Deletion</h3>
        <p>
          If you revoke our Google Drive access or delete your account, all
          Google OAuth tokens associated with your account are immediately and
          permanently deleted from our servers. Any pending upload sessions are
          terminated and no Google user data is retained.
        </p>

        <h3>5.2 How to Request Data Deletion</h3>
        <p>
          To request deletion of all your data, including any references to your
          Google account:
        </p>
        <ul>
          <li>
            Use the Bin feature within the application to permanently delete
            your uploaded files
          </li>
          <li>
            Contact us at the email below to request full account and data
            deletion
          </li>
          <li>
            We will process your deletion request within 30 days and confirm
            completion
          </li>
        </ul>

        <p>
          If you wish to exercise any of these rights or have questions about
          your data, please contact us using the information below.
        </p>

        <h2>6. Data Retention</h2>
        <p>
          We retain your data only as long as necessary to provide our services:
        </p>
        <ul>
          <li>
            Form submissions and file references are retained in our database
            until you delete them.
          </li>
          <li>
            Temporarily stored files on our servers are processed for deletion
            once the upload operation is complete.
          </li>
          <li>
            If you delete items via the Bin feature, they are moved to a
            soft-deleted state and can be restored or permanently deleted at
            your discretion.
          </li>
          <li>
            Google Drive uploads are processed immediately and no copies are
            retained on our servers beyond the operational processing period.
          </li>
        </ul>

        <h2>7. Third-Party Services</h2>
        <p>
          Our application integrates with the following third-party services:
        </p>
        <ul>
          <li>
            <strong>Google Drive API:</strong> Used only when you opt in to
            upload files. Google's privacy policy applies to data handled
            through their APIs.{" "}
            <a
              href="https://policies.google.com/privacy"
              target="_blank"
              rel="noopener noreferrer"
            >
              Google Privacy Policy
            </a>
          </li>
          <li>
            <strong>MongoDB:</strong> Used to store form data and user account
            information securely.
          </li>
        </ul>

        <p>
          We are not responsible for the privacy practices of these third-party
          services. We encourage you to review their respective privacy
          policies.
        </p>

        <h2>8. Changes to This Policy</h2>
        <p>
          We may update this Privacy Policy from time to time to reflect changes
          in our practices, technology, legal requirements, or other factors.
          When we make changes, we will update the "Last Updated" date at the
          top of this policy.
        </p>

        <p>
          We encourage you to review this policy periodically to stay informed
          about how we protect your data.
        </p>

        <h2>9. Contact Information</h2>
        <p>
          If you have questions, concerns, or requests regarding this Privacy
          Policy or our data practices, please contact us:
        </p>

        <div className="contact-info">
          <p>
            <strong>My Drive Support</strong>
          </p>
          <p>Email: [your-email@domain.com]</p>
        </div>

        <p className="footer-note">
          By using My Drive, you acknowledge that you have read and understood
          this Privacy Policy.
        </p>
      </div>
    </div>
  );
}

export default PrivacyPolicy;
