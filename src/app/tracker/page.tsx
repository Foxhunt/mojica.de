import { Suspense } from "react";

import config from "@payload-config";
import { getPayload } from "payload";
import { User } from "../../../payload-types.ts";

import { authUser } from "./serverActions/userActions.tsx";

import { EventSkeleton } from "./components/Event.tsx";
import Events, { EventsSkeleton } from "./components/Events.tsx";
import MenuBar from "./components/MenuBar.tsx";
import StartEvent, { StartEventSkeleton } from "./components/StartEvent.tsx";

import {
  getLocalTimeZone,
  parseDate,
  Time,
  toCalendarDateTime,
  today,
  toZoned,
} from "@internationalized/date";

export default async function TrackerPage({
  searchParams,
}: {
  searchParams: Promise<{ [key: string]: string | undefined }>;
}) {
  const payload = await getPayload({ config });
  const user = (await authUser()) as User;

  const { start, end } = await searchParams;

  const startOfDay = toZoned(
    toCalendarDateTime(start ? parseDate(start) : today(getLocalTimeZone())),
    getLocalTimeZone()
  ).toDate();

  const endOfDay = toZoned(
    toCalendarDateTime(
      end ? parseDate(end) : today(getLocalTimeZone()),
      new Time(23, 59, 59, 999)
    ),
    getLocalTimeZone()
  ).toDate();

  const pastEvents = payload.find({
    collection: "Events",
    sort: "-updatedAt",
    where: {
      and: [
        {
          createdAt: {
            greater_than_equal: startOfDay,
          },
        },
        {
          createdAt: {
            less_than_equal: endOfDay,
          },
        },
        {
          endedAt: {
            exists: true,
          },
        },
      ],
    },
    pagination: false,
    overrideAccess: user.username === "dummy",
    user,
  });

  const runningEvents = payload.find({
    collection: "Events",
    sort: "-updatedAt",
    where: {
      endedAt: {
        exists: false,
      },
    },
    pagination: false,
    overrideAccess: user.username === "dummy",
    user,
  });

  const eventTypes = payload.find({
    collection: "EventTypes",
    pagination: false,
    overrideAccess: user.username === "dummy",
    user,
  });

  return (
    <>
      <main className="min-h-screen p-4">
        <Suspense fallback={<EventSkeleton withFooter />}>
          <Events eventsPromise={runningEvents} />
        </Suspense>
        <Suspense fallback={<StartEventSkeleton />}>
          <StartEvent eventTypesPromise={eventTypes} />
        </Suspense>
        <Suspense fallback={<EventsSkeleton />}>
          <Events eventsPromise={pastEvents} />
        </Suspense>
      </main>
      {user && <MenuBar user={user} />}
    </>
  );
}
