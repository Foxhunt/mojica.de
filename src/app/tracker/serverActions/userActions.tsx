"use server";

import { headers } from "next/headers";
import { revalidatePath } from "next/cache";

import config from "@payload-config";
import { getPayload } from "payload";

import { User } from "../../../../payload-types";

export async function authUser(): Promise<User> {
  const payload = await getPayload({ config });
  const { user } = await payload.auth({ headers: await headers() });

  if (!user) {
    const dummyUser = await payload.db.findOne<User>({
      collection: "users",
      where: {
        username: { equals: "dummy" },
      },
    });

    delete (dummyUser as User).eventTypes;
    delete (dummyUser as User).events;

    return dummyUser!;
  }

  delete (user as User)?.eventTypes;
  delete (user as User)?.events;

  return user as User;
}

export async function setStopRunningEvents(value: boolean) {
  const payload = await getPayload({ config });
  const user = await authUser();

  await payload.update({
    collection: "users",
    id: user.id,
    data: {
      stopRunningEvents: value,
    },
    overrideAccess: user.username === "dummy",
    user,
  });

  revalidatePath("/tracker");
}
