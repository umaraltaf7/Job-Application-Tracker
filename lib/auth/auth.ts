
import {MongoClient} from "mongodb";
import { betterAuth } from "better-auth";
import { mongodbAdapter } from "better-auth/adapters/mongodb";
import { headers } from "next/headers";
import { redirect } from "next/navigation";
import { initializeUserBoard } from "../init.user.board";

const developmentOrigins = [
  "http://localhost:3000",
  "http://192.168.0.105:3000",
];

const client = new MongoClient(process.env.MONGODB_URI!);
const db = client.db();
export const auth = betterAuth({
  baseURL:
    process.env.NODE_ENV === "development"
      ? {
          allowedHosts: ["localhost:3000", "192.168.0.105:3000"],
          protocol: "http",
        }
      : process.env.BETTER_AUTH_URL,
  trustedOrigins:
    process.env.NODE_ENV === "development" ? developmentOrigins : undefined,
  database: mongodbAdapter(db,{
    client,
  }),
  session:{
    cookieCache:{
      enabled: true,
      maxAge: 60 * 60 ,
    }
  },

  emailAndPassword: {
    enabled: true,

  },
  databaseHooks: {
    user:{
      create:{
        after: async (user) => {
          if(user.id){
            await initializeUserBoard(user.id);
          }
        }
      }
    }
  }

});

export async function getSession(requestHeaders?: Headers){
  const result = await auth.api.getSession({
    headers: requestHeaders ?? await headers()
  })
  return result;
}

export async function signOut() {
  const result = await auth.api.signOut({
    headers:await headers()
  });

  if(result.success) {

    redirect("/sign-in");
  } 
} 
