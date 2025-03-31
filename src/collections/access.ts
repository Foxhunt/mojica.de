import { Access, getPayload } from "payload";
import config from "@payload-config";
import { User } from "../../payload-types";

export const belongsToUser: Access = async ({ req: { user } }) => {
  if (user) {
    if (user.collection === "admins") {
      return true;
    } else {
      return {
        user: {
          equals: user.id,
        },
      };
    }
  }

  const payload = await getPayload({ config });
  const dummyUser = await payload.db.findOne<User>({
    collection: "users",
    where: {
      username: { equals: "dummy" },
    },
  });

  return {
    user: {
      equals: dummyUser!.id,
    },
  };
};

export const isAuthenticated: Access = ({ req: { user } }) => {
  return true;
};

export const isAdmin: Access = ({ req: { user } }) => {
  return Boolean(user?.collection === "admins");
};

export const isAdminOrSelf: Access = ({ req: { user } }) => {
  if (user) {
    if (user.collection === "admins") {
      return true;
    } else {
      return {
        id: {
          equals: user.id,
        },
      };
    }
  }

  return false;
};
