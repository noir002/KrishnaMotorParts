# Contributing to Krishna Motor Parts

Thank you for your interest in contributing to Krishna Motor Parts! This document provides guidelines and information for contributors.

## 🤝 How to Contribute

### Reporting Issues
- Use the GitHub issue tracker to report bugs
- Provide detailed information about the issue
- Include steps to reproduce the problem
- Mention your environment (OS, Node.js version, etc.)

### Suggesting Features
- Open an issue with the "feature request" label
- Describe the feature and its benefits
- Provide use cases and examples

### Code Contributions

#### Prerequisites
- Node.js 18.0.0 or higher
- npm 8.0.0 or higher
- Git knowledge
- MongoDB (local or Atlas)

#### Development Setup
1. Fork the repository
2. Clone your fork:
   ```bash
   git clone https://github.com/your-username/KrishnaMotorParts.git
   ```
3. Install dependencies:
   ```bash
   # Backend
   cd server && npm install
   
   # Frontend
   cd ../client && npm install
   ```
4. Set up environment variables (see README.md)
5. Start development servers:
   ```bash
   # Backend (terminal 1)
   cd server && npm run dev
   
   # Frontend (terminal 2)
   cd client && npm run dev
   ```

#### Making Changes
1. Create a feature branch:
   ```bash
   git checkout -b feature/your-feature-name
   ```
2. Make your changes
3. Follow the coding standards (see below)
4. Add tests for new features
5. Ensure all tests pass:
   ```bash
   # Backend tests
   cd server && npm test
   
   # Frontend tests
   cd client && npm test
   ```
6. Commit your changes:
   ```bash
   git commit -m "Add: your feature description"
   ```
7. Push to your fork:
   ```bash
   git push origin feature/your-feature-name
   ```
8. Open a Pull Request

## 📝 Coding Standards

### General Guidelines
- Write clean, readable, and maintainable code
- Follow existing code patterns and conventions
- Use meaningful variable and function names
- Add comments for complex logic
- Keep functions small and focused

### JavaScript/Node.js (Backend)
- Use ES6+ features where appropriate
- Follow async/await pattern for asynchronous operations
- Use proper error handling with try/catch blocks
- Validate all inputs using Joi or express-validator
- Write unit tests for new functions
- Use meaningful HTTP status codes

### React (Frontend)
- Use functional components with hooks
- Follow React best practices
- Use proper state management
- Implement error boundaries where needed
- Write component tests
- Use semantic HTML elements

### Database
- Use proper MongoDB schema design
- Add appropriate indexes for performance
- Use Mongoose middleware for data validation
- Follow data normalization principles

## 🧪 Testing Guidelines

### Backend Testing
- Write unit tests for all new functions
- Use Jest and Supertest for API testing
- Test both success and error scenarios
- Maintain test coverage above 80%
- Use property-based testing for complex logic

### Frontend Testing
- Write component tests using Jest
- Test user interactions and edge cases
- Mock external dependencies
- Test responsive design on different screen sizes

## 📚 Documentation

### Code Documentation
- Add JSDoc comments for functions and classes
- Document API endpoints with examples
- Update README.md for new features
- Include inline comments for complex logic

### API Documentation
- Document all endpoints with request/response examples
- Include authentication requirements
- Specify error responses and status codes
- Update Postman collection if available

## 🔍 Code Review Process

### Pull Request Guidelines
- Provide a clear description of changes
- Reference related issues
- Include screenshots for UI changes
- Ensure CI/CD checks pass
- Request review from maintainers

### Review Criteria
- Code quality and readability
- Test coverage and quality
- Performance implications
- Security considerations
- Documentation updates

## 🚀 Release Process

### Version Numbering
- Follow Semantic Versioning (SemVer)
- Major: Breaking changes
- Minor: New features (backward compatible)
- Patch: Bug fixes

### Release Steps
1. Update version numbers
2. Update CHANGELOG.md
3. Create release branch
4. Test thoroughly
5. Merge to main
6. Tag release
7. Deploy to production

## 🛡️ Security

### Reporting Security Issues
- Do not open public issues for security vulnerabilities
- Email security concerns to: krishnamotorparts1993@gmail.com
- Provide detailed information about the vulnerability
- Allow time for investigation and fix

### Security Best Practices
- Never commit sensitive information (passwords, keys)
- Use environment variables for configuration
- Validate and sanitize all inputs
- Follow OWASP security guidelines
- Keep dependencies updated

## 📞 Getting Help

### Communication Channels
- GitHub Issues: Bug reports and feature requests
- Email: krishnamotorparts1993@gmail.com
- Developer: chauhanparas7500@gmail.com

### Resources
- Project README.md
- API Documentation
- Code examples in the repository
- Integration guide

## 🏆 Recognition

Contributors will be recognized in:
- README.md contributors section
- Release notes
- Project documentation

## 📄 License

By contributing to Krishna Motor Parts, you agree that your contributions will be licensed under the ISC License.

---

Thank you for contributing to Krishna Motor Parts! 🚗✨