import connectDB from "@/lib/db";
import "@/lib/models";
import { Board, Column, JobApplication } from "@/lib/models";
import { describe } from "node:test";

const USER_ID = "6a38e104302c08f681b16148"; // Replace with the actual user ID

const SAMPLE_JOBS=[
    //whislist
    {
        company:"Google",
        position:"Software Engineer",
        location:"Mountain View, CA",
        tags:["Google","Software Engineer"],
        description:"cool job",
        jobURl:"https://careers.google.com/jobs/results/123456-software-engineer/",
        notes:"This is a wishlist job application.",
        salary: 120000,

    },
    {
        company:"Amazon",
        position:"Data Scientist",
        location:"Seattle, WA",
        tags:["Amazon","Data Scientist"],
        description:"cool job",
        jobURl:"https://www.amazon.jobs/en/jobs/123456/data-scientist/",
        notes:"This is a wishlist job application.",
        salary: 120000,
    },
    //applied
    {
        company:"Microsoft",
        position:"Frontend Developer",
        location:"Redmond, WA",
        tags:["Microsoft","Frontend Developer"],
        description:"cool job",
        jobURl:"https://careers.microsoft.com/us/en/job/123456/frontend-developer/",
        notes:"This is an applied job application.",
        salary: 120000,

    },{
        company:"Google",
        position:"Software Engineer",
        location:"Mountain View, CA",
        tags:["Google","Software Engineer"],
        description:"cool job",
        jobURl:"https://careers.google.com/jobs/results/123456-software-engineer/",
        notes:"This is an applied job application.",
        salary: 120000,
    },
    //interview
    {
        company:"Amazon",
        position:"Data Scientist",
        location:"Seattle, WA",
        tags:["Amazon","Data Scientist"],
        description:"cool job",
        jobURl:"https://www.amazon.jobs/en/jobs/123456/data-scientist/",
        notes:"This is an interview job application.",
        salary: 120000,
    },{
        company:"Microsoft",
        position:"Frontend Developer",
        location:"Redmond, WA",
        tags:["Microsoft","Frontend Developer"],
        description:"cool job",
        jobURl:"https://careers.microsoft.com/us/en/job/123456/frontend-developer/",
        notes:"This is an interview job application.",
        salary: 120000,

    },

    //offer
    {
        company:"Google",
        position:"Software Engineer",
        location:"Mountain View, CA",
        tags:["Google","Software Engineer"],
        description:"cool job",
        jobURl:"https://careers.google.com/jobs/results/123456-software-engineer/",
        notes:"This is an offer job application.",
        salary: 120000,

    },
    {
        company:"Amazon",
        position:"Data Scientist",
        location:"Seattle, WA",
        tags:["Amazon","Data Scientist"],
        description:"cool job",
        jobURl:"https://www.amazon.jobs/en/jobs/123456/data-scientist/",
        notes:"This is an offer job application.",
        salary: 120000,

    },
    //rejected
    {
        company:"Microsoft",
        position:"Frontend Developer",
        location:"Redmond, WA",
        tags:["Microsoft","Frontend Developer"],
        description:"cool job",
        jobURl:"https://careers.microsoft.com/us/en/job/123456/frontend-developer/",
        notes:"This is a rejected job application.",
        salary: 120000,
    },
    {
        company:"Google",
        position:"Software Engineer",
        location:"Mountain View, CA",
        tags:["Google","Software Engineer"],
        description:"cool job",
        jobURl:"https://careers.google.com/jobs/results/123456-software-engineer/",
        notes:"This is a rejected job application.",
        salary: 120000,
    }
];

async function seed() {
    if(!USER_ID){
        console.error("USER_ID is not defined. Please set the USER_ID variable.");
        console.error("You can find your user ID in the database or by logging in and checking the session.");
        process.exit(1);
    }

    try{
        console.log("Starting seed process...");
console.log("USAGE:SEED_USER_ID=YOUR_USER_ID npm run seed");
        await connectDB();
        console.log("Connected to the database.");
        //find user baord
        let board=await Board.findOne({
            userId:USER_ID,
            name:"Job Hunt",
        });

        if(!board){
            console.error("board not found. creating board...");
            const { initializeUserBoard } = await import("../lib/init.user.board");
            board=await initializeUserBoard(USER_ID);
            console.log("board created.");
        }else{
            console.log("board found.");
        }

        //get all columns
        const columns=await Column.find({
            boardId:board._id,
        }).sort({order:1});

        console.log(`Found ${columns.length} columns.`);

    if(columns.length===0){
        console.error("no columns found make sure board has default columns");
        process.exit(1);
    }
    //map cokumn names to column ids
    const columnMap:Record<string,string>={};
    columns.forEach((col)=>{
        columnMap[col.name]=col._id.toString();

    });

    //clear existing job applications for the user
    const existingJobs=await JobApplication.find({
        userId:USER_ID,
    });
    if(existingJobs.length>0){
        console.log(` Deleting ${existingJobs.length} existing job applications for user ${USER_ID}...`);
        await JobApplication.deleteMany({
            userId:USER_ID,
        });
        
        //clear job applications from columns
        for(const col of columns){
            col.jobapplications=[];
            await col.save();
        }
    }
    //distribute sample jobs to columns
    const jobsByColumn:Record<string,typeof SAMPLE_JOBS>={
        "Wish List":SAMPLE_JOBS.slice(0,2),
        "Applied":SAMPLE_JOBS.slice(2,4),
        "Interviewing":SAMPLE_JOBS.slice(4,6),
        "Offer":SAMPLE_JOBS.slice(6,8),
        "Rejected":SAMPLE_JOBS.slice(8,10),
    };

    let totalCreated=0;
    for(const [columnName,jobs] of Object.entries(jobsByColumn)){
        const columnId=columnMap[columnName];
        if(!columnId){
            console.error(`Column ${columnName} not found for user ${USER_ID}. Skipping job applications for this column.`);
            continue;
        }
        const column=columns.find((c)=>c.name===columnName);
        if(!column) continue;
        for (let i = 0; i < jobs.length; i++) {
            const jobData = jobs[i];
            const jobApplication = await JobApplication.create({
                company: jobData.company,
                position: jobData.position,
                location: jobData.location,
                tags: jobData.tags,
                description: jobData.description,
                jobURl: jobData.jobURl,
                salary: jobData.salary,
                columnId: columnId,
                boardId: board._id,
                userId: USER_ID,
                status: columnName.toLocaleLowerCase().replace(" ", "_"),
                order: i,
                notes: jobData.notes,
                

            });
            column.jobapplications.push(jobApplication._id);
            totalCreated++;
        }
        await column.save();
        console.log(`Created ${jobs.length} job applications for column ${columnName}.`);
        
    }
        
       
    
    console.log(`Seed process completed. Total job applications created: ${totalCreated}.`);
    console.log(`Created ${totalCreated} job applications for user ${USER_ID}.`);
    console.log(`Board ${board.name}`);
    console.log(`USer ID: ${USER_ID}`);
    process.exit(0);

}
  catch(error){
    console.error("Seed process failed:",error);
    process.exit(1);

 }
}

seed();



