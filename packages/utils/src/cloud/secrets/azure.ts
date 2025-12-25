import { SecretsBackend, sanitize } from "./base";
import { SecretClient } from "@azure/keyvault-secrets";
import { DefaultAzureCredential } from "@azure/identity";
import { Integration } from "@aster/db";
import type { IIntegration } from "@aster/db";

export class AzureKeyVaultSecretManager extends SecretsBackend {
  private readonly client: SecretClient;

  constructor(vaultUrl?: string) {
    super();
    const keyVaultUrl = vaultUrl || (process.env.AZURE_KEY_VAULT_URL as string);
    
    if (!keyVaultUrl) {
      throw new Error("Azure Key Vault URL is required. Provide it via constructor or AZURE_KEY_VAULT_URL environment variable.");
    }

    const credential = new DefaultAzureCredential();
    this.client = new SecretClient(keyVaultUrl, credential);
  }

  async fetchSecrets(
    secretNames: string[],
  ): Promise<{ [key: string]: string }> {
    const result: { [key: string]: string } = {};
    const secretsPromises = secretNames.map(async (secretName) => {
      try {
        const secret = await this.client.getSecret(secretName);

        if (!secret.value) {
          throw new Error(`Could not found secret ${secretName}`);
        }

        result[secretName] = secret.value;
      } catch (error) {
        console.error(`Error fetching secret ${secretName}:`, error);
      }
    });

    await Promise.all(secretsPromises);

    return result;
  }

  async createSecret(secretName: string, secretValue: string): Promise<void> {
    try {
      await this.client.setSecret(secretName, secretValue);
    } catch (err) {
      console.log("secret create err: ", err);
      throw new Error("Failed creating a secret");
    }
  }

  async createCredentials(
    organizationId: string,
    vendor: string,
    credentials: { [key: string]: string },
  ): Promise<unknown> {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const formattedCredentials: any = {};
    const env = process.env.NODE_ENV as string;

    for (const key in credentials) {
      // Azure Key Vault secret names can only contain alphanumeric characters and dashes
      const secretName = `${sanitize(env)}-${sanitize(organizationId)}-integration-${sanitize(vendor)}-${sanitize(key)}`;
      await this.createSecret(
        secretName,
        credentials[key as keyof typeof credentials],
      );
      if (key) {
        formattedCredentials[key] = secretName;
      }
    }

    return formattedCredentials;
  }

  async recreateCredentials(
    integration: IIntegration,
    values: Record<string, string>,
  ): Promise<void> {
    // Delete current
    await Promise.all(
      Object.keys(values).map((key) =>
        this.deleteSecret(integration.credentials[key as never] as string),
      ),
    );
    await Promise.all(
      Object.keys(values).map((key) =>
        this.createSecret(integration.credentials[key as never], values[key]),
      ),
    );
  }

  private getSecretNames(integrations: IIntegration[]) {
    const secretNames: string[] = [];

    integrations.forEach((integration: IIntegration) => {
      if (
        !integration.credentials ||
        !Object.keys(integration.credentials).length
      ) {
        return;
      }
      secretNames.push(...Object.values(integration.credentials));
    });

    return secretNames;
  }

  async populateCredentials(
    integrations: IIntegration[],
  ): Promise<IIntegration[]> {
    const secretNames = this.getSecretNames(integrations);
    const secrets = await this.fetchSecrets(secretNames);

    const populated = integrations.map((integration: IIntegration) => {
      if (
        !integration.credentials ||
        !Object.keys(integration.credentials).length
      ) {
        return integration;
      }

      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      const newCredentials: any = {};
      const newIntegration = new Integration(integration);
      Object.entries(newIntegration.credentials).forEach(
        ([key, secretName]) => {
          newCredentials[key] = secrets[secretName];
        },
      );
      newIntegration.credentials = newCredentials;
      return newIntegration;
    });

    return populated;
  }

  async deleteCredentials(integrations: IIntegration[]): Promise<void> {
    const secretNames = this.getSecretNames(integrations);

    const deletionPromises = secretNames.map(this.deleteSecret);

    // Wait for all promises to complete
    await Promise.all(deletionPromises);
  }

  deleteSecret = async (secretName: string): Promise<void> => {
    try {
      const poller = await this.client.beginDeleteSecret(secretName);
      await poller.pollUntilDone();
    } catch (error) {
      console.error(`Error deleting secret ${secretName}:`, error);
    }
  };
}


