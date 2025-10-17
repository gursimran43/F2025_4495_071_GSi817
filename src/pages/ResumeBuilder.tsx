import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { FileText, Sparkles, Download, Eye, ArrowLeft, Plus, Trash2 } from 'lucide-react';
import Header from '@/components/Header';
import Footer from '@/components/Footer';
import { useToast } from '@/hooks/use-toast';

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

const ResumeBuilder = () => {
    const navigate = useNavigate();
    const { toast } = useToast();
    const [isGenerating, setIsGenerating] = useState(false);

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

    const handleGenerateWithAI = () => {
        setIsGenerating(true);

        // Simulate AI generation
        setTimeout(() => {
            setPersonalInfo({
                name: 'John Doe',
                email: 'john.doe@example.com',
                phone: '+1 (555) 123-4567',
                location: 'San Francisco, CA',
                summary: 'Results-driven professional with 5+ years of experience in software development. Passionate about creating innovative solutions and leading high-performing teams.'
            });

            setExperiences([
                {
                    id: '1',
                    company: 'Tech Corp',
                    position: 'Senior Software Engineer',
                    duration: '2021 - Present',
                    description: 'Led development of scalable web applications, mentored junior developers, and improved system performance by 40%.'
                },
                {
                    id: '2',
                    company: 'StartupXYZ',
                    position: 'Software Engineer',
                    duration: '2019 - 2021',
                    description: 'Developed full-stack applications using React and Node.js, collaborated with cross-functional teams.'
                }
            ]);

            setEducation([
                {
                    id: '1',
                    school: 'University of Technology',
                    degree: 'Bachelor of Science in Computer Science',
                    year: '2019'
                }
            ]);

            setSkills('JavaScript, TypeScript, React, Node.js, Python, AWS, Docker, Agile Methodologies');

            setIsGenerating(false);
            toast({
                title: "Resume Generated!",
                description: "Your resume has been filled with AI-generated content.",
            });
        }, 2500);
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
        toast({
            title: "Preview Mode",
            description: "Resume preview feature coming soon!",
        });
    };

    const handleDownload = () => {
        toast({
            title: "Download Started",
            description: "Your resume is being downloaded as PDF.",
        });
    };

    return (
        <div className="min-h-screen bg-gradient-to-br from-background via-background to-primary/5 flex flex-col">
            <Header />

            {/* Decorative elements */}
            <div className="fixed inset-0 overflow-hidden pointer-events-none">
                <div className="absolute -top-40 -right-40 w-80 h-80 bg-primary/10 rounded-full blur-3xl"></div>
                <div className="absolute top-1/2 -left-40 w-80 h-80 bg-accent/10 rounded-full blur-3xl"></div>
            </div>

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
                                                value={exp.description}
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

            <Footer />
        </div>
    );
};

export default ResumeBuilder;
