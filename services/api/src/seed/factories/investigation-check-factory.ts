import { IInvestigationCheck, IInvestigation } from "@aster/db";
import mongoose from "mongoose";

/**
 * Configuration for creating a seed investigation check.
 * This interface allows flexibility in what can be configured
 * while the factory ensures all required IInvestigationCheck fields are present.
 */
export interface SeedInvestigationCheckConfig {
  _id: mongoose.Types.ObjectId;
  investigation: IInvestigation;
  source: "github" | "grafana" | "datadog" | "sentry";
  action: object;
  result: object;
}

/**
 * Creates a type-safe investigation check object for seeding.
 *
 * The return type ensures that ALL required fields from the IInvestigationCheck interface
 * are present. If the IInvestigationCheck schema changes to add new required fields, TypeScript
 * will error here, forcing us to update the seed data.
 *
 * @param config - Configuration for the investigation check seed data
 * @returns Complete IInvestigationCheck object ready for database insertion
 */
export function createSeedInvestigationCheck(
  config: SeedInvestigationCheckConfig,
): IInvestigationCheck {
  return {
    _id: config._id,
    investigation: config.investigation,
    source: config.source,
    action: config.action,
    result: config.result,
    createdAt: new Date(),
    updatedAt: new Date(),
  };
}

/**
 * Preset configurations for investigation checks.
 * These can be used across different seed files for consistency.
 */
export const SEED_INVESTIGATION_CHECK_PRESETS = {
  githubCheck: {
    _id: new mongoose.Types.ObjectId("000000000000000000000001"),
    source: "github" as const,
    action: {
      request:
        "PaymentService 500 error in charge.js processing logic, focusing on 'Payment charge failed' errors and transaction handling",
      files: [
        {
          filename: "demo.ts",
          file_path: "src/react-native-app/protos/demo.ts",
          repo_path: "asteroncall/opentelemetry-demo",
          url: "https://github.com/asteroncall/opentelemetry-demo/blob/4cd79258754881d11a39bbb2a831d5bf098cee97/src/react-native-app/protos/demo.ts",
          text: ': Partial<ClientOptions>): CurrencyServiceClient;\n  service: typeof CurrencyServiceService;\n  serviceName: string;\n};\n\nexport type PaymentServiceService = typeof PaymentServiceService;\nexport const PaymentServiceService = {\n  charge: {\n    path: "/oteldemo.PaymentService/Charge",\n    requestStream: false,\n    responseStream: false,\n    requestSerialize: (value: ChargeRequest) => Buffer.from(ChargeRequest.encode(value).finish()),\n    requestDeserialize: (value: Buffer) => ChargeRequest.decode(value),\n    responseSerialize: (value: ChargeResponse) => Buffer.from(ChargeResponse.encode(value).finish()),\n    responseDeserialize: (value: Buffer) => ChargeResponse.decode(value),\n  },\n} as const;\n\nexport interface PaymentServiceServer extends UntypedServiceImplementation {\n  charge: handleUnaryCall<ChargeRequest, ChargeResponse>;\n}\n\nexport interface PaymentServiceClient extends Client {\n  charge(\n    request: ChargeRequest,\n    callback: (error: ServiceError | null, response: ChargeResponse) => void,\n  ): ClientUnaryCall;\n  charge(\n    request: ChargeRequest,\n    metadata: Metadata,\n    callback: (error: ServiceError | null, response: ChargeResponse) => void,\n  ): ClientUnaryCall;\n  charge(\n    request: ChargeRequest,\n    metadata: Metadata,\n    options: Partial<CallOptions>,\n    callback: (error: ServiceError | null, response: ChargeResponse) => void,\n  ): ClientUnaryCall;\n}\n\nexport const PaymentServiceClient = makeGenericClientConstructor(\n  PaymentServiceService,\n  "oteldemo.PaymentService",\n) as unknown as {\n  new (address: string, credentials: ChannelCredentials, options?: Partial<ClientOptions>): PaymentServiceClient;\n  service: typeof PaymentServiceService;\n  serviceName: string;\n};\n\nexport type EmailServiceService = typeof EmailServiceService;\nexport const EmailServiceService = {\n  sendOrderConfirmation: {\n    path: "/oteldemo.EmailService/SendOrderConfirmation",\n    requestStream: false,\n    responseStream: false,\n    requestSerialize: (value: SendOrderConfirmationRequest) =>\n      Buffer.from(SendOrderConfirmationRequest.encode(value).finish()),\n    requestDeserialize: (value: Buffer) => SendOrderConfirmationRequest.decode(value),\n    responseSerialize: (value: Empty) => Buffer.from(Empty.encode(value).finish()),\n    responseDeserialize: (value: Buffer) => Empty.decode(value),\n  },\n} as const;\n\nexport interface EmailServiceServer extends UntypedServiceImplementation {\n  sendOrderConfirmation: handleUnaryCall<SendOrderConfirmationRequest, Empty>;\n}\n\nexport interface EmailServiceClient extends Client {\n  sendOrderConfirmation(\n    request: SendOrderConfirmationRequest,\n    callback: (error: ServiceError | null, response: Empty) => void,\n  ): ClientUnaryCall;\n  sendOrderConfirmation(\n    request: SendOrderConfirmationRequest,\n    metadata: Metadata,\n    callback: (error: ServiceError | null, response: Empty) => void,\n  ): ClientUnaryCall;\n  sendOrderConfirmation(\n    request: SendOrderConfirmationRequest,\n    metadata: Metadata,\n    options: Partial<CallOptions>,\n    callback: (error: ServiceError | null, response: Empty) => void,\n  ): ClientUnaryCall;\n}\n\nexport const EmailServiceClient = makeGenericClientConstructor(\n  EmailServiceService,\n  "oteldemo.EmailService",\n) as unknown as {\n  new (address: string, credentials: ChannelCredentials, options?',
        },
        {
          filename: "index.js",
          file_path: "src/payment/index.js",
          repo_path: "asteroncall/opentelemetry-demo",
          url: "https://github.com/asteroncall/opentelemetry-demo/blob/4cd79258754881d11a39bbb2a831d5bf098cee97/src/payment/index.js",
          text: "const Sentry = require(\"@sentry/node\");\n\nSentry.init({\n  dsn: \"https://3a925781d204b889d2ace7b5a2b2d857@o528967.ingest.us.sentry.io/4510106974289920\",\n  // Setting this option to true will send default PII data to Sentry.\n  // For example, automatic IP address collection on events\n  sendDefaultPii: true,\n});\n\n// Copyright The OpenTelemetry Authors\n// SPDX-License-Identifier: Apache-2.0\nconst grpc = require('@grpc/grpc-js')\nconst protoLoader = require('@grpc/proto-loader')\nconst health = require('grpc-js-health-check')\nconst opentelemetry = require('@opentelemetry/api')\n\nconst charge = require('./charge')\nconst logger = require('./logger')\n\nasync function chargeServiceHandler(call, callback) {\n  const span = opentelemetry.trace.getActiveSpan();\n\n  try {\n    const amount = call.request.amount\n    span.setAttributes({\n      'app.payment.amount': parseFloat(`${amount.units}.${amount.nanos}`).toFixed(2)\n    })\n    logger.info({ request: call.request }, \"Charge request received.\")\n\n    const response = await charge.charge(call.request)\n    callback(null, response)\n\n  } catch (err) {\n    logger.warn({ err })\n\n    span.recordException(err)\n    span.setStatus({ code: opentelemetry.SpanStatusCode.ERROR })\n\n    callback(err)\n  }\n}\n\nasync function closeGracefully(signal) {\n  server.forceShutdown()\n  process.kill(process.pid, signal)\n}\n\nconst otelDemoPackage = grpc.loadPackageDefinition(protoLoader.loadSync('demo.proto'))\nconst server = new grpc.Server()\n\nserver.addService(health.service, new health.Implementation({\n  '': health.servingStatus.SERVING\n}))\n\nserver.addService(otelDemoPackage.oteldemo.PaymentService.service, { charge: chargeServiceHandler })\n\nserver.bindAsync(`0.0.0.0:${process.env['PAYMENT_PORT']}`, grpc.ServerCredentials.createInsecure(), (err, port) => {\n  if (err) {\n    return logger.error({ err })\n  }\n\n  logger.info(`payment gRPC server started on port ${port}`)\n})\n\nprocess.once('SIGINT', closeGracefully)\nprocess.once('SIGTERM', closeGracefully)",
        },
        {
          filename: "charge.js",
          file_path: "src/payment/charge.js",
          repo_path: "asteroncall/opentelemetry-demo",
          url: "https://github.com/asteroncall/opentelemetry-demo/blob/4cd79258754881d11a39bbb2a831d5bf098cee97/src/payment/charge.js",
          text: "const Sentry = require('@sentry/node');\n\n// Copyright The OpenTelemetry Authors\n// SPDX-License-Identifier: Apache-2.0\nconst { context, propagation, trace, metrics } = require('@opentelemetry/api');\nconst cardValidator = require('simple-card-validator');\nconst { v4: uuidv4 } = require('uuid');\n\nconst { OpenFeature } = require('@openfeature/server-sdk');\nconst { FlagdProvider } = require('@openfeature/flagd-provider');\nconst flagProvider = new FlagdProvider();\n\nconst logger = require('./logger');\nconst tracer = trace.getTracer('payment');\nconst meter = metrics.getMeter('payment');\nconst transactionsCounter = meter.createCounter('app.payment.transactions');\n\nconst LOYALTY_LEVEL = ['platinum', 'gold', 'silver', 'bronze'];\n\n/** Return random element from given array */\nfunction random(arr) {\n  const index = Math.floor(Math.random() * arr.length);\n  return arr[index];\n}\n\nmodule.exports.charge = async request => {\n  const span = tracer.startSpan('charge');\n\n  await OpenFeature.setProviderAndWait(flagProvider);\n\n  const {\n    creditCardNumber: number,\n  } = request.creditCard;\n  const lastFourDigits = number.substr(-4);\n  const transactionId = uuidv4();\n\n  const card = cardValidator(number);\n  const { card_type: cardType, valid } = card.getCardDetails();\n\n  const loyalty_level = random(LOYALTY_LEVEL);\n\n  span.setAttributes({\n    'app.payment.card_type': cardType,\n    'app.payment.card_valid': valid,\n    'app.loyalty.level': loyalty_level\n  });\n\n  try {\n    // Get stripe API URL and key from environment variables\n    const STRIPE_URI = process.env.STRIPE_URL\n    const STRIPE_KEY = process.env.STRIPE_API_KEY\n\n    // Call stripe API to charge the credit card and do the payment transaction\n    await fetch(STRIPE_URI, {\n      method: 'POST',\n      headers: {\n        'Content-Type': 'application/json',\n        'Authorization': `Bearer ${STRIPE_KEY}`\n      },\n      body: JSON.stringify({\n        amount: request.amount,\n        currency: request.currency,\n        source: request.creditCard\n      })\n    });\n\n    const { units, nanos, currencyCode } = request.amount;\n    logger.info({ transactionId, cardType, lastFourDigits, amount: { units, nanos, currencyCode }, loyalty_level }, 'Transaction complete.');\n    transactionsCounter.add(1, { 'app.payment.currency': currencyCode });\n    span.end();\n  } catch (error) {\n    const errorTitle = error?.message || error?.name || 'Unknown Error';\n    Sentry.captureException(error);\n    logger.error({ error }, errorTitle);\n    transactionsCounter.add(1, { 'app.payment.failure': errorTitle })\n    span.end();\n    throw new Error(`Payment request failed: ${error}`);\n  }\n\n\n\n  return { transactionId };\n};",
        },
      ],
      diffs: {
        "asteroncall/opentelemetry-demo": [
          {
            sha: "1689a9ff6417512c1c6518d6a9cbe445db4ac714",
            author: "tanvir362",
            date: "2025-10-09T11:39:29Z",
            diff: "@@ -1,3 +1,5 @@\n+const Sentry = require('@sentry/node');\n+\n // Copyright The OpenTelemetry Authors\n // SPDX-License-Identifier: Apache-2.0\n const { context, propagation, trace, metrics } = require('@opentelemetry/api');\n@@ -67,8 +69,10 @@ module.exports.charge = async request => {\n     transactionsCounter.add(1, { 'app.payment.currency': currencyCode });\n     span.end();\n   } catch (error) {\n-    logger.error({ error }, 'Payment charge failed');\n-    transactionsCounter.add(1, { 'app.payment.failure': 'Payment charge failed' })\n+    const errorTitle = error?.message || error?.name || 'Unknown Error';\n+    Sentry.captureException(error);\n+    logger.error({ error }, errorTitle);\n+    transactionsCounter.add(1, { 'app.payment.failure': errorTitle })\n     span.end();\n     throw new Error(`Payment request failed: ${error}`);\n   }",
          },
          {
            sha: "8b69887c9b04e519e013c2baad87a70209d37396",
            author: "moshfiqrony",
            date: "2025-06-29T15:24:37Z",
            diff: "@@ -67,6 +67,7 @@ module.exports.charge = async request => {\n     transactionsCounter.add(1, { 'app.payment.currency': currencyCode });\n     span.end();\n   } catch (error) {\n+    logger.error({ error }, 'Payment charge failed');\n     transactionsCounter.add(1, { 'app.payment.failure': 'Payment charge failed' })\n     span.end();\n     throw new Error(`Payment request failed: ${error}`);",
          },
          {
            sha: "9237f86a5b8cafa96cbdd59824529536de515d2c",
            author: "moshfiqrony",
            date: "2025-03-25T05:37:19Z",
            diff: "@@ -45,7 +45,7 @@ module.exports.charge = async request => {\n \n   try {\n     // Get stripe API URL and key from environment variables\n-    const STRIPE_URI = process.env.STRIPE_API_URL\n+    const STRIPE_URI = process.env.STRIPE_URL\n     const STRIPE_KEY = process.env.STRIPE_API_KEY\n \n     // Call stripe API to charge the credit card and do the payment transaction",
          },
        ],
      },
    },
    result: {
      summary:
        'A semantic search tool was used to look for code related to "PaymentService 500 error in charge.js," focusing on errors like "Payment charge failed" and how transactions are handled. The tool found that when a payment fails—often due to issues with the Stripe payment system—the error is logged, tracked, and reported by the system. This matters because it shows that payment failures are being properly recorded, which is crucial for understanding and fixing the transaction errors users are experiencing.',
      explanation:
        'This data is about how the PaymentService handles charging payments, especially when there are errors like "Payment charge failed" and 500 errors. The code shows that when a payment is processed, it tries to charge the card using an outside service (Stripe). If something goes wrong—like a problem with the Stripe API or the card—the system logs the error, records it for monitoring, and then returns a failure. This is important because it helps explain why users might see payment failures, and it shows that errors are being tracked and reported, which is key for investigating and fixing these issues.',
    },
  },
  grafanaCheck: {
    _id: new mongoose.Types.ObjectId("000000000000000000000002"),
    source: "grafana" as const,
    action: {
      request:
        "Show recent logs for payment service transaction errors, focusing on 'charge failed' events and any stack traces or error details.",
      query: "increase(app_payment_transactions_total[24h])",
      url: "http://localhost:8080/grafana/api/datasources/proxy/1/api/v1/query?query=increase(app_payment_transactions_total[24h])",
    },
    result: {
      summary:
        'Grafana logs were checked to find out how many payment transactions failed in the last 24 hours, specifically looking for "charge failed" errors. The logs show 68 failed payments, but no extra details were given about why they failed. Knowing this helps figure out if customers are running into payment issues, which is important for fixing any problems with the payment system.',
      explanation:
        'The data shows that in the last 24 hours, there were 68 payment transactions that did not go through because of a "Payment charge failed" error in the payment system. No extra details or error messages are available in the logs, so it\'s not clear why these payments failed. This information helps track how often payment problems happen, which is important for understanding if customers are having trouble paying.',
    },
  },
};
