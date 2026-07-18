
"use client";

import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useState } from "react";
import { signUp } from "@/lib/auth/auth-client";
import { useRouter } from "next/navigation";



export default function SignUp() {
    const[name, setName] = useState("");
    const[email, setEmail] = useState("");
    const[password, setPassword] = useState("");

    const[error, setError] = useState("");
    const[loading, setLoading] = useState(false);

    
    const router=useRouter();

    async function handleSubmit(e: React.FormEvent) {
        e.preventDefault();
        setError("");
        setLoading(true);

        try {
           const result = await signUp.email({
                name,
                email,
                password,
            });

            if(result.error) {
                setError(result.error.message || "Failed to create an account. Please try again.");
            } else {
                router.push("/dashboard");
            }

        }catch (err) {
            setError("Failed to create an account. Please try again.");
        }finally {
            setLoading(false);
        }

    }




    return (
        <div className="flex min-h-[calc(100vh-4rem)] items-center justify-center bg-white p-4">
           <Card className="w-full max-w-md">
            <CardHeader className="space-y-1">
                <CardTitle className="text-2xl ">Sign Up</CardTitle>
              <CardDescription className="text-sm text-muted-foreground">
                Create an account to get started.
              </CardDescription>
            </CardHeader>
            <form className="grid gap-6" onSubmit={handleSubmit}>
                {error && <p className="text-sm text-red-500">{error}</p>}
                <CardContent className="space-y-4 ">
                    <div className="space-y-2">
                        <Label htmlFor="name" className="text-sm font-medium leading-none">
                            Name
                        </Label>
                        <Input id="name" type="text" placeholder="Enter your name" required  className="text-sm" value={name} onChange={(e) => setName(e.target.value)}/>
                        
                    </div>
                    <div className="space-y-2">
                        <Label htmlFor="email" className="text-sm font-medium leading-none">
                            Email
                        </Label>
                        <Input id="email" type="email" placeholder="Enter your email" required className="text-sm" value={email} onChange={(e) => setEmail(e.target.value)}/>
                    </div>
                    <div className="space-y-2">
                        <Label htmlFor="password" className="text-sm font-medium leading-none">
                            Password
                        </Label>
                        <Input id="password" type="password" placeholder="Enter your password" required minLength={8} className="text-sm" value={password} onChange={(e) => setPassword(e.target.value)}/>
                    </div>
                    </CardContent>
                    <CardFooter className="flex flex-col items-center space-y-4">
                        <Button disabled={loading} type="submit">
                            {loading ? "Creating Account..." : "Sign Up"}
                        </Button>
                        <p className="text-sm text-muted-foreground">
                            Already have an account? <a href="/sign-in" className="text-primary">Sign In</a>
                        </p>
                    </CardFooter>
            </form>
            </Card> 
            
        </div>
    );
}
