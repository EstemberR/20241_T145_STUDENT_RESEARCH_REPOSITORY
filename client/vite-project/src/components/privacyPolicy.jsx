// PrivacyPolicy.js
import React, { useState } from 'react';

const PrivacyPolicy = () => {
  const [accepted, setAccepted] = useState(false);

  const handleSubmit = (event) => {
    event.preventDefault();
    if (accepted) {
      // Redirect to the dashboard or perform the necessary action
      window.location.href = '/dashboard'; // Change this to your dashboard URL
    } else {
      alert('You must accept the privacy policy to proceed.');
    }
  };

  return (
    <div>
      <h1>Welcome to Your Dashboard</h1>
      <p>Please accept our privacy policy to proceed.</p>
      <form onSubmit={handleSubmit}>
        <textarea rows="10" cols="50" readOnly>
          Privacy Policy

          Effective Date: [Insert Date]

          1. Introduction
             We value your privacy and are committed to protecting your personal information.

          2. Information We Collect
             We collect personal information that you provide to us when you register, log in, or use our services.

          3. How We Use Your Information
             We use your information to provide and improve our services, communicate with you, and comply with legal obligations.

          4. Sharing Your Information
             We do not sell or rent your personal information to third parties.

          5. Your Rights
             You have the right to access, correct, or delete your personal information.

          6. Changes to This Policy
             We may update this privacy policy from time to time. We will notify you of any changes.

          7. Contact Us
             If you have any questions about this privacy policy, please contact us at [Your Contact Information].
        </textarea>
        <br />
        <input
          type="checkbox"
          id="acceptPolicy"
          checked={accepted}
          onChange={() => setAccepted(!accepted)}
        />
        <label htmlFor="acceptPolicy">I accept the privacy policy</label>
        <br />
        <button type="submit">Proceed to Dashboard</button>
      </form>
    </div>
  );
};

export default PrivacyPolicy;