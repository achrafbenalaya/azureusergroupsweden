# Azure User Group Sweden - Static Website

This repository contains a responsive, Azure-ready static website for the Azure User Group Sweden community. The project delivers four public-facing pages (Home, About, Events, Contact) along with an admin-friendly events list stored in JSON so new sessions can be published without touching the HTML.

## Project Structure

```
.
├── index.html
├── about.html
├── events.html
├── contact.html
├── assets
│   ├── css
│   │   └── style.css
│   ├── js
│   │   └── main.js
│   └── images
│       ├── azure-grid.svg
│       ├── event-local.svg
│       └── event-online.svg
├── data
│   └── events.json
└── README.md
```

## Branding and Design Notes

- Color palette: `#0078D4` to `#005A9E` gradient, `#0CAFFF`, `#002B45`, `#F2C200`.
- Typography: Segoe UI via Google Fonts (falls back to system sans-serif).
- Components: Rounded cards, soft shadows, gradient hero, and consistent navigation.
- Responsive: Optimized for desktop and mobile, includes collapsible navigation and back-to-top control.

## Updating Events

Events are stored in `data/events.json`. Each object supports:

```json
[
  {
    "title": "Intro to Azure AI",
    "date": "2025-03-10",
    "time": "17:00 CET",
    "type": "Online",
    "image": "/assets/images/event-online.svg",
    "location": "",
    "registrationUrl": "https://aka.ms/augs-ai-session"
  }
]
```

Guidelines:

- `date`: ISO 8601 (`YYYY-MM-DD`) so the list stays sorted chronologically.
- `time`: Optional text, shown next to the date when present.
- `type`: `Online` or `Local` to toggle the location badge.
- `image`: Use an absolute path under `assets/images` or a remote URL.
- `location`: Only displayed for in-person events.
- `registrationUrl`: Optional button link for registrations or RSVP pages.

After editing, save the file and redeploy; the Events page fetches this JSON at runtime.

## Running Locally

Because everything is static, any local web server will work. Examples:

1. Python
   ```
   python -m http.server 8080
   ```
   Then browse to http://localhost:8080.

2. Node.js (if installed)
   ```
   npx serve .
   ```

When using a local server, make sure the root is this project folder so `data/events.json` and assets resolve correctly.

## Deploying to Azure Static Web Apps

1. Push this project to a GitHub repository.
2. In the Azure Portal, create a **Static Web App**:
   - **Source**: GitHub
   - **Build Presets**: Custom
   - **App location**: `/`
   - **Api location**: leave blank
   - **Output location**: `/`
3. Complete the wizard. Azure will generate a GitHub Actions workflow that builds and deploys on every push to your chosen branch.
4. To update events or content, edit the files and push a new commit; the workflow will redeploy automatically.

### Optional: Azure CLI

```
az staticwebapp create \
  --name augs-website \
  --resource-group YOUR_RESOURCE_GROUP \
  --source https://github.com/YOUR_ORG/YOUR_REPO \
  --branch main \
  --location westeurope \
  --app-location "/" \
  --output-location "/"
```

Replace `YOUR_RESOURCE_GROUP`, GitHub details, and Azure region as needed.

## Customization Ideas

- Replace the placeholder logo in the hero with the official Azure User Group Sweden logo.
- Update social links in `contact.html` with the actual community URLs.
- Connect the contact form to Azure Static Web Apps Form Submissions, Logic Apps, or another workflow.
- Add meetup recordings or blog posts by creating additional pages or extending the Events JSON schema.

Enjoy building with Azure!
