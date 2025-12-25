# Aster - open-source AI on-call developer

<div align="center">
    <a href="https://aster.so">
      <img src="./assets/logo-cat.png" alt="Aster-logo" width="30%"/>
    </a>
</div>
<br />
<div align="center">
   <div>
      <a href="https://github.com/asteroncall/aster?tab=readme-ov-file"><strong>Docs</strong></a> ·
      <a href="https://github.com/asteroncall/aster/issues"><strong>Report Bug</strong></a> ·
      <a href="https://github.com/orgs/asteroncall/discussions"><strong>Feature Request</strong></a>
   </div>
</div>
<br />
<div style="display: flex" style="margin-bottom: 20px">
<a href="https://aster.so/?utm_source=github"><img src="https://img.shields.io/badge/Website-blue?logo=googlechrome&logoColor=orange"/></a>
  <a href="https://tally.so/r/nWlxVR"><img src="https://img.shields.io/badge/Book%20a%20Call-blue" /></a>
<a href="https://github.com/asteroncall/aster/blob/main/LICENSE.md"><img src="https://img.shields.io/badge/license-AGPL--v3-blue" alt="AGPL V3 License"></a>
<a href="https://github.com/prettier/prettier">
<img src="https://img.shields.io/badge/code_style-prettier-ff69b4.svg?style=flat-square" alt="code style: prettier">
</a>
</div>


Note: If you want to use Aster for your team or for your organisation please reach out to us.
This open-source project is suited for single individual use. Any advanced investigation, LLM and organization management features will be under Aster enterprise edition.

Reach out to us regarding enterprise edition access: https://tally.so/r/nWlxVR

</p>


## Overview 💫

Aster is an AI-powered on-call engineer. It can automatically jump into incidents & alerts with you, and provide you useful & contextual insights and RCA in real time.


## Why ❓

Most people don't like to do on-call shifts. It requires engineers to be swift and solve problems quickly. Moreover, it takes time to reach to the root cause of the problem. That's why we developed Aster. We believe Gen AI can help on-call developers solve issues faster.

## Table of Contents

- [Overview](#overview-)
- [Why](#why-)
- [Key Features](#key-features-)
- [Demo](#demo-)
- [Getting started](#getting-started-)
  - [Prerequisites](#prerequisites-)
  - [Quick Installation](#quick-installation-)
  - [Updating Aster](#updating-aster-️-)
  - [Deployment](#deployment-)
  - [Visualize Knowledge Base](#visualize-knowledge-base-)
- [Support and feedback](#support-and-feedback-️)
- [Contributing to Aster](#contributing-to-aster-️)
- [Troubleshooting](#troubleshooting-️)
- [License](#license-)
- [Learn more](#learn-more-)
- [Contributors](#contributors-)

## Key features 🎯

- **Automatic RCA**: Aster automatically listens to production incidents/alerts and automatically investigates them for you.
- **Slack integration**: Aster lives inside your Slack. Simply connect it and enjoy an on-call engineer that never sleeps.
- **Integrations**: Aster integrates with popular observability/incident management tools such as Sentry, Datadog, Coralogix, Opsgenie and Pagerduty. It also integrates to other tools as GitHub, Notion, Jira and Confluence to gain insights on incidents.
- **Intuitive UX**: Aster offers a familiar experience. You can talk to it and ask follow-up questions.
- **Secure**: Self-host Aster and own your data. Always.
- **Open Source**: We love open-source. Self-host Aster and use it for free.

## Getting started 🚀

In order to run Aster, you need to clone the repo & run the app using Docker Compose.

### Prerequisites 📜

Ensure you have the following installed:

- **Docker & Docker Compose** - The app works with Docker containers. To run it, you need to have [Docker Desktop](https://docs.docker.com/desktop/), which comes with Docker CLI, Docker Engine and Docker Compose.

### Quick installation 🏎️

1. Clone the repository:

   ```bash
   git clone git@github.com:asteroncall/aster.git && cd aster
   ```

2. Copy the `.env.example` file:

   ```bash
   cp .env.example .env
   ```

3. Open the `.env` file in your favorite editor (vim, vscode, emacs, etc):

   ```bash
   vim .env # or emacs or vscode or nano
   ```

4. Update these variables:
  - `OPENAI_API_KEY` - This variable is needed in order to use OpenAI's API. You can get it from [here](https://platform.openai.com/account/api-keys).

  - `JWT_SIGNING_SECRET` - This variable is needed in order to sign JWT tokens. You can generate it using `openssl rand -base64 32`.
  
  - `SMTP_CONNECTION_URL` - This variable is needed in order to invite new members to your Aster organization via email and allow them to use the bot. It's not mandatory if you just want to test Aster and play with it. If you do want to send invites to your team members, you can use a service like SendGrid/Mailgun. Should follow this pattern: `smtp://username:password@domain:port`.

  - `SLACK_APP_TOKEN` and `SLACK_SIGNING_SECRET` - These variables are needed in order to talk to Aster on Slack. Please follow [this guide](https://github.com/asteroncall/aster/tree/main/config/slack/README.md) to create a new Slack app in your organization.

  - (Optional) `MICROSOFT_TEAMSBOT_URL`, `MICROSOFT_TEAMS_APP_ID`, `MICROSOFT_APP_ID`, `MICROSOFT_APP_TENANT_ID` and `MICROSOFT_APP_PASSWORD` - These variables are needed in order to talk to Aster on Microsoft Teams. Please follow [this guide](https://github.com/asteroncall/aster/tree/main/config/teams/README.md) to create a new Microsoft Teams app in your organization. If you choose to use Microsoft Teams, you don't need to configure Slack.



5. Launch the project:
   ```bash
   docker compose up -d
   ```

   **Or using pre-built images:**
   If you don't want to build images from source, you can use our pre-built images:
   ```bash
   docker compose -p aster-quick-start -f docker-compose.quick-start.yml up -d
   ```

   To stop the quick-start containers:
   ```bash
   docker compose -p aster-quick-start down
   ```

   > [!NOTE]
   > If you are using **Microsoft Teams**, make sure to uncomment the `teamsbot` service in `docker-compose.quick-start.yml` before running the command.

That's it. You should be able to visit Aster's dashboard in http://localhost:5173.
Simply create a user **(with the same e-mail as the one in your Slack user)** and start to configure your organization. If something does not work for you, please checkout our [troubleshooting](#troubleshooting) or reach out to us via our [support channels](#support-and-feedback).

The next steps are to configure your organization a bit more (connect incident management tools, build a knowledge base, etc). Head over to the [connect & configure](https://github.com/asteroncall/aster) section in our docs for more information 💫

### Updating Aster 🧙‍♂️

1. Pull the latest changes:

   ```bash
   git pull
   ```

2. Rebuild images:

   ```bash
   docker compose up --build -d
   ```

<a id="support-and-feedback"></a>
## Support and feedback 👷‍♀️

In order of preference the best way to communicate with us:

- **GitHub Discussions**: Contribute ideas, support requests and report bugs (preferred as there is a static & permanent for other community members).
- **Privately**: contact at razin@worklife.so

<a id="troubleshooting"></a>
## Troubleshooting ⚒️

If you encounter any problems/errors/issues with Aster, please feel free to reach out to us at our [support channels](#support-and-feedback).

## License 📃

This project is licensed under the AGPL V3 license - see the [LICENSE](https://github.com/asteroncall/aster/tree/main/LICENSE) file for details

## Learn more 🔍

Check out the official website at https://aster.so for more information.

## Contributors ✨

Built with ❤️ by Aster
