"use client";

import { Briefcase } from "lucide-react";
import Link from "next/link";
import { Button } from "./ui/button";
import { getSession } from "@/lib/auth/auth";
import { DropdownMenu, DropdownMenuItem, DropdownMenuContent,  DropdownMenuLabel, DropdownMenuTrigger } from "./ui/dropdown-menu";
import { Avatar, AvatarFallback } from "./ui/avatar";
import { signOut } from "@/lib/auth/auth";
import SignOutBtn from "./sign-out-btn";
import { useSession } from "@/lib/auth/auth-client";


export default  function Navbar() {
   const{data:session}=useSession();

    return (
        <nav className="bg-white dark:bg-gray-800 shadow-md py-4 px-6">  
           < div className="max-w-7xl mx-auto flex items-center justify-between">
            <Link href="/" className="flex items-center space-x-2 text-xl font-bold text-gray-700 dark:text-gray-200">
            <Briefcase className="w-6 h-6" />
            Job Tracker
            </Link>
            <div className="space-x-4">
                {session?.user?(<>
                <Link href="/dashboard" className="text-gray-700 dark:text-gray-200 hover:text-gray-900 dark:hover:text-white transition duration-300">
                    <Button variant="ghost">Dashboard</Button>
                </Link>
                
                <DropdownMenu >
                    <DropdownMenuTrigger asChild>
                        <Button variant="ghost" className="rounded-full p-0">
                            <Avatar>
                                <AvatarFallback className="bg-primary text-white">
                                    {session.user.name?.charAt(0).toUpperCase() || "U"}
                                </AvatarFallback>
                                </Avatar>

                                </Button>
                        
                    </DropdownMenuTrigger>
                    <DropdownMenuContent className="w-50">
                        <DropdownMenuLabel>
                            <div>
                                <p className="text-sm font-medium">{session.user.name}</p>
                                <p className="text-xs text-muted-foreground">{session.user.email}</p>
                            </div>
                        </DropdownMenuLabel>
                       <SignOutBtn />
                        </DropdownMenuContent>
                </DropdownMenu>
                </>): 
                
               ( <>
                <Link href="/sign-in" className="text-gray-700 dark:text-gray-200 hover:text-gray-900 dark:hover:text-white transition duration-300">
                    <Button>Log In</Button>
                </Link>

                <Link href="/sign-up" className="text-gray-700 dark:text-gray-200 hover:text-gray-900 dark:hover:text-white transition duration-300">
                    <Button>Start For Free</Button>
                </Link>
                </>)}

                </div>
            </div>
        </nav>
    );
}
    