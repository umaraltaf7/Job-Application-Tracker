
"use client";

import { signOut } from "@/lib/auth/auth-client";
import { DropdownMenuItem } from "./ui/dropdown-menu";
import { useRouter } from "next/navigation";

export default function SignOutBtn() {
    const router = useRouter();
    return (
         <DropdownMenuItem onClick={async () => {
                        const result=   await signOut();
                        if(result.data){
                           router.push("/sign-in");
                        }else{
                            alert("Failed to log out. Please try again.");
                        }
                        }}>
                            Log Out

                        </DropdownMenuItem>
    );
}