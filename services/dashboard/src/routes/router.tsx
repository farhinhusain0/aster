import { createBrowserRouter } from "react-router-dom";
import {
  LoginPage,
  CallbackPage,
  ChatPage,
  OrganizationGeneralPage,
  OrganizationMembersPage,
  OrganizationIntegrationsPage,
  OrgIndexPage,
  OrganizationKnowledgeGraphPage,
  RequestAccessPage,
  HomePage,
  ForgotPasswordPage,
} from "../pages";
import { AuthenticationGuard } from "./auth";
import * as paths from "./paths";
import { GenericLayout, OrganizationLayout } from "../layouts";
import { SupportPage } from "../pages/Support";
import { SHOW_CHAT_PAGE } from "../constants";
import { InvestigationDetails, Investigations } from "../pages/Investigation";
import {
  MicrosoftTeamsCallback,
  RegistrationTokenVerificationCallback,
  ResetPasswordCallback,
} from "../pages/Callback";
import { SignupPage } from "../pages/Register/Register";
import { UnauthenticatedLayout } from "@/layouts/UnauthenticatedLayout";
import { ProfilePage } from "@/pages/Profile";
import OrganizationIntegrationDetailsPage from "@/pages/Organization/Integrations/IntegrationDetails";
import { CallbackLayout } from "@/layouts/CallbackLayout";
import { RegistrationEmailVerification } from "@/pages/RegistrationEmailVerification";

export function getGenericLayoutChildren() {
  const children = [
    {
      path: paths.HOME_PATH,
      element: <AuthenticationGuard component={HomePage} />,
    },
    {
      path: paths.INVESTIGATIONS_PATH,
      children: [
        {
          index: true,
          element: <AuthenticationGuard component={Investigations} />,
        },
        {
          path: ":id/:checkId?",
          element: <AuthenticationGuard component={InvestigationDetails} />,
        },
      ],
    },
    {
      path: paths.SUPPORT_PATH,
      element: <AuthenticationGuard component={SupportPage} />,
    },
    {
      path: paths.ORGANIZATION_PATH,
      element: <AuthenticationGuard component={OrganizationLayout} />,
      children: [
        {
          index: true,
          element: <AuthenticationGuard component={OrgIndexPage} />,
        },
        {
          path: paths.ORGANIZATION_GENERAL_PATH,
          element: <AuthenticationGuard component={OrganizationGeneralPage} />,
        },
        {
          path: paths.ORGANIZATION_MEMBERS_PATH,
          element: <AuthenticationGuard component={OrganizationMembersPage} />,
        },
        {
          path: paths.ORGANIZATION_INTEGRATIONS_PATH,
          children: [
            {
              index: true,
              element: (
                <AuthenticationGuard component={OrganizationIntegrationsPage} />
              ),
            },
            {
              path: ":vendorId",
              element: (
                <AuthenticationGuard
                  component={OrganizationIntegrationDetailsPage}
                />
              ),
            },
          ],
        },
        {
          path: paths.ORGANIZATION_KNOWLEDGE_GRAPH_PATH,
          element: (
            <AuthenticationGuard component={OrganizationKnowledgeGraphPage} />
          ),
        },
      ],
    },
    {
      path: paths.PROFILE_PATH,
      element: <AuthenticationGuard component={ProfilePage} />,
    },
  ];

  if (SHOW_CHAT_PAGE) {
    children.push({
      path: paths.CHAT_PATH,
      element: <AuthenticationGuard component={ChatPage} />,
    });
  }

  return children;
}

function createGenericLayout() {
  return {
    element: <AuthenticationGuard component={GenericLayout} />,
    children: getGenericLayoutChildren(),
  };
}

export function unauthenticatedLayoutChildren() {
  return [
    {
      path: paths.LOGIN_PATH,
      element: <LoginPage />,
    },
    {
      path: paths.FORGOT_PASSWORD_PATH,
      element: <ForgotPasswordPage />,
    },
    {
      path: paths.SIGNUP_PATH,
      children: [
        {
          index: true,
          element: <SignupPage />,
        },
        {
          path: "verify-email",
          element: <RegistrationEmailVerification />,
        },
        {
          path: "request-access",
          element: <RequestAccessPage />,
        },
      ],
    },
  ];
}

function createUnauthenticatedLayout() {
  return {
    element: <UnauthenticatedLayout />,
    children: unauthenticatedLayoutChildren(),
  };
}

export function callbackLayoutChildren() {
  return [
    {
      path: paths.CALLBACK_PATH,
      element: <AuthenticationGuard component={CallbackPage} />,
    },
    {
      path: paths.MICROSOFT_TEAMS_CALLBACK_PATH,
      element: <AuthenticationGuard component={MicrosoftTeamsCallback} />,
    },
    {
      path: paths.REGISTRATION_TOKEN_VERIFICATION_CALLBACK_PATH,
      element: <RegistrationTokenVerificationCallback />,
    },
    {
      path: paths.RESET_PASSWORD_CALLBACK_PATH,
      element: <ResetPasswordCallback />,
    },
  ];
}

function createCallbackLayout() {
  return {
    element: <CallbackLayout />,
    children: callbackLayoutChildren(),
  };
}

export const router = createBrowserRouter([
  createUnauthenticatedLayout(),
  createCallbackLayout(),
  createGenericLayout(),
]);
