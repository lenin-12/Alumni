const { z } = require('zod');

const emptyToUndefined = (val) => (val === '' || val === null ? undefined : val);

const optionalString = z.preprocess(emptyToUndefined, z.string().optional());

const registerSchema = z.object({
    name: z.string().trim().min(1, 'Name is required'),
    lastName: z.string().trim().min(1, 'Last name is required'),
    email: z.string().trim().email('Valid email is required'),
    password: z.string().min(1, 'Password is required'),
    role: z.enum(['ALUMNI', 'STUDENT', 'ADMIN']).optional(),
    profileType: z.enum(['PUBLIC', 'PRIVATE']).optional(),
    phone: optionalString,
    batch: z.preprocess(
        (val) => {
            const cleaned = emptyToUndefined(val);
            if (cleaned === undefined) return undefined;
            const num = Number(cleaned);
            return Number.isNaN(num) ? cleaned : num;
        },
        z.number().optional()
    ),
    rollNo: optionalString,
    department: optionalString,
    imageUrl: optionalString,
});

const loginSchema = z.object({
    email: z.string().trim().email('Valid email is required'),
    password: z.string().min(1, 'Password is required'),
});

const jobCreateSchema = z.object({
    title: z.string().trim().min(1, 'Title is required'),
    company: z.string().trim().min(1, 'Company is required'),
    location: z.string().trim().min(1, 'Location is required'),
    description: z.string().trim().min(1, 'Description is required'),
    jobType: optionalString,
    experienceLevel: optionalString,
    skills: optionalString,
    applicationDeadline: optionalString,
    applicationLink: optionalString,
    contactInfo: optionalString,
    userId: optionalString,
});

const achievementCreateSchema = z.object({
    title: z.string().trim().min(1, 'Title is required'),
    dateOfAchievement: z.string().trim().min(1, 'Date of achievement is required'),
    description: z.string().trim().min(1, 'Description is required'),
    category: optionalString,
    supportingDocuments: optionalString,
    organization: optionalString,
    userId: optionalString,
});

const workExperienceCreateSchema = z.object({
    company: z.string().trim().min(1, 'Company is required'),
    role: z.string().trim().min(1, 'Role is required'),
    startDate: z.string().trim().min(1, 'Start date is required'),
    endDate: optionalString,
    isPresent: z.preprocess(emptyToUndefined, z.coerce.boolean().optional()),
    isCurrent: z.preprocess(emptyToUndefined, z.coerce.boolean().optional()),
    description: optionalString,
    user: z
        .object({
            id: z.string().optional(),
        })
        .optional(),
});

const eventCreateSchema = z.object({
    eventName: z.string().trim().min(1, 'Event name is required'),
    description: z.string().trim().min(1, 'Description is required'),
    eventType: z.string().trim().min(1, 'Event type is required'),
    organizer: z.string().trim().min(1, 'Organizer is required'),
    date: z.string().trim().min(1, 'Date is required'),
    venue: z.string().trim().min(1, 'Venue is required'),
    contactPersonEmail: z.string().trim().email('Valid contact email is required'),
    sponsorshipDetails: optionalString,
    imageUrl: optionalString,
});

const contactSubmitSchema = z.object({
    name: z.string().trim().min(1, 'Name is required'),
    email: z.string().trim().email('Valid email is required'),
    message: z.string().trim().min(1, 'Message is required'),
    subject: optionalString,
});

module.exports = {
    registerSchema,
    loginSchema,
    jobCreateSchema,
    achievementCreateSchema,
    workExperienceCreateSchema,
    eventCreateSchema,
    contactSubmitSchema,
};
