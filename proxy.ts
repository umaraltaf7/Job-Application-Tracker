
import { NextRequest, NextResponse } from "next/server";
import { getSession } from "./lib/auth/auth";

export default async  function proxy(request:NextRequest){
const session = await getSession(request.headers);



const isSignInPage=request.nextUrl.pathname.startsWith("/sign-in");

if(isSignInPage && session?.user){
    return NextResponse.redirect(new URL("/dashboard",request.url));
}
const isSignUpPage=request.nextUrl.pathname.startsWith("/sign-up");

if(isSignUpPage && session?.user){
    return NextResponse.redirect(new URL("/dashboard",request.url));
}

return NextResponse.next();

}

export const config = {
    matcher: ["/sign-in/:path*", "/sign-up/:path*"],
};