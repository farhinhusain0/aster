<p align="center">
  <a href="https://aster.so">
    <picture>
      <source srcset="assets/full-logo.png" media="(prefers-color-scheme: dark)">
      <source srcset="assets/full-logo.png" media="(prefers-color-scheme: light)">
      <img src="assets/full-logo.png" alt="Aster logo" width="234" height="auto">
    </picture>
  </a>
</p>
<p align="center">The open source AI on-call engineer</p>

<p align="center">
  <a href="https://aster.so">
    <img src="assets/banner.png" alt="Aster" width="512" height="auto">
  </a>
</p>

Aster is an AI on-call engineer. It integrates with your observability stack, codebase and the tools you work with to autonomously investigate production incidents. Think machines on-call for humans, not the other way around.

## How it works

1. Clone the repo and start Aster.

2. Create an account and invite your teammates.

3. Connect Aster to your observability stack, e.g., Sentry, Datadog.

4. ⁠Connect Aster to GitHub, Slack/Teams, and any other tools you work with when triaging/troubleshooting, e.g., PagerDuty, Jira.

5. ⁠Create your organization’s knowledge graph to ingest data from the tools you connected in the previous step. The knowledge graph allows Aster to search for contextual information that might be relevant to an incident.

6. Once these steps are complete, Aster will automatically get added to your Slack/Teams and start investigating alerts for you.

## Getting started

To run Aster, clone the repo and run the app using Docker Compose.

### Prerequisites

The app uses Docker containers. To run it, you need to have [Docker Desktop](https://docs.docker.com/desktop/), which comes with Docker CLI, Docker Engine and Docker Compose.

### Installation

Clone the repository:

   ```bash
   git clone git@github.com:asteroncall/aster.git && cd aster
   ```

Copy the `.env.example` file:

   ```bash
   cp .env.example .env
   ```

Open the .env file in your editor:

   ```bash
   vscode .env # or emacs or vim or nano
   ```

Update these variables:
- `OPENAI_API_KEY` - Your OpenAI API key (get it from [here](https://platform.openai.com/account/api-keys))

- `JWT_SIGNING_SECRET` - Secret for signing JWT tokens (generate with `openssl rand -base64 32`)

- `SLACK_APP_TOKEN` and `SLACK_SIGNING_SECRET` - If you use Slack, follow [this guide](https://github.com/asteroncall/aster/tree/main/config/slack/README.md) to create a Slack app for Aster in your organization 

- `MICROSOFT_TEAMSBOT_URL`, `MICROSOFT_TEAMS_APP_ID`, `MICROSOFT_APP_ID`, `MICROSOFT_APP_TENANT_ID` and `MICROSOFT_APP_PASSWORD` - If you use Teams, follow [this guide](https://github.com/asteroncall/aster/tree/main/config/teams/README.md) to create a Teams app for Aster in your organization

- `SMTP_CONNECTION_URL` - SMTP server for transactional emails (format: `smtp://username:password@domain:port`)



Launch the project:

   ```bash
   docker compose up -d
   ```

   If you prefer to use pre-built images:

   ```bash
   docker compose -p aster-quick-start -f docker-compose.quick-start.yml up -d
   ```

   To stop the quick-start containers:

   ```bash
   docker compose -p aster-quick-start down
   ```
   >[!Note]
   >If you are using Microsoft Teams, make sure to uncomment the teamsbot service in docker-compose.quick-start.yml before running the command.

You should now be able to access Aster through http://localhost:5173. Simply create an account with the email you use for Slack or Teams, and set up your organization.

### Updates

Pull the latest changes:

```bash
git pull
```

Rebuild images:

```bash
docker compose up --build -d
```

## Licensing

There are two editions of Aster:
- Aster Community Edition (CE) is available freely under the AGPL 3.0 license.
- Aster Enterprise Edition (EE) includes extra features that are primarily useful for larger organizations. For feature details, check out [our website](https://aster.so/).

