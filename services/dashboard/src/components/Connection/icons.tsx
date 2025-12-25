/* eslint-disable @typescript-eslint/no-explicit-any */
import { ConnectionName } from "@/types/Connections";
import { FaGithub } from "react-icons/fa";
import SlackLogo from "../../assets/logo-slack.png";
import OpsgenieLogo from "../../assets/logo-opsgenie.png";
import DataDogLogo from "../../assets/logo-datadog.png";
import GrafanaLogo from "../../assets/logo-grafana.png";
import JaegerLogo from "../../assets/logo-jaeger.png";
import ConfluenceLogo from "../../assets/logo-confluence.png";
import JiraLogo from "../../assets/logo-jira.png";
import MongoDBLogo from "../../assets/logo-mongodb.png";
import PrometheusLogo from "../../assets/logo-prometheus.png";
import TeamsLogo from "../../assets/logo-teams.png";
import JiraServiceManagementLogo from "../../assets/logo-jira-service-management.png";
import CoralogixLogo from "../../assets/logo-coralogix.png";
import SentryLogo from "../../assets/logo-sentry.svg";
import PagerDutyLogo from "../../assets/logo-pagerduty.png";
import NotionLogo from "../../assets/logo-notion.png";

export const icons = {
  [ConnectionName.AlertManager]: ({ style = {}, className }: any) => (
    <img src={PrometheusLogo} style={style} className={className} />
  ),
  [ConnectionName.Prometheus]: ({ style = {}, className }: any) => (
    <img src={PrometheusLogo} style={style} className={className} />
  ),
  [ConnectionName.Jaeger]: ({ style = {}, className }: any) => (
    <img src={JaegerLogo} style={style} className={className} />
  ),
  [ConnectionName.Grafana]: ({ style = {}, className }: any) => (
    <img src={GrafanaLogo} style={style} className={className} />
  ),
  [ConnectionName.DataDog]: ({ style = {}, className }: any) => (
    <img src={DataDogLogo} style={style} className={className} />
  ),
  [ConnectionName.Sentry]: ({ style = {}, className }: any) => (
    <img src={SentryLogo} style={style} className={className} />
  ),
  [ConnectionName.Github]: FaGithub,
  [ConnectionName.Coralogix]: ({ style = {}, className }: any) => (
    <img src={CoralogixLogo} style={style} className={className} />
  ),
  [ConnectionName.Teams]: ({ style = {}, className }: any) => (
    <img src={TeamsLogo} style={style} className={className} />
  ),
  [ConnectionName.Opsgenie]: ({ style = {}, className }: any) => (
    <img src={OpsgenieLogo} style={style} className={className} />
  ),
  [ConnectionName.Slack]: ({ style = {}, className }: any) => (
    <img src={SlackLogo} style={style} className={className} />
  ),
  [ConnectionName.PagerDuty]: ({ style = {}, className }: any) => (
    <img src={PagerDutyLogo} style={style} className={className} />
  ),
  [ConnectionName.Notion]: ({ style = {}, className }: any) => (
    <img src={NotionLogo} style={style} className={className} />
  ),
  [ConnectionName.Confluence]: ({ style = {}, className }: any) => (
    <img src={ConfluenceLogo} style={style} className={className} />
  ),
  [ConnectionName.Jira]: ({ style = {}, className }: any) => (
    <img src={JiraLogo} style={style} className={className} />
  ),
  [ConnectionName.MongoDB]: ({ style = {}, className }: any) => (
    <img src={MongoDBLogo} style={style} className={className} />
  ),
  [ConnectionName.JiraServiceManagement]: ({ style = {}, className }: any) => (
    <img src={JiraServiceManagementLogo} style={style} className={className} />
  ),
};
