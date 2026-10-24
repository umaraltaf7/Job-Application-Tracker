
"use client";

import {
    Board,
    Column,
    JobApplication,
} from "@/lib/models/models.type";

import {
    Award,
    Calendar,
    CheckCircle2,
    Mic,
    MoreVertical,
    Trash2,
    XCircle,
} from "lucide-react";

import {
    Card,
    CardContent,
    CardHeader,
    CardTitle,
} from "./ui/card";

import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuTrigger,
} from "./ui/dropdown-menu";

import { Button } from "./ui/button";

import CreateJobAppicationDialog from "./create-job-dialog";
import JobApplicationCard from "./job-application-card";

import useBoards from "@/lib/hooks/useBoards";

import {
    closestCorners,
    DndContext,
    DragEndEvent,
    DragOverlay,
    DragStartEvent,
    PointerSensor,
    useDroppable,
    useSensor,
    useSensors,
} from "@dnd-kit/core";

import {
    SortableContext,
    useSortable,
    verticalListSortingStrategy,
} from "@dnd-kit/sortable";

import { CSS } from "@dnd-kit/utilities";

import { useState, useSyncExternalStore } from "react";

const subscribeToNothing = () => () => {};
const getClientSnapshot = () => true;
const getServerSnapshot = () => false;


interface KanbanBoardProps {
    board: Board;
}


interface ColConfig {
    color: string;
    icon: React.ReactNode;
}


const COLUMN_CONFIG: Array<ColConfig> = [
    {
        color: "bg-cyan-500",
        icon: <Calendar className="h-4 w-4" />,
    },
    {
        color: "bg-purple-500",
        icon: <CheckCircle2 className="h-4 w-4" />,
    },
    {
        color: "bg-green-500",
        icon: <Mic className="h-4 w-4" />,
    },
    {
        color: "bg-yellow-500",
        icon: <Award className="h-4 w-4" />,
    },
    {
        color: "bg-red-500",
        icon: <XCircle className="h-4 w-4" />,
    },
];


function DroppableColumn({
    column,
    config,
    boardId,
    sortedColumns,
}: {
    column: Column;
    config: ColConfig;
    boardId: string;
    sortedColumns: Column[];
}) {

    const {
        setNodeRef,
        isOver,
    } = useDroppable({
        id: column._id,

        data: {
            type: "column",
            columnId: column._id,
        },
    });


    const sortedJobs =
        [...(column.jobapplications || [])].sort(
            (a, b) => a.order - b.order
        );


    return (
        <Card
            className="
                w-[calc(100vw-3.5rem)]
                max-w-[320px]
                shrink-0
                overflow-hidden
                p-0
                shadow-md
            "
        >

            {/* ================================================= */}
            {/* COLUMN HEADER */}
            {/* ================================================= */}

            <CardHeader
                className={`
                    ${config.color}
                    rounded-t-lg
                    pb-3
                    pt-3
                    text-white
                `}
            >

                <div className="flex min-w-0 w-full items-center justify-between gap-2">

                    <div className="flex min-w-0 items-center gap-2">

                        <div className="shrink-0">
                            {config.icon}
                        </div>

                        <CardTitle className="min-w-0 truncate text-base font-semibold text-white">
                            {column.name}
                        </CardTitle>

                    </div>


                    <DropdownMenu>

                        <DropdownMenuTrigger asChild>

                            <Button
                                variant="ghost"
                                size="icon"
                                className="
                                    h-6
                                    w-6
                                    shrink-0
                                    text-white
                                    hover:bg-white/20
                                "
                            >
                                <MoreVertical className="h-4 w-4" />
                            </Button>

                        </DropdownMenuTrigger>


                        <DropdownMenuContent align="end">

                            <DropdownMenuItem className="text-destructive">

                                <Trash2 className="mr-2 h-4 w-4" />

                                Delete Column

                            </DropdownMenuItem>

                        </DropdownMenuContent>

                    </DropdownMenu>

                </div>

            </CardHeader>


            {/* ================================================= */}
            {/* COLUMN CONTENT */}
            {/* ================================================= */}

            <CardContent
                ref={setNodeRef}
                className={`
                    min-w-0
                    w-full
                    space-y-2
                    overflow-hidden
                    bg-gray-50/50
                    pt-4
                    min-h-[400px]
                    rounded-b-lg

                    ${
                        isOver
                            ? "ring-2 ring-blue-500"
                            : ""
                    }
                `}
            >

                <SortableContext
                    items={sortedJobs.map(
                        (job) => job._id
                    )}
                    strategy={
                        verticalListSortingStrategy
                    }
                >

                    <div className="min-w-0 w-full space-y-2">

                        {sortedJobs.map((job) => (

                            <SortableJobCard
                                key={job._id}
                                job={{
                                    ...job,
                                    columnId:
                                        job.columnId ||
                                        column._id,
                                }}
                                columns={sortedColumns}
                            />

                        ))}

                    </div>

                </SortableContext>


                {/* CREATE JOB */}

                <div className="min-w-0 w-full">

                    <CreateJobAppicationDialog
                        columnId={column._id}
                        boardId={boardId}
                    />

                </div>

            </CardContent>

        </Card>
    );
}


function SortableJobCard({
    job,
    columns,
}: {
    job: JobApplication;
    columns: Column[];
}) {

    const {
        attributes,
        listeners,
        transform,
        transition,
        isDragging,
        setNodeRef,
    } = useSortable({
        id: job._id,

        data: {
            type: "job",
            job,
        },
    });


    const style = {
        transform:
            CSS.Transform.toString(
                transform
            ),

        transition,

        opacity:
            isDragging
                ? 0.5
                : 1,
    };


    return (
        <div
            ref={setNodeRef}
            style={style}
            className="min-w-0 w-full"
        >

            <JobApplicationCard
                job={job}
                columns={columns}
                dragHandleProp={{
                    ...attributes,
                    ...listeners,
                }}
            />

        </div>
    );
}


export default function KanbanBoard({
    board,
}: KanbanBoardProps) {

    /*
     * Prevent @dnd-kit from rendering during SSR.
     *
     * @dnd-kit generates accessibility IDs such as:
     * DndDescribedBy-0
     *
     * These IDs can differ between the server-rendered HTML
     * and the first client render, causing React hydration
     * warnings.
     *
     * Rendering the DnD tree only after mount keeps the
     * server HTML and initial client HTML identical.
     */

    const mounted = useSyncExternalStore(
        subscribeToNothing,
        getClientSnapshot,
        getServerSnapshot
    );

    const [activeId, setActiveId] =
        useState<string | null>(null);


    const {
        columns,
        error,
        moveJob,
    } = useBoards(board);


    const sortedColumns =
        [...(columns || [])].sort(
            (a, b) =>
                a.order - b.order
        );


    const sensor =
        useSensors(
            useSensor(
                PointerSensor,
                {
                    activationConstraint: {
                        distance: 8,
                    },
                }
            )
        );


    function handleDragStart(
        event: DragStartEvent
    ) {

        setActiveId(
            event.active.id as string
        );
    }


    async function handleDragEnd(
        event: DragEndEvent
    ) {

        const {
            active,
            over,
        } = event;


        setActiveId(null);


        if (
            !over ||
            !board._id
        ) {
            return;
        }


        const activeId =
            active.id as string;

        const overId =
            over.id as string;


        let draggedJob:
            JobApplication | null =
            null;

        let sourceColumn:
            Column | null =
            null;

        let sourceIndex =
            -1;


        for (
            const column of sortedColumns
        ) {

            const jobs =
                [...(
                    column.jobapplications ||
                    []
                )].sort(
                    (a, b) =>
                        a.order - b.order
                );


            const jobIndex =
                jobs.findIndex(
                    (j) =>
                        j._id === activeId
                );


            if (
                jobIndex !== -1
            ) {

                draggedJob =
                    jobs[jobIndex];

                sourceColumn =
                    column;

                sourceIndex =
                    jobIndex;

                break;
            }
        }


        if (
            !draggedJob ||
            !sourceColumn
        ) {
            return;
        }


        const targetColumn =
            sortedColumns.find(
                (col) =>
                    col._id === overId
            );


        const targetJob =
            sortedColumns
                .flatMap(
                    (col) =>
                        col.jobapplications ||
                        []
                )
                .find(
                    (job) =>
                        job._id === overId
                );


        let targetColumnId: string;
        let newOrder: number;


        /* ================================================= */
        /* DROPPED ON COLUMN */
        /* ================================================= */

        if (targetColumn) {

            targetColumnId =
                targetColumn._id;


            const jobsInTarget =
                (
                    targetColumn
                        .jobapplications ||
                    []
                )
                    .filter(
                        (j) =>
                            j._id !== activeId
                    )
                    .sort(
                        (a, b) =>
                            a.order - b.order
                    );


            newOrder =
                jobsInTarget.length;


        }

        /* ================================================= */
        /* DROPPED ON ANOTHER JOB */
        /* ================================================= */

        else if (targetJob) {

            const targetJobColumn =
                sortedColumns.find(
                    (col) =>
                        (
                            col.jobapplications ||
                            []
                        ).some(
                            (j) =>
                                j._id ===
                                targetJob._id
                        )
                );


            targetColumnId =
                targetJob.columnId ||
                targetJobColumn?._id ||
                "";


            if (!targetColumnId) {
                return;
            }


            const targetColumnObject =
                sortedColumns.find(
                    (col) =>
                        col._id ===
                        targetColumnId
                );


            if (!targetColumnObject) {
                return;
            }


            const allJobsInTargetOriginal =
                [
                    ...(
                        targetColumnObject
                            .jobapplications ||
                        []
                    ),
                ].sort(
                    (a, b) =>
                        a.order - b.order
                );


            const allJobsInTargetFiltered =
                allJobsInTargetOriginal.filter(
                    (j) =>
                        j._id !== activeId
                );


            const targetIndexInOriginal =
                allJobsInTargetOriginal.findIndex(
                    (j) =>
                        j._id === overId
                );


            const targetIndexInFiltered =
                allJobsInTargetFiltered.findIndex(
                    (j) =>
                        j._id === overId
                );


            if (
                targetIndexInFiltered !==
                -1
            ) {

                if (
                    sourceColumn._id ===
                    targetColumnId
                ) {

                    if (
                        sourceIndex <
                        targetIndexInOriginal
                    ) {

                        newOrder =
                            targetIndexInFiltered +
                            1;

                    } else {

                        newOrder =
                            targetIndexInFiltered;
                    }

                } else {

                    newOrder =
                        targetIndexInFiltered;
                }

            } else {

                newOrder =
                    allJobsInTargetFiltered.length;
            }


        } else {

            return;
        }


        if (!targetColumnId) {
            return;
        }


        await moveJob(
            activeId,
            targetColumnId,
            newOrder
        );
    }


    const activeJob =
        sortedColumns
            .flatMap(
                (col) =>
                    col.jobapplications ||
                    []
            )
            .find(
                (job) =>
                    job._id ===
                    activeId
            );


    /*
     * IMPORTANT:
     *
     * Do not render DndContext until the component
     * has mounted on the client.
     *
     * This prevents @dnd-kit accessibility IDs from
     * causing server/client hydration mismatches.
     */

    if (!mounted) {
        return (
            <div className="space-y-4">

                <div
                    className="
                        flex
                        min-w-0
                        gap-4
                        overflow-x-auto
                        pb-4
                        hide-scrollbar
                    "
                >

                    {sortedColumns.map(
                        (col, key) => {

                            const config =
                                COLUMN_CONFIG[key] ||
                                {
                                    color:
                                        "bg-cyan-500",

                                    icon:
                                        <Calendar className="h-4 w-4" />,
                                };


                            return (
                                <Card
                                    key={col._id}
                                    className="
                                        w-[calc(100vw-3.5rem)]
                                        max-w-[320px]
                                        shrink-0
                                        overflow-hidden
                                        p-0
                                        shadow-md
                                    "
                                >

                                    <CardHeader
                                        className={`
                                            ${config.color}
                                            rounded-t-lg
                                            pb-3
                                            pt-3
                                            text-white
                                        `}
                                    >

                                        <div className="flex min-w-0 w-full items-center gap-2">

                                            <div className="shrink-0">
                                                {config.icon}
                                            </div>

                                            <CardTitle className="min-w-0 truncate text-base font-semibold text-white">
                                                {col.name}
                                            </CardTitle>

                                        </div>

                                    </CardHeader>

                                    <CardContent
                                        className="
                                            min-w-0
                                            w-full
                                            min-h-[400px]
                                            bg-gray-50/50
                                            pt-4
                                            rounded-b-lg
                                        "
                                    />

                                </Card>
                            );
                        }
                    )}

                </div>

            </div>
        );
    }


    return (
        <DndContext
            sensors={sensor}
            collisionDetection={
                closestCorners
            }
            onDragStart={
                handleDragStart
            }
            onDragEnd={
                handleDragEnd
            }
            accessibility={{
                screenReaderInstructions: {
                    draggable:
                        "Press space to pick up the job. Use the arrow keys to move it. Press space to drop it.",
                },
            }}
        >

            <div className="space-y-4">
                {error && (
                    <p
                        className="rounded-lg border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700"
                        role="alert"
                    >
                        {error}
                    </p>
                )}

                {/* ================================================= */}
                {/* KANBAN COLUMNS */}
                {/* ================================================= */}

                <div
                    className="
                        flex
                        min-w-0
                        gap-4
                        overflow-x-auto
                        pb-4
                        hide-scrollbar
                    "
                >

                    {sortedColumns.map(
                        (col, key) => {

                            const config =
                                COLUMN_CONFIG[key] ||
                                {
                                    color:
                                        "bg-cyan-500",

                                    icon:
                                        <Calendar className="h-4 w-4" />,
                                };


                            return (
                                <DroppableColumn
                                    key={col._id}
                                    column={col}
                                    config={config}
                                    boardId={
                                        board._id
                                    }
                                    sortedColumns={
                                        sortedColumns
                                    }
                                />
                            );
                        }
                    )}

                </div>

            </div>


            {/* ================================================= */}
            {/* DRAG OVERLAY */}
            {/* ================================================= */}

            <DragOverlay>

                {activeJob ? (

                    <div className="w-[calc(100vw-3.5rem)] max-w-[320px] opacity-50">

                        <JobApplicationCard
                            job={activeJob}
                            columns={
                                sortedColumns
                            }
                        />

                    </div>

                ) : null}

            </DragOverlay>

        </DndContext>
    );
}
