import { Card, CardContent } from '@/components/ui/card';

interface Experience {
    id: string;
    company: string;
    position: string;
    duration: string;
    description: string;
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
    return (
        <Card className="w-full max-w-4xl mx-auto bg-white text-black">
            <CardContent className="p-12 space-y-6" id="resume-content">
                {/* Header */}
                <div className="border-b-2 border-black pb-4">
                    <h1 className="text-4xl font-bold text-black mb-2">{personalInfo.name || 'Your Name'}</h1>
                    <div className="flex flex-wrap gap-4 text-sm text-gray-700">
                        {personalInfo.email && <span>{personalInfo.email}</span>}
                        {personalInfo.phone && <span>•</span>}
                        {personalInfo.phone && <span>{personalInfo.phone}</span>}
                        {personalInfo.location && <span>•</span>}
                        {personalInfo.location && <span>{personalInfo.location}</span>}
                    </div>
                </div>

                {/* Summary */}
                {personalInfo.summary && (
                    <div className="space-y-2">
                        <h2 className="text-xl font-bold text-black uppercase border-b border-gray-400 pb-1">
                            Professional Summary
                        </h2>
                        <p className="text-sm text-gray-800 leading-relaxed">{personalInfo.summary}</p>
                    </div>
                )}

                {/* Experience */}
                {experiences.some(exp => exp.company || exp.position) && (
                    <div className="space-y-3">
                        <h2 className="text-xl font-bold text-black uppercase border-b border-gray-400 pb-1">
                            Experience
                        </h2>
                        {experiences.filter(exp => exp.company || exp.position).map((exp) => (
                            <div key={exp.id} className="space-y-1">
                                <div className="flex justify-between items-baseline">
                                    <h3 className="text-lg font-semibold text-black">{exp.position || 'Position'}</h3>
                                    <span className="text-sm text-gray-600">{exp.duration}</span>
                                </div>
                                <p className="text-md font-medium text-gray-700">{exp.company}</p>
                                {exp.description && (
                                    <p className="text-sm text-gray-800 leading-relaxed">{exp.description}</p>
                                )}
                            </div>
                        ))}
                    </div>
                )}

                {/* Education */}
                {education.some(edu => edu.school || edu.degree) && (
                    <div className="space-y-3">
                        <h2 className="text-xl font-bold text-black uppercase border-b border-gray-400 pb-1">
                            Education
                        </h2>
                        {education.filter(edu => edu.school || edu.degree).map((edu) => (
                            <div key={edu.id} className="space-y-1">
                                <div className="flex justify-between items-baseline">
                                    <h3 className="text-lg font-semibold text-black">{edu.degree || 'Degree'}</h3>
                                    <span className="text-sm text-gray-600">{edu.year}</span>
                                </div>
                                <p className="text-md text-gray-700">{edu.school}</p>
                            </div>
                        ))}
                    </div>
                )}

                {/* Skills */}
                {skills && (
                    <div className="space-y-2">
                        <h2 className="text-xl font-bold text-black uppercase border-b border-gray-400 pb-1">
                            Skills
                        </h2>
                        <p className="text-sm text-gray-800 leading-relaxed">{skills}</p>
                    </div>
                )}
            </CardContent>
        </Card>
    );
};