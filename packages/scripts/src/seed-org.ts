import "varlock/auto-load";
import { createDb } from "@havenly/db";
import {
  categories,
  properties,
  caretakers,
  houses,
  renters,
  payments,
} from "@havenly/db";
import { faker } from "@faker-js/faker";

const db = createDb({ DATABASE_URL: process.env.DATABASE_URL || "" });
const ORG_ID = process.env.ORG_ID || process.env.ORGANIZATION_ID;

if (!ORG_ID) {
  console.error("ORG_ID (or ORGANIZATION_ID) environment variable is required");
  process.exit(1);
}

function isValidUuid(uuid: string) {
  return /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(
    uuid,
  );
}

if (!isValidUuid(ORG_ID)) {
  console.error("ORG_ID must be a valid UUID");
  process.exit(1);
}

async function seed() {
  const orgId = ORG_ID!;

  await db.transaction(async (tx) => {
    // Categories
    const categoryData = Array.from({
      length: faker.number.int({ min: 2, max: 4 }),
    }).map(() => ({
      organizationId: orgId,
      title: faker.word.noun(),
      features: Array.from({
        length: faker.number.int({ min: 2, max: 4 }),
      }).map(() => faker.word.words({ count: 1 })),
      description: faker.lorem.sentence(),
      otherFeatures: { amenities: faker.word.noun() },
    }));
    const insertedCategories = await tx
      .insert(categories)
      .values(categoryData)
      .returning();
    console.log(`Created ${insertedCategories.length} categories`);

    // Caretakers (no auth records)
    const caretakerData = Array.from({
      length: faker.number.int({ min: 1, max: 2 }),
    }).map(() => ({
      name: faker.person.fullName(),
      email: faker.internet.email().toLowerCase(),
      phone: faker.phone.number(),
    }));
    const insertedCaretakers = await tx
      .insert(caretakers)
      .values(caretakerData)
      .returning();
    console.log(`Created ${insertedCaretakers.length} caretakers`);

    // Properties
    const propertyData = Array.from({
      length: faker.number.int({ min: 1, max: 3 }),
    }).map(() => ({
      organizationId: orgId,
      name: faker.company.name(),
      address: faker.location.streetAddress(),
      city: faker.location.city(),
      state: faker.location.state(),
      postalCode: faker.location.zipCode(),
      propertyType: faker.helpers.arrayElement(["Residential", "Commercial"]),
      unitsCount: faker.number.int({ min: 2, max: 6 }),
      caretakerId: faker.helpers.arrayElement(insertedCaretakers).id,
    }));
    const insertedProperties = await tx
      .insert(properties)
      .values(propertyData)
      .returning();
    console.log(`Created ${insertedProperties.length} properties`);

    // Houses
    const allHouses: any[] = [];
    for (const property of insertedProperties) {
      const houseCount = faker.number.int({ min: 1, max: property.unitsCount });
      const houseData = Array.from({ length: houseCount }).map((_, i) => ({
        organizationId: orgId,
        propertyId: property.id,
        categoryId: faker.helpers.arrayElement(insertedCategories).id,
        unitNumber: `U-${(i + 1).toString().padStart(2, "0")}`,
        bedrooms: faker.number.int({ min: 1, max: 3 }),
        bathrooms: faker.helpers.arrayElement(["1", "1.5", "2"]),
        sizeSqft: faker.number.int({ min: 400, max: 1200 }),
        monthlyRent: faker.number.int({ min: 1000000, max: 4000000 }),
        status: faker.helpers.arrayElement(["vacant", "occupied"]),
      }));
      const inserted = await tx.insert(houses).values(houseData).returning();
      allHouses.push(...inserted);
    }
    console.log(`Created ${allHouses.length} houses`);

    // Renters
    const allRenters: any[] = [];
    for (const house of allHouses) {
      if (faker.datatype.boolean({ probability: 0.6 })) {
        const renterData = {
          organizationId: orgId,
          houseId: house.id,
          name: faker.person.fullName(),
          email: faker.internet.email().toLowerCase(),
          phone: faker.phone.number(),
          leaseStart: faker.date.past({ years: 1 }).toISOString(),
          leaseEnd: faker.date.future({ years: 1 }).toISOString(),
        };
        const [inserted] = await tx
          .insert(renters)
          .values(renterData)
          .returning();
        allRenters.push(inserted);
      }
    }
    console.log(`Created ${allRenters.length} renters`);

    // Payments
    const paymentData: any[] = [];
    for (const renter of allRenters.slice(0, Math.min(allRenters.length, 5))) {
      const house = allHouses.find((h) => h.id === renter.houseId);
      if (house) {
        paymentData.push({
          organizationId: orgId,
          houseId: house.id,
          renterId: renter.id,
          amount: house.monthlyRent,
          paymentDate: faker.date.recent(),
          period: faker.date.recent().toISOString().slice(0, 7),
          method: faker.helpers.arrayElement([
            "Bank transfer",
            "MPesa",
            "Cash",
          ]),
          status: faker.helpers.arrayElement(["Paid", "Pending"]),
        });
      }
    }
    if (paymentData.length > 0) {
      const insertedPayments = await tx
        .insert(payments)
        .values(paymentData)
        .returning();
      console.log(`Created ${insertedPayments.length} payments`);
    }
  });
}

seed()
  .then(() => {
    console.log("Seed script completed");
    process.exit(0);
  })
  .catch((error) => {
    console.error("Seed failed:", error);
    process.exit(1);
  });
