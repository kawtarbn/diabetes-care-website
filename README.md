# Diabetes Care Website

A professional-grade diabetes consulting website built with vanilla HTML, CSS, JavaScript, and Node.js. This project includes enterprise-level security features, comprehensive logging, API documentation, and is designed for production deployment.

## 🎯 Project Overview

This website helps diabetic patients manage their health by:
- Connecting with doctors
- Tracking their diet and meals
- Monitoring blood sugar levels
- Booking appointments
- Accessing educational resources

## 🚀 5 Core Features Implemented

1. **User Authentication System**
   - Registration and login for patients and doctors
   - Role-based access control (RBAC)
   - JWT token-based authentication with 24-hour expiration
   - Password hashing with bcrypt (10 salt rounds)
   - Password reset functionality with email
   - Secure session management
   - Account verification support

2. **Patient Health Profile**
   - Store diabetes type (Type 1, Type 2, Gestational, Prediabetes)
   - Blood sugar target levels
   - Medications list
   - Additional health notes

3. **Diet & Meal Tracking**
   - Log meals (breakfast, lunch, dinner, snacks)
   - Track calories and carbohydrates
   - Record blood sugar after meals
   - View meal history

4. **Doctor Appointment Booking**
   - Schedule consultations with doctors
   - Set date and time
   - Provide appointment reason
   - View upcoming appointments

5. **Diabetes Education Hub**
   - Educational content about diabetes
   - Topics: basics, diet, monitoring, exercise, medication
   - Easy-to-understand information

## 📁 Project Structure

```
first_website/
├── package.json          # Project dependencies and scripts
├── server.js             # Backend server (Node.js + Express)
├── data/                 # Database (JSON files, auto-created)
│   ├── users.json
│   ├── patients.json
│   ├── meals.json
│   └── appointments.json
├── public/               # Frontend files
│   ├── index.html        # Main HTML page
│   ├── css/
│   │   └── styles.css    # Styling
│   └── js/
│       └── app.js        # Frontend JavaScript
└── README.md            # This file
```

## 🛠️ Technologies Used

### Frontend (UI/UX)
- **HTML5**: Structure and semantic markup
- **CSS3**: Styling, responsive design, animations
- **JavaScript (Vanilla)**: Interactivity, API calls, DOM manipulation

### Backend
- **Node.js**: JavaScript runtime
- **Express.js**: Web framework for handling HTTP requests
- **bcryptjs**: Password hashing
- **jsonwebtoken**: JWT authentication
- **helmet**: Security headers
- **cors**: Cross-origin resource sharing
- **express-rate-limit**: Rate limiting
- **joi**: Input validation
- **dotenv**: Environment configuration
- **winston**: Professional logging
- **morgan**: HTTP request logging
- **nodemailer**: Email functionality
- **express-sanitizer**: Data sanitization
- **compression**: Response compression
- **xss-clean**: XSS protection
- **hpp**: HTTP parameter pollution protection
- **uuid**: Unique request ID generation
- **swagger-ui-express**: API documentation
- **JSON Files**: Simple database for data storage

## 📋 Prerequisites

Before running this project, you need to install:
- **Node.js** (version 14 or higher): Download from [nodejs.org](https://nodejs.org/)

## 🚀 Setup Instructions

### Step 1: Install Dependencies

Open your terminal/command prompt in the project folder and run:

```bash
npm install
```

This will install:
- `express`: Web framework for the backend
- `body-parser`: Middleware to parse JSON data
- `bcryptjs`: Password hashing
- `jsonwebtoken`: JWT authentication
- `helmet`: Security headers
- `cors`: CORS configuration
- `express-rate-limit`: Rate limiting
- `joi`: Input validation
- `dotenv`: Environment configuration
- `winston`: Professional logging
- `morgan`: HTTP request logging
- `nodemailer`: Email functionality
- `express-sanitizer`: Data sanitization
- `compression`: Response compression
- And more security and utility packages

### Step 2: Configure Environment Variables

Copy the example environment file and configure it:

```bash
copy .env.example .env
```

Edit `.env` and set a secure JWT_SECRET:

```bash
# Generate a secure random string
node -e "console.log(require('crypto').randomBytes(32).toString('hex'))"
```

**IMPORTANT**: Change the JWT_SECRET to the generated random string in production!

### Step 3: Start the Server

```bash
npm start
```

The server will start on `http://localhost:3000`

### Step 4: Open in Browser

Open your web browser and go to:
```
http://localhost:3000
```

## 🎓 Learning Guide

### For Beginners - How to Learn from This Code

#### 1. Understanding the Structure

**Frontend (What users see)**
- `public/index.html` - The structure of the page
- `public/css/styles.css` - How the page looks
- `public/js/app.js` - How the page interacts

**Backend (What happens on the server)**
- `server.js` - Handles requests and manages data
- `data/` folder - Stores all user information

#### 2. How the Website Works

**User Flow:**
1. User registers → Data saved to `users.json`
2. User logs in → Session stored in browser
3. User accesses dashboard → Can use all features
4. User logs out → Session cleared

**Data Flow:**
```
Browser (JavaScript) → API Call → Server (Node.js) → JSON File
```

#### 3. Key Concepts to Learn

**HTML (Structure)**
- Semantic tags: `<nav>`, `<section>`, `<header>`, `<footer>`
- Forms: `<form>`, `<input>`, `<select>`, `<textarea>`
- IDs and Classes for styling and JavaScript selection

**CSS (Styling)**
- Selectors: `.class`, `#id`, `tag`
- Flexbox and Grid for layout
- Responsive design with `@media`
- Colors, spacing, and typography
- Hover effects and transitions

**JavaScript (Interactivity)**
- DOM manipulation: `document.getElementById()`, `querySelector()`
- Event listeners: `addEventListener()`
- API calls: `fetch()` for backend communication
- localStorage for session management
- Form handling and validation

**Node.js/Express (Backend)**
- Routes: `app.get()`, `app.post()`
- Middleware: `bodyParser`, `express.static()`
- File system operations: `fs.readFileSync()`, `fs.writeFileSync()`
- JSON data handling
- HTTP status codes

#### 4. Code Reading Order

Start here:
1. `public/index.html` - Understand the page structure
2. `public/css/styles.css` - See how styling works
3. `public/js/app.js` - Learn frontend logic
4. `server.js` - Understand backend operations

#### 5. Experimenting with the Code

**Try these exercises:**
- Change the color scheme in `styles.css`
- Add a new field to the registration form
- Create a new education topic
- Modify the dashboard layout
- Add validation to forms

## 🔧 API Endpoints

### System
- `GET /health` - Health check endpoint
- `GET /api-docs` - Interactive API documentation (Swagger)

### Authentication
- `POST /api/register` - Register new user
- `POST /api/login` - Login user
- `POST /api/forgot-password` - Request password reset
- `POST /api/reset-password` - Reset password with token

### Patient Profile
- `POST /api/patient-profile` - Save/update profile (requires auth)
- `GET /api/patient-profile/:userId` - Get user profile (requires auth)

### Diet Tracking
- `POST /api/meals` - Log a meal (requires auth)
- `GET /api/meals/:userId` - Get user's meals (requires auth)

### Appointments
- `POST /api/appointments` - Book appointment (requires auth)
- `GET /api/appointments/patient/:patientId` - Get patient appointments (requires auth)
- `GET /api/appointments/doctor/:doctorId` - Get doctor appointments (requires auth)

### Education
- `GET /api/education` - Get educational content (public)

## 🎨 UI/UX Features

- **Responsive Design**: Works on mobile, tablet, and desktop
- **Clean Interface**: Easy to navigate and understand
- **Color Scheme**: Professional healthcare colors (blue, white, gray)
- **Smooth Transitions**: Hover effects and tab switching
- **Form Validation**: Required fields and user feedback
- **Dashboard Layout**: Tabbed interface for easy access

## 🔒 Security Features (Production-Ready)

This project includes comprehensive security features:

### Authentication & Authorization
- **Password Hashing**: All passwords are hashed using bcrypt with 10 salt rounds
- **JWT Tokens**: Secure token-based authentication with 24-hour expiration
- **Role-Based Access Control**: Patients can only access their own data; doctors can access patient data
- **Protected Routes**: All API endpoints (except auth and education) require valid JWT tokens
- **Password Reset**: Secure password reset with time-limited tokens

### Input Validation & Sanitization
- **Joi Validation**: Schema-based validation for all user inputs
- **Password Requirements**: Minimum 8 characters with uppercase, lowercase, numbers, and special characters
- **Email Validation**: Proper email format validation
- **Data Sanitization**: Trimming and validation of all string inputs
- **XSS Protection**: Cross-site scripting prevention
- **HPP Protection**: HTTP parameter pollution prevention
- **express-sanitizer**: Additional data sanitization

### Rate Limiting
- **General API Limit**: 100 requests per 15 minutes per IP
- **Auth Endpoints**: Stricter limit of 5 requests per 15 minutes to prevent brute force attacks
- **Skip Successful Requests**: Successful auth attempts don't count against rate limit

### Security Headers
- **Helmet**: Sets secure HTTP headers (XSS protection, content security policy, etc.)
- **CORS**: Configurable cross-origin resource sharing with allowed methods and headers
- **Content Security Policy**: Configured CSP directives

### Request Security
- **Body Size Limits**: 10kb limit on request bodies
- **Request Timeout**: 30-second timeout on all requests
- **Trust Proxy**: Proper proxy configuration for rate limiting

### Environment Configuration
- **dotenv**: Sensitive configuration stored in environment variables
- **.gitignore**: Prevents committing sensitive data to version control
- **Environment-specific logging**: Different log levels for development vs production

## 🚀 Production Deployment

### Before Deploying

1. **Set strong JWT_SECRET** in your environment variables
2. **Configure ALLOWED_ORIGINS** to your actual domain(s)
3. **Set NODE_ENV=production** in environment
4. **Set up email configuration** for password reset functionality
5. **Use HTTPS** - obtain SSL certificate (Let's Encrypt recommended)
6. **Consider migrating to a real database** (PostgreSQL, MongoDB)
7. **Set up proper logging** and monitoring (logs stored in `logs/` directory)
8. **Configure backup strategy** for data
9. **Review rate limiting settings** for your expected traffic
10. **Set up log rotation** for production logs

### Deployment Options

#### Option 1: VPS (DigitalOcean, Linode, AWS EC2)
```bash
# Install Node.js on your VPS
# Clone your repository
# Install dependencies: npm install --production
# Set up environment variables
# Use PM2 to keep the server running
npm install -g pm2
pm2 start server.js --name diabetes-care
pm2 startup
pm2 save
```

#### Option 2: Vercel (Recommended for Easy Deployment)
```bash
# Install Vercel CLI
npm install -g vercel

# Login to Vercel
vercel login

# Deploy
vercel

# Set environment variables in Vercel dashboard:
# - JWT_SECRET
# - EMAIL_HOST (optional, for password reset)
# - EMAIL_PORT (optional)
# - EMAIL_USER (optional)
# - EMAIL_PASSWORD (optional)
# - EMAIL_FROM (optional)
# - ALLOWED_ORIGINS

# For production deployment
vercel --prod
```

**Vercel Setup Steps:**
1. Push your code to GitHub/GitLab/Bitbucket
2. Go to [vercel.com](https://vercel.com) and import your repository
3. Configure environment variables in project settings
4. Deploy automatically on push to main branch

**Note:** Vercel uses serverless functions. The API is served from `/api/*` routes and static files from `/public`.

#### Option 3: Platform as a Service (Heroku, Railway, Render)
- Connect your Git repository
- Set environment variables in the platform dashboard
- Deploy with automatic builds

#### Option 4: Container (Docker)
```dockerfile
FROM node:18-alpine
WORKDIR /app
COPY package*.json ./
RUN npm install --production
COPY . .
EXPOSE 3000
CMD ["node", "server.js"]
```

### Database Migration (Recommended for Production)

For production, migrate from JSON files to a real database:
- **PostgreSQL** - Robust relational database
- **MongoDB** - Flexible NoSQL database
- **MySQL** - Popular relational database

This will provide:
- Better performance
- Data integrity
- Backup and recovery
- Scalability
- Concurrent access handling

## 🐛 Troubleshooting

**Server won't start:**
- Make sure Node.js is installed: `node --version`
- Check if port 3000 is already in use
- Try a different port in `server.js`

**Data not saving:**
- Check if `data/` folder exists
- Ensure write permissions on the folder
- Check browser console for errors

**Styles not loading:**
- Check file paths in `index.html`
- Clear browser cache
- Check browser console for errors

## 📚 Additional Professional Features

### Logging & Monitoring
- **Winston Logger**: Professional logging with file and console transports
- **Morgan**: HTTP request logging in combined format
- **Request IDs**: Unique request tracking for debugging
- **Error Logging**: Comprehensive error logging with stack traces
- **Log Levels**: Configurable log levels (error, warn, info, debug)
- **Log Files**: Separate error and combined log files in `logs/` directory

### Performance
- **Compression**: Gzip compression for all responses
- **Request Timeout**: 30-second timeout for all requests
- **Body Size Limits**: 10kb limit on request bodies
- **Rate Limiting**: Configurable rate limits per endpoint

### API Documentation
- **Swagger/OpenAPI**: Interactive API documentation at `/api-docs`
- **Auto-generated**: Documentation generated from code comments
- **Test Interface**: Built-in API testing interface

### Developer Experience
- **Environment Configuration**: Comprehensive `.env` configuration
- **Error Handling**: Global error handler with proper status codes
- **404 Handler**: Custom 404 responses
- **Request Sanitization**: Multiple layers of data sanitization

## 📚 Next Steps for Enhancement

To further improve this application:
- **Database Migration**: Move from JSON to PostgreSQL or MongoDB
- **Email Verification**: Add email confirmation for registration
- **Two-Factor Authentication**: Add 2FA for enhanced security
- **Real-time Notifications**: WebSocket integration for appointment reminders
- **File Upload**: Allow users to upload lab results
- **Data Visualization**: Charts for blood sugar trends
- **Mobile App**: React Native or Flutter mobile version
- **Payment Integration**: Stripe for consultation fees
- **Admin Panel**: Dashboard for platform management
- **Automated Testing**: Jest/Mocha test suite
- **CI/CD Pipeline**: GitHub Actions or similar
- **Containerization**: Docker setup for deployment
- **Monitoring**: Sentry or similar error tracking
- **Analytics**: User analytics and usage tracking

## 💡 Tips for Beginners

1. **Read the code slowly** - Don't rush, understand each line
2. **Use browser DevTools** - Press F12 to inspect elements and debug
3. **Console.log everything** - See what's happening in your code
4. **Break things** - Try modifying code and see what happens
5. **Build small features first** - Don't try to do everything at once
6. **Ask questions** - Research online when you're stuck

## 📝 License

This project is open source and available for production use.

## 🤝 Support

If you have questions while learning:
- Read the code comments
- Check browser console for errors
- Research MDN Web Docs for HTML/CSS/JS
- Check Express.js documentation for backend questions

---

**Happy Learning! 🎉**
