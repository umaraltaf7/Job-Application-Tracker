import jsPDF from "jspdf";
import type { TailoredResume } from "@/lib/ai/tailored-resume";

export function generateResumePDF(
    resume: TailoredResume
) {
    const pdf = new jsPDF({
        unit: "mm",
        format: "a4",
    });

    const pageWidth =
        pdf.internal.pageSize.getWidth();

    const pageHeight =
        pdf.internal.pageSize.getHeight();

    const margin = 18;
    const contentWidth =
        pageWidth - margin * 2;

    let y = margin;

    const ensureSpace = (
        height = 10
    ) => {
        if (
            y + height >
            pageHeight - margin
        ) {
            pdf.addPage();
            y = margin;
        }
    };

    const addText = (
        text: string,
        fontSize = 10,
        bold = false,
        spacing = 3
    ) => {
        if (!text?.trim()) {
            return;
        }

        pdf.setFont(
            "helvetica",
            bold ? "bold" : "normal"
        );
        pdf.setFontSize(fontSize);

        const lines =
            pdf.splitTextToSize(
                text,
                contentWidth
            );

        const lineHeight =
            fontSize * 0.45;

        ensureSpace(
            lines.length * lineHeight +
                spacing
        );

        pdf.text(
            lines,
            margin,
            y
        );

        y +=
            lines.length * lineHeight +
            spacing;
    };

    const addHeading = (
        text: string
    ) => {
        if (!text?.trim()) {
            return;
        }

        ensureSpace(14);

        y += 2;

        pdf.setFont(
            "helvetica",
            "bold"
        );
        pdf.setFontSize(12);

        pdf.text(
            text.toUpperCase(),
            margin,
            y
        );

        y += 7;
    };

    const addBullet = (
        text: string
    ) => {
        if (!text?.trim()) {
            return;
        }

        pdf.setFont(
            "helvetica",
            "normal"
        );
        pdf.setFontSize(10);

        const bulletWidth =
            contentWidth - 5;

        const lines =
            pdf.splitTextToSize(
                text,
                bulletWidth
            );

        const lineHeight = 4.5;

        ensureSpace(
            lines.length * lineHeight +
                2
        );

        pdf.text(
            "•",
            margin,
            y
        );

        pdf.text(
            lines,
            margin + 5,
            y
        );

        y +=
            lines.length * lineHeight +
            2;
    };

    // Header
    pdf.setFont(
        "helvetica",
        "bold"
    );
    pdf.setFontSize(20);

    const name =
        resume.personalInfo.name ||
        "Resume";

    pdf.text(
        name,
        margin,
        y
    );

    y += 8;

    const contact = [
        resume.personalInfo.email,
        resume.personalInfo.phone,
        resume.personalInfo.location,
        resume.personalInfo.linkedin,
        resume.personalInfo.github,
    ].filter(Boolean);

    if (contact.length > 0) {
        addText(
            contact.join(" | "),
            8.5,
            false,
            5
        );
    }

    // Summary
    if (resume.summary) {
        addHeading(
            "Professional Summary"
        );

        addText(
            resume.summary
        );
    }

    // Skills
    if (
        resume.skills.length > 0
    ) {
        addHeading("Skills");

        addText(
            resume.skills.join(" • ")
        );
    }

    // Experience
    if (
        resume.experience.length > 0
    ) {
        addHeading(
            "Experience"
        );

        for (
            const experience of
                resume.experience
        ) {
            ensureSpace(18);

            addText(
                `${experience.role}${
                    experience.company
                        ? ` — ${experience.company}`
                        : ""
                }`,
                11,
                true,
                2
            );

            const dates = [
                experience.startDate,
                experience.endDate,
            ]
                .filter(Boolean)
                .join(" - ");

            if (dates) {
                addText(
                    dates,
                    9,
                    false,
                    2
                );
            }

            for (
                const bullet of
                    experience.description
            ) {
                addBullet(bullet);
            }
        }
    }

    // Projects
    if (
        resume.projects.length > 0
    ) {
        addHeading(
            "Projects"
        );

        for (
            const project of
                resume.projects
        ) {
            ensureSpace(16);

            addText(
                project.name,
                11,
                true,
                2
            );

            if (
                project.technologies.length >
                0
            ) {
                addText(
                    `Technologies: ${project.technologies.join(
                        ", "
                    )}`,
                    9,
                    false,
                    2
                );
            }

            for (
                const description of
                    project.description
            ) {
                addBullet(
                    description
                );
            }
        }
    }

    // Education
    if (
        resume.education.length > 0
    ) {
        addHeading(
            "Education"
        );

        for (
            const education of
                resume.education
        ) {
            ensureSpace(16);

            const degree = [
                education.degree,
                education.field,
            ]
                .filter(Boolean)
                .join(" — ");

            addText(
                degree,
                11,
                true,
                2
            );

            if (
                education.institution
            ) {
                addText(
                    education.institution,
                    10,
                    false,
                    2
                );
            }

            const dates = [
                education.startDate,
                education.endDate,
            ]
                .filter(Boolean)
                .join(" - ");

            if (dates) {
                addText(
                    dates,
                    9,
                    false,
                    2
                );
            }
        }
    }

    // Certifications
    if (
        resume.certifications.length >
        0
    ) {
        addHeading(
            "Certifications"
        );

        for (
            const certification of
                resume.certifications
        ) {
            addBullet(
                certification
            );
        }
    }

    // Languages
    if (
        resume.languages.length > 0
    ) {
        addHeading(
            "Languages"
        );

        addText(
            resume.languages.join(
                ", "
            )
        );
    }

    const safeName =
        (
            resume.personalInfo.name ||
            "Tailored-Resume"
        )
            .replace(
                /[^a-z0-9]+/gi,
                "-"
            )
            .replace(
                /^-+|-+$/g,
                ""
            );

    pdf.save(
        `${safeName}-Tailored-Resume.pdf`
    );
}
