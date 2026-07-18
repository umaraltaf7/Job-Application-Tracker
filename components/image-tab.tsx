"use client"

import { useState } from "react";
import { Button } from "./ui/button"
import Image from "next/image";

export default function ImageTabs(){
    const[activeTab, setActiveTab] = useState("organize");
    return(
<section>
          {/* You can add an image or illustration here */}
          <div className="container mx-auto px-4">
            <div className="mx-auto max-w-6xl">
              <div className="flex gap-6 justify-center b-12 mb-6">
                <Button onClick={()=>setActiveTab("organize")} className={activeTab==="organize" ? "bg-blue-600 text-white" : "bg-transparent text-gray-600 dark:text-gray-400 hover:bg-gray-200 dark:hover:bg-gray-800"}>Organize Your Applications</Button>
                <Button onClick={()=>setActiveTab("hired")} className={activeTab==="hired" ? "bg-blue-600 text-white" : "bg-transparent text-gray-600 dark:text-gray-400 hover:bg-gray-200 dark:hover:bg-gray-800"}>Get Hired Faster</Button>
                <Button onClick={()=>setActiveTab("manage")} className={activeTab==="manage" ? "bg-blue-600 text-white" : "bg-transparent text-gray-600 dark:text-gray-400 hover:bg-gray-200 dark:hover:bg-gray-800"}>Manage Boards</Button>
              </div>
              <div className="relative mx-auto m-w-5xl overflow-hidden rounded-lg border border-grey-200 dark:border-gray-800 shadow-lg">
               {activeTab==="organize" &&(<Image    
               src="/hero-images/hero1.png"
               alt="Organize Your Applications"
               width={800}
               height={800}
             /> )} 
              {activeTab==="hired" &&(<Image    
               src="/hero-images/hero2.png"
               alt="Get Hired Faster"
               width={800}
               height={800}
             /> )}
              {activeTab==="manage" &&(
              <Image    
               src="/hero-images/hero3.png"
               alt="Manage Boards"
               width={800}
               height={800}
             /> )}



            </div>
          </div>
        </div>
        </section>
    )
}