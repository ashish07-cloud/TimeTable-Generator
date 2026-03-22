class DataFormatter {
    /**
     * Aggregates student choices into Elective Groups for the NEP solver.
     */
    static formatForSolver(dbData) {
        const { courses, faculty, rooms, studentChoices, config, subjects } = dbData;

        // Group students taking the same GE/SEC/VAC subjects
        const electiveGroups = this._generateElectiveGroups(studentChoices, subjects);

        return {
            institution_id: dbData.institutionId,
            subjects: subjects.map(s => ({
                subject_id: s.id,
                name: s.name,
                subject_type: s.type,
                department: s.department,
                credits: s.credits,
                hours_per_week: s.hoursPerWeek,
                required_room_type: s.requiredRoomType || "CLASSROOM"
            })),
            courses: courses.map(c => ({
                course_id: c.id,
                course_name: c.name,
                semester: c.semester,
                academic_year: c.academicYear,
                student_count: c.studentCount,
                core_subject_ids: c.coreSubjectIds
            })),
            faculty: faculty.map(f => ({
                faculty_id: f.id,
                name: f.name,
                email: f.email,
                department: f.department,
                qualified_subjects: f.qualifiedSubjectIds,
                max_hours_per_day: f.maxHoursPerDay,
                max_hours_per_week: f.maxHoursPerWeek,
                availability: f.availability // Assumes DB stores [ { day: "Mon", slots: [0,1,2] } ]
            })),
            rooms: rooms.map(r => ({
                room_id: r.id,
                room_name: r.name,
                room_type: r.type,
                capacity: r.capacity,
                is_available: r.isAvailable
            })),
            elective_groups: electiveGroups,
            config: config
        };
    }

    static _generateElectiveGroups(studentChoices, subjects) {
        // Logic to group student IDs from various courses into subject buckets
        // Example output: [{ elective_subject_id: "GE_ECO_01", student_count: 45, member_course_ids: ["C1", "C2"] }]
        const groups = {};
        
        studentChoices.forEach(choice => {
            ['GE', 'SEC', 'AEC', 'VAC'].forEach(type => {
                const subId = choice[type];
                if (subId) {
                    if (!groups[subId]) {
                        groups[subId] = { 
                            elective_subject_id: subId, 
                            student_count: 0, 
                            member_course_ids: new Set() 
                        };
                    }
                    groups[subId].student_count += 1;
                    groups[subId].member_course_ids.add(choice.courseId);
                }
            });
        });

        return Object.values(groups).map(g => ({
            ...g,
            member_course_ids: Array.from(g.member_course_ids)
        }));
    }
}

module.exports = DataFormatter;