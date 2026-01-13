const { VendorName } = require("..");
const { runMigration } = require("./base");

async function up(db) {
  console.log("Starting migration: addHtmlUrlForJSMDetails");
  let updateCount = 0;
  let totalCount = 0;

  const investigations = await db
    .collection("investigations")
    .find({
      jsmDetails: { $exists: true },
    })
    .toArray();

  for (const investigation of investigations) {
    totalCount++;
    const jsmDetails = investigation.jsmDetails;

    const organization = await db.collection("organizations").findOne({
      _id: investigation.organization,
    });

    if (!organization) {
      console.log(
        `Organization not found for investigation ${investigation._id}`,
      );
      continue;
    }

    const vendor = await db.collection("vendors").findOne({
      name: VendorName.JiraServiceManagement,
    });

    if (!vendor) {
      console.log(`Vendor not found for organization ${organization.name}`);
      continue;
    }

    const jsmIntegration = await db.collection("integrations").findOne({
      organization: organization._id,
      vendor: vendor._id,
    });

    if (!jsmIntegration) {
      console.log(
        `Jira Service Management integration not found for organization ${organization.name}`,
      );
      continue;
    }

    if (!jsmDetails?.id) {
      console.log(
        `Jira Service Management incident ID not found for investigation ${investigation._id}`,
      );
      continue;
    }

    if (!jsmIntegration.metadata?.siteUrl) {
      console.log(
        `Jira Service Management site URL not found for organization ${organization.name}`,
      );
      continue;
    }

    const _jsmDetails = {
      ...jsmDetails,
      asterAdded: {
        ...(jsmDetails?.asterAdded || {}),
        htmlUrl: `https://${jsmIntegration.metadata.siteUrl}/jira/ops/alerts/${jsmDetails.id}`,
      },
    };

    await db
      .collection("investigations")
      .updateOne(
        { _id: investigation._id },
        { $set: { jsmDetails: _jsmDetails } },
      );

    updateCount++;
  }

  console.log(`Total investigations: ${totalCount}`);
  console.log(`Updated ${updateCount} investigations`);
}

async function down(db) {
  console.log("Starting rollback: addHtmlUrlForJSMDetails");
  let updateCount = 0;
  let totalCount = 0;

  const investigations = await db
    .collection("investigations")
    .find({
      "jsmDetails.asterAdded.htmlUrl": { $exists: true },
    })
    .toArray();

  for (const investigation of investigations) {
    totalCount++;

    await db
      .collection("investigations")
      .updateOne(
        { _id: investigation._id },
        { $unset: { "jsmDetails.asterAdded.htmlUrl": "" } },
      );

    updateCount++;
  }

  console.log(`Total investigations: ${totalCount}`);
  console.log(`Rolled back ${updateCount} investigations`);
}

runMigration(up, down)
  .then(() => {
    console.log("Migration completed!");
    process.exit(0);
  })
  .catch((error) => {
    console.error("Migration failed!", error);
    process.exit(1);
  });
