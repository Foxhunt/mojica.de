import { Field } from "payload";

import { User } from "../../payload-types";

export const userRelationField: Field = {
  name: "user",
  type: "relationship",
  relationTo: "users",
  defaultValue: async ({ user, req }) => {
    if (user?.collection === "users") {
      return user.id;
    }

    if (!user) {
      const dummyUser = await req.payload.db.findOne<User>({
        collection: "users",
        where: {
          username: { equals: "dummy" },
        },
      });

      return dummyUser!.id;
    }
  },
};
