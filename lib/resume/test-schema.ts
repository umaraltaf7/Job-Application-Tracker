import { ResumeParsedDataSchema } from "./schema";

const resumeData = {
  personalInfo: {
    name: "Umar Altaf",
    email: "malikumar01324@gmail.com",
    phone: "03400560328",
    location: "Rawalpindi, Pakistan",
    linkedin: null,
    github: "https://github.com/umaraltaf7",
  },

  summary:
    "Software Engineering student at COMSATS University Islamabad.",

  skills: [
    "JavaScript",
    "React.js",
    "Next.js",
    "Laravel",
    "Flutter",
    "MongoDB",
  ],

  experience: [
    {
      company: "Mars Digital IO",
      role: "Front End Developer Intern",
      startDate: null,
      endDate: null,
      description: [
        "Developed internal CRM systems.",
        "Built dashboard interfaces.",
      ],
    },
  ],

  education: [
    {
      institution: "COMSATS University Islamabad",
      degree: "BS",
      field: "Software Engineering",
      startDate: null,
      endDate: "2027",
    },
  ],

  projects: [
    {
      name: "Job Application Tracker",
      technologies: [
        "Next.js",
        "MongoDB",
        "Tailwind CSS",
      ],
      description: [
        "Built a Kanban-style job application tracker.",
      ],
    },
  ],

  certifications: [],

  languages: ["English", "Urdu"],
};

const result = ResumeParsedDataSchema.safeParse(resumeData);

if (result.success) {
  console.log("✅ Resume data is valid!");

  console.log(result.data);
} else {
  console.log("❌ Resume data is invalid!");

  console.log(result.error.issues);
}