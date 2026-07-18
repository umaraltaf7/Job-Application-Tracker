
import ImageTabs from "@/components/image-tab";
import { Button } from "@/components/ui/button";
import { ArrowRight } from "lucide-react";
import Link from "next/link";
import { Bell, Briefcase, Tag } from "lucide-react";

export default function Home() {
  
  return (
    <div className="flex min-h-screen flex-col bg-gradient-to-br from-white via-blue-50 to-slate-100 dark:from-black dark:via-gray-950 dark:to-gray-900">
      
      <main className="flex flex-1 items-center justify-center px-6 py-20">
        
        <section className="max-w-4xl w-full">
          
          <div className="rounded-3xl bg-white/80 dark:bg-gray-900/80 backdrop-blur-md shadow-2xl border border-gray-200 dark:border-gray-800 p-10 md:p-16 text-center">
            
            <h1 className="text-4xl md:text-6xl font-bold leading-tight text-gray-900 dark:text-white">
              A better way to track your{" "}
              <span className="text-blue-600 dark:text-blue-400">
                job applications
              </span>
            </h1>

            <p className="mt-6 text-lg leading-8 text-gray-600 dark:text-gray-400 max-w-3xl mx-auto">
              Job Application Tracker is a simple and easy to use tool to help
              you keep track of your job applications. With Job Application
              Tracker, you can easily add your job applications, track their
              status, and set reminders for follow-ups.
            </p>
            <Link href="/sign-up">
            <Button className="mt-8 px-8 py-4 bg-blue-600 text-white font-semibold rounded-2xl shadow-lg hover:bg-blue-700 hover:scale-105 transition duration-300">
              Get Started <ArrowRight className="ml-2" />
            </Button>
            </Link>

            <p className="mt-8 text-base leading-7 text-gray-500 dark:text-gray-400 max-w-3xl mx-auto">
              Job Application Tracker is free to use and will always be free.
              We believe that everyone should have access to a tool that helps
              them keep track of their job applications.
            </p>

          </div>
        </section>
        
      </main>
      <ImageTabs />
      {/* feature section */}
      <section className="py-20 bg-gray-100 dark:bg-gray-900">
        <div className="container mx-auto px-4">
          <h2 className="text-3xl font-bold text-center text-gray-900 dark:text-white">
            Features
          </h2>
          <p className="mt-4 text-lg text-center text-gray-600 dark:text-gray-400">
            Job Application Tracker comes with all the features you need to manage your job applications effectively.
          </p>
        </div>
        <div className="container mx-auto px-4 mt-10 grid grid-cols-1 md:grid-cols-3 gap-8">
          <div className="bg-white dark:bg-gray-800 rounded-lg shadow-lg p-6 text-center">
            <h3 className="text-xl font-semibold text-gray-900 dark:text-white mb-4"><Briefcase className="inline mr-2" />Track Applications</h3>
            <p className="text-gray-600 dark:text-gray-400">Easily add and track the status of your job applications in one place.</p>
          </div>
          <div className="bg-white dark:bg-gray-800 rounded-lg shadow-lg p-6 text-center">
            <h3 className="text-xl font-semibold text-gray-900 dark:text-white mb-4"><Bell className="inline mr-2" />Set Reminders</h3>
            <p className="text-gray-600 dark:text-gray-400">Never miss a follow-up with customizable reminders for each application.</p>
          </div>
          <div className="bg-white dark:bg-gray-800 rounded-lg shadow-lg p-6 text-center">
            <h3 className="text-xl font-semibold text-gray-900 dark:text-white mb-4"><Tag className="inline mr-2" />Organize with Tags</h3>
            <p className="text-gray-600 dark:text-gray-400">Use tags to categorize your applications by company, role, or status.</p>
          </div>
        </div>
      </section>

    </div>
  );
}