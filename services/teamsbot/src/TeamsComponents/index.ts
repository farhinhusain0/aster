import { createInvestigationCardWithMarkdown } from "../utils/adaptiveCard";

const getUnauthenticatedWelcomeCard = ({ data }: { data: Object }) => ({
  type: "AdaptiveCard",
  $schema: "http://adaptivecards.io/schemas/adaptive-card.json",
  version: "1.5",
  body: [
    {
      type: "TextBlock",
      text: "Welcome to Aster | AI teammate for on-call engineers",
      wrap: true,
      style: "heading",
    },
    {
      type: "TextBlock",
      text: "Aster automates root cause analysis and incident response to slash MTTR, reduce alert fatigue and prevent engineer burnout.",
      wrap: true,
    },
    {
      type: "ActionSet",
      actions: [
        {
          type: "Action.OpenUrl",
          title: "Login to Aster",
          id: "aster-teams-login",
          tooltip: "Login to Aster",
          url: `https://login.microsoftonline.com/organizations/oauth2/v2.0/authorize?client_id=${process.env.MICROSOFT_APP_ID}&response_type=code&redirect_uri=${process.env.MICROSOFT_APP_REDIRECT_URI}&response_mode=query&scope=${process.env.MICROSOFT_APP_SCOPE}&state=${JSON.stringify(data)}&prompt=consent`,
          style: "positive",
        },
      ],
      spacing: "ExtraLarge",
    },
  ],
});

const getAuthenticatedWelcomeCard = () => ({
  type: "AdaptiveCard",
  $schema: "http://adaptivecards.io/schemas/adaptive-card.json",
  version: "1.5",
  body: [
    {
      type: "TextBlock",
      text: "Welcome to Aster | AI teammate for on-call engineers",
      wrap: true,
      style: "heading",
    },
  ],
});

const getInvestigationCard = ({
  hypothesis,
  investigationId,
}: {
  hypothesis: string;
  investigationId: string;
}) => {
  return createInvestigationCardWithMarkdown({ hypothesis, investigationId });
};

export {
  getUnauthenticatedWelcomeCard,
  getAuthenticatedWelcomeCard,
  getInvestigationCard,
};
