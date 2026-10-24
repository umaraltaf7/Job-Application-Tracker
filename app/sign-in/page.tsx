
"use client";

import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { signIn } from "@/lib/auth/auth-client";

import { useRouter } from "next/navigation";
import { useState } from "react";

export default function SignIn() {

    
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
               const result = await signIn.email({
                
                    email,
                    password,
                });
    
                if(result.error) {
                    setError(result.error.message || "Failed to sign in.");
                } else {
                    router.push("/dashboard");
                }
    
            }catch {
                setError("Failed to sign in. Please try again.");
            }finally {
                setLoading(false);
            }
    
        }
    
    
    
    return (
        <div className="flex min-h-[calc(100vh-4rem)] items-center justify-center bg-white p-4">
           <Card className="w-full max-w-md">
            <CardHeader className="space-y-1">
                <CardTitle className="text-2xl ">Sign In</CardTitle>
              <CardDescription className="text-sm text-muted-foreground">
                Sign in to your account.
              </CardDescription>
            </CardHeader>
            <form className="grid gap-6" onSubmit={handleSubmit}>
                <CardContent className="space-y-4 ">
                    {error && <p className="text-sm text-red-500">{error}</p>}
                    
                    <div className="space-y-2">
                        <Label htmlFor="email" className="text-sm font-medium leading-none">
                            Email
                        </Label>
                        <Input id="email" type="email" placeholder="Enter your email" required className="text-sm" value={email} onChange={(e) => setEmail(e.target.value)} />
                    </div>
                    <div className="space-y-2">
                        <Label htmlFor="password" className="text-sm font-medium leading-none">
                            Password
                        </Label>
                        <Input id="password" type="password" placeholder="Enter your password" required minLength={8} className="text-sm" value={password} onChange={(e) => setPassword(e.target.value)} />
                    </div>
                    </CardContent>
                    <CardFooter className="flex flex-col items-center space-y-4">
                        <Button type="submit" disabled={loading}>
                            {loading ? "Signing In..." : "Sign In"}
                        </Button>
                        <p className="text-sm text-muted-foreground">
                            Don&apos;t have an account? <a href="/sign-up" className="text-primary">Sign Up</a>
                        </p>
                    </CardFooter>
            </form>
            </Card> 
            
        </div>
    );
}
