"use client";

import {
  Autocomplete,
  AutocompleteItem,
  Button,
  Form,
} from "@nextui-org/react";

import { EventType } from "../../../../payload-types.ts";
import { startEvent } from "../serverActions/eventActions.tsx";

type StartEvent = {
  eventTypes: EventType[];
};

export default function StartEvent({ eventTypes }: StartEvent) {
  return (
    <div className="grid grid-cols-1 gap-4 py-4">
      <Form
        className="flex flex-row gap-4"
        validationBehavior="native"
        onSubmit={async (e) => {
          e.preventDefault();
          startEvent(e.currentTarget.elements["name"].value);
        }}
      >
        <Autocomplete
          name="name"
          isRequired
          allowsCustomValue
          aria-label="Event Type"
          placeholder="Event Type"
          errorMessage="Please select or enter an event type"
          defaultItems={eventTypes}
        >
          {(item) => (
            <AutocompleteItem key={item.id}>{item.name}</AutocompleteItem>
          )}
        </Autocomplete>
        <Button type="submit" className="px-6">
          Add and Start
        </Button>
      </Form>
      {eventTypes.slice(0, 5).map((event) => (
        <Button
          key={event.id}
          type="submit"
          onPress={() => {
            startEvent(event.name);
          }}
        >
          {event.name}
        </Button>
      ))}
    </div>
  );
}
