# FirstStep – Eclipse Lumina

### மனதின் மொழி புரியும் இடம்
**Where the language of the heart is understood.**

**Understand. Reflect. Connect. Grow.**

FirstStep – Eclipse Lumina is an AI-powered emotional well-being discovery, reflection and support-navigation platform designed to help individuals understand their emotions, reflect on their experiences and discover appropriate next steps.

Our vision is to make emotional well-being support more approachable, personalised and culturally connected.

---

## 1. About the Project

Sometimes, people experience emotional difficulties but struggle to understand what they are feeling, express their thoughts or identify where to seek support.

FirstStep aims to address this gap by providing a guided digital experience that brings together:

- Emotional well-being discovery
- Structured self-reflection
- AI-assisted conversations
- Self-help resources
- Personal reflection journeys
- Support navigation
- Culturally relevant literature-based reflection

FirstStep is designed to complement human support, not replace qualified mental health professionals.

## 2. Key Features

### Sanctuary
A welcoming entry point designed to provide users with a comfortable, non-judgemental starting space for their emotional well-being journey.

### Discovery
A guided experience that helps users explore and express what they are experiencing.

### Well-being Snapshot
A structured self-reflection experience covering four dimensions:

- Stress
- Emotional balance
- Daily functioning
- Social connection

The Snapshot uses structured questions and predefined scoring logic to help users recognise patterns in their reported experiences.

It is not a clinical diagnostic assessment.

### AI Reflection
An AI-assisted conversational experience intended to help users explore their thoughts and reflect on their experiences.

### Next Step
A support-navigation concept designed to help users identify relevant next steps based on their reflections.

### Journal and My Journey
Personal reflection and journey-tracking experiences intended to support continuity over time.

### Self-Help Resource Library
A collection of accessible resources intended to support emotional well-being awareness and self-reflection.

### Literature-to-Reflection
A culturally relevant concept that connects insights from Tamil literature with modern-day reflection prompts and personal experiences.

### Premium
A proposed subscription experience for enhanced features and additional content.

### For Institutions
A proposed institutional offering for colleges, universities and organisations interested in making emotional well-being resources accessible to their communities.

## 3. Technology Stack

The prototype was developed using Google's AI development ecosystem.

| Technology | Purpose |
|---|---|
| Google AI Studio | AI-assisted application development |
| Gemini API | AI-powered conversational reflection |
| Firebase Authentication | User authentication |
| Cloud Firestore | User-related data storage |
| React / TypeScript | Application interface and frontend logic |
| Progressive Web App (PWA) | Mobile-friendly application experience |

*Refer to the source code and configuration files for the exact versions and implementation details.*

## 4. Application Architecture

The application brings together the following components:

1. User interface: Provides the FirstStep experience.
2. Authentication: Supports user sign-in.
3. Database: Stores relevant user profile and application data.
4. AI integration: Uses Gemini for AI-assisted reflection.
5. Application logic: Handles structured Snapshot scoring and user journeys.

The Snapshot scoring logic is separate from AI-generated reflections. Gemini is not intended to calculate or modify the Snapshot score.

## 5. User Data and Privacy

FirstStep is designed with user privacy in mind.

The prototype uses Firebase Authentication and Firestore with user-specific data access controls.

The intended approach includes:

- User-specific data access.
- Authentication-based access.
- Firestore security rules.
- Protection of API credentials.
- Avoiding unnecessary storage of sensitive personal conversations.

The application requires further privacy, security and safety validation before production deployment.

## 6. Installation and Local Development

### Prerequisites

- Node.js
- npm
- Git
- A Firebase project
- Gemini API access for AI-powered features

### Clone the repository

```bash
git clone <YOUR_GITHUB_REPOSITORY_URL>
cd <YOUR_PROJECT_FOLDER>
```

### Install dependencies

```bash
npm install
```

### Configure environment variables

Create a `.env.local` file in the project root.

Add the environment variables required by the application.

Example placeholders:

```env
GEMINI_API_KEY=your_gemini_api_key

VITE_FIREBASE_API_KEY=your_firebase_api_key
VITE_FIREBASE_AUTH_DOMAIN=your_firebase_auth_domain
VITE_FIREBASE_PROJECT_ID=your_firebase_project_id
VITE_FIREBASE_STORAGE_BUCKET=your_firebase_storage_bucket
VITE_FIREBASE_MESSAGING_SENDER_ID=your_sender_id
VITE_FIREBASE_APP_ID=your_firebase_app_id
```

**Important:** These are illustrative variable names. Check the application's actual source code for the exact variable names and configuration requirements. Never expose a Gemini API key in frontend code or commit secrets to GitHub.

### Run the application

```bash
npm run dev
```

Open the local URL displayed in your terminal.

*The commands above assume the repository uses the corresponding npm scripts. Check `package.json` for the actual available scripts.*

## 7. Project Status

**Current stage: Early-stage functional prototype**

The project demonstrates the core product concept and selected user experiences.

| Area | Status |
|---|---|
| Core application interface | Prototype |
| Sanctuary experience | Prototype |
| User authentication | Integrated |
| Firestore user data | Integrated |
| Well-being Snapshot | Prototype |
| Gemini integration | Implemented; further testing required |
| Reflect / Next Step flow | Requires troubleshooting and verification |
| Self-help resources | Prototype |
| Literature-to-Reflection | Concept / further development |
| Premium subscriptions | Proposed |
| Institutional offering | Proposed |
| Production readiness | Not yet established |

Some features may require additional configuration, API access or further development.

## 8. Known Issues and Limitations

- The Reflect / Generate Next Step Card flow has encountered a JSON parsing error when the application receives an HTML response instead of the
