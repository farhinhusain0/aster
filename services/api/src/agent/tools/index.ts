import {
  type DataDogIntegration,
  type GithubIntegration,
  type IIntegration,
  type JaegerIntegration,
  type PrometheusIntegration,
  type MongoDBIntegration,
  type GrafanaIntegration,
  type SentryIntegration,
  VendorName,
} from "@aster/db";
import { toolLoaders as grafanaToolLoaders } from "./grafana";
import { toolLoaders as githubToolLoaders } from "./github";
import { toolLoaders as datadogToolLoaders } from "./datadog";
import { createToolLoaders as createStaticToolLoaders } from "./static";
import { toolLoaders as mongodbToolLoaders } from "./mongodb";
import { toolLoaders as jaegerToolLoaders } from "./jaeger";
import { toolLoaders as prometheusToolLoaders } from "./prometheus";
import { toolLoaders as sentryToolLoaders } from "./sentry";
import { Tool } from "./types";
import { RunContext } from "../types";
import dummyLoader from "./dummy";

export const compileToolsForIntegration = async <T extends IIntegration>(
  integration: T | undefined,
  toolLoaders: ((integration: T, context: RunContext) => Promise<Tool>)[],
  context: RunContext,
) => {
  const tools = [] as Tool[];
  if (integration) {
    console.log("### compiling tools for integration", integration.vendor.name);
    // Logic from compileTools is now inlined here
    const vendorTools = await Promise.all(
      toolLoaders.map((loader) => loader(integration, context)),
    );

    tools.push(...vendorTools);
  } else {
    console.log("### no integration provided");
  }

  console.log("### Compiled tools", tools.length);
  return tools;
};

export class CreateTools {
  private readonly integrations: IIntegration[];
  private readonly context: RunContext;
  private readonly tools: Tool[];

  constructor(integrations: IIntegration[], context: RunContext) {
    this.integrations = integrations;
    this.context = context;
    this.tools = [];
  }

  protected async getIntegration<T extends IIntegration>(
    vendorName: VendorName,
  ): Promise<T | undefined> {
    return this.integrations.find((i) => i.vendor.name === vendorName) as
      | T
      | undefined;
  }

  protected async compileAndAddTools<T extends IIntegration>(
    integration: T | undefined,
    toolLoaders: ((integration: T, context: RunContext) => Promise<Tool>)[],
  ): Promise<void> {
    this.tools.push(
      ...(await compileToolsForIntegration(
        integration,
        toolLoaders,
        this.context,
      )),
    );
  }

  protected async sentry(): Promise<void> {
    const sentryIntegration = await this.getIntegration<SentryIntegration>(
      VendorName.Sentry,
    );

    if (!sentryIntegration) {
      return;
    }

    await this.compileAndAddTools(sentryIntegration, sentryToolLoaders);
  }

  protected async grafana(): Promise<void> {
    const grafanaIntegration = await this.getIntegration<GrafanaIntegration>(
      VendorName.Grafana,
    );

    if (!grafanaIntegration) {
      return;
    }

    await this.compileAndAddTools(grafanaIntegration, grafanaToolLoaders);
  }

  protected async mongodb(): Promise<void> {
    const mongodbIntegration = await this.getIntegration<MongoDBIntegration>(
      VendorName.MongoDB,
    );

    if (!mongodbIntegration) {
      return;
    }

    await this.compileAndAddTools(mongodbIntegration, mongodbToolLoaders);
  }

  protected async jaeger(): Promise<void> {
    const jaegerIntegration = await this.getIntegration<JaegerIntegration>(
      VendorName.Jaeger,
    );

    if (!jaegerIntegration) {
      return;
    }

    await this.compileAndAddTools(jaegerIntegration, jaegerToolLoaders);
  }

  protected async prometheus(): Promise<void> {
    const prometheusIntegration =
      await this.getIntegration<PrometheusIntegration>(VendorName.Prometheus);

    if (!prometheusIntegration) {
      return;
    }

    await this.compileAndAddTools(prometheusIntegration, prometheusToolLoaders);
  }

  protected async datadog(): Promise<void> {
    const datadogIntegration = await this.getIntegration<DataDogIntegration>(
      VendorName.DataDog,
    );

    if (!datadogIntegration) {
      return;
    }

    await this.compileAndAddTools(datadogIntegration, datadogToolLoaders);
  }

  protected async github(): Promise<void> {
    const githubIntegration = await this.getIntegration<GithubIntegration>(
      VendorName.Github,
    );

    if (!githubIntegration) {
      return;
    }

    await this.compileAndAddTools(githubIntegration, githubToolLoaders);
  }

  protected async static(): Promise<void> {
    const staticToolLoaders = await createStaticToolLoaders(this.context);
    const staticTools = await Promise.all(
      staticToolLoaders.map((loader) => loader(this.context)),
    );
    this.tools.push(...staticTools);
  }

  async create(): Promise<Tool[]> {
    await this.sentry();
    await this.grafana();
    await this.mongodb();
    await this.jaeger();
    await this.prometheus();
    await this.datadog();
    await this.github();
    await this.static();


    if (this.tools.length === 0) {
      this.tools.push(await dummyLoader("No integrations configured"));
    }

    return this.tools;
  }
}
