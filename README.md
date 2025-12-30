<p align="center">
  <a href="https://aster.so">
    <picture>
      <source srcset="assets/full-logo.png" media="(prefers-color-scheme: dark)">
      <source srcset="assets/full-logo.png" media="(prefers-color-scheme: light)">
      <img src="assets/full-logo.png" alt="Aster logo">
    </picture>
  </a>
</p>
<p align="center">The open source AI on-call engineer</p>

[![Aster](assets/banner.png)](https://aster.so)


## Getting started

To run Aster, clone the repo and run the app using Docker Compose.

### Prerequisites 📜

The app uses Docker containers. To run it, you need to have [Docker Desktop](https://docs.docker.com/desktop/), which comes with Docker CLI, Docker Engine and Docker Compose.

### Installation

1. Clone the repository:

   ```bash
   git clone git@github.com:asteroncall/aster.git && cd aster
   ```

2. Copy the `.env.example` file:

   ```bash
   cp .env.example .env
   ```

3. Open the .env file in your editor:

   ```bash
   nano .env # or emacs or vscode or vim
   ```

4. Update these variables:
  - `OPENAI_API_KEY` - Your OpenAI API key (get it from [here](https://platform.openai.com/account/api-keys))

  - `JWT_SIGNING_SECRET` - Secret for signing JWT tokens (generate with `openssl rand -base64 32`)

  - `SLACK_APP_TOKEN` and `SLACK_SIGNING_SECRET` - If you use Slack, follow [this guide](https://github.com/asteroncall/aster/tree/main/config/slack/README.md) to create a Slack app for Aster in your organization 

  - `MICROSOFT_TEAMSBOT_URL`, `MICROSOFT_TEAMS_APP_ID`, `MICROSOFT_APP_ID`, `MICROSOFT_APP_TENANT_ID` and `MICROSOFT_APP_PASSWORD` - If you use Teams, follow [this guide](https://github.com/asteroncall/aster/tree/main/config/teams/README.md) to create a Teams app for Aster in your organization

  - `SMTP_CONNECTION_URL` - SMTP server for transactional emails (format: `smtp://username:password@domain:port`)



5. Launch the project:

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
   [!Note]
   If you are using Microsoft Teams, make sure to uncomment the teamsbot service in docker-compose.quick-start.yml before running the command.

You should now be able to access Aster through http://localhost:5173. Simply create a user with the email you use for Slack or Teams, and set up your organization.

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

