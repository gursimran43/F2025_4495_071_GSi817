const { model } = require('../config/gemini');

class GeminiService {
  // Generate personalized tasks based on onboarding data
  static async generateTasksFromOnboarding(onboardingData) {
    try {
      console.log('🤖 Generating AI tasks for:', onboardingData.name);
      
      const prompt = `
You are a professional career development AI assistant. Based on the following user profile, generate exactly 8-10 actionable, specific tasks to help them achieve their career goals.

User Profile:
- Name: ${onboardingData.name}
- Profession: ${onboardingData.profession}
- Experience Level: ${onboardingData.experience}
- Industry: ${onboardingData.industry}
- Current Skills: ${onboardingData.currentSkills}
- Career Goals: ${onboardingData.goals}
- Timeline: ${onboardingData.timeline}
- Motivation: ${onboardingData.motivation}
- Learning Style: ${onboardingData.learningStyle}
- Weekly Hours Available: ${onboardingData.weeklyHours}

Generate tasks that are:
1. Specific and actionable (not vague)
2. Properly prioritized (high/medium/low based on importance for their goals)
3. Categorized appropriately (Foundation, Learning, Projects, Networking, Portfolio, etc.)
4. Progressive (easier foundational tasks first, then advanced)
5. Realistic for their experience level and available time
6. Aligned with their timeline and weekly hours

Return ONLY a valid JSON array (no other text, no markdown, no backticks) with this exact format:
[
  {
    "title": "Complete and specific task title here",
    "description": "Detailed 2-3 sentence description explaining what to do, how to do it, and why it matters for their goals",
    "priority": "high",
    "category": "Foundation",
    "estimatedDuration": "2 weeks",
    "subtasks": [
      "Specific actionable subtask 1",
      "Specific actionable subtask 2",
      "Specific actionable subtask 3",
      "Specific actionable subtask 4",
      "Specific actionable subtask 5"
    ]
  }
]

IMPORTANT REQUIREMENTS FOR SUBTASKS:
- Generate 5-10 specific, actionable subtasks for EACH task
- Subtasks should be small, concrete steps that break down the main task
- Each subtask should be completable in 1-2 hours or less
- Subtasks should be ordered logically (start to finish)
- Make subtasks clear enough that checking them off provides a sense of progress
- Example subtask format: "Research and bookmark 3 online courses", "Complete module 1 of the course", "Build the header component"

Categories to use: Foundation, Learning, Projects, Networking, Certification, Portfolio, Research, Practice, Skills
Priorities: high (critical for goals), medium (important), low (beneficial but not essential)
Duration examples: "3 days", "1 week", "2 weeks", "1 month", "6 weeks"
`;

      const result = await model.generateContent(prompt);
      const response = await result.response;
      const text = response.text();
      
      console.log('🤖 Raw AI Response:', text.substring(0, 200) + '...');
      
      // Clean up the response and parse JSON
      const cleanText = text
        .trim()
        .replace(/```json\n?/g, '')
        .replace(/```\n?/g, '')
        .replace(/^[^[\{]*/, '')
        .replace(/[^}\]]*$/, '')
        .trim();
      
      let tasks;
      try {
        tasks = JSON.parse(cleanText);
      } catch (parseError) {
        console.error('❌ JSON Parse Error:', parseError.message);
        console.log('📝 Cleaned Text:', cleanText);
        return this.getFallbackTasks(onboardingData);
      }
      
      // Validate and ensure we have proper task structure
      const validatedTasks = tasks.map((task, index) => ({
        title: task.title || `Career Task ${index + 1}`,
        description: task.description || 'Complete this task to advance your career goals.',
        priority: ['high', 'medium', 'low'].includes(task.priority) ? task.priority : 'medium',
        category: task.category || 'General',
        estimatedDuration: task.estimatedDuration || '1 week',
        subtasks: Array.isArray(task.subtasks) && task.subtasks.length > 0
          ? task.subtasks.map(st => ({
              title: typeof st === 'string' ? st : st.title || 'Subtask',
              completed: false
            }))
          : [],
        aiGenerated: true,
        percentage: 0,
        completed: false
      }));
      
      console.log(`✅ Generated ${validatedTasks.length} AI tasks successfully`);
      return validatedTasks;
      
    } catch (error) {
      console.error('❌ Gemini AI Task Generation Error:', error.message);
      console.log('🔄 Using fallback tasks instead');
      return this.getFallbackTasks(onboardingData);
    }
  }

  // Generate recommendations based on onboarding data and tasks
  static async generateRecommendations(onboardingData, tasks) {
    try {
      console.log('🤖 Generating AI recommendations for:', onboardingData.name);

      const taskTitles = tasks.map(t => t.title).join(', ');

      const prompt = `
You are a career development AI that generates SPECIFIC, REAL, and ACTIONABLE recommendations with REAL LINKS to actual resources.

User Profile:
- Name: ${onboardingData.name}
- Profession: ${onboardingData.profession}
- Experience: ${onboardingData.experience}
- Industry: ${onboardingData.industry}
- Current Skills: ${onboardingData.currentSkills}
- Goals: ${onboardingData.goals}
- Learning Style: ${onboardingData.learningStyle}
- Timeline: ${onboardingData.timeline}
- Weekly Hours: ${onboardingData.weeklyHours}

Their Generated Tasks: ${taskTitles}

Generate exactly 6 SPECIFIC recommendations with REAL resources and REAL LINKS:
- 2 REAL online courses from platforms like Coursera, Udemy, Udacity, LinkedIn Learning, Educative.io, Pluralsight, freeCodeCamp
- 2 SPECIFIC project ideas they can build (with real GitHub repos or tutorial links if available)
- 1 REAL professional certification program with actual certification link
- 1 REAL community to join (Reddit, Discord, Slack, Dev.to, LinkedIn groups) with actual join link

CRITICAL REQUIREMENTS:
1. Use REAL course names from REAL platforms with REAL URLs
2. Match courses to their profession (${onboardingData.profession}), industry (${onboardingData.industry}), and experience level (${onboardingData.experience})
3. Include specific pricing, duration, and level information
4. For communities, provide REAL Discord servers, Reddit subreddits, or Slack workspaces with actual join links
5. For certifications, use industry-recognized programs (AWS, Google Cloud, Microsoft, CompTIA, etc.) based on their field

Return ONLY valid JSON (no markdown, no backticks) in this EXACT format:
[
  {
    "title": "Exact course/resource name",
    "description": "Detailed 2-3 sentence description of what this resource offers and why it's perfect for their goals",
    "type": "course",
    "relevance": "Why this specifically matches their ${onboardingData.profession} career path and ${onboardingData.goals}",
    "platform": "Platform name (e.g., Coursera, Udemy)",
    "provider": "Content creator (e.g., Google, IBM, University)",
    "link": "REAL working URL to the resource",
    "format": "Interactive lessons / Video course / Live cohort / Async forum",
    "level": "Beginner / Intermediate / Advanced",
    "duration": "X weeks / X months / Self-paced",
    "price": "Free / $X / $X/mo",
    "outcomes": ["Specific skill 1", "Specific skill 2", "Specific skill 3"],
    "bonuses": ["Extra feature 1", "Extra feature 2"],
    "focusAreas": ["Topic 1", "Topic 2"],
    "highlights": ["Highlight 1", "Highlight 2"],
    "audience": "Who this is for"
  }
]

For PROJECT type recommendations:
- Provide specific project ideas relevant to ${onboardingData.profession}
- Include GitHub repos, tutorial links, or documentation links as the "link"
- Set price to "Free" and format to "Self-paced project"

For CERTIFICATION type:
- Use industry-standard certifications for ${onboardingData.industry}
- Include actual certification body links (AWS, Google, Microsoft, etc.)
- Provide real pricing and duration

For NETWORK type:
- Use REAL community links (https://reddit.com/r/..., https://discord.gg/..., https://slack.com/...)
- Specify platform and format clearly
- Include what makes this community valuable

Make every recommendation hyper-personalized to ${onboardingData.profession} working in ${onboardingData.industry} with ${onboardingData.experience} experience level.
`;

      const result = await model.generateContent(prompt);
      const response = await result.response;
      const text = response.text();

      console.log('🤖 Raw Recommendation Response (first 500 chars):', text.substring(0, 500));

      // Clean up the response and parse JSON
      const cleanText = text
        .trim()
        .replace(/```json\n?/g, '')
        .replace(/```\n?/g, '')
        .replace(/^[^[\{]*/, '')
        .replace(/[^}\]]*$/, '')
        .trim();

      let recommendations;
      try {
        recommendations = JSON.parse(cleanText);
      } catch (parseError) {
        console.error('❌ Recommendations JSON Parse Error:', parseError.message);
        console.log('📝 Cleaned Text:', cleanText.substring(0, 500));
        return this.getFallbackRecommendations(onboardingData);
      }

      const validatedRecommendations = recommendations.map(rec => ({
        title: rec.title || 'Professional Recommendation',
        description: rec.description || 'This resource will help advance your career.',
        type: ['course', 'project', 'certification', 'network'].includes(rec.type) ? rec.type : 'course',
        relevance: rec.relevance || 'Relevant to your career goals',
        platform: rec.platform || '',
        provider: rec.provider || '',
        link: rec.link || '',
        format: rec.format || '',
        level: rec.level || '',
        duration: rec.duration || '',
        price: rec.price || '',
        outcomes: Array.isArray(rec.outcomes) ? rec.outcomes : [],
        bonuses: Array.isArray(rec.bonuses) ? rec.bonuses : [],
        focusAreas: Array.isArray(rec.focusAreas) ? rec.focusAreas : [],
        highlights: Array.isArray(rec.highlights) ? rec.highlights : [],
        audience: rec.audience || ''
      }));

      console.log(`✅ Generated ${validatedRecommendations.length} AI recommendations successfully`);
      return validatedRecommendations;

    } catch (error) {
      console.error('❌ Gemini AI Recommendation Error:', error.message);
      return this.getFallbackRecommendations(onboardingData);
    }
  }

  // Enhance task description with more details
  static async enhanceTaskDescription(taskTitle, userContext) {
    try {
      const prompt = `
Enhance this task title with a detailed, actionable description:

Task: "${taskTitle}"
User Context: ${userContext}

Provide a 2-3 sentence description that:
1. Explains exactly what to do step by step
2. Why it's important for their career
3. Expected outcome or benefit

Return only the enhanced description (no other text, no quotes).
`;

      const result = await model.generateContent(prompt);
      const response = await result.response;
      return response.text().trim();
      
    } catch (error) {
      console.error('❌ Task Enhancement Error:', error.message);
      return `Complete this important task: ${taskTitle}. This will help advance your career goals and build valuable skills.`;
    }
  }

  // Fallback tasks if AI fails
  static getFallbackTasks(onboardingData) {
    const profession = onboardingData.profession.toLowerCase();
    const industry = onboardingData.industry.toLowerCase();
    
    console.log('🔄 Generating fallback tasks for:', profession, 'in', industry);
    
    const baseTasks = [
      {
        title: `Update ${profession} Resume for ${onboardingData.industry}`,
        description: `Create a modern, ATS-friendly resume highlighting your ${onboardingData.experience} experience in ${onboardingData.industry}. Use industry-specific keywords and quantify your achievements to stand out to recruiters.`,
        priority: 'high',
        category: 'Foundation',
        estimatedDuration: '1 week',
        subtasks: [
          { title: 'Research industry-specific keywords and requirements', completed: false },
          { title: 'Gather all past work experience and achievements', completed: false },
          { title: 'Choose a modern, ATS-friendly template', completed: false },
          { title: 'Write professional summary highlighting key skills', completed: false },
          { title: 'Add quantified achievements for each role', completed: false },
          { title: 'Proofread and optimize for ATS scanning', completed: false },
        ],
        aiGenerated: false,
        percentage: 0,
        completed: false
      },
      {
        title: 'Build Professional LinkedIn Profile',
        description: 'Optimize your LinkedIn profile with professional photo, compelling headline, and detailed experience section. Connect with industry professionals and share relevant content to build your network.',
        priority: 'high',
        category: 'Networking',
        estimatedDuration: '3 days',
        subtasks: [
          { title: 'Upload professional headshot photo', completed: false },
          { title: 'Write compelling headline and summary', completed: false },
          { title: 'Add all work experience with achievements', completed: false },
          { title: 'Request 5+ recommendations from colleagues', completed: false },
          { title: 'Connect with 50+ industry professionals', completed: false },
        ],
        aiGenerated: false,
        percentage: 0,
        completed: false
      },
      {
        title: 'Learn In-Demand Skills',
        description: `Identify and start learning 2-3 key skills that are highly valued in ${onboardingData.industry}. Focus on skills that align with your ${onboardingData.goals} and can be learned within your ${onboardingData.timeline} timeline.`,
        priority: 'medium',
        category: 'Learning',
        estimatedDuration: '1 month',
        subtasks: [
          { title: 'Research top 10 in-demand skills in your industry', completed: false },
          { title: 'Choose 2-3 skills aligned with career goals', completed: false },
          { title: 'Find quality online courses or resources', completed: false },
          { title: 'Complete 25% of first course', completed: false },
          { title: 'Complete 50% of first course', completed: false },
          { title: 'Complete 75% of first course', completed: false },
          { title: 'Finish first course and get certificate', completed: false },
        ],
        aiGenerated: false,
        percentage: 0,
        completed: false
      },
      {
        title: 'Build Portfolio Project',
        description: `Create a practical project that demonstrates your skills in ${profession}. This will serve as tangible proof of your abilities to potential employers or clients.`,
        priority: 'medium',
        category: 'Portfolio',
        estimatedDuration: '3 weeks',
        subtasks: [
          { title: 'Brainstorm and choose project idea', completed: false },
          { title: 'Create project plan and timeline', completed: false },
          { title: 'Set up development environment', completed: false },
          { title: 'Build core functionality', completed: false },
          { title: 'Add styling and polish', completed: false },
          { title: 'Write documentation', completed: false },
          { title: 'Deploy and share project', completed: false },
        ],
        aiGenerated: false,
        percentage: 0,
        completed: false
      },
      {
        title: 'Network with Industry Professionals',
        description: `Attend industry events, join professional groups, and connect with people working in ${onboardingData.industry}. Building relationships is crucial for career advancement.`,
        priority: 'medium',
        category: 'Networking',
        estimatedDuration: '2 weeks',
        subtasks: [
          { title: 'Find 3 relevant online communities or groups', completed: false },
          { title: 'Join and introduce yourself in communities', completed: false },
          { title: 'Attend virtual or in-person industry event', completed: false },
          { title: 'Have coffee chat with 2 industry professionals', completed: false },
          { title: 'Share valuable content with your network', completed: false },
        ],
        aiGenerated: false,
        percentage: 0,
        completed: false
      },
      {
        title: 'Research Industry Trends',
        description: `Stay updated with the latest trends, tools, and technologies in ${onboardingData.industry}. This knowledge will help you stay competitive and identify new opportunities.`,
        priority: 'low',
        category: 'Research',
        estimatedDuration: '1 week',
        subtasks: [
          { title: 'Subscribe to 3 industry newsletters', completed: false },
          { title: 'Follow 10 industry leaders on social media', completed: false },
          { title: 'Read 5 recent industry articles', completed: false },
          { title: 'Identify 3 emerging trends in your field', completed: false },
          { title: 'Create summary of key findings', completed: false },
        ],
        aiGenerated: false,
        percentage: 0,
        completed: false
      }
    ];
    
    return baseTasks.slice(0, 8); // Return 8 fallback tasks
  }

  // Fallback recommendations if AI fails
  static getFallbackRecommendations(onboardingData) {
    console.log('🔄 Generating fallback recommendations');

    const profession = (onboardingData.profession || 'Professional').toLowerCase();
    const industry = (onboardingData.industry || 'Technology').toLowerCase();

    return [
      {
        title: 'Google Professional Certificate',
        description: 'Explore industry-recognized certificates from top companies like Google, IBM, and Meta. These certificates can be completed in 3-6 months and are highly valued by employers.',
        type: 'course',
        relevance: 'Industry-recognized credentials that match current job market demands',
        platform: 'Coursera',
        provider: 'Google',
        link: 'https://www.coursera.org/google-certificates',
        format: 'Video course + hands-on labs',
        level: 'Beginner to Intermediate',
        duration: '3-6 months',
        price: '$49/month',
        outcomes: ['Industry certification', 'Job-ready skills', 'Portfolio projects'],
        bonuses: ['Career resources', 'Interview prep', 'Job board access'],
        focusAreas: ['Professional skills', 'Industry tools', 'Best practices'],
        highlights: [],
        audience: 'Career switchers and professionals'
      },
      {
        title: 'Build a Portfolio Website',
        description: 'Create a professional website showcasing your work, projects, and achievements. Use platforms like GitHub Pages, Netlify, or WordPress to build an impressive online presence.',
        type: 'project',
        relevance: 'Demonstrates your skills and makes you more visible to potential employers',
        platform: 'GitHub Pages',
        provider: 'Self-guided',
        link: 'https://pages.github.com/',
        format: 'Self-paced project',
        level: 'All levels',
        duration: '1-2 weeks',
        price: 'Free',
        outcomes: ['Professional online presence', 'Portfolio showcase', 'Personal branding'],
        bonuses: ['Free hosting', 'Custom domain support', 'Version control'],
        focusAreas: ['Web development', 'Personal branding', 'Showcase'],
        highlights: [],
        audience: 'All professionals'
      },
      {
        title: `${onboardingData.industry || 'Professional'} Certification`,
        description: `Pursue a relevant professional certification in ${industry}. Research the most recognized certifications in your field and create a study plan.`,
        type: 'certification',
        relevance: 'Validates your expertise and shows commitment to professional development',
        platform: 'Multiple providers',
        provider: 'Industry leaders',
        link: 'https://www.certmetrics.com/',
        format: 'Self-study + exam',
        level: 'Intermediate to Advanced',
        duration: '2-4 months',
        price: '$150-$300',
        outcomes: ['Industry credential', 'Expert validation', 'Career advancement'],
        bonuses: ['Digital badge', 'Resume boost', 'Salary increase potential'],
        focusAreas: ['Industry expertise', 'Best practices', 'Standards'],
        highlights: [],
        audience: `${industry} professionals`
      },
      {
        title: `r/${profession.replace(/\s+/g, '')} Reddit Community`,
        description: `Connect with other professionals in ${onboardingData.profession || 'your field'} through Reddit. Share knowledge, ask questions, and learn from others' experiences in this active community.`,
        type: 'network',
        relevance: 'Building professional relationships accelerates career growth',
        platform: 'Reddit',
        provider: 'Community-driven',
        link: `https://www.reddit.com/r/${profession.replace(/\s+/g, '')}/`,
        format: 'Async forum',
        level: 'All levels',
        duration: 'Ongoing',
        price: 'Free',
        outcomes: [],
        bonuses: [],
        focusAreas: [],
        highlights: ['Active community', 'Career advice', 'Industry news', 'Peer support'],
        audience: `${onboardingData.profession || 'Professionals'} at all levels`
      },
      {
        title: 'Build a Real-World Project',
        description: 'Identify a gap in your skillset and create a project specifically to fill that gap. Document your learning process, use version control, and share it with your network.',
        type: 'project',
        relevance: 'Hands-on experience is the best way to solidify new skills',
        platform: 'GitHub',
        provider: 'Self-guided',
        link: 'https://github.com/',
        format: 'Self-paced project',
        level: 'Intermediate',
        duration: '2-4 weeks',
        price: 'Free',
        outcomes: ['Practical experience', 'Portfolio piece', 'GitHub showcase'],
        bonuses: ['Version control practice', 'Documentation skills', 'Code review'],
        focusAreas: ['Hands-on coding', 'Problem solving', 'Best practices'],
        highlights: [],
        audience: 'Developers and builders'
      },
      {
        title: `${industry} Masterclass`,
        description: `Complete a course specifically focused on ${industry} trends and best practices. Platforms like Udemy, LinkedIn Learning offer comprehensive options taught by industry experts.`,
        type: 'course',
        relevance: 'Keeps you updated with industry standards and emerging technologies',
        platform: 'Udemy',
        provider: 'Industry experts',
        link: 'https://www.udemy.com/',
        format: 'Video course',
        level: 'Intermediate',
        duration: '4-8 weeks',
        price: '$50-$100',
        outcomes: ['Current industry knowledge', 'Practical skills', 'Certificate of completion'],
        bonuses: ['Lifetime access', 'Mobile learning', 'Q&A support'],
        focusAreas: [`${industry} trends`, 'Tools and technologies', 'Best practices'],
        highlights: [],
        audience: `${industry} professionals`
      }
    ];
  }
  // Generate personalized resume content based on user profile
  static async generateResumeContent(userData, onboardingData) {
    try {
      console.log('🤖 Generating AI resume content for:', userData.name || userData.email);

      const prompt = `
You are a professional resume writer AI that creates personalized, ATS-friendly resume content.

User Information:
- Name: ${userData.name || 'Professional'}
- Email: ${userData.email || ''}
- Profession: ${onboardingData?.profession || 'Professional'}
- Experience Level: ${onboardingData?.experience || 'Intermediate'}
- Industry: ${onboardingData?.industry || 'Technology'}
- Current Skills: ${onboardingData?.currentSkills || 'Various professional skills'}
- Career Goals: ${onboardingData?.goals || 'Career advancement'}
- Timeline: ${onboardingData?.timeline || '1-2 years'}

Generate a complete, professional resume content that is:
1. Personalized to their profession (${onboardingData?.profession || 'Professional'}) and industry (${onboardingData?.industry || 'Technology'})
2. Appropriate for their experience level (${onboardingData?.experience || 'Intermediate'})
3. ATS-friendly with strong action verbs and quantifiable achievements
4. Includes realistic company names and dates
5. Matches their career goals and current skill set

Return ONLY valid JSON (no markdown, no backticks) with this EXACT structure:
{
  "personalInfo": {
    "name": "${userData.name || 'Professional Name'}",
    "email": "${userData.email || 'email@example.com'}",
    "phone": "Generate realistic phone number",
    "location": "Generate realistic location based on industry",
    "summary": "Write 2-3 sentence professional summary highlighting experience in ${onboardingData?.profession || 'their field'}, key skills, and career focus"
  },
  "experiences": [
    {
      "company": "Realistic company name relevant to ${onboardingData?.industry || 'their industry'}",
      "position": "Job title appropriate for ${onboardingData?.experience || 'their experience'} level",
      "duration": "Realistic date range (e.g., 2022 - Present, 2020 - 2022)",
      "description": "3-4 bullet points with strong action verbs, quantifiable achievements, and relevant technologies/skills from: ${onboardingData?.currentSkills || ''}"
    }
  ],
  "education": [
    {
      "school": "Realistic university/institution name",
      "degree": "Appropriate degree for ${onboardingData?.profession || 'their profession'} (e.g., Bachelor of Science in Computer Science)",
      "year": "Realistic graduation year"
    }
  ],
  "skills": "Comma-separated list of ${onboardingData?.currentSkills || 'relevant skills'} plus 3-5 additional skills that are valuable for ${onboardingData?.profession || 'their profession'} in ${onboardingData?.industry || 'their industry'}"
}

IMPORTANT REQUIREMENTS:
- For experiences array, generate 2-3 realistic work experiences based on their ${onboardingData?.experience || 'experience'} level
  - Entry level: 1-2 experiences, 0-2 years each
  - Intermediate: 2-3 experiences, 2-3 years each
  - Senior: 3-4 experiences, 3-5 years each
- Use REALISTIC company names appropriate for ${onboardingData?.industry || 'their industry'} (can be real companies or realistic fictional ones)
- Include QUANTIFIABLE achievements (percentages, numbers, metrics)
- Use strong ACTION VERBS (Led, Developed, Implemented, Optimized, etc.)
- Each experience description should be 3-4 bullet points showing impact
- Skills should include technologies/tools actually used in ${onboardingData?.profession || 'their profession'}
- Make dates realistic and chronologically correct
- Professional summary should highlight ${onboardingData?.goals || 'their goals'}
`;

      const result = await model.generateContent(prompt);
      const response = await result.response;
      const text = response.text();

      console.log('🤖 Raw Resume Response (first 300 chars):', text.substring(0, 300));

      // Clean up the response and parse JSON
      const cleanText = text
        .trim()
        .replace(/```json\n?/g, '')
        .replace(/```\n?/g, '')
        .replace(/^[^{\[]*/, '')
        .replace(/[^}\]]*$/, '')
        .trim();

      let resumeContent;
      try {
        resumeContent = JSON.parse(cleanText);
      } catch (parseError) {
        console.error('❌ Resume JSON Parse Error:', parseError.message);
        console.log('📝 Cleaned Text:', cleanText.substring(0, 500));
        return this.getFallbackResumeContent(userData, onboardingData);
      }

      // Validate and structure the response
      const validatedResume = {
        personalInfo: {
          name: resumeContent.personalInfo?.name || userData.name || 'Professional',
          email: resumeContent.personalInfo?.email || userData.email || '',
          phone: resumeContent.personalInfo?.phone || '',
          location: resumeContent.personalInfo?.location || '',
          summary: resumeContent.personalInfo?.summary || ''
        },
        experiences: Array.isArray(resumeContent.experiences)
          ? resumeContent.experiences.map(exp => ({
              company: exp.company || 'Company Name',
              position: exp.position || 'Position',
              duration: exp.duration || '',
              description: exp.description || ''
            }))
          : [],
        education: Array.isArray(resumeContent.education)
          ? resumeContent.education.map(edu => ({
              school: edu.school || 'Institution',
              degree: edu.degree || 'Degree',
              year: edu.year || ''
            }))
          : [],
        skills: resumeContent.skills || ''
      };

      console.log(`✅ Generated AI resume content with ${validatedResume.experiences.length} experiences`);
      return validatedResume;

    } catch (error) {
      console.error('❌ Gemini AI Resume Generation Error:', error.message);
      return this.getFallbackResumeContent(userData, onboardingData);
    }
  }

  // Fallback resume content if AI fails
  static getFallbackResumeContent(userData, onboardingData) {
    console.log('🔄 Generating fallback resume content');

    const profession = onboardingData?.profession || 'Professional';
    const industry = onboardingData?.industry || 'Technology';
    const experience = onboardingData?.experience || 'Intermediate';
    const skills = onboardingData?.currentSkills || 'Communication, Problem Solving, Project Management';

    return {
      personalInfo: {
        name: userData.name || 'Your Name',
        email: userData.email || 'your.email@example.com',
        phone: '+1 (555) 123-4567',
        location: 'City, State',
        summary: `Results-driven ${profession} with expertise in ${industry}. Proven track record of delivering high-quality results and collaborating effectively with cross-functional teams. Passionate about continuous learning and professional growth.`
      },
      experiences: [
        {
          company: `${industry} Solutions Inc.`,
          position: experience === 'Entry level' ? `Junior ${profession}` : experience === 'Senior' ? `Senior ${profession}` : profession,
          duration: experience === 'Senior' ? '2020 - Present' : experience === 'Intermediate' ? '2022 - Present' : '2023 - Present',
          description: `• Led development and implementation of key projects in ${industry}\n• Collaborated with cross-functional teams to deliver solutions on time and within budget\n• Improved processes and efficiency by 30% through innovative approaches\n• Mentored team members and contributed to knowledge sharing initiatives`
        },
        {
          company: `${industry} Innovations LLC`,
          position: experience === 'Entry level' ? 'Intern' : `${profession}`,
          duration: experience === 'Senior' ? '2017 - 2020' : experience === 'Intermediate' ? '2020 - 2022' : '2021 - 2023',
          description: `• Contributed to multiple successful projects in ${industry} sector\n• Utilized ${skills.split(',')[0]} and modern best practices\n• Supported team objectives and exceeded performance targets\n• Gained valuable experience in professional environment`
        }
      ],
      education: [
        {
          school: 'University of Technology',
          degree: `Bachelor's Degree in ${industry} or related field`,
          year: experience === 'Senior' ? '2017' : experience === 'Intermediate' ? '2020' : '2022'
        }
      ],
      skills: skills
    };
  }
}

module.exports = GeminiService;