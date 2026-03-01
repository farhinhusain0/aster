import {
  IInvestigation,
  InvestigationConfidenceLevel,
  IOrganization,
} from "@aster/db";
import mongoose from "mongoose";

/**
 * Configuration for creating a seed investigation.
 * This interface allows flexibility in what can be configured
 * while the factory ensures all required IInvestigation fields are present.
 */
export interface SeedInvestigationConfig {
  _id: mongoose.Types.ObjectId;
  hypothesis: string;
  organization: IOrganization;
  pdIncidentId: string;
  pdDetails: object;
  rootCause: string;
  recommendedFix: string;
  confidenceLevel: InvestigationConfidenceLevel;
}

/**
 * Creates a type-safe investigation object for seeding.
 *
 * The return type ensures that ALL required fields from the IInvestigation interface
 * are present. If the IInvestigation schema changes to add new required fields, TypeScript
 * will error here, forcing us to update the seed data.
 *
 * @param config - Configuration for the investigation seed data
 * @returns Complete IInvestigation object ready for database insertion
 */
export function createSeedInvestigation(
  config: SeedInvestigationConfig,
): Omit<IInvestigation, "createdAt" | "updatedAt"> {
  return {
    _id: config._id,
    hypothesis: config.hypothesis,
    organization: config.organization,
    status: "active",
    pdIncidentId: config.pdIncidentId,
    pdDetails: config.pdDetails,
    jsmDetails: null,
    rootCause: config.rootCause,
    recommendedFix: config.recommendedFix,
    confidenceLevel: config.confidenceLevel,
  };
}

/**
 * Preset configurations for common test investigations.
 * These can be used across different seed files for consistency.
 */
export const SEED_INVESTIGATION_PRESETS = {
  quickStartInvestigation: {
    _id: new mongoose.Types.ObjectId("000000000000000000000001"),
    hypothesis:
      'There was 1 incident affecting the `payment-local` service, with 68 payment transaction failures logged as "Payment charge failed" in the last 24 hours. The error consistently occurs in the Stripe API call within `src/payment/charge.js`, but no stack traces or detailed error messages are present—likely due to generic error handling. No code or configuration changes have occurred in the last 2 months, ruling out recent deployments as the cause. The most probable cause is an external or environmental issue, such as problems with the `STRIPE_API_KEY`, `STRIPE_URL`, or Stripe API availability. Recommended next steps: verify environment variables on the payment service, check Stripe API status, and improve logging to capture the underlying Stripe error response.\n',
    rootCause:
      "The environment variable STRIPE_URL is not set in the payment service's production environment.",
    recommendedFix:
      "Set the STRIPE_URL environment variable in the payment service's deployment configuration.",
    confidenceLevel: InvestigationConfidenceLevel.High,
    pdDetails: {
      incident_number: 1239,
      title:
        "[FIRING:1] payment service transaction error Demo (Payment charge failed payment)",
      description:
        "[FIRING:1] payment service transaction error Demo (Payment charge failed payment)",
      created_at: "2025-12-21T10:58:10Z",
      updated_at: "2025-12-21T10:58:10Z",
      status: "triggered",
      incident_key: null,
      service: {
        id: "PLGKKE5",
        type: "service_reference",
        summary: "payment-local",
        self: "https://api.pagerduty.com/services/PLGKKE5",
        html_url:
          "https://worklifeteam.pagerduty.com/service-directory/PLGKKE5",
      },
      assignments: [
        {
          at: "2025-12-21T10:58:10Z",
          assignee: {
            id: "P063IEI",
            type: "user_reference",
            summary: "Md. Moshfiqur Rahman Rony",
            self: "https://api.pagerduty.com/users/P063IEI",
            html_url: "https://worklifeteam.pagerduty.com/users/P063IEI",
          },
        },
      ],
      assigned_via: "escalation_policy",
      last_status_change_at: "2025-12-21T10:58:10Z",
      resolved_at: null,
      first_trigger_log_entry: {
        id: "RP4AU2VACDJU6Y9KB44F4BIMCO",
        type: "trigger_log_entry",
        summary: "Triggered through the API.",
        self: "https://api.pagerduty.com/log_entries/RP4AU2VACDJU6Y9KB44F4BIMCO",
        html_url:
          "https://worklifeteam.pagerduty.com/incidents/Q2DBOAA5TSQGU6/log_entries/RP4AU2VACDJU6Y9KB44F4BIMCO",
        created_at: "2025-12-21T10:58:10Z",
        agent: {
          id: "PJR2RQJ",
          type: "events_api_v2_inbound_integration_reference",
          summary: "Events API V2",
          self: "https://api.pagerduty.com/services/PLGKKE5/integrations/PJR2RQJ",
          html_url:
            "https://worklifeteam.pagerduty.com/services/PLGKKE5/integrations/PJR2RQJ",
        },
        channel: {
          type: "api",
          service_key: "98e2c4f08c354408d045a093c0b383f1",
          description:
            "[FIRING:1] payment service transaction error Demo (Payment charge failed payment)",
          incident_key:
            "5eed518c62c55d3d5b4d79123e935c688fcb972a3ebdc76a43ae637a92c00152",
          details: {
            firing:
              "\nValue: A=13.998833430547453\nLabels:\n - alertname = payment service transaction error\n - app_payment_failure = Payment charge failed\n - grafana_folder = Demo\n - job = payment\nAnnotations:\nSource: http://localhost/grafana/alerting/grafana/de8rnwee6fta8a/view?orgId=1\nSilence: http://localhost/grafana/alerting/silence/new?alertmanager=grafana&matcher=alertname%3Dpayment+service+transaction+error&matcher=app_payment_failure%3DPayment+charge+failed&matcher=grafana_folder%3DDemo&matcher=job%3Dpayment&orgId=1\n",
            num_firing: "1",
            num_resolved: "0",
            resolved: "",
          },
          cef_details: {
            client: "Grafana",
            client_url: "http://localhost/grafana/",
            contexts: [
              {
                href: "http://localhost/grafana/",
                text: "External URL",
                type: "link",
              },
            ],
            creation_time: null,
            dedup_key:
              "5eed518c62c55d3d5b4d79123e935c688fcb972a3ebdc76a43ae637a92c00152",
            description:
              "[FIRING:1] payment service transaction error Demo (Payment charge failed payment)",
            details: {
              firing:
                "\nValue: A=13.998833430547453\nLabels:\n - alertname = payment service transaction error\n - app_payment_failure = Payment charge failed\n - grafana_folder = Demo\n - job = payment\nAnnotations:\nSource: http://localhost/grafana/alerting/grafana/de8rnwee6fta8a/view?orgId=1\nSilence: http://localhost/grafana/alerting/silence/new?alertmanager=grafana&matcher=alertname%3Dpayment+service+transaction+error&matcher=app_payment_failure%3DPayment+charge+failed&matcher=grafana_folder%3DDemo&matcher=job%3Dpayment&orgId=1\n",
              num_firing: "1",
              num_resolved: "0",
              resolved: "",
            },
            event_class: "default",
            message:
              "[FIRING:1] payment service transaction error Demo (Payment charge failed payment)",
            mutations: [],
            priority: null,
            reporter_component: null,
            reporter_location: null,
            service_group: "default",
            severity: "critical",
            source_component: "Grafana",
            source_location: null,
            source_origin: "34ff431cb9d2",
            urgency: null,
            version: "1.0",
          },
          summary:
            "[FIRING:1] payment service transaction error Demo (Payment charge failed payment)",
          client_url: "http://localhost/grafana/",
          client: "Grafana",
        },
        service: {
          id: "PLGKKE5",
          type: "service_reference",
          summary: "payment-local",
          self: "https://api.pagerduty.com/services/PLGKKE5",
          html_url:
            "https://worklifeteam.pagerduty.com/service-directory/PLGKKE5",
        },
        incident: {
          id: "Q2DBOAA5TSQGU6",
          type: "incident_reference",
          summary:
            "[#1239] [FIRING:1] payment service transaction error Demo (Payment charge failed payment)",
          self: "https://api.pagerduty.com/incidents/Q2DBOAA5TSQGU6",
          html_url:
            "https://worklifeteam.pagerduty.com/incidents/Q2DBOAA5TSQGU6",
        },
        teams: [],
        contexts: [
          {
            type: "link",
            href: "http://localhost/grafana/",
            text: "External URL",
          },
        ],
        event_details: {
          description:
            "[FIRING:1] payment service transaction error Demo (Payment charge failed payment)",
        },
      },
      alert_counts: {
        all: 1,
        triggered: 1,
        resolved: 0,
      },
      is_mergeable: true,
      incident_type: {
        name: "incident_default",
      },
      escalation_policy: {
        id: "POLQ8XD",
        type: "escalation_policy_reference",
        summary: "Shujog backend-ep",
        self: "https://api.pagerduty.com/escalation_policies/POLQ8XD",
        html_url:
          "https://worklifeteam.pagerduty.com/escalation_policies/POLQ8XD",
      },
      teams: [],
      impacted_services: [
        {
          id: "PLGKKE5",
          type: "service_reference",
          summary: "payment-local",
          self: "https://api.pagerduty.com/services/PLGKKE5",
          html_url:
            "https://worklifeteam.pagerduty.com/service-directory/PLGKKE5",
        },
      ],
      pending_actions: [],
      acknowledgements: [],
      basic_alert_grouping: null,
      alert_grouping: null,
      last_status_change_by: {
        id: "PLGKKE5",
        type: "service_reference",
        summary: "payment-local",
        self: "https://api.pagerduty.com/services/PLGKKE5",
        html_url:
          "https://worklifeteam.pagerduty.com/service-directory/PLGKKE5",
      },
      priority: null,
      urgency: "high",
      id: "Q2DBOAA5TSQGU6",
      type: "incident",
      summary:
        "[#1239] [FIRING:1] payment service transaction error Demo (Payment charge failed payment)",
      self: "https://api.pagerduty.com/incidents/Q2DBOAA5TSQGU6",
      html_url: "https://worklifeteam.pagerduty.com/incidents/Q2DBOAA5TSQGU6",
    },
    pdIncidentId: "Q2DBOAA5TSQGU6",
  },
};
