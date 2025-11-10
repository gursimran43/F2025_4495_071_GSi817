import { Mail, Phone, MapPin, Briefcase, GraduationCap, Award } from 'lucide-react';

interface Experience {
    id: string;
    company: string;
    position: string;
    duration: string;
    description: string | string[];
}

interface Education {
    id: string;
    school: string;
    degree: string;
    year: string;
}

interface PersonalInfo {
    name: string;
    email: string;
    phone: string;
    location: string;
    summary: string;
}

interface ResumePreviewProps {
    personalInfo: PersonalInfo;
    experiences: Experience[];
    education: Education[];
    skills: string;
}

export const ResumePreview = ({ personalInfo, experiences, education, skills }: ResumePreviewProps) => {
    console.log('ResumePreview received:', { personalInfo, experiences, education, skills });

    // Ensure we have valid data with defaults
    const safePersonalInfo = personalInfo || { name: '', email: '', phone: '', location: '', summary: '' };
    const safeExperiences = Array.isArray(experiences) ? experiences : [];
    const safeEducation = Array.isArray(education) ? education : [];
    const safeSkills = skills || '';

    // Split skills into array for better display
    const skillsArray = safeSkills ? safeSkills.split(',').map(s => s.trim()).filter(s => s) : [];

    // Format description to handle bullet points
    const formatDescription = (description: string | string[] | any) => {
        if (!description) return [];

        // If description is already an array, return it
        if (Array.isArray(description)) {
            return description.map(line => String(line).trim()).filter(line => line.length > 0);
        }

        // If description is not a string, convert it
        if (typeof description !== 'string') {
            return [String(description)];
        }

        // Split by newlines or bullet points
        const lines = description
            .split(/\n|•/)
            .map(line => line.trim())
            .filter(line => line.length > 0);

        return lines;
    };

    return (
        <div id="resume-content" className="w-full max-w-[210mm] mx-auto bg-white p-0" style={{ minHeight: '297mm' }}>
            <div className="flex h-full">
                {/* Left Sidebar - Accent Color */}
                <div className="w-[35%] bg-gradient-to-b from-slate-800 to-slate-900 text-white p-8">
                    {/* Profile Section */}
                    <div className="mb-8 pb-6 border-b-2 border-slate-600">
                        <div className="w-24 h-24 rounded-full bg-slate-700 flex items-center justify-center text-4xl font-bold mb-4 mx-auto">
                            {safePersonalInfo.name ? safePersonalInfo.name.charAt(0).toUpperCase() : 'U'}
                        </div>
                        <h1 className="text-2xl font-bold text-center mb-1 leading-tight">
                            {safePersonalInfo.name || 'Your Name'}
                        </h1>
                        <p className="text-slate-300 text-center text-sm">Professional</p>
                    </div>

                    {/* Contact Information */}
                    <div className="mb-8">
                        <h2 className="text-lg font-bold mb-4 flex items-center gap-2 text-slate-200">
                            <div className="w-6 h-6 bg-slate-700 rounded flex items-center justify-center">
                                <Mail className="w-4 h-4" />
                            </div>
                            CONTACT
                        </h2>
                        <div className="space-y-3 text-sm">
                            {safePersonalInfo.email && (
                                <div className="flex items-start gap-2">
                                    <Mail className="w-4 h-4 mt-0.5 flex-shrink-0 text-slate-400" />
                                    <span className="text-slate-300 break-all">{safePersonalInfo.email}</span>
                                </div>
                            )}
                            {safePersonalInfo.phone && (
                                <div className="flex items-start gap-2">
                                    <Phone className="w-4 h-4 mt-0.5 flex-shrink-0 text-slate-400" />
                                    <span className="text-slate-300">{safePersonalInfo.phone}</span>
                                </div>
                            )}
                            {safePersonalInfo.location && (
                                <div className="flex items-start gap-2">
                                    <MapPin className="w-4 h-4 mt-0.5 flex-shrink-0 text-slate-400" />
                                    <span className="text-slate-300">{safePersonalInfo.location}</span>
                                </div>
                            )}
                        </div>
                    </div>

                    {/* Skills */}
                    {skillsArray.length > 0 && (
                        <div className="mb-8">
                            <h2 className="text-lg font-bold mb-4 flex items-center gap-2 text-slate-200">
                                <div className="w-6 h-6 bg-slate-700 rounded flex items-center justify-center">
                                    <Award className="w-4 h-4" />
                                </div>
                                SKILLS
                            </h2>
                            <div className="flex flex-wrap gap-2">
                                {skillsArray.map((skill, index) => (
                                    <div
                                        key={index}
                                        className="px-3 py-1.5 bg-slate-700 text-slate-200 rounded-full text-xs font-medium"
                                    >
                                        {skill}
                                    </div>
                                ))}
                            </div>
                        </div>
                    )}
                </div>

                {/* Right Content Area */}
                <div className="w-[65%] p-8 bg-white">
                    {/* Professional Summary */}
                    {safePersonalInfo.summary && (
                        <div className="mb-8">
                            <div className="flex items-center gap-2 mb-3">
                                <div className="h-8 w-1 bg-slate-800"></div>
                                <h2 className="text-xl font-bold text-slate-800 uppercase tracking-wide">
                                    Professional Summary
                                </h2>
                            </div>
                            <p className="text-sm text-slate-700 leading-relaxed pl-3">
                                {safePersonalInfo.summary}
                            </p>
                        </div>
                    )}

                    {/* Experience */}
                    {safeExperiences.some(exp => exp.company || exp.position) && (
                        <div className="mb-8">
                            <div className="flex items-center gap-2 mb-4">
                                <div className="h-8 w-1 bg-slate-800"></div>
                                <h2 className="text-xl font-bold text-slate-800 uppercase tracking-wide flex items-center gap-2">
                                    <Briefcase className="w-5 h-5" />
                                    Work Experience
                                </h2>
                            </div>
                            <div className="space-y-5 pl-3">
                                {safeExperiences.filter(exp => exp.company || exp.position).map((exp) => {
                                    const descriptionLines = formatDescription(exp.description);

                                    return (
                                        <div key={exp.id} className="relative">
                                            {/* Timeline dot */}
                                            <div className="absolute -left-6 top-1 w-2 h-2 bg-slate-400 rounded-full"></div>

                                            <div className="flex justify-between items-start mb-1">
                                                <h3 className="text-base font-bold text-slate-800">
                                                    {exp.position || 'Position'}
                                                </h3>
                                                {exp.duration && (
                                                    <span className="text-xs text-slate-500 font-medium bg-slate-100 px-2 py-1 rounded">
                                                        {exp.duration}
                                                    </span>
                                                )}
                                            </div>
                                            <p className="text-sm font-semibold text-slate-600 mb-2">{exp.company}</p>
                                            {descriptionLines.length > 0 && (
                                                <ul className="space-y-1">
                                                    {descriptionLines.map((line, idx) => (
                                                        <li key={idx} className="text-sm text-slate-700 leading-relaxed flex items-start gap-2">
                                                            <span className="text-slate-400 mt-1.5 flex-shrink-0">•</span>
                                                            <span>{line}</span>
                                                        </li>
                                                    ))}
                                                </ul>
                                            )}
                                        </div>
                                    );
                                })}
                            </div>
                        </div>
                    )}

                    {/* Education */}
                    {safeEducation.some(edu => edu.school || edu.degree) && (
                        <div className="mb-8">
                            <div className="flex items-center gap-2 mb-4">
                                <div className="h-8 w-1 bg-slate-800"></div>
                                <h2 className="text-xl font-bold text-slate-800 uppercase tracking-wide flex items-center gap-2">
                                    <GraduationCap className="w-5 h-5" />
                                    Education
                                </h2>
                            </div>
                            <div className="space-y-4 pl-3">
                                {safeEducation.filter(edu => edu.school || edu.degree).map((edu) => (
                                    <div key={edu.id} className="relative">
                                        {/* Timeline dot */}
                                        <div className="absolute -left-6 top-1 w-2 h-2 bg-slate-400 rounded-full"></div>

                                        <div className="flex justify-between items-start mb-1">
                                            <h3 className="text-base font-bold text-slate-800">
                                                {edu.degree || 'Degree'}
                                            </h3>
                                            {edu.year && (
                                                <span className="text-xs text-slate-500 font-medium bg-slate-100 px-2 py-1 rounded">
                                                    {edu.year}
                                                </span>
                                            )}
                                        </div>
                                        <p className="text-sm font-medium text-slate-600">{edu.school}</p>
                                    </div>
                                ))}
                            </div>
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
};
