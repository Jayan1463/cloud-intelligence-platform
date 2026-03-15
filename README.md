# Cloud Intelligence Platform

A cloud infrastructure monitoring and analytics platform built with Next.js, Firebase, and real-time visualization.

## Features

- Real-time infrastructure metrics monitoring
- AI-based cloud cost prediction
- Infrastructure topology visualization
- 3D server network with animated data packets
- Anomaly detection for CPU and memory spikes
- Authentication system
- Interactive analytics dashboard

## Tech Stack

Frontend
- Next.js
- React
- TailwindCSS

Visualization
- Three.js
- React Three Fiber
- Recharts

Backend
- Firebase Firestore
- Firebase Authentication

Deployment
- Vercel

## Email Development Mode

You can build and test invite/notification flows without a custom sending domain.

- Set `EMAIL_DELIVERY_MODE=log` to simulate email delivery.
- In this mode, the app logs the email payload and returns a mock message id.
- When ready for production, set `RESEND_API_KEY` and optionally `ALERT_FROM_EMAIL`, then remove `EMAIL_DELIVERY_MODE=log`.

## Live Demo

https://cloud-intelligence-platform-sigma.vercel.app/login

## Screenshots

Dashboard, infrastructure topology, and analytics views.

## Future Improvements

- Kubernetes cluster monitoring
- Real cloud provider pricing APIs
- AI anomaly prediction
- Multi-user team dashboards
