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

Generate exactly 6 SPECIFIC recommendations with REAL resources and REAL, COMPLETE, CLICKABLE URLs:
- 2 REAL online courses from platforms like Coursera, Udemy, Udacity, LinkedIn Learning, Educative.io, Pluralsight, freeCodeCamp
- 2 SPECIFIC project ideas they can build (with real GitHub repos or tutorial links if available)
- 1 REAL professional certification program with actual certification link
- 1 REAL community to join (Reddit, Discord, Slack, Dev.to, LinkedIn groups) with actual join link

CRITICAL REQUIREMENTS FOR URLS:
1. Use COMPLETE, SPECIFIC URLS that link directly to the course/resource, NOT generic platform homepages
   - GOOD: "https://www.udemy.com/course/aws-certified-solutions-architect-associate-saa-c03/"
   - BAD: "https://www.udemy.com/"
   - GOOD: "https://www.coursera.org/specializations/machine-learning-introduction"
   - BAD: "https://www.coursera.org/"
2. For Udemy courses: Include the full course URL like "https://www.udemy.com/course/[course-slug]/"
3. For Coursera: Use "https://www.coursera.org/learn/[course-name]" or "https://www.coursera.org/specializations/[specialization-name]"
4. For certifications: Use the exact certification page URL (e.g., "https://aws.amazon.com/certification/certified-solutions-architect-associate/")
5. For Reddit: Use "https://www.reddit.com/r/[subreddit-name]/" (e.g., "https://www.reddit.com/r/cloudarchitecture/")
6. For Discord: Use actual Discord invite links like "https://discord.gg/[invite-code]"
7. For GitHub projects: Use specific topic URLs like "https://github.com/topics/[topic-name]"

ADDITIONAL REQUIREMENTS:
1. Match courses to their profession (${onboardingData.profession}), industry (${onboardingData.industry}), and experience level (${onboardingData.experience})
2. Include specific pricing, duration, and level information
3. For communities, provide REAL Discord servers, Reddit subreddits, or Slack workspaces with actual join links
4. For certifications, use industry-recognized programs (AWS, Google Cloud, Microsoft, CompTIA, etc.) based on their field

EXAMPLE OF GOOD RECOMMENDATIONS (use this format and specificity level):
[
  {
    "title": "AWS Certified Solutions Architect - Associate 2024",
    "description": "Complete certification training course covering EC2, S3, VPC, IAM, Lambda, and architectural best practices. Includes hands-on labs, practice exams, and real-world scenarios.",
    "type": "course",
    "relevance": "Essential for cloud architects working with AWS, this course directly prepares you for the industry's most sought-after cloud certification",
    "platform": "Udemy",
    "provider": "Stephane Maarek",
    "link": "https://www.udemy.com/course/aws-certified-solutions-architect-associate-saa-c03/",
    "format": "Video course + hands-on labs",
    "level": "Intermediate",
    "duration": "27 hours on-demand video",
    "price": "$84.99 (often on sale for $12.99)",
    "outcomes": ["AWS certification preparation", "Hands-on cloud architecture", "Real-world scenarios"],
    "bonuses": ["Lifetime access", "Certificate of completion", "Q&A support"],
    "focusAreas": ["AWS services", "Cloud architecture", "Best practices"],
    "highlights": [],
    "audience": "Cloud architects and AWS engineers"
  }
]

Now generate your recommendations in this EXACT format with REAL, COMPLETE URLs:
[
  {
    "title": "Exact course/resource name",
    "description": "Detailed 2-3 sentence description of what this resource offers and why it's perfect for their goals",
    "type": "course",
    "relevance": "Why this specifically matches their ${onboardingData.profession} career path and ${onboardingData.goals}",
    "platform": "Platform name (e.g., Coursera, Udemy)",
    "provider": "Content creator (e.g., Google, IBM, University)",
    "link": "COMPLETE, SPECIFIC URL directly to the course/resource (NOT a homepage)",
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

    // Determine industry-specific recommendations
    const isCloudArchitect = profession.includes('architect') || profession.includes('cloud') || profession.includes('aws') || profession.includes('devops');
    const isDeveloper = profession.includes('developer') || profession.includes('engineer') || profession.includes('programmer');
    const isProductManager = profession.includes('product') && profession.includes('manager');
    const isDataScience = profession.includes('data') || profession.includes('analytics') || profession.includes('machine learning');

    // Build recommendations based on profession
    const recommendations = [];

    // Course 1
    if (isCloudArchitect) {
      recommendations.push({
        title: 'AWS Certified Solutions Architect - Associate 2024',
        description: 'Complete certification training course covering EC2, S3, VPC, IAM, Lambda, and architectural best practices. Includes hands-on labs, practice exams, and real-world scenarios to prepare for the AWS certification exam.',
        type: 'course',
        relevance: 'Essential certification for cloud architects working with AWS infrastructure',
        platform: 'Udemy',
        provider: 'Stephane Maarek',
        link: 'https://www.udemy.com/course/aws-certified-solutions-architect-associate-saa-c03/',
        format: 'Video course + hands-on labs',
        level: 'Intermediate',
        duration: '27 hours on-demand video',
        price: '$84.99 (often on sale for $12.99)',
        outcomes: ['AWS certification preparation', 'Hands-on cloud architecture', 'Real-world scenarios', 'Practice exams'],
        bonuses: ['Lifetime access', 'Mobile learning', 'Certificate of completion', 'Q&A support'],
        focusAreas: ['AWS services', 'Cloud architecture', 'Best practices', 'Security'],
        highlights: [],
        audience: 'Cloud architects and AWS engineers'
      });
    } else if (isDeveloper) {
      recommendations.push({
        title: 'The Complete Web Developer in 2024: Zero to Mastery',
        description: 'Master modern web development with React, Node.js, Express, MongoDB, and more. Build 15+ real-world projects including full-stack applications with authentication, payments, and deployment.',
        type: 'course',
        relevance: 'Comprehensive full-stack development skills highly valued in the current job market',
        platform: 'Udemy',
        provider: 'Andrei Neagoie',
        link: 'https://www.udemy.com/course/the-complete-web-developer-zero-to-mastery/',
        format: 'Video course + coding exercises',
        level: 'Beginner to Advanced',
        duration: '41 hours on-demand video',
        price: '$84.99 (often on sale)',
        outcomes: ['Full-stack development', '15+ portfolio projects', 'Modern JavaScript', 'React & Node.js'],
        bonuses: ['Lifetime access', 'Discord community', 'Career guidance', 'Interview prep'],
        focusAreas: ['Frontend development', 'Backend development', 'Databases', 'Deployment'],
        highlights: [],
        audience: 'Web developers and software engineers'
      });
    } else if (isProductManager) {
      recommendations.push({
        title: 'Become a Product Manager | Learn the Skills & Get the Job',
        description: 'Learn product management from former Google and Facebook PMs. Master user research, roadmapping, prioritization, metrics, and stakeholder management with real product case studies.',
        type: 'course',
        relevance: 'Industry-standard PM skills from tech leaders',
        platform: 'Udemy',
        provider: 'Cole Mercer & Evan Kimbrell',
        link: 'https://www.udemy.com/course/become-a-product-manager-learn-the-skills-get-a-job/',
        format: 'Video course + templates',
        level: 'Intermediate',
        duration: '10 hours on-demand video',
        price: '$84.99',
        outcomes: ['Product strategy', 'User research', 'Roadmap planning', 'Stakeholder management'],
        bonuses: ['PM templates', 'Interview prep', 'Resume review', 'Certificate'],
        focusAreas: ['Product strategy', 'Agile methods', 'Metrics & KPIs', 'Communication'],
        highlights: [],
        audience: 'Aspiring and current product managers'
      });
    } else {
      recommendations.push({
        title: 'Google Professional Certificate Programs',
        description: 'Industry-recognized certificates from Google covering Data Analytics, Project Management, UX Design, IT Support, and more. Gain job-ready skills in 3-6 months with hands-on projects.',
        type: 'course',
        relevance: 'Recognized credentials that open doors across multiple industries',
        platform: 'Coursera',
        provider: 'Google',
        link: 'https://www.coursera.org/google-career-certificates',
        format: 'Video course + hands-on projects',
        level: 'Beginner to Intermediate',
        duration: '3-6 months',
        price: '$49/month',
        outcomes: ['Industry certification', 'Job-ready skills', 'Portfolio projects', 'Career resources'],
        bonuses: ['Career resources', 'Interview prep', 'Job board access', 'Resume builder'],
        focusAreas: ['Professional skills', 'Industry tools', 'Best practices', 'Hands-on experience'],
        highlights: [],
        audience: 'Career switchers and professionals'
      });
    }

    // Course 2
    if (isDataScience) {
      recommendations.push({
        title: 'Machine Learning Specialization',
        description: 'Learn machine learning fundamentals from Andrew Ng, Stanford professor and founder of DeepLearning.AI. Master supervised learning, neural networks, and best practices with Python and TensorFlow.',
        type: 'course',
        relevance: 'Industry-standard ML education from a pioneer in the field',
        platform: 'Coursera',
        provider: 'Andrew Ng, Stanford & DeepLearning.AI',
        link: 'https://www.coursera.org/specializations/machine-learning-introduction',
        format: 'Video lectures + programming assignments',
        level: 'Intermediate',
        duration: '3 months (10 hours/week)',
        price: '$49/month',
        outcomes: ['ML fundamentals', 'Python & TensorFlow', 'Neural networks', 'Best practices'],
        bonuses: ['Shareable certificate', 'Flexible schedule', 'Career resources'],
        focusAreas: ['Supervised learning', 'Neural networks', 'ML algorithms', 'Python'],
        highlights: [],
        audience: 'Data scientists and ML engineers'
      });
    } else {
      recommendations.push({
        title: 'CS50\'s Introduction to Computer Science',
        description: 'Harvard University\'s legendary introduction to computer science and programming. Learn problem-solving, algorithms, data structures, and build real projects. Completely free and self-paced.',
        type: 'course',
        relevance: 'World-class CS fundamentals strengthen any technical career',
        platform: 'edX / Harvard',
        provider: 'Harvard University',
        link: 'https://www.edx.org/learn/computer-science/harvard-university-cs50-s-introduction-to-computer-science',
        format: 'Video lectures + problem sets + projects',
        level: 'Beginner',
        duration: '10-20 hours/week for 12 weeks',
        price: 'Free (certificate $199)',
        outcomes: ['CS fundamentals', 'Problem solving', 'Multiple languages', 'Final project'],
        bonuses: ['Free access', 'Harvard certificate option', 'Supportive community', 'Lifetime access'],
        focusAreas: ['Algorithms', 'Data structures', 'Programming', 'Problem solving'],
        highlights: [],
        audience: 'Anyone wanting strong CS fundamentals'
      });
    }

    // Certification
    if (isCloudArchitect) {
      recommendations.push({
        title: 'AWS Certified Solutions Architect - Associate',
        description: 'Validate your ability to design and deploy scalable systems on AWS. Covers architectural best practices, security, cost optimization, and operational excellence across AWS services.',
        type: 'certification',
        relevance: 'Industry-standard credential for cloud architects, opens high-paying job opportunities',
        platform: 'AWS Certification',
        provider: 'Amazon Web Services',
        link: 'https://aws.amazon.com/certification/certified-solutions-architect-associate/',
        format: 'Self-study + 130-minute exam',
        level: 'Associate',
        duration: '2-4 months study',
        price: '$150 USD exam fee',
        outcomes: ['AWS credential', 'Architectural expertise', 'Cloud best practices', 'Career advancement'],
        bonuses: ['Digital badge', 'AWS certified community', 'Salary increase potential', 'Recertification every 3 years'],
        focusAreas: ['Cloud architecture', 'AWS services', 'Security', 'Cost optimization'],
        highlights: [],
        audience: 'Cloud architects and AWS engineers'
      });
    } else if (isDeveloper) {
      recommendations.push({
        title: 'Microsoft Certified: Azure Developer Associate',
        description: 'Demonstrate your expertise in developing cloud applications and services on Microsoft Azure. Covers Azure compute, storage, security, and monitoring.',
        type: 'certification',
        relevance: 'Highly valued credential for developers working with cloud platforms',
        platform: 'Microsoft Learn',
        provider: 'Microsoft',
        link: 'https://learn.microsoft.com/en-us/certifications/azure-developer/',
        format: 'Self-paced learning + exam',
        level: 'Associate',
        duration: '2-3 months',
        price: '$165 USD exam fee',
        outcomes: ['Azure expertise', 'Cloud development', 'Microsoft credential', 'Career growth'],
        bonuses: ['Digital badge', 'Microsoft community', 'Free learning paths', 'Valid for 1 year'],
        focusAreas: ['Azure services', 'Cloud development', 'Security', 'Monitoring'],
        highlights: [],
        audience: 'Cloud developers and Azure engineers'
      });
    } else {
      recommendations.push({
        title: 'Google Cloud Professional Cloud Architect',
        description: 'Demonstrate your ability to design, develop, and manage robust, secure, scalable, and dynamic solutions on Google Cloud Platform.',
        type: 'certification',
        relevance: 'Premier certification for cloud professionals, validates enterprise architecture skills',
        platform: 'Google Cloud',
        provider: 'Google',
        link: 'https://cloud.google.com/certification/cloud-architect',
        format: 'Study + 2-hour exam',
        level: 'Professional',
        duration: '3-6 months preparation',
        price: '$200 USD exam fee',
        outcomes: ['GCP expertise', 'Architecture credential', 'Industry recognition', 'Career advancement'],
        bonuses: ['Digital badge', 'Google Cloud community', 'Recertification every 2 years'],
        focusAreas: ['Cloud architecture', 'GCP services', 'Design patterns', 'Best practices'],
        highlights: [],
        audience: 'Cloud architects and GCP professionals'
      });
    }

    // Project 1
    recommendations.push({
      title: 'Build a Full-Stack Application with Modern Technologies',
      description: 'Create a complete CRUD application using React, Node.js, Express, and MongoDB/PostgreSQL. Include authentication, API design, database modeling, and deployment to Vercel/Heroku.',
      type: 'project',
      relevance: 'Demonstrates end-to-end development skills that employers actively seek',
      platform: 'GitHub',
      provider: 'Self-guided',
      link: 'https://github.com/topics/fullstack-project',
      format: 'Self-paced hands-on project',
      level: 'Intermediate',
      duration: '3-4 weeks',
      price: 'Free',
      outcomes: ['Full-stack portfolio piece', 'GitHub project', 'Deployed application', 'Real-world experience'],
      bonuses: ['Version control', 'Documentation practice', 'Deploy experience', 'Resume showcase'],
      focusAreas: ['Frontend', 'Backend', 'Database', 'Deployment'],
      highlights: [],
      audience: 'Developers building their portfolio'
    });

    // Project 2
    recommendations.push({
      title: 'Contribute to Open Source Projects',
      description: 'Find beginner-friendly open source projects on GitHub and make meaningful contributions. Start with documentation, bug fixes, then progress to features. Build reputation and real-world experience.',
      type: 'project',
      relevance: 'Open source contributions demonstrate collaboration skills and code quality',
      platform: 'GitHub',
      provider: 'Open Source Community',
      link: 'https://github.com/topics/good-first-issue',
      format: 'Collaborative development',
      level: 'Beginner to Intermediate',
      duration: 'Ongoing',
      price: 'Free',
      outcomes: ['Open source experience', 'Code review skills', 'Community involvement', 'Portfolio building'],
      bonuses: ['Mentorship opportunities', 'Networking', 'Real codebase experience', 'GitHub profile'],
      focusAreas: ['Collaboration', 'Code quality', 'Best practices', 'Git workflow'],
      highlights: [],
      audience: 'Developers at all levels'
    });

    // Community/Network
    if (isCloudArchitect) {
      recommendations.push({
        title: 'AWS Developers Slack Community',
        description: 'Join the largest AWS developer community on Slack with 20,000+ members. Get real-time help, share knowledge, participate in discussions about AWS services, architecture patterns, and best practices.',
        type: 'network',
        relevance: 'Connect with AWS experts, get answers fast, and stay updated on cloud trends',
        platform: 'Slack',
        provider: 'Community-driven',
        link: 'https://awsdevelopers.slack.com/',
        format: 'Real-time chat + channels',
        level: 'All levels',
        duration: 'Ongoing',
        price: 'Free',
        outcomes: ['Expert connections', 'Problem solving', 'Career opportunities', 'Learning resources'],
        bonuses: ['Job board', 'Events calendar', 'Resource sharing'],
        focusAreas: ['AWS services', 'Architecture', 'Best practices', 'Troubleshooting'],
        highlights: ['20K+ members', 'Active discussions', 'Expert advice', 'Job opportunities'],
        audience: 'AWS developers and architects'
      });
    } else if (isDeveloper) {
      recommendations.push({
        title: 'freeCodeCamp Developer Community',
        description: 'Join the massive freeCodeCamp community on Discord with study groups, code reviews, project feedback, and career advice. Connect with developers worldwide who are learning and growing together.',
        type: 'network',
        relevance: 'Supportive community perfect for learning, networking, and career growth',
        platform: 'Discord',
        provider: 'freeCodeCamp',
        link: 'https://discord.gg/freecodecamp',
        format: 'Discord server + study groups',
        level: 'All levels',
        duration: 'Ongoing',
        price: 'Free',
        outcomes: ['Study partners', 'Code reviews', 'Mentorship', 'Job opportunities'],
        bonuses: ['Study rooms', 'Project feedback', 'Interview prep', 'Accountability'],
        focusAreas: ['Web development', 'Problem solving', 'Career guidance', 'Networking'],
        highlights: ['Active community', 'Study groups', 'Peer support', 'Free resources'],
        audience: 'Web developers and software engineers'
      });
    } else {
      recommendations.push({
        title: 'Professional Network on LinkedIn Groups',
        description: `Join active LinkedIn groups in ${industry} to connect with industry professionals, share insights, discover job opportunities, and stay updated on industry trends.`,
        type: 'network',
        relevance: 'Professional networking essential for career advancement and opportunities',
        platform: 'LinkedIn',
        provider: 'Professional network',
        link: 'https://www.linkedin.com/groups/',
        format: 'Professional networking',
        level: 'All levels',
        duration: 'Ongoing',
        price: 'Free',
        outcomes: ['Professional connections', 'Industry insights', 'Job opportunities', 'Thought leadership'],
        bonuses: ['Job postings', 'Events', 'Discussions', 'Direct messaging'],
        focusAreas: [`${industry} trends`, 'Career growth', 'Networking', 'Knowledge sharing'],
        highlights: ['Industry experts', 'Job opportunities', 'Events', 'Latest trends'],
        audience: `${industry} professionals`
      });
    }

    return recommendations.slice(0, 6); // Return exactly 6 recommendations
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

  // Enhance resume for specific job description
  static async enhanceResumeForJob(currentResume, jobDescription, onboardingData) {
    try {
      console.log('🤖 Enhancing resume with AI for target job');

      const prompt = `
You are an expert resume writer and ATS (Applicant Tracking System) optimization specialist. Your task is to enhance an existing resume to match a specific job description while maintaining authenticity.

CURRENT RESUME:
Name: ${currentResume.personalInfo?.name || 'Candidate'}
Email: ${currentResume.personalInfo?.email || ''}
Phone: ${currentResume.personalInfo?.phone || ''}
Location: ${currentResume.personalInfo?.location || ''}
Professional Summary: ${currentResume.personalInfo?.summary || ''}

Work Experience:
${currentResume.experiences?.map((exp, i) => `
${i + 1}. ${exp.position} at ${exp.company} (${exp.duration})
   ${exp.description}
`).join('\n')}

Education:
${currentResume.education?.map((edu, i) => `
${i + 1}. ${edu.degree} - ${edu.school} (${edu.year})
`).join('\n')}

Skills: ${currentResume.skills || ''}

TARGET JOB DESCRIPTION:
${jobDescription}

USER CONTEXT (if available):
${onboardingData ? `
- Profession: ${onboardingData.profession || ''}
- Experience Level: ${onboardingData.experience || ''}
- Industry: ${onboardingData.industry || ''}
- Goals: ${onboardingData.goals || ''}
- Current Skills: ${onboardingData.currentSkills || ''}
` : 'No additional context'}

ENHANCEMENT REQUIREMENTS:
1. **Professional Summary**: Rewrite to align with the job's key requirements. Include 2-3 most relevant skills/experiences from the job description. Keep it 2-3 sentences.

2. **Work Experience**: For EACH experience entry:
   - Keep the company name, position, and duration EXACTLY as provided
   - ENHANCE the description to highlight achievements relevant to the target job
   - Use strong action verbs (Led, Developed, Implemented, Optimized, Achieved)
   - Add quantifiable metrics where possible (percentages, numbers, scale)
   - Incorporate keywords from the job description naturally
   - Format as bullet points (use bullet point character •)
   - Make 4-6 bullet points per experience

3. **Education**: Keep education EXACTLY as provided. Do not modify.

4. **Skills**:
   - Reorganize skills to prioritize those mentioned in the job description
   - Add relevant skills from job description that match the candidate's background
   - Remove less relevant skills if needed to stay focused
   - Keep it as a comma-separated list

5. **ATS Optimization**:
   - Use exact keywords and phrases from the job description
   - Avoid overly creative language that might confuse ATS
   - Use standard section headers
   - Maintain professional terminology

6. **Authenticity**:
   - DO NOT fabricate experiences or skills
   - Only emphasize and reframe existing experiences
   - Keep all facts (companies, dates, degrees) unchanged
   - Enhance descriptions to show relevance, not invent new achievements

Return ONLY valid JSON (no markdown, no backticks) in this EXACT structure:
{
  "personalInfo": {
    "name": "${currentResume.personalInfo?.name || 'Name'}",
    "email": "${currentResume.personalInfo?.email || 'email@example.com'}",
    "phone": "${currentResume.personalInfo?.phone || ''}",
    "location": "${currentResume.personalInfo?.location || ''}",
    "summary": "Enhanced 2-3 sentence professional summary aligned with job requirements"
  },
  "experiences": [
    {
      "company": "EXACT company name from original",
      "position": "EXACT position from original",
      "duration": "EXACT duration from original",
      "description": "• Enhanced bullet point 1 with metrics and keywords\\n• Enhanced bullet point 2 with action verbs\\n• Enhanced bullet point 3 showing relevant achievements\\n• Enhanced bullet point 4 with quantifiable results"
    }
  ],
  "education": [
    {
      "school": "EXACT school name from original",
      "degree": "EXACT degree from original",
      "year": "EXACT year from original"
    }
  ],
  "skills": "Prioritized, comma-separated skills list optimized for the job"
}

IMPORTANT:
- Each experience description should be a single string with bullet points separated by \\n
- Use • character for bullet points
- Include 4-6 bullet points per experience
- Match ${currentResume.experiences?.length || 0} experience entries
- Match ${currentResume.education?.length || 0} education entries
- Keep company names, positions, durations, schools, degrees, and years IDENTICAL to original
`;

      const result = await model.generateContent(prompt);
      const response = await result.response;
      const text = response.text();

      console.log('🤖 Raw Enhancement Response (first 500 chars):', text.substring(0, 500));

      // Clean up the response and parse JSON
      const cleanText = text
        .trim()
        .replace(/```json\n?/g, '')
        .replace(/```\n?/g, '')
        .replace(/^[^{\[]*/, '')
        .replace(/[^}\]]*$/, '')
        .trim();

      let enhancedResume;
      try {
        enhancedResume = JSON.parse(cleanText);
      } catch (parseError) {
        console.error('❌ Enhancement JSON Parse Error:', parseError.message);
        console.log('📝 Cleaned Text:', cleanText.substring(0, 500));
        // If parsing fails, return the original resume
        return currentResume;
      }

      // Validate and ensure proper structure
      const validatedResume = {
        personalInfo: {
          name: enhancedResume.personalInfo?.name || currentResume.personalInfo?.name || '',
          email: enhancedResume.personalInfo?.email || currentResume.personalInfo?.email || '',
          phone: enhancedResume.personalInfo?.phone || currentResume.personalInfo?.phone || '',
          location: enhancedResume.personalInfo?.location || currentResume.personalInfo?.location || '',
          summary: enhancedResume.personalInfo?.summary || currentResume.personalInfo?.summary || ''
        },
        experiences: Array.isArray(enhancedResume.experiences)
          ? enhancedResume.experiences.map((exp, idx) => ({
              company: exp.company || currentResume.experiences?.[idx]?.company || '',
              position: exp.position || currentResume.experiences?.[idx]?.position || '',
              duration: exp.duration || currentResume.experiences?.[idx]?.duration || '',
              description: exp.description || currentResume.experiences?.[idx]?.description || ''
            }))
          : currentResume.experiences || [],
        education: Array.isArray(enhancedResume.education)
          ? enhancedResume.education.map((edu, idx) => ({
              school: edu.school || currentResume.education?.[idx]?.school || '',
              degree: edu.degree || currentResume.education?.[idx]?.degree || '',
              year: edu.year || currentResume.education?.[idx]?.year || ''
            }))
          : currentResume.education || [],
        skills: enhancedResume.skills || currentResume.skills || ''
      };

      console.log(`✅ Resume enhanced successfully with ${validatedResume.experiences.length} experiences`);
      return validatedResume;

    } catch (error) {
      console.error('❌ Gemini AI Resume Enhancement Error:', error.message);
      // On error, return the original resume
      return currentResume;
    }
  }

  // Generate interview questions based on completed tasks
  static async generateInterviewQuestions(completedTasks, onboardingData) {
    try {
      console.log('🤖 Generating interview questions for', completedTasks.length, 'completed tasks');

      const taskSummaries = completedTasks.map(task => ({
        title: task.title,
        description: task.description,
        category: task.category,
      }));

      const prompt = `
You are an AI interview coach that creates practice interview questions based on a user's completed learning tasks.

User Profile:
- Profession: ${onboardingData?.profession || 'Professional'}
- Experience Level: ${onboardingData?.experience || 'Intermediate'}
- Industry: ${onboardingData?.industry || 'Technology'}
- Goals: ${onboardingData?.goals || 'Career advancement'}

Completed Tasks (what the user has learned):
${taskSummaries.map((task, i) => `${i + 1}. ${task.title} (${task.category}): ${task.description}`).join('\n')}

Generate EXACTLY 10 interview practice questions based on these completed tasks. The questions should:
1. Test knowledge and understanding of the tasks they've completed
2. Mix of MCQ (Multiple Choice Questions) and short answer questions
3. Be realistic interview questions for ${onboardingData?.profession || 'their profession'}
4. Cover different task categories proportionally
5. Range from easy to medium difficulty

Question Distribution:
- 6 MCQ questions (with 4 options each, only 1 correct)
- 4 short answer questions (expecting 2-3 sentence responses)

Return ONLY valid JSON (no markdown, no backticks) in this EXACT format:
[
  {
    "question": "What is the primary benefit of implementing CI/CD in a development workflow?",
    "type": "mcq",
    "options": [
      "Faster manual testing",
      "Automated build, test, and deployment pipeline",
      "Reduced need for version control",
      "Cheaper hosting costs"
    ],
    "correctAnswer": "Automated build, test, and deployment pipeline",
    "relatedTask": "Set up CI/CD pipeline",
    "category": "DevOps"
  },
  {
    "question": "Explain how you would approach building a scalable REST API for a high-traffic application.",
    "type": "short",
    "expectedKeywords": ["caching", "database", "load balancing", "API design", "performance", "rate limiting"],
    "relatedTask": "Build RESTful API",
    "category": "Backend Development"
  }
]

IMPORTANT REQUIREMENTS:
- Generate EXACTLY 10 questions total (6 MCQ + 4 short answer)
- Each MCQ must have exactly 4 options
- Only 1 option should be the correct answer
- MCQ correctAnswer must EXACTLY match one of the options
- Short answer questions should have 3-6 expectedKeywords for evaluation
- All questions must relate to the completed tasks provided
- Use professional, realistic interview question format
- Include relatedTask and category for each question
`;

      const result = await model.generateContent(prompt);
      const response = await result.response;
      const text = response.text();

      console.log('🤖 Raw Interview Questions Response (first 500 chars):', text.substring(0, 500));

      // Clean up the response and parse JSON
      const cleanText = text
        .trim()
        .replace(/```json\n?/g, '')
        .replace(/```\n?/g, '')
        .replace(/^[^[\{]*/, '')
        .replace(/[^}\]]*$/, '')
        .trim();

      let questions;
      try {
        questions = JSON.parse(cleanText);
      } catch (parseError) {
        console.error('❌ Interview Questions JSON Parse Error:', parseError.message);
        console.log('📝 Cleaned Text:', cleanText.substring(0, 500));
        return this.getFallbackInterviewQuestions(completedTasks);
      }

      // Validate questions
      const validatedQuestions = questions.map((q, index) => ({
        question: q.question || `Question ${index + 1}`,
        type: ['mcq', 'short'].includes(q.type) ? q.type : 'short',
        options: q.type === 'mcq' && Array.isArray(q.options) ? q.options : [],
        correctAnswer: q.type === 'mcq' ? q.correctAnswer : undefined,
        expectedKeywords: q.type === 'short' && Array.isArray(q.expectedKeywords) ? q.expectedKeywords : [],
        relatedTask: q.relatedTask || '',
        category: q.category || 'General',
      }));

      console.log(`✅ Generated ${validatedQuestions.length} interview questions successfully`);
      return validatedQuestions;

    } catch (error) {
      console.error('❌ Gemini Interview Questions Error:', error.message);
      return this.getFallbackInterviewQuestions(completedTasks);
    }
  }

  // Evaluate interview answers using AI
  static async evaluateInterviewAnswers(questions, answers) {
    try {
      console.log('🤖 Evaluating interview answers with AI');

      const qaArray = questions.map((q, index) => {
        const userAnswer = answers.find(a => a.questionIndex === index);
        return {
          question: q.question,
          type: q.type,
          correctAnswer: q.correctAnswer,
          expectedKeywords: q.expectedKeywords,
          userAnswer: userAnswer?.userAnswer || 'No answer provided',
        };
      });

      const prompt = `
You are an AI interview evaluator. Evaluate the user's answers to these interview questions.

Questions and Answers:
${qaArray.map((qa, i) => `
${i + 1}. ${qa.question}
   Type: ${qa.type}
   ${qa.type === 'mcq' ? `Correct Answer: ${qa.correctAnswer}` : `Expected Keywords: ${qa.expectedKeywords?.join(', ')}`}
   User's Answer: ${qa.userAnswer}
`).join('\n')}

For each answer, provide:
1. Whether the answer is correct (for MCQ) or quality score 0-100 (for short answers)
2. Brief feedback explaining why it's correct/incorrect or how to improve

For MCQ questions:
- Mark as correct if the user's answer matches the correct answer exactly or is very close in meaning
- isCorrect: true/false
- score: 100 if correct, 0 if incorrect

For short answer questions:
- Evaluate based on presence of expected keywords and overall quality
- Check if answer demonstrates understanding
- score: 0-100 (0-40: Poor, 41-70: Good, 71-100: Excellent)
- isCorrect: true if score >= 70, false otherwise

Return ONLY valid JSON (no markdown, no backticks) in this EXACT format:
[
  {
    "questionIndex": 0,
    "isCorrect": true,
    "score": 100,
    "feedback": "Correct! This answer demonstrates good understanding of the concept."
  },
  {
    "questionIndex": 1,
    "isCorrect": false,
    "score": 60,
    "feedback": "Partial credit. Your answer mentions caching which is good, but could also discuss load balancing and database optimization."
  }
]

IMPORTANT:
- Return evaluation for ALL ${questions.length} questions in the same order
- Each evaluation must have questionIndex, isCorrect, score, and feedback
- Be constructive and educational in feedback
- Score must be between 0-100
`;

      const result = await model.generateContent(prompt);
      const response = await result.response;
      const text = response.text();

      console.log('🤖 Raw Evaluation Response (first 500 chars):', text.substring(0, 500));

      // Clean up the response and parse JSON
      const cleanText = text
        .trim()
        .replace(/```json\n?/g, '')
        .replace(/```\n?/g, '')
        .replace(/^[^[\{]*/, '')
        .replace(/[^}\]]*$/, '')
        .trim();

      let evaluations;
      try {
        evaluations = JSON.parse(cleanText);
      } catch (parseError) {
        console.error('❌ Evaluation JSON Parse Error:', parseError.message);
        return this.getFallbackEvaluation(questions, answers);
      }

      // Validate evaluations
      const validatedEvaluations = evaluations.map((evaluation, index) => ({
        questionIndex: evaluation.questionIndex !== undefined ? evaluation.questionIndex : index,
        isCorrect: evaluation.isCorrect === true,
        score: Math.min(100, Math.max(0, evaluation.score || 0)),
        feedback: evaluation.feedback || 'No feedback available',
      }));

      console.log(`✅ Evaluated ${validatedEvaluations.length} answers successfully`);
      return validatedEvaluations;

    } catch (error) {
      console.error('❌ Gemini Evaluation Error:', error.message);
      return this.getFallbackEvaluation(questions, answers);
    }
  }

  // Fallback interview questions if AI fails
  static getFallbackInterviewQuestions(completedTasks) {
    console.log('🔄 Generating fallback interview questions');

    const fallbackQuestions = [
      {
        question: 'What motivated you to pursue your current career goals?',
        type: 'short',
        expectedKeywords: ['passion', 'growth', 'learning', 'impact', 'goals'],
        relatedTask: 'Career Planning',
        category: 'Career Development',
      },
      {
        question: 'Which of the following is a key principle of good software design?',
        type: 'mcq',
        options: [
          'Write code as quickly as possible',
          'Separation of concerns and modularity',
          'Use as many design patterns as possible',
          'Avoid documentation',
        ],
        correctAnswer: 'Separation of concerns and modularity',
        relatedTask: 'Learning',
        category: 'Software Engineering',
      },
      {
        question: 'Describe a challenging technical problem you solved recently and your approach.',
        type: 'short',
        expectedKeywords: ['problem', 'solution', 'approach', 'debugging', 'research', 'testing'],
        relatedTask: 'Projects',
        category: 'Problem Solving',
      },
      {
        question: 'What is the primary purpose of version control systems like Git?',
        type: 'mcq',
        options: [
          'To make code run faster',
          'To track changes and enable collaboration',
          'To compile code automatically',
          'To deploy applications',
        ],
        correctAnswer: 'To track changes and enable collaboration',
        relatedTask: 'Foundation',
        category: 'Development Tools',
      },
      {
        question: 'How do you stay updated with new technologies and industry trends?',
        type: 'short',
        expectedKeywords: ['reading', 'courses', 'community', 'practice', 'blogs', 'documentation'],
        relatedTask: 'Research',
        category: 'Continuous Learning',
      },
      {
        question: 'Which HTTP method is typically used to update an existing resource?',
        type: 'mcq',
        options: ['GET', 'POST', 'PUT', 'DELETE'],
        correctAnswer: 'PUT',
        relatedTask: 'Learning',
        category: 'Web Development',
      },
      {
        question: 'Explain the importance of testing in software development.',
        type: 'short',
        expectedKeywords: ['quality', 'bugs', 'reliability', 'confidence', 'regression', 'automation'],
        relatedTask: 'Best Practices',
        category: 'Software Quality',
      },
      {
        question: 'What does API stand for?',
        type: 'mcq',
        options: [
          'Advanced Programming Interface',
          'Application Programming Interface',
          'Automated Program Integration',
          'Application Process Integration',
        ],
        correctAnswer: 'Application Programming Interface',
        relatedTask: 'Learning',
        category: 'Technical Knowledge',
      },
      {
        question: 'Describe your approach to learning a new programming language or framework.',
        type: 'short',
        expectedKeywords: ['documentation', 'practice', 'projects', 'tutorials', 'fundamentals'],
        relatedTask: 'Skills Development',
        category: 'Learning Strategy',
      },
      {
        question: 'Which of these is a benefit of code reviews?',
        type: 'mcq',
        options: [
          'Slowing down development',
          'Knowledge sharing and catching bugs early',
          'Making code more complex',
          'Reducing team collaboration',
        ],
        correctAnswer: 'Knowledge sharing and catching bugs early',
        relatedTask: 'Best Practices',
        category: 'Team Collaboration',
      },
    ];

    return fallbackQuestions.slice(0, 10);
  }

  // Fallback evaluation if AI fails
  static getFallbackEvaluation(questions, answers) {
    console.log('🔄 Generating fallback evaluation');

    return questions.map((question, index) => {
      const userAnswer = answers.find(a => a.questionIndex === index);
      const answerText = userAnswer?.userAnswer || '';

      if (question.type === 'mcq') {
        const isCorrect = answerText.trim().toLowerCase() === question.correctAnswer?.trim().toLowerCase();
        return {
          questionIndex: index,
          isCorrect,
          score: isCorrect ? 100 : 0,
          feedback: isCorrect
            ? 'Correct answer!'
            : `Incorrect. The correct answer is: ${question.correctAnswer}`,
        };
      } else {
        // Short answer - basic keyword matching
        const keywords = question.expectedKeywords || [];
        const matchedKeywords = keywords.filter(keyword =>
          answerText.toLowerCase().includes(keyword.toLowerCase())
        );
        const score = Math.round((matchedKeywords.length / Math.max(keywords.length, 1)) * 100);

        return {
          questionIndex: index,
          isCorrect: score >= 70,
          score,
          feedback: score >= 70
            ? 'Good answer! You covered the key points.'
            : `Your answer could be improved. Consider mentioning: ${keywords.slice(0, 3).join(', ')}`,
        };
      }
    });
  }
}

module.exports = GeminiService;