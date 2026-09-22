# 6. Testing

The following test cases were executed on the functional prototype of the **Campus Fix-It Web App** to ensure all core features meet the system requirements.

| Test ID | Test Description (Function) | Expected Result | Actual Result | Status |
| :--- | :--- | :--- | :--- | :--- |
| **TC01** | **User Registration:** Register a new student account using a valid `@mvula.univen.ac.za` email address and a matching student number. | A new account is successfully created in Firebase Auth and the `users` Firestore collection. User is redirected to the Student Dashboard. | Account created successfully; Firestore document generated with role 'student'. Redirected to dashboard. | ✅ Pass |
| **TC02** | **Invalid Registration:** Attempt to register an account with a non-university email address (e.g., `@gmail.com` in the university email field). | System rejects the registration, enforcing the HTML pattern validation for the university email domain. | Form submission is blocked by browser validation; error message displayed. | ✅ Pass |
| **TC03** | **User Login:** Log in using valid student credentials. | User is authenticated securely via Firebase Auth and successfully routed to their specific Student Dashboard based on their role. | Authenticated successfully; redirected to `/student/dashboard.html`. | ✅ Pass |
| **TC04** | **Submit Report:** Submit a new maintenance report filling out all fields (Title, Category, Location, Description). | A new document is created in the `reports` Firestore collection with a status of "Submitted" and linked to the student's ID. | Report appears instantly in the database and on the student's dashboard. | ✅ Pass |
| **TC05** | **Image Upload:** Attach an image file to a maintenance report submission. | The image is successfully uploaded to ImgBB via API, and the returned URL is saved within the report's Firestore document. | Image uploads successfully; URL is saved and image renders on the report details page. | ✅ Pass |
| **TC06** | **Admin Dashboard View:** Log in as an Administrator and view the global dashboard. | The Admin dashboard retrieves and displays all submitted reports across the campus, calculating statistics (Total, New, In Progress, Fixed). | Dashboard loads all reports dynamically; statistics calculate correctly. | ✅ Pass |
| **TC07** | **Assign Worker:** As an Admin, select a specific maintenance worker from the dropdown to assign them to a pending report. | The `reports` document is updated with the `assigned_worker_id`, and the status automatically changes to "Assigned". | Database updates successfully; the assigned worker can now see the task on their specific portal. | ✅ Pass |
| **TC08** | **Update Status & Add Note:** As a Worker, change the status of an assigned report to "In Progress" and leave a comment. | The status is updated in real-time. The comment is appended to the `notes` array in Firestore, creating an update history timeline. | Status changes to "In Progress"; comment appears in the Update History timeline with the worker's name. | ✅ Pass |
| **TC09** | **'Fixed' Email Notification:** As a Worker/Admin, change a report's status to "Fixed". | The Vercel Serverless Function `/api/sendFixedEmail` is triggered, securely dispatching an email to the student via EmailJS. | Status updates to "Fixed"; student receives the customized email notification in their inbox. | ✅ Pass |
| **TC10** | **Secure OTP Request:** Click "Forgot Password", enter email, and request a password reset. | Vercel backend generates a 6-digit OTP, stores it in Firestore with an expiration time, and emails it to the user. | OTP is successfully generated, stored, and emailed. | ✅ Pass |
| **TC11** | **OTP Verification:** Enter the correct 6-digit OTP received via email to set a new password. | The system validates the OTP. If correct and not expired, the user's Firebase Auth password is automatically updated. | OTP verified successfully; password updated; user logs in with the new password. | ✅ Pass |

---

### Testing Summary
The functional prototype was thoroughly tested across all three user roles (Student, Maintenance Worker, Administrator). The integration between the Vanilla JavaScript frontend, the Firebase NoSQL database, and the Vercel serverless backend proved to be highly robust. All core functional requirements were successfully met without critical failures.
 