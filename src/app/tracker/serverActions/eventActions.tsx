"use server";

import { revalidatePath } from "next/cache";

import { getPayload } from "payload";
import config from "@payload-config";
import { EventType, User } from "../../../../payload-types.ts";

import { authUser } from "./userActions.tsx";

export async function stopEvent(id: string) {
  const payload = await getPayload({ config });
  const user = await authUser();

  await payload.update({
    collection: "Events",
    id,
    data: {
      endedAt: new Date().toISOString(),
    },
    overrideAccess: user.username === "dummy",
    user,
  });

  revalidatePath("/tracker");
}

export async function startEvent(eventTypeName: string) {
  const payload = await getPayload({ config });
  const user = (await authUser()) as User;

  if (user.stopRunningEvents) {
    const runningEvents = await payload.find({
      collection: "Events",
      sort: "-createdAt",
      where: {
        endedAt: {
          exists: false,
        },
      },
      overrideAccess: user.username === "dummy",
      user,
    });

    const stopEventPromisses = runningEvents.docs.map((event) =>
      stopEvent(event.id)
    );
    await Promise.all(stopEventPromisses);
  }

  const eventType = await payload.find({
    collection: "EventTypes",
    where: { name: { equals: eventTypeName } },
    limit: 1,
    overrideAccess: user.username === "dummy",
    user,
  });

  let newEventType: EventType;

  if (eventType.docs.length === 0) {
    newEventType = await createEventType(eventTypeName);
  } else {
    await payload.update({
      collection: "EventTypes",
      where: { name: { equals: eventTypeName } },
      data: {
        lastUsedAt: new Date().toISOString(),
      },
      overrideAccess: user.username === "dummy",
      user,
    });
  }

  await payload.create({
    collection: "Events",
    data: {
      type: eventType.docs[0] ?? newEventType!,
    },
    overrideAccess: user.username === "dummy",
    user,
  });

  revalidatePath("/tracker");
}

export async function createEventType(name: string) {
  const payload = await getPayload({ config });
  const user = await authUser();

  const newEventType = await payload.create({
    collection: "EventTypes",
    data: {
      name: name.trim(),
    },
    overrideAccess: user.username === "dummy",
    user,
  });

  revalidatePath("/tracker");

  return newEventType;
}
