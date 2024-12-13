"use client";

import {
  Autocomplete,
  AutocompleteItem,
  Button,
  Form,
  Switch,
} from "@nextui-org/react";

import { useState, useTransition } from "react";
import { EventType } from "../../../../payload-types.ts";
import { startEvent } from "../serverActions/eventActions.tsx";

type StartEvent = {
  eventTypes: EventType[];
};

export default function StartEvent({ eventTypes }: StartEvent) {
  const [isPending, startTransition] = useTransition();
  const [stopRunningEvents, setStopRunningEvents] = useState(false);

  return (
    <div className="grid grid-cols-1 gap-4 py-4">
      <Form
        className="gap-4 items-stretch"
        validationBehavior="native"
        onSubmit={(e) => {
          e.preventDefault();
          startTransition(() => {
            startEvent(
              e.currentTarget.elements["name"].value,
              e.currentTarget.elements["stopRunningEvents"].checked
            );
          });
        }}
      >
        <div className="flex gap-4">
          <Autocomplete
            name="name"
            isRequired
            allowsCustomValue
            aria-label="Event Type"
            placeholder="Event Type"
            errorMessage="Please select or enter an event type"
            defaultItems={eventTypes.sort(
              (a, b) => b.usageCount! - a.usageCount!
            )}
          >
            {(item) => (
              <AutocompleteItem key={item.id}>{item.name}</AutocompleteItem>
            )}
          </Autocomplete>
          <Button type="submit" isLoading={isPending}>
            Start
          </Button>
        </div>
        <Switch
          className="self-end"
          name="stopRunningEvents"
          isSelected={stopRunningEvents}
          onValueChange={setStopRunningEvents}
        >
          Stop running Event
        </Switch>
      </Form>
      {eventTypes
        .sort((a, b) => b.usageCount! - a.usageCount!)
        .slice(0, 5)
        .map((event) => (
          <PendableButton
            key={event.id}
            event={event}
            action={(eventName) => startEvent(eventName, stopRunningEvents)}
          />
        ))}
    </div>
  );
}

type PendableButtonProps = {
  event: EventType;
  action: (...args: any[]) => Promise<void>;
};

function PendableButton({ event, action }: PendableButtonProps) {
  const [isPending, startTransition] = useTransition();

  return (
    <Button
      isLoading={isPending}
      onPress={() => {
        startTransition(() => {
          action(event.name);
        });
      }}
    >
      {event.name}
    </Button>
  );
}
