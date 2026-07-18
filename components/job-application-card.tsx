"use client";
import { Column, JobApplication } from "@/lib/models/models.type";
import { Card, CardContent } from "./ui/card";
import { Edit2, ExternalLink, Icon, MoreVertical, PlusIcon, Trash2 } from "lucide-react";
import { Label } from "./ui/label";
import { DropdownMenu, DropdownMenuTrigger, DropdownMenuContent, DropdownMenuItem } from "./ui/dropdown-menu";
import { Button } from "./ui/button";
import { deleteJobApplication, updateJobApplication } from "@/lib/actions/job-applications";

import {Dialog, DialogTrigger, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from "./ui/dialog";
import { Input } from "./ui/input";
import { Textarea } from "./ui/textarea";
import React, { useState } from "react";

interface JobApplicationCardProps{
    job:JobApplication;
    columns:Column[];
    dragHandleProp?:React.HTMLAttributes<HTMLElement>;

}   
export default function JobApplicationCard({job,columns,dragHandleProp}:JobApplicationCardProps){
const[isEditing, setIsEditing]=useState(false);

    const[formData,setFormData]=useState({
        company:job.company,
        position:job.position,
        location:job.location || "",
        notes:job.notes || "",
        salary:job.salary || "",
        jobUrl:job.jobUrl || "",
        columnId:job.columnId,
        tags:job.tags?.join(",") || "",
        description:job.description || "",

    });

    async function handleUpdate(e:React.FormEvent){
    e.preventDefault();
    try{
        const result=await updateJobApplication(job._id,{
            ...formData,
            salary:String(formData.salary),
            tags:formData.tags.split(",").map((tag)=>tag.trim()).filter((tag)=>tag.length>0),
        });

        if(!result.error){
            setIsEditing(false);
        }


    }catch(error){
        console.error("Error moving job application:",error);
    }
  }

   async function handleDelete(){
    try{
        const result=await deleteJobApplication(job._id);


    }catch(error){
        console.error("Error moving job application:",error);
    }
  }

  async function handleMove(newColumnId:string){
    try{
        const result=await updateJobApplication(job._id,{columnId:newColumnId});


    }catch(error){
        console.error("Error moving job application:",error);
    }
  }
    return (<>
    <Card className="cursor-pointer transition-shadow hover:shadow-md " {...dragHandleProp}> 
        <CardContent className="p-4">
        <div className="flex justify-between items-start gap-4 ">
            <div className="flex-1 min-w-0">
                <h3 className="text-lg font-semibold truncate">{job.position}</h3>
                <p className="text-sm text-muted-foreground truncate">{job.company}</p>
                {job.description && <p className="text-sm text-muted-foreground truncate">{job.description}</p>}
                {job.tags && job.tags.length >0 &&(
                    <div className="flex flex-wrap gap-2 mt-2 ">
                        {job.tags.map((tag, index) => (
                            <span key={index} className="inline-block bg-blue-100 text-blue-800 rounded-full px-3 py-1 text-xs">
                                {tag}
                            </span>
                        ))}
                    </div>
                
                ) }
                {job.jobUrl &&
                 (
                 <a target="_blank" href={job.jobUrl} onClick={(e)=> e.stopPropagation()} className="inline-flex items-center gap-1 text-sm text-primary mt-2">
                    <ExternalLink/>

                    </a>
                 )}

                
            </div>
            <div className="flex items-center gap-2">
                <DropdownMenu  >
                 <DropdownMenuTrigger asChild className="flex items-center">
                    <Button variant="ghost" size="icon" className="h-6 w-6"><MoreVertical/></Button>
                 </DropdownMenuTrigger>
                 <DropdownMenuContent align="end" className="w-56">
                    <DropdownMenuItem className="flex items-center gap-2" onClick={()=>setIsEditing(true)}>
                        <Edit2/>
                        Edit
                        </DropdownMenuItem>
                {columns.length>1 &&(
                    <>
                    {columns.filter((c)=> c._id!==job.columnId).map((column ,key)=>(
                        <DropdownMenuItem key={key} onClick={()=>handleMove(column._id)}  className="flex items-center gap-2">
                            
                            Move to {column.name}
                           
                            </DropdownMenuItem>
                    ))}
                    </>
                )}
                <DropdownMenuItem className="flex items-center gap-2" onClick={()=>handleDelete()}>
                    <Trash2/>
                    Delete
                </DropdownMenuItem>

                 </DropdownMenuContent>
                </DropdownMenu>
            </div>
        </div>
        </CardContent>

    </Card>
   
   
   
   
   <Dialog open={isEditing} onOpenChange={setIsEditing}>
        
   
         <DialogContent className="max-w-2xl">
           <DialogHeader>
             <DialogTitle>Add Job Application</DialogTitle>
             <DialogDescription>
               Track New Job Application
             </DialogDescription>
           </DialogHeader>
           <form className="space-y-4" onSubmit={handleUpdate}>
             <div className="space-y-4">
               <div className="grid grid-cols-2 gap-4">
                 <div className="space-y-2">
                   <Label htmlFor="company">Company*</Label>
                   <Input id="company" required value={formData.company} onChange={(e) => setFormData({ ...formData, company: e.target.value })} />
                 </div>
                 <div className="space-y-2">
                   <Label htmlFor="position">Position*</Label>
                   <Input id="position" required value={formData.position} onChange={(e) => setFormData({ ...formData, position: e.target.value })} />
                 </div>
               </div>
   
               <div className="grid grid-cols-2 gap-4">
                 <div className="space-y-2">
                   <Label htmlFor="location">Location</Label>
                   <Input id="location" value={formData.location} onChange={(e) => setFormData({ ...formData, location: e.target.value })} />
                 </div>
                 <div className="space-y-2">
                   <Label htmlFor="salary">Salary</Label>
                   <Input id="salary" value={formData.salary} onChange={(e) => setFormData({ ...formData, salary: e.target.value })} />
                 </div>
               </div>
   
               <div>
                 <div className="space-y-2">
                   <Label htmlFor="job-url">Job URL</Label>
                   <Input id="job-url" value={formData.jobUrl} onChange={(e) => setFormData({ ...formData, jobUrl: e.target.value })} />
                 </div>
                 <div className="space-y-2">
                   <Label htmlFor="tags">Tags(comma separated)</Label>
                   <Input id="tags" placeholder="React , Tailwind,..." value={formData.tags} onChange={(e) => setFormData({ ...formData, tags: e.target.value })} />
                 </div>
                 <div className="space-y-2">
                   <Label htmlFor="description">Description</Label>
                   <Textarea id="description" rows={3} className="resize-none" placeholder="Job Description" value={formData.description} onChange={(e) => setFormData({ ...formData, description: e.target.value })} />
                 </div>
                 <div className="space-y-2">
                   <Label htmlFor="notes">Notes</Label>
                   <Textarea id="notes" rows={4} className="resize-none" placeholder="Notes" value={formData.notes} onChange={(e) => setFormData({ ...formData, notes: e.target.value })} />
                 </div>
               </div>
             </div>
             <DialogFooter>
               <Button type="button" variant="outline" onClick={() => setIsEditing(false)}>Cancel</Button>
               <Button type="submit">Save Changes</Button>
             </DialogFooter>
           </form>
         </DialogContent>
       </Dialog>






    </>
    

)

    

}