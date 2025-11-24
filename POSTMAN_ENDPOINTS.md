# 📋 API Endpoints - Postman Collection

Base URL: `http://localhost:5000` (or your server URL)

---

## 🔐 Authentication

All protected routes require JWT token in header:
```
Authorization: Bearer <TOKEN>
```

---

## 1. 🔑 Authentication Endpoints

### 1.1 Register User
- **Method:** `POST`
- **Path:** `/api/auth/register`
- **Auth:** ❌ None required
- **Body (JSON):**
```json
{
  "name": "John Doe",
  "email": "john@example.com",
  "password": "password123",
  "role": "particulier"
}
```
- **Response:** Returns user data and token

---

### 1.2 Login
- **Method:** `POST`
- **Path:** `/api/auth/login`
- **Auth:** ❌ None required
- **Body (JSON):**
```json
{
  "email": "john@example.com",
  "password": "password123"
}
```
- **Response:** Returns user data and JWT token
- **💡 Save the token for subsequent requests!**

---

## 2. 👤 User Endpoints

### 2.1 Get All Users
- **Method:** `GET`
- **Path:** `/api/users`
- **Auth:** ✅ Required
- **Response:** List of all users

---

### 2.2 Create User (Admin)
- **Method:** `POST`
- **Path:** `/api/users`
- **Auth:** ✅ Required (Admin)
- **Body (JSON):**
```json
{
  "name": "Admin User",
  "email": "admin@example.com",
  "password": "admin123",
  "role": "admin"
}
```

---

## 3. 🔒 KYC Endpoints

### 3.1 Upload ID Document
- **Method:** `POST`
- **Path:** `/api/kyc/upload`
- **Auth:** ✅ Required
- **Content-Type:** `multipart/form-data`
- **Body (form-data):**
  - `idImage`: (file) - Image of national ID card
  - `idNumber`: (text) - National ID number
- **Response:** KYC data saved

---

### 3.2 Get KYC Status
- **Method:** `GET`
- **Path:** `/api/kyc/status`
- **Auth:** ✅ Required
- **Response:** Current KYC status

---

### 3.3 Verify Face
- **Method:** `POST`
- **Path:** `/api/kyc/verify-face`
- **Auth:** ✅ Required
- **Content-Type:** `multipart/form-data`
- **Body (form-data):**
  - `selfie`: (file) - Optional selfie image/video
- **Response:** Face verification result

---

### 3.4 Review KYC (Admin)
- **Method:** `POST`
- **Path:** `/api/kyc/review/:userId`
- **Auth:** ✅ Required (Admin)
- **Params:**
  - `userId`: User ID to review
- **Body (JSON):**
```json
{
  "action": "approve",
  "note": "KYC verified successfully"
}
```
- **Actions:** `"approve"` or `"reject"`

---

### 3.5 List Pending KYC (Admin)
- **Method:** `GET`
- **Path:** `/api/kyc/pending`
- **Auth:** ✅ Required (Admin)
- **Response:** List of pending KYC submissions

---

### 3.6 Get KYC History
- **Method:** `GET`
- **Path:** `/api/kyc/history/:userId`
- **Auth:** ✅ Required (Owner or Admin)
- **Params:**
  - `userId`: User ID
- **Response:** KYC audit history

---

## 4. 👥 Group Endpoints

### 4.1 Create Group
- **Method:** `POST`
- **Path:** `/api/groups`
- **Auth:** ✅ Required (KYC verified)
- **Body (JSON):**
```json
{
  "name": "Summer Savings Group",
  "amount": 1000,
  "maxMembers": 10,
  "round": "month"
}
```
- **Round options:** `"week"`, `"month"`, `"15days"`

---

### 4.2 Get Group Details
- **Method:** `GET`
- **Path:** `/api/groups/:id`
- **Auth:** ✅ Required
- **Params:**
  - `id`: Group ID
- **Response:** Group details with members and turns

---

### 4.3 List All Groups (Admin)
- **Method:** `GET`
- **Path:** `/api/groups`
- **Auth:** ✅ Required (Admin)
- **Response:** List of all groups

---

### 4.4 Invite Members to Group
- **Method:** `POST`
- **Path:** `/api/groups/:id/invite`
- **Auth:** ✅ Required (Group creator)
- **Params:**
  - `id`: Group ID
- **Body (JSON):**
```json
{
  "emails": ["user1@example.com", "user2@example.com"]
}
```
- **💡 Members are automatically sorted by trustScore!**

---

### 4.5 Distribute Funds
- **Method:** `POST`
- **Path:** `/api/groups/:id/distribute`
- **Auth:** ✅ Required (Group creator or Admin)
- **Params:**
  - `id`: Group ID
- **Response:** Payment record for distribution
- **💡 All members must have paid before distribution!**

---

## 5. 💰 Payment & Contribution Endpoints

### 5.1 Create Stripe Payment
- **Method:** `POST`
- **Path:** `/api/contributions`
- **Auth:** ✅ Required (KYC verified)
- **Body (JSON):**
```json
{
  "amount": 1000,
  "currency": "mad"
}
```
- **Response:** `clientSecret` and `paymentId` for Stripe

---

### 5.2 Get User Payment History
- **Method:** `GET`
- **Path:** `/api/contributions/history`
- **Auth:** ✅ Required
- **Response:** User's payment history

---

### 5.3 Get Group Payment History
- **Method:** `GET`
- **Path:** `/api/contributions/group/:groupId/history`
- **Auth:** ✅ Required (Group member)
- **Params:**
  - `groupId`: Group ID
- **Response:** All payments (contributions and distributions) for the group

---

### 5.4 Contribute to Group
- **Method:** `POST`
- **Path:** `/api/contributions/group/:groupId/contribute`
- **Auth:** ✅ Required (Group member)
- **Params:**
  - `groupId`: Group ID
- **Body (JSON):**
```json
{
  "amount": 1000
}
```
- **💡 Amount must match group amount!**

---

### 5.5 Get Group Contributions
- **Method:** `GET`
- **Path:** `/api/contributions/group/:groupId`
- **Auth:** ✅ Required
- **Params:**
  - `groupId`: Group ID
- **Response:** All contributions for the group

---

## 6. 💬 Message Endpoints

### 6.1 Send Message to Group (Text)
- **Method:** `POST`
- **Path:** `/api/messages/group/:groupId`
- **Auth:** ✅ Required (Group member)
- **Params:**
  - `groupId`: Group ID
- **Body (JSON):**
```json
{
  "content": "Hello everyone!",
  "messageType": "text"
}
```

---

### 6.2 Send Message to Group (Audio)
- **Method:** `POST`
- **Path:** `/api/messages/group/:groupId`
- **Auth:** ✅ Required (Group member)
- **Content-Type:** `multipart/form-data`
- **Params:**
  - `groupId`: Group ID
- **Body (form-data):**
  - `audio`: (file) - Audio file
  - `messageType`: (text) - `"audio"`
- **Response:** Created message with encrypted audio path

---

### 6.3 Get Group Messages
- **Method:** `GET`
- **Path:** `/api/messages/group/:groupId`
- **Auth:** ✅ Required (Group member)
- **Params:**
  - `groupId`: Group ID
- **Query Params (optional):**
  - `limit`: (number) - Default: 50
  - `offset`: (number) - Default: 0
- **Response:** List of messages (newest first, then reversed)

---

## 7. 🎫 Ticket Endpoints

### 7.1 Create Ticket
- **Method:** `POST`
- **Path:** `/api/tickets`
- **Auth:** ✅ Required
- **Body (JSON):**
```json
{
  "subject": "Payment issue",
  "description": "I'm having trouble making a payment",
  "groupId": "optional_group_id_here"
}
```

---

### 7.2 Get User Tickets
- **Method:** `GET`
- **Path:** `/api/tickets`
- **Auth:** ✅ Required
- **Response:** List of user's tickets

---

### 7.3 Get Ticket Details
- **Method:** `GET`
- **Path:** `/api/tickets/:ticketId`
- **Auth:** ✅ Required (Owner or Admin)
- **Params:**
  - `ticketId`: Ticket ID
- **Response:** Ticket details with admin response if any

---

### 7.4 List All Tickets (Admin)
- **Method:** `GET`
- **Path:** `/api/tickets/admin`
- **Auth:** ✅ Required (Admin)
- **Query Params (optional):**
  - `status`: (string) - Filter by status: `"open"`, `"in_progress"`, `"resolved"`, `"closed"`
- **Response:** List of all tickets

---

### 7.5 Respond to Ticket (Admin)
- **Method:** `PATCH`
- **Path:** `/api/tickets/:ticketId/respond`
- **Auth:** ✅ Required (Admin)
- **Params:**
  - `ticketId`: Ticket ID
- **Body (JSON):**
```json
{
  "adminResponse": "We've fixed the issue. Please try again.",
  "status": "resolved"
}
```
- **Status options:** `"open"`, `"in_progress"`, `"resolved"`, `"closed"`

---

## 8. 🔔 Notification Endpoints

### 8.1 Get User Notifications
- **Method:** `GET`
- **Path:** `/api/notifications`
- **Auth:** ✅ Required
- **Response:** List of user's notifications

---

### 8.2 Mark Notification as Read
- **Method:** `PATCH`
- **Path:** `/api/notifications/:id/read`
- **Auth:** ✅ Required
- **Params:**
  - `id`: Notification ID
- **Response:** Success confirmation

---

## 9. 👨‍💼 Admin Endpoints

### 9.1 Send Message to User
- **Method:** `POST`
- **Path:** `/api/admin/users/:userId/message`
- **Auth:** ✅ Required (Admin)
- **Params:**
  - `userId`: User ID
- **Body (JSON):**
```json
{
  "message": "Please verify your account details"
}
```

---

### 9.2 Send Message to Group
- **Method:** `POST`
- **Path:** `/api/admin/groups/:groupId/message`
- **Auth:** ✅ Required (Admin)
- **Params:**
  - `groupId`: Group ID
- **Body (JSON):**
```json
{
  "message": "Important announcement for your group"
}
```
- **💡 Sends notification to all group members!**

---

### 9.3 Get All Users (Admin)
- **Method:** `GET`
- **Path:** `/api/admin/users`
- **Auth:** ✅ Required (Admin)
- **Response:** List of all users with stats

---

### 9.4 Get User Statistics (Admin)
- **Method:** `GET`
- **Path:** `/api/admin/users/:userId/stats`
- **Auth:** ✅ Required (Admin)
- **Params:**
  - `userId`: User ID
- **Response:** Detailed user statistics (groups, tickets, payments, etc.)

---

## 10. 🏥 Health Check

### 10.1 Health Check
- **Method:** `GET`
- **Path:** `/health`
- **Auth:** ❌ None required
- **Response:** `{ "status": "ok" }`

---

## 📝 Testing Workflow Example

1. **Register a user:**
   ```
   POST /api/auth/register
   ```

2. **Login to get token:**
   ```
   POST /api/auth/login
   → Save the token!
   ```

3. **Upload KYC documents:**
   ```
   POST /api/kyc/upload (multipart/form-data)
   POST /api/kyc/verify-face (multipart/form-data)
   ```

4. **Admin approves KYC:**
   ```
   POST /api/kyc/review/:userId (as admin)
   ```

5. **Create a group:**
   ```
   POST /api/groups
   ```

6. **Invite members:**
   ```
   POST /api/groups/:id/invite
   ```

7. **Members contribute:**
   ```
   POST /api/contributions/group/:groupId/contribute
   ```

8. **Distribute funds:**
   ```
   POST /api/groups/:id/distribute
   ```

9. **Send messages in group:**
   ```
   POST /api/messages/group/:groupId
   ```

10. **Create a ticket if needed:**
    ```
    POST /api/tickets
    ```

---

## 🔑 Important Notes

- **JWT Token:** Save the token from login and use it in all protected routes
- **KYC Required:** Creating groups and making payments require KYC verification
- **Trust Score:** Affects turn order - higher score = earlier turn
- **Late Payments:** Automatic penalty of -2 trustScore points
- **File Uploads:** Use `multipart/form-data` for images and audio files
- **Admin Role:** Some endpoints require admin role

---

## 🎯 Response Format

All responses follow this format:
```json
{
  "success": true/false,
  "message": "Optional message",
  "data": {...}
}
```

Error responses:
```json
{
  "success": false,
  "message": "Error description"
}
```

