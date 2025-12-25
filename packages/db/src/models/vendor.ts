import mongoose from "mongoose";
import { VendorSchema } from "../schemas/vendor";
import { IVendor } from "../types";
import { BaseModel } from "./base";

export const Vendor = mongoose.model<IVendor>("Vendor", VendorSchema);
export const vendorModel = new BaseModel(Vendor);

export const seedVendors = async () => {
  const vendorsData = [
    {
      name: "Slack",
      displayName: "Slack",
      description:
        "Ask questions, explore your knowledge graph, and get real-time answers where your team already collaborates.",
    },
    {
      name: "Teams",
      displayName: "Teams",
      description:
        "Get insights, ask questions, and stay updated on incidents — all without leaving Teams.",
    },
    {
      name: "PagerDuty",
      displayName: "PagerDuty",
      description:
        "Aster connects to PagerDuty to ingest alert data and provide smart incident summaries and recommendations.",
    },
    {
      name: "Github",
      displayName: "GitHub",
      description:
        "Aster syncs with repositories, pull requests, and issues to provide rich engineering context for debugging and analysis. for version control using Git.",
    },
    {
      name: "Grafana",
      displayName: "Grafana",
      description:
        "Integrate Grafana to capture dashboards and metrics that help Aster understand the state of your systems.",
    },
    {
      name: "Jira Service Management",
      displayName: "Jira Service Management",
      description:
        "Jira Service Management is a cloud-based platform that provides incident response, on-call scheduling, and DevOps monitoring services",
    },
    {
      name: "Opsgenie",
      displayName: "Opsgenie",
      description:
        "Use Opsgenie to inform Aster about incidents, responders, and escalation paths.",
    },
    {
      name: "Coralogix",
      displayName: "Coralogix",
      description:
        "Use Coralogix to feed observability data into Aster's knowledge layer.",
    },
    {
      name: "DataDog",
      displayName: "Datadog",
      description:
        "Aster pulls logs, traces, and metrics from Datadog to enrich incident context and analysis.",
    },
    {
      name: "Sentry",
      displayName: "Sentry",
      description: "Sentry integration helps you analyze you app crashes",
    },
    {
      name: "Notion",
      displayName: "Notion",
      description:
        "Aster uses Notion pages as part of its knowledge base — helping you find relevant runbooks, notes, or shared context during incident response or debugging.",
    },
    {
      name: "Jira",
      displayName: "Jira",
      description:
        "Link Jira tickets, epics, and workflows to give Aster deeper context around engineering work and incident history.",
    },
    {
      name: "Confluence",
      displayName: "Confluence",
      description:
        "Aster connects to Confluence to surface relevant runbooks, playbooks, and internal docs during incidents or queries.",
    },
    {
      name: "Jaeger",
      displayName: "Jaeger",
      description:
        "Aster uses trace data from Jaeger to understand distributed systems behavior and identify bottlenecks during investigations.",
    },
  ] as IVendor[];

  let i = 0;
  for (const vendor of vendorsData) {
    await Vendor.findOneAndUpdate(
      { name: vendor.name },
      { ...vendor, order: i++ },
      {
        upsert: true,
      },
    );
  }
};
