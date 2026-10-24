import { updateJobApplication } from "../actions/job-applications";
import { Board , Column } from "../models/models.type";
import { useState } from "react";

export default function useBoards(initialBoard?:Board | null) {
const board = initialBoard ?? null;
const [columns, setColumns] = useState<Column[]>(() => initialBoard?.columns || []);
const [error, setError] = useState<string | null>(null);
async function moveJob(jobApplicationId:string,newColumnId:string,newOrder:number){
    const previousColumns = columns;
    const nextColumns = columns.map((column) => ({
        ...column,
        jobapplications: [...(column.jobapplications ?? [])],
    }));
    const sourceColumn = nextColumns.find((column) =>
        column.jobapplications.some((job) => job._id === jobApplicationId)
    );
    const targetColumn = nextColumns.find((column) => column._id === newColumnId);

    if (!sourceColumn || !targetColumn) {
        setError("Could not move this application. Please refresh and try again.");
        return;
    }

    const sourceIndex = sourceColumn.jobapplications.findIndex(
        (job) => job._id === jobApplicationId
    );
    const [jobToMove] = sourceColumn.jobapplications.splice(sourceIndex, 1);
    const insertionIndex = Math.max(
        0,
        Math.min(newOrder, targetColumn.jobapplications.length)
    );

    targetColumn.jobapplications.splice(insertionIndex, 0, {
        ...jobToMove,
        columnId: newColumnId,
    });
    targetColumn.jobapplications = targetColumn.jobapplications.map(
        (job, index) => ({ ...job, order: index * 100 })
    );
    if (sourceColumn._id !== targetColumn._id) {
        sourceColumn.jobapplications = sourceColumn.jobapplications.map(
            (job, index) => ({ ...job, order: index * 100 })
        );
    }

    setError(null);
    setColumns(nextColumns);

    try {
        const result = await updateJobApplication(jobApplicationId, {
            columnId: newColumnId,
            order: newOrder,
        });

        if (result.error || !result.data) {
            setColumns(previousColumns);
            setError(result.error || "Could not save the application move.");
            return;
        }
    } catch {
        console.error("Error moving job application.");
        setColumns(previousColumns);
        setError("Could not save the application move. Please try again.");
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
