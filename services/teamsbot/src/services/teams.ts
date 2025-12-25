import { integrationModel, TeamsIntegration, VendorName } from "@aster/db";
import { createGraphClient } from "../client";
import { TeamsAdaptiveCardBodyItem } from "../types";
import { getIncidentIdFromJSMTitle, getIncidentIdFromPagerDutyTitle } from "../utils/adaptiveCard";

export async function getTeamsMessageById(
  messageId: string,
  channelId: string,
  tenantId: string,
) {
  try {
    const integration = await integrationModel.getIntegrationByName("Teams", {
      "metadata.tenantId": tenantId,
    });

    if (!integration) {
      throw new Error("Integration not found");
    }
    const { metadata } = integration as TeamsIntegration;

    const graphClient = await createGraphClient(tenantId);
    const message = await graphClient
      .api(
        `/teams/${metadata.aadGroupId}/channels/${channelId}/messages/${messageId}`,
      )
      .get();

    console.log("\n=============Message=============\n");
    console.log(message);
    console.log("\n=============Message=============\n");

    return message;
  } catch (error) {
    console.error("Error fetching message by ID:", error);
    throw error;
  }
}

export async function getTeamsUserByAADObjectId(
  aadObjectId: string,
  tenantId: string,
) {
  try {
    const graphClient = await createGraphClient(tenantId);
    const user = await graphClient.api(`/users/${aadObjectId}`).get();

    console.log("\n=============User=============\n");
    console.log(user);
    console.log("\n=============User=============\n");

    return user;
  } catch (error) {
    console.error("Error fetching user by AAD Object ID:", error);
    throw error;
  }
}

export function getIncidentTextFromMessage(message: any) {
  try {
    const content = JSON.parse(message?.attachments[0]?.content);
    let text = "";

    // Detect JSM by presence of a bolder TextBlock and a Description container
    let jsmTitle = "";
    let jsmDescription = "";
    let foundJSMTitle = false;
    let foundJSMDescription = false;
    content.body.forEach((item: any) => {
      if (item.type === "TextBlock" && item.weight === "bolder") {
        jsmTitle = item.text;
        foundJSMTitle = true;
      }
      if (
        item.type === "Container" &&
        Array.isArray(item.items) &&
        item.items.length > 1 &&
        item.items[0].type === "TextBlock" &&
        item.items[0].text?.trim() === "**Description**"
      ) {
        const descBlock = item.items[1];
        if (descBlock && descBlock.type === "TextBlock") {
          // Extract only the main message from the description (first non-empty line, skipping status/URLs)
          const lines = descBlock.text
            .split("\n")
            .map((l: string) => l.trim())
            .filter(
              (l: string) =>
                l &&
                !l.startsWith("http") &&
                !l.startsWith("**") &&
                !l.startsWith("Value:") &&
                !l.startsWith("Labels:") &&
                !l.startsWith("Annotations:") &&
                !l.startsWith("Source:") &&
                !l.startsWith("Silence:"),
            );
          // Try to find the first line that matches the main alert message
          jsmDescription = lines[0] || "";
          foundJSMDescription = true;
        }
      }
    });

    if (foundJSMTitle) {
      text = `Incident: ${jsmTitle}`;
      if (foundJSMDescription) {
        text += `\nDescription: ${jsmDescription}`;
      }
      const incidentId = getIncidentIdFromJSMTitle(jsmTitle);
      console.log("\n=============Incident Text (JSM)=============");
      console.log(text, incidentId);
      console.log("\n=============Incident Text (JSM)=============");
      return {
        text,
        vendorName: VendorName.JiraServiceManagement,
        incidentId,
      };
    }

    // PagerDuty fallback: look for special TextBlock pattern
    let pdTitle = "";
    content.body.forEach((item: TeamsAdaptiveCardBodyItem) => {
      if (item.type === "TextBlock") {
        const match = item?.text?.match(/\[(.*?)\*\*\*/);
        if (match) {
          pdTitle = match[1].replace(/^#\d+:\s*/, "").replace(" ↗ ]", "");
          text += `Incident: ${pdTitle}`;
        }
      } else if (item.type === "ColumnSet") {
        item?.columns?.forEach((column: any) => {
          column.items.forEach((subItem: any) => {
            if (subItem.type === "FactSet") {
              subItem?.facts?.forEach((fact: any) => {
                if (fact.title === "Service:") {
                  text += `\n${fact.title} ${fact.value.replace(" ↗ ", "")}`;
                }
              });
            }
          });
        });
      }
    });
    const incidentId = getIncidentIdFromPagerDutyTitle(pdTitle);
    console.log("\n=============Incident Text (PagerDuty)=============");
    console.log(text, incidentId);
    console.log("\n=============Incident Text (PagerDuty)=============");
    return { text, vendorName: VendorName.PagerDuty, incidentId };
  } catch (error) {
    console.error("Error extracting incident text:", error);
    throw error;
  }
}
