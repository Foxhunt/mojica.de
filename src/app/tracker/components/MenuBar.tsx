"use client";

import { useCallback } from "react";

import { usePathname, useRouter, useSearchParams } from "next/navigation";

import { User } from "../../../../payload-types";

import {
  Button,
  DateRangePicker,
  Drawer,
  DrawerBody,
  DrawerContent,
  DrawerFooter,
  DrawerHeader,
  RangeValue,
  Switch,
  useDisclosure,
} from "@nextui-org/react";

import {
  CalendarDate,
  getLocalTimeZone,
  parseDate,
  today,
} from "@internationalized/date";

import { LogOut, Menu, LogIn } from "react-feather";

import { setStopRunningEvents } from "../serverActions/userActions";

type MenuBarProps = {
  user: User;
};

export default function MenuBar({ user }: MenuBarProps) {
  const { isOpen, onOpen, onClose, onOpenChange } = useDisclosure();

  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();

  const createQueryString = useCallback(
    (newParams: RangeValue<CalendarDate>) => {
      const params = new URLSearchParams(searchParams?.toString());

      for (const [key, value] of Object.entries(newParams))
        params.set(key, value);

      return params.toString();
    },
    [searchParams]
  );

  return (
    <footer className="sticky bottom-0 z-20 p-4 bg-black bg-opacity-30 backdrop-blur-xl flex gap-4 place-items-center rounded-t-large">
      <DateRangePicker
        aria-label="Date Range"
        disableAnimation
        labelPlacement="inside"
        key={searchParams?.toString()}
        defaultValue={{
          start: searchParams?.has("start")
            ? parseDate(searchParams?.get("start")!)
            : today(getLocalTimeZone()),
          end: searchParams?.has("end")
            ? parseDate(searchParams?.get("end")!)
            : today(getLocalTimeZone()),
        }}
        onChange={(value) => {
          if (value) {
            router.replace(pathname + "?" + createQueryString(value));
          }
        }}
      />
      <Button onPress={onOpen} isIconOnly>
        <Menu />
      </Button>
      <Drawer
        isOpen={isOpen}
        onOpenChange={onOpenChange}
        placement="bottom"
        size="xs"
      >
        <DrawerContent>
          <DrawerHeader className="place-content-between place-items-center pr-8">
            Tracker
            <Button
              isIconOnly
              onPress={async () => {
                await fetch(window.location.origin + "/api/users/logout", {
                  method: "POST",
                });

                router.replace("/tracker/login");
              }}
            >
              {user.username === "dummy" ? <LogIn /> : <LogOut />}
            </Button>
          </DrawerHeader>
          <DrawerBody>
            <Button
              onPress={() => {
                router.replace(
                  pathname +
                    "?" +
                    createQueryString({
                      start: today(getLocalTimeZone()),
                      end: today(getLocalTimeZone()),
                    })
                );
                onClose();
              }}
            >
              Reset to Todays Events
            </Button>
          </DrawerBody>
          <DrawerFooter>
            <Switch
              defaultSelected={Boolean(user.stopRunningEvents)}
              onValueChange={setStopRunningEvents}
            >
              Stop running Event
            </Switch>
          </DrawerFooter>
        </DrawerContent>
      </Drawer>
    </footer>
  );
}
