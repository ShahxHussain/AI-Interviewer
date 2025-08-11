---
inclusion: always
---

# AI Interviewer Product Guidelines

## Core Product Concepts

**Dual User Experience**: Always consider both candidate and recruiter perspectives when implementing features. Candidates focus on interview preparation and performance, while recruiters manage job postings and evaluate candidates.

**Interview Personas**: The system supports four distinct AI interviewer types:
- `tech-lead` - Technical interviews with coding/system design focus
- `hr-manager` - Behavioral and cultural fit assessments  
- `product-manager` - Product thinking and strategy interviews
- `recruiter` - General screening and role-specific questions

**Interview Types & Difficulty**: Support three interview categories (technical, behavioral, case-study) with configurable difficulty levels (easy, medium, hard).

## User Flow Patterns

**Candidate Journey**: Resume upload → Interview configuration → AI session → Performance review
**Recruiter Journey**: Job posting creation → Candidate review → Interview management → Analytics dashboard

## Data & Analytics Focus

**Multi-Modal Analysis**: Implement real-time tracking for:
- Facial emotion detection and eye contact metrics
- Voice confidence and speech pattern analysis  
- Response quality and content evaluation

**Performance Metrics**: Always capture and display:
- Confidence scores, engagement levels, response timing
- Comparative analytics against role benchmarks
- Actionable feedback for improvement areas

## File Upload Standards

- Support PDF/DOCX resume formats only
- Maximum file size: 10MB
- Store uploads in `/uploads` directory
- Implement automatic parsing and content extraction

## API Integration Patterns

- **Together AI**: Use for natural language processing, interview question generation, and response analysis
- **Murf AI**: Integrate for voice synthesis of interviewer responses
- Always handle API failures gracefully with fallback options

## Authentication & Security

- JWT-based session management with 7-day expiration
- Role-based access control (candidate vs recruiter)
- Secure file upload validation and storage