import { updateJobApplication } from "../actions/job-applications";
import { Board , Column, JobApplication } from "../models/models.type";
import { useEffect, useState } from "react";

export default function useBoards(initialBoard?:Board | null) {
const [board, setBoard] = useState<Board | null>(initialBoard || null);
const [columns, setColumns] = useState<Column[]>(initialBoard?.columns || []);
const [error, setError] = useState<string | null>(null);

useEffect(() => {
    if (initialBoard) {
        setBoard(initialBoard);
        setColumns(initialBoard.columns || []);
    }

},[initialBoard]);
async function moveJob(jobApplicationId:string,newColumnId:string,newOrder:number){
     setColumns((prev)=>{
         const newColumns=prev.map((col)=>({
            ...col,
            jobapplications:[...col.jobapplications],
         }));

         //find and remove job from ol column
         let jobToMove:JobApplication|null=null;
         let oldColumnId:string|null=null;

         for(const col of columns){
            const jobIndex=col.jobapplications.findIndex((job)=>job._id===jobApplicationId);
            if(jobIndex!==-1 && jobIndex!==undefined){
                jobToMove=col.jobapplications[jobIndex];
                oldColumnId=col._id;
                col.jobapplications=col.jobapplications.filter((job)=>job._id!==jobApplicationId);
                 break;
            }
           
         }
         if(jobToMove && oldColumnId){
            const targetColumnIndex=newColumns.findIndex((col)=>col._id===newColumnId);
            if(targetColumnIndex!==-1){
                const targetColumn=newColumns[targetColumnIndex];
                const currentJobs=targetColumn.jobapplications || [];
                const updatedJobs=[...currentJobs];
                updatedJobs.splice(newOrder,0,{
                    ...jobToMove,
                    columnId:newColumnId,
                    order:newOrder*100,
                });
                const jobsWithUpdatedOrders=updatedJobs.map((job,key)=>({...job,order:key*100}));
                newColumns[targetColumnIndex]={
                    ...targetColumn,
                    jobapplications:jobsWithUpdatedOrders,
                };
            }

         }
         return newColumns;
     });

     try{
        const result=await updateJobApplication(jobApplicationId,{columnId:newColumnId,order:newOrder});


     }catch(error){
        console.error("Error moving job application:",error);
     }

}

// async function deleteColumn(columnId: string) {
//   const prev = columns;

//   // Optimistically remove the column from the UI
//   setColumns((prevCols) => prevCols.filter((c) => c._id !== columnId));

//   try {
//     await deleteColumn(columnId);
//   } catch (err) {
//     console.error("Delete column failed:", err);

//     // Refresh to get the latest data from the server


//     // Revert the UI if the deletion failed
//     setColumns(prev);
//   }
// }


return{board,columns,error,moveJob};

}
