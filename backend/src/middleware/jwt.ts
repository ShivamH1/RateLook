import { jwt } from "@elysiajs/jwt";

export const jwtPlugin = jwt({
  name: "jwt",
  secret: "ratelook-super-secret-key-2024",
});
