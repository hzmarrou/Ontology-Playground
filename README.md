# Ontology Playground ☕

An interactive demo application showcasing **Microsoft Fabric IQ Ontology** through the fictional "Cosmic Coffee Company" ontology.

![Microsoft Fabric](https://img.shields.io/badge/Microsoft-Fabric-0078D4?style=flat-square&logo=microsoft)
![React](https://img.shields.io/badge/React-18-61DAFB?style=flat-square&logo=react)
![TypeScript](https://img.shields.io/badge/TypeScript-5-3178C6?style=flat-square&logo=typescript)

## Features

- **Interactive Graph Visualization** - Explore entity types and relationships using Cytoscape.js
- **Quest System** - Gamified learning with 5 progressive quests and achievement badges
- **NL Query Playground** - Demonstrate NL2Ontology natural language queries
- **Data Bindings View** - See how ontology concepts connect to OneLake sources
- **Microsoft Fluent Design** - Dark/light themes with Microsoft branding

## Sample Ontology

The demo includes a complete "Cosmic Coffee Company" ontology with:

| Entity Type | Description |
|-------------|-------------|
| Customer    | Coffee shop customers with loyalty tiers |
| Order       | Purchase transactions |
| Product     | Coffee products with origins |
| Store       | Physical locations |
| Supplier    | Bean and goods suppliers |
| Shipment    | Supply chain deliveries |

## Getting Started

### Prerequisites

- Node.js 18+ 
- npm 9+

### Installation

```bash
cd ontology-quest
npm install
```

### Development

```bash
npm run dev
```

Visit http://localhost:5173

### Production Build

```bash
npm run build
```

Output is in the `dist/` folder.

## Deploy to Azure Static Web Apps

### Option 1: Azure Portal

1. Create a new Static Web App in Azure Portal
2. Connect to your GitHub repository
3. Set build configuration:
   - **App location:** `ontology-quest`
   - **Output location:** `dist`
   - **App build command:** `npm run build`

### Option 2: GitHub Actions

The project includes a workflow at `.github/workflows/azure-static-web-apps.yml`.

1. Create a Static Web App in Azure Portal
2. Copy the deployment token
3. Add it as a GitHub secret: `AZURE_STATIC_WEB_APPS_API_TOKEN`
4. Push to `main` branch to trigger deployment

### Option 3: Azure CLI

```bash
# Install SWA CLI
npm install -g @azure/static-web-apps-cli

# Build
npm run build

# Deploy
swa deploy ./dist --deployment-token <YOUR_TOKEN>
```

## Project Structure

```
ontology-quest/
├── src/
│   ├── components/       # React components
│   │   ├── OntologyGraph.tsx
│   │   ├── InspectorPanel.tsx
│   │   ├── QuestPanel.tsx
│   │   ├── QueryPlayground.tsx
│   │   └── ...
│   ├── data/
│   │   ├── ontology.ts   # Cosmic Coffee ontology model
│   │   └── quests.ts     # Quest definitions & NL responses
│   ├── store/
│   │   └── appStore.ts   # Zustand state management
│   └── styles/
│       └── app.css       # Microsoft Fluent-inspired styles
├── staticwebapp.config.json  # Azure SWA routing config
└── .github/workflows/    # CI/CD workflow
```

## Technologies

- **React 18** + TypeScript
- **Cytoscape.js** - Graph visualization
- **Framer Motion** - Animations
- **Zustand** - State management
- **Lucide Icons** - Icon library
- **Vite** - Build tool

## Learn More

- [Microsoft Fabric IQ Ontology Documentation](https://learn.microsoft.com/en-us/fabric/iq/ontology/overview)
- [Azure Static Web Apps](https://docs.microsoft.com/azure/static-web-apps/)

## License

MIT
