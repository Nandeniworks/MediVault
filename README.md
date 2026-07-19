# 🛡️ MediVault

### *"Your Lifetime Medical History. One Secure Vault."*

MediVault is a next-generation, patient-controlled, highly secure digital vault designed to aggregate, encrypt, and share your lifetime medical history. Built to replace fragmented, fragile, and siloed health records, MediVault gives individuals complete ownership over their health records while streamlining authorized provider access.

---

## 📌 Table of Contents
- [Problem Statement](#-problem-statement)
- [Solution](#-solution)
- [Core Features](#-core-features)
  - [AI Features](#ai-features)
  - [Patient Workspace](#patient-workspace)
  - [Doctor Workspace](#doctor-workspace)
- [Tech Stack](#%EF%B8%8F-tech-stack)
- [Folder Structure](#-folder-structure)
- [Installation Guide](#%EF%B8%8F-installation-guide)
- [Screenshots & Demo](#-screenshots--demo)
- [Future Scope](#-future-scope)
- [Deployment Instructions](#%EF%B8%8F-deployment-instructions)
- [Contributors](#-contributors)
- [License](#-license)

---

## ❓ Problem Statement
Modern healthcare suffers from fragmented medical records. A patient’s history is scattered across different hospitals, primary care clinics, labs, and pharmacies. 
- **Fragmented Data**: Patients cannot access their full medical history in one unified interface.
- **Security & Privacy Risks**: Centralized hospital servers are high-value targets for cyberattacks, and patient consent is rarely enforced programmatically.
- **Inefficient Sharing**: Passing reports to a new doctor often requires printing, scanning, or repeating diagnostic tests, leading to massive financial waste and delayed care.

---

## 💡 Solution
**MediVault** addresses these limitations by placing the patient at the absolute center of their healthcare ecosystem:
- **Unified Medical Vault**: A single digital space to aggregate reports, allergy profiles, medications, and test histories.
- **Granular Consent Controls**: Patients explicitly approve or revoke time-bound access requests from doctors before records are decrypted.
- **Digital Health Card**: Every patient receives a unique Digital Health ID and card for instant authorization.

---

## 🚀 Core Features

### 🧠 AI Features
- **Smart Report Analyzer**: Automatically extract key metrics from uploaded lab reports, translate medical jargon into plain English, and flag out-of-range biomarkers.
- **Health Assistant**: Provides conversational summaries of historical records, suggesting patterns or highlights for patient review.

### 👤 Patient Workspace
- **Personal Profile**: Manage vital metrics, emergency contacts, and personal health declarations.
- **Medical Passport**: A travel-ready, quickly exportable compilation of vaccines, active issues, allergies, and medications.
- **Consent Manager**: Real-time request feed where patients can view, approve, or reject access requests from registered doctors.
- **Vault & Records**: Chronological view of uploaded health files categorized by type (Lab Report, Prescription, Imaging, vaccine proof) with instant filtering.

### 🩺 Doctor Workspace
- **Doctor Onboarding**: Registered doctors complete details including license ID, specialization, and hospital affiliation.
- **Search Vaults**: Query and request access to a patient's vault using their unique Digital Health ID.
- **Interactive Review**: View approved patient records, prescription timelines, analytics, and test histories inside a unified timeline.

---

## 🛠️ Tech Stack
- **Frontend Core**: React 19, TypeScript, Vite
- **Styling**: Vanilla CSS (Custom design system, sleek dark mode, fluid micro-animations, premium glassmorphism layout)
- **Icons**: Lucide React
- **Storage & State**: React Context API, LocalStorage (Mocked persistent backend database API simulating security boundaries)

---

## 📁 Folder Structure

```text
MediVault/
├── public/                 # Static assets
├── src/
│   ├── assets/             # Images and styles
│   ├── components/         # Reusable React components
│   │   ├── common/         # Buttons, Modals, Badges, Input fields
│   │   ├── doctor/         # Doctor dashboard elements
│   │   ├── landing/        # Hero, Audiences, HowItWorks, ConsentFlow sections
│   │   └── patient/        # Vaults, HealthCard, Records, Profile
│   ├── context/            # Auth & Routing state provider (RouterContext.tsx)
│   ├── pages/              # Onboarding, Workspace, Landing, and Auth pages
│   ├── services/           # Data services (Auth, Patient, Vault, Consent)
│   ├── App.tsx             # Main entry point & routing switch
│   └── main.tsx            # React DOM mounting
├── package.json            # Configuration and dependencies
├── tsconfig.json           # TypeScript configuration
└── vite.config.ts          # Vite configuration
```

---

## ⚡️ Installation Guide

Follow these steps to run MediVault locally:

1. **Clone the repository**:
   ```bash
   git clone https://github.com/Nandeniworks/MediVault.git
   cd MediVault
   ```

2. **Install dependencies**:
   ```bash
   npm install
   ```

3. **Start the development server**:
   ```bash
   npm run dev
   ```

4. **Open in browser**:
   Navigate to `http://localhost:5173`.

---

## 📸 Screenshots & Demo

### Screenshots
*Place workspace screenshots here after deployment (e.g. Patient Vault, Doctor Workspace, Consent Request).*

### Demo
*Interactive demo link will be available at standard hosting providers.*

---

## 🔮 Future Scope
- **Blockchain Verification**: Leverage decentralized ledger technology to seal health records, ensuring tamper-proof logs of consent.
- **Biometric Authentication**: FaceID and fingerprint credentials for quick consent approvals directly from mobile devices.
- **Wearable Integration**: Stream real-time vitals (heart rate, blood glucose, sleep metrics) from Apple HealthKit and Fitbit.

---

## 📦 Deployment Instructions

### Production Build
To build the project for production, run:
```bash
npm run build
```
This outputs compiled, optimized assets to the `dist/` directory, which can be deployed to Vercel, Netlify, Firebase Hosting, or GitHub Pages.

---

## 👥 Contributors
- **Nandeniworks** (Project Creator & Developer)

---

## 📄 License
This project is licensed under the MIT License.
