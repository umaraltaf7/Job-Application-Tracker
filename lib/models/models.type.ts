

export interface JobApplication  {
    _id:string;
    company: string;
    position: string;
    location?: string;
    status: string;
    notes?: string;
    salary?: number;
    jobUrl?: string;
    order:number;
    columnId?:string;
    tags?: string[];
    description?: string;
    

}

export  interface Column {
    jobApplications: any;
    _id:string;
    name: string;
    
    order: number;
    jobapplications: JobApplication[];
    
}

 export interface Board {
    _id:string;
    name: string;
    
    columns: Column[];
   
}
