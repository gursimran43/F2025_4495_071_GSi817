import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { FileText, Sparkles, Download, Eye, ArrowLeft, Plus, Trash2, Save } from 'lucide-react';
import Header from '@/components/Header';
import Footer from '@/components/Footer';
import { useToast } from '@/hooks/use-toast';
import { ResumePreview } from '@/components/ResumePreview';
import { api, type Resume as ApiResume } from '@/services/api';

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

const ResumeBuilder = () => {
    const navigate = useNavigate();
    const { toast } = useToast();
    const [isGenerating, setIsGenerating] = useState(false);
    const [isSaving, setIsSaving] = useState(false);
    const [isLoading, setIsLoading] = useState(true);
    const [showPreview, setShowPreview] = useState(false);
    const [resumeId, setResumeId] = useState<string | null>(null);

    const [personalInfo, setPersonalInfo] = useState({
        name: '',
        email: '',
        phone: '',
        location: '',
        summary: ''
    });

    const [experiences, setExperiences] = useState<Experience[]>([
        { id: '1', company: '', position: '', duration: '', description: '' }
    ]);

    const [education, setEducation] = useState<Education[]>([
        { id: '1', school: '', degree: '', year: '' }
    ]);

    const [skills, setSkills] = useState('');

    useEffect(() => {
        loadExistingResume();
    }, []);

    const loadExistingResume = async () => {
        try {
            setIsLoading(true);
            const response = await api.getResumes();
            if (response.success && response.data && response.data.resumes.length > 0) {
                const resume = response.data.resumes[0]; // Load the first resume
                setResumeId(resume._id!);
                setPersonalInfo({
                    name: resume.personalInfo.name || '',
                    email: resume.personalInfo.email || '',
                    phone: resume.personalInfo.phone || '',
                    location: resume.personalInfo.location || '',
                    summary: resume.personalInfo.summary || ''
                });
                setExperiences(resume.experiences.map((exp, idx) => ({
                    id: `${idx}`,
                    ...exp
                })));
                setEducation(resume.education.map((edu, idx) => ({
                    id: `${idx}`,
                    ...edu
                })));
                setSkills(resume.skills || '');
                toast({
                    title: "Resume Loaded",
                    description: "Your existing resume has been loaded",
                });
            }
        } catch (error) {
            console.error('Error loading resume:', error);
        } finally {
            setIsLoading(false);
        }
    };

    const handleSaveResume = async () => {
        try {
            setIsSaving(true);
            const resumeData = {
                personalInfo: {
                    name: personalInfo.name,
                    email: personalInfo.email,
                    phone: personalInfo.phone,
                    location: personalInfo.location,
                    summary: personalInfo.summary
                },
                experiences: experiences.map(({ id, ...exp }) => exp),
                education: education.map(({ id, ...edu }) => edu),
                skills: skills,
                template: 'modern' as const
            };

            if (resumeId) {
                // Update existing resume
                const response = await api.updateResume(resumeId, resumeData);
                if (response.success) {
                    toast({
                        title: "Resume Updated",
                        description: "Your resume has been saved successfully",
                    });
                }
            } else {
                // Create new resume
                const response = await api.createResume(resumeData);
                if (response.success && response.data) {
                    setResumeId(response.data.resume._id!);
                    toast({
                        title: "Resume Created",
                        description: "Your resume has been created successfully",
                    });
                }
            }
        } catch (error) {
            console.error('Error saving resume:', error);
            toast({
                title: "Save Failed",
                description: "Failed to save resume. Please try again.",
                variant: "destructive",
            });
        } finally {
            setIsSaving(false);
        }
    };

    const handleGenerateWithAI = async () => {
        try {
            setIsGenerating(true);

            // Call the AI resume generation API
            const response = await api.generateResumeWithAI();

            if (response.success && response.data) {
                const { resumeContent } = response.data;

                console.log('AI Generated Resume Content:', resumeContent);

                // Populate form with AI-generated content
                setPersonalInfo({
                    name: resumeContent.personalInfo?.name || '',
                    email: resumeContent.personalInfo?.email || '',
                    phone: resumeContent.personalInfo?.phone || '',
                    location: resumeContent.personalInfo?.location || '',
                    summary: resumeContent.personalInfo?.summary || ''
                });

                setExperiences(
                    Array.isArray(resumeContent.experiences) && resumeContent.experiences.length > 0
                        ? resumeContent.experiences.map((exp, idx) => ({
                            id: (idx + 1).toString(),
                            company: exp.company || '',
                            position: exp.position || '',
                            duration: exp.duration || '',
                            description: exp.description || ''
                        }))
                        : [{ id: '1', company: '', position: '', duration: '', description: '' }]
                );

                setEducation(
                    Array.isArray(resumeContent.education) && resumeContent.education.length > 0
                        ? resumeContent.education.map((edu, idx) => ({
                            id: (idx + 1).toString(),
                            school: edu.school || '',
                            degree: edu.degree || '',
                            year: edu.year || ''
                        }))
                        : [{ id: '1', school: '', degree: '', year: '' }]
                );

                setSkills(resumeContent.skills || '');

                console.log('State updated with:', {
                    personalInfo,
                    experiencesCount: resumeContent.experiences?.length,
                    educationCount: resumeContent.education?.length,
                    skillsLength: resumeContent.skills?.length
                });

                toast({
                    title: "Resume Generated!",
                    description: "Your resume has been filled with personalized AI-generated content based on your profile.",
                });
            } else {
                throw new Error(response.message || 'Failed to generate resume');
            }
        } catch (error) {
            console.error('Error generating resume:', error);
            toast({
                title: "Generation Failed",
                description: "Failed to generate resume content. Please try again or fill manually.",
                variant: "destructive",
            });
        } finally {
            setIsGenerating(false);
        }
    };

    const addExperience = () => {
        setExperiences([...experiences, { id: Date.now().toString(), company: '', position: '', duration: '', description: '' }]);
    };

    const removeExperience = (id: string) => {
        setExperiences(experiences.filter(exp => exp.id !== id));
    };

    const addEducation = () => {
        setEducation([...education, { id: Date.now().toString(), school: '', degree: '', year: '' }]);
    };

    const removeEducation = (id: string) => {
        setEducation(education.filter(edu => edu.id !== id));
    };

    const handlePreview = () => {
        setShowPreview(true);
    };

    const handleDownload = async () => {
        try {
            // First, open the preview dialog to ensure the resume content is rendered
            setShowPreview(true);

            // Wait a bit for the dialog to render
            await new Promise(resolve => setTimeout(resolve, 300));

            const element = document.getElementById('resume-content');
            if (!element) {
                toast({
                    variant: 'destructive',
                    title: "Error",
                    description: "Could not find resume content to download.",
                });
                return;
            }

            toast({
                title: "Generating PDF...",
                description: "Please wait while we create your PDF.",
            });

            // Import html2canvas and jsPDF dynamically
            const html2canvas = (await import('html2canvas')).default;
            const { jsPDF } = await import('jspdf');

            const canvas = await html2canvas(element, {
                scale: 2,
                backgroundColor: '#ffffff',
                logging: false,
                useCORS: true,
                allowTaint: true,
            });

            const imgData = canvas.toDataURL('image/png');
            const pdf = new jsPDF({
                orientation: 'portrait',
                unit: 'mm',
                format: 'a4',
            });

            const imgWidth = 210; // A4 width in mm
            const pageHeight = 297; // A4 height in mm
            const imgHeight = (canvas.height * imgWidth) / canvas.width;

            pdf.addImage(imgData, 'PNG', 0, 0, imgWidth, imgHeight);
            pdf.save(`${personalInfo.name.replace(/\s+/g, '_') || 'resume'}.pdf`);

            toast({
                title: "Download Complete",
                description: "Your resume has been downloaded as PDF.",
            });

            // Close the preview after a short delay
            setTimeout(() => setShowPreview(false), 500);
        } catch (error) {
            console.error('PDF generation error:', error);
            toast({
                variant: 'destructive',
                title: "Download Failed",
                description: "Could not generate PDF. Please try again.",
            });
            setShowPreview(false);
        }
    };

    return (
        <div className="min-h-screen bg-gradient-to-br from-background via-background to-primary/5 flex flex-col">
            <Header />

            {/* Decorative elements */}
            <div className="fixed inset-0 overflow-hidden pointer-events-none">
                <div className="absolute -top-40 -right-40 w-80 h-80 bg-primary/10 rounded-full blur-3xl"></div>
                <div className="absolute top-1/2 -left-40 w-80 h-80 bg-accent/10 rounded-full blur-3xl"></div>
            </div>

            {isLoading ? (
                <div className="flex-1 flex items-center justify-center">
                    <div className="text-center space-y-4">
                        <div className="animate-spin h-12 w-12 border-4 border-primary border-t-transparent rounded-full mx-auto"></div>
                        <p className="text-muted-foreground">Loading your resume...</p>
                    </div>
                </div>
            ) : (
                <div className="flex-1 py-12 px-6 relative z-10">
                    <div className="max-w-6xl mx-auto space-y-8">
                        {/* Header */}
                        <div className="flex items-center justify-between">
                            <div className="space-y-2">
                                <div className="flex items-center gap-3">
                                    <Button variant="ghost" size="icon" onClick={() => navigate('/dashboard')}>
                                        <ArrowLeft className="h-5 w-5" />
                                    </Button>
                                    <div className="flex items-center gap-3">
                                        <div className="p-2 bg-primary/10 rounded-xl">
                                            <FileText className="h-6 w-6 text-primary" />
                                        </div>
                                        <h1 className="text-3xl font-bold text-foreground">Resume Builder</h1>
                                    </div>
                                </div>
                                <p className="text-muted-foreground ml-14">
                                    Create a professional resume with AI assistance
                                </p>
                            </div>

                            <div className="flex gap-3">
                                <Button
                                    variant="secondary"
                                    onClick={handleSaveResume}
                                    disabled={isSaving}
                                    className="gap-2"
                                >
                                    <Save className="h-4 w-4" />
                                    {isSaving ? 'Saving...' : 'Save'}
                                </Button>
                                <Button variant="outline" onClick={handlePreview} className="gap-2">
                                    <Eye className="h-4 w-4" />
                                    Preview
                                </Button>
                                <Button onClick={handleDownload} className="gap-2">
                                    <Download className="h-4 w-4" />
                                    Download PDF
                                </Button>
                            </div>
                        </div>

                        {/* AI Generate Button */}
                        <Card className="border-2 border-primary/20 bg-gradient-to-r from-primary/5 to-accent/5">
                            <CardContent className="py-6">
                                <div className="flex items-center justify-between">
                                    <div className="space-y-1">
                                        <h3 className="text-lg font-semibold text-foreground flex items-center gap-2">
                                            <Sparkles className="h-5 w-5 text-primary" />
                                            Generate Resume with AI
                                        </h3>
                                        <p className="text-sm text-muted-foreground">
                                            Let AI create a professional resume based on your profile
                                        </p>
                                    </div>
                                    <Button
                                        onClick={handleGenerateWithAI}
                                        disabled={isGenerating}
                                        size="lg"
                                        className="gap-2"
                                    >
                                        <Sparkles className="h-4 w-4" />
                                        {isGenerating ? 'Generating...' : 'Generate with AI'}
                                    </Button>
                                </div>
                            </CardContent>
                        </Card>

                        {/* Main Content */}
                        <Tabs defaultValue="personal" className="space-y-6">
                            <TabsList className="grid w-full grid-cols-4">
                                <TabsTrigger value="personal">Personal Info</TabsTrigger>
                                <TabsTrigger value="experience">Experience</TabsTrigger>
                                <TabsTrigger value="education">Education</TabsTrigger>
                                <TabsTrigger value="skills">Skills</TabsTrigger>
                            </TabsList>

                            {/* Personal Info Tab */}
                            <TabsContent value="personal" className="space-y-6">
                                <Card>
                                    <CardHeader>
                                        <CardTitle>Personal Information</CardTitle>
                                        <CardDescription>Enter your basic contact details</CardDescription>
                                    </CardHeader>
                                    <CardContent className="space-y-4">
                                        <div className="grid sm:grid-cols-2 gap-4">
                                            <div className="space-y-2">
                                                <Label htmlFor="name">Full Name</Label>
                                                <Input
                                                    id="name"
                                                    placeholder="John Doe"
                                                    value={personalInfo.name}
                                                    onChange={(e) => setPersonalInfo({ ...personalInfo, name: e.target.value })}
                                                />
                                            </div>
                                            <div className="space-y-2">
                                                <Label htmlFor="email">Email</Label>
                                                <Input
                                                    id="email"
                                                    type="email"
                                                    placeholder="john@example.com"
                                                    value={personalInfo.email}
                                                    onChange={(e) => setPersonalInfo({ ...personalInfo, email: e.target.value })}
                                                />
                                            </div>
                                            <div className="space-y-2">
                                                <Label htmlFor="phone">Phone</Label>
                                                <Input
                                                    id="phone"
                                                    placeholder="+1 (555) 123-4567"
                                                    value={personalInfo.phone}
                                                    onChange={(e) => setPersonalInfo({ ...personalInfo, phone: e.target.value })}
                                                />
                                            </div>
                                            <div className="space-y-2">
                                                <Label htmlFor="location">Location</Label>
                                                <Input
                                                    id="location"
                                                    placeholder="San Francisco, CA"
                                                    value={personalInfo.location}
                                                    onChange={(e) => setPersonalInfo({ ...personalInfo, location: e.target.value })}
                                                />
                                            </div>
                                        </div>
                                        <div className="space-y-2">
                                            <Label htmlFor="summary">Professional Summary</Label>
                                            <Textarea
                                                id="summary"
                                                placeholder="A brief overview of your professional background and career goals..."
                                                rows={4}
                                                value={personalInfo.summary}
                                                onChange={(e) => setPersonalInfo({ ...personalInfo, summary: e.target.value })}
                                            />
                                        </div>
                                    </CardContent>
                                </Card>
                            </TabsContent>

                            {/* Experience Tab */}
                            <TabsContent value="experience" className="space-y-6">
                                {experiences.map((exp, index) => (
                                    <Card key={exp.id}>
                                        <CardHeader>
                                            <div className="flex items-center justify-between">
                                                <CardTitle>Experience #{index + 1}</CardTitle>
                                                {experiences.length > 1 && (
                                                    <Button
                                                        variant="ghost"
                                                        size="icon"
                                                        onClick={() => removeExperience(exp.id)}
                                                    >
                                                        <Trash2 className="h-4 w-4 text-destructive" />
                                                    </Button>
                                                )}
                                            </div>
                                        </CardHeader>
                                        <CardContent className="space-y-4">
                                            <div className="grid sm:grid-cols-2 gap-4">
                                                <div className="space-y-2">
                                                    <Label>Company</Label>
                                                    <Input
                                                        placeholder="Company Name"
                                                        value={exp.company}
                                                        onChange={(e) => {
                                                            const updated = [...experiences];
                                                            updated[index].company = e.target.value;
                                                            setExperiences(updated);
                                                        }}
                                                    />
                                                </div>
                                                <div className="space-y-2">
                                                    <Label>Position</Label>
                                                    <Input
                                                        placeholder="Job Title"
                                                        value={exp.position}
                                                        onChange={(e) => {
                                                            const updated = [...experiences];
                                                            updated[index].position = e.target.value;
                                                            setExperiences(updated);
                                                        }}
                                                    />
                                                </div>
                                            </div>
                                            <div className="space-y-2">
                                                <Label>Duration</Label>
                                                <Input
                                                    placeholder="2020 - 2023"
                                                    value={exp.duration}
                                                    onChange={(e) => {
                                                        const updated = [...experiences];
                                                        updated[index].duration = e.target.value;
                                                        setExperiences(updated);
                                                    }}
                                                />
                                            </div>
                                            <div className="space-y-2">
                                                <Label>Description</Label>
                                                <Textarea
                                                    placeholder="Describe your responsibilities and achievements..."
                                                    rows={3}
                                                    value={Array.isArray(exp.description) ? exp.description.join('\n') : exp.description}
                                                    onChange={(e) => {
                                                        const updated = [...experiences];
                                                        updated[index].description = e.target.value;
                                                        setExperiences(updated);
                                                    }}
                                                />
                                            </div>
                                        </CardContent>
                                    </Card>
                                ))}
                                <Button onClick={addExperience} variant="outline" className="w-full gap-2">
                                    <Plus className="h-4 w-4" />
                                    Add Experience
                                </Button>
                            </TabsContent>

                            {/* Education Tab */}
                            <TabsContent value="education" className="space-y-6">
                                {education.map((edu, index) => (
                                    <Card key={edu.id}>
                                        <CardHeader>
                                            <div className="flex items-center justify-between">
                                                <CardTitle>Education #{index + 1}</CardTitle>
                                                {education.length > 1 && (
                                                    <Button
                                                        variant="ghost"
                                                        size="icon"
                                                        onClick={() => removeEducation(edu.id)}
                                                    >
                                                        <Trash2 className="h-4 w-4 text-destructive" />
                                                    </Button>
                                                )}
                                            </div>
                                        </CardHeader>
                                        <CardContent className="space-y-4">
                                            <div className="space-y-2">
                                                <Label>School/University</Label>
                                                <Input
                                                    placeholder="Institution Name"
                                                    value={edu.school}
                                                    onChange={(e) => {
                                                        const updated = [...education];
                                                        updated[index].school = e.target.value;
                                                        setEducation(updated);
                                                    }}
                                                />
                                            </div>
                                            <div className="space-y-2">
                                                <Label>Degree</Label>
                                                <Input
                                                    placeholder="Bachelor of Science in Computer Science"
                                                    value={edu.degree}
                                                    onChange={(e) => {
                                                        const updated = [...education];
                                                        updated[index].degree = e.target.value;
                                                        setEducation(updated);
                                                    }}
                                                />
                                            </div>
                                            <div className="space-y-2">
                                                <Label>Year</Label>
                                                <Input
                                                    placeholder="2023"
                                                    value={edu.year}
                                                    onChange={(e) => {
                                                        const updated = [...education];
                                                        updated[index].year = e.target.value;
                                                        setEducation(updated);
                                                    }}
                                                />
                                            </div>
                                        </CardContent>
                                    </Card>
                                ))}
                                <Button onClick={addEducation} variant="outline" className="w-full gap-2">
                                    <Plus className="h-4 w-4" />
                                    Add Education
                                </Button>
                            </TabsContent>

                            {/* Skills Tab */}
                            <TabsContent value="skills">
                                <Card>
                                    <CardHeader>
                                        <CardTitle>Skills</CardTitle>
                                        <CardDescription>List your technical and professional skills</CardDescription>
                                    </CardHeader>
                                    <CardContent className="space-y-4">
                                        <div className="space-y-2">
                                            <Label htmlFor="skills">Your Skills</Label>
                                            <Textarea
                                                id="skills"
                                                placeholder="JavaScript, React, Node.js, Python, AWS, Docker, etc."
                                                rows={8}
                                                value={skills}
                                                onChange={(e) => setSkills(e.target.value)}
                                            />
                                            <p className="text-xs text-muted-foreground">
                                                Separate skills with commas
                                            </p>
                                        </div>
                                    </CardContent>
                                </Card>
                            </TabsContent>
                        </Tabs>
                    </div>
                </div>
            )}

            <Footer />

            {/* Preview Dialog */}
            <Dialog open={showPreview} onOpenChange={setShowPreview}>
                <DialogContent className="max-w-5xl max-h-[90vh] overflow-y-auto p-6">
                    <DialogHeader>
                        <DialogTitle>Resume Preview</DialogTitle>
                    </DialogHeader>
                    <div className="mt-4">
                        <ResumePreview
                            personalInfo={personalInfo}
                            experiences={experiences}
                            education={education}
                            skills={skills}
                        />
                    </div>
                </DialogContent>
            </Dialog>
        </div>
    );
};

export default ResumeBuilder;