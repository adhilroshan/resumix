import { useState, useEffect } from 'react';
import { Paper, Stack, Text, TextInput, Button, Group, Badge, Box, Alert } from '@mantine/core';
import { StorageService } from '../../services/storageService';

interface SkillsInformationProps {
  onSave: (skills: string[]) => void;
}

export function SkillsInformation({ onSave }: SkillsInformationProps) {
  const [skills, setSkills] = useState<string[]>([]);
  const [newSkill, setNewSkill] = useState('');
  const [detectedSkills, setDetectedSkills] = useState<string[]>([]);
  const [showDetectedSkills, setShowDetectedSkills] = useState(false);

  // Load skills from local storage on component mount
  useEffect(() => {
    try {
      // Load user skills
      const savedSkills = StorageService.getUserSkills();
      if (savedSkills.length) {
        setSkills(savedSkills);
      }
      
      // Load detected skills
      const detectedSkillsStr = localStorage.getItem('detectedSkills');
      if (detectedSkillsStr) {
        const parsedSkills = JSON.parse(detectedSkillsStr) as string[];
        // Filter out skills that are already in the user's list
        const newDetectedSkills = parsedSkills.filter(
          skill => !savedSkills.some(s => s.toLowerCase() === skill.toLowerCase())
        );
        
        if (newDetectedSkills.length > 0) {
          setDetectedSkills(newDetectedSkills);
          setShowDetectedSkills(true);
        }
      }
    } catch (error) {
      console.error('Error loading skills:', error);
    }
  }, []);

  // Save skills to local storage whenever they change
  useEffect(() => {
    StorageService.saveUserSkills(skills);
    onSave(skills);
  }, [skills, onSave]);

  const addSkill = () => {
    if (!newSkill.trim()) return;
    
    // Prevent duplicate skills (case-insensitive)
    if (!skills.some(skill => skill.toLowerCase() === newSkill.toLowerCase())) {
      setSkills([...skills, newSkill.trim()]);
    }
    
    setNewSkill('');
  };

  const removeSkill = (skillToRemove: string) => {
    setSkills(skills.filter(skill => skill !== skillToRemove));
  };

  const addDetectedSkill = (skill: string) => {
    // Only add if not already in the list
    if (!skills.some(s => s.toLowerCase() === skill.toLowerCase())) {
      setSkills([...skills, skill]);
      
      // Remove from detected skills
      setDetectedSkills(detectedSkills.filter(s => s !== skill));
      
      // Hide detected skills panel if empty
      if (detectedSkills.length <= 1) {
        setShowDetectedSkills(false);
      }
    }
  };

  const addAllDetectedSkills = () => {
    // Filter out skills that are already in the list
    const newSkills = detectedSkills.filter(
      skill => !skills.some(s => s.toLowerCase() === skill.toLowerCase())
    );
    
    setSkills([...skills, ...newSkills]);
    setDetectedSkills([]);
    setShowDetectedSkills(false);
  };

  // Handle Enter key press to add skill
  const handleKeyPress = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter') {
      e.preventDefault();
      addSkill();
    }
  };

  return (
    <Paper p="md" withBorder>
      <Stack gap="md">
        <Text size="lg" fw={500}>Skills</Text>
        <Text size="sm" c="dimmed">
          Add your technical and professional skills. These will be matched against job descriptions.
        </Text>
        
        {showDetectedSkills && detectedSkills.length > 0 && (
          <Alert title="Skills Detected from Resume" color="blue">
            <Text size="sm" mb="sm">
              We detected the following skills from your resume. Click to add them to your profile.
            </Text>
            <Box mb="sm">
              {detectedSkills.map((skill, index) => (
                <Badge 
                  key={index} 
                  size="lg" 
                  mr="xs" 
                  mb="xs"
                  variant="filled"
                  color="blue"
                  style={{ cursor: 'pointer' }}
                  onClick={() => addDetectedSkill(skill)}
                >
                  {skill}
                </Badge>
              ))}
            </Box>
            <Button size="xs" onClick={addAllDetectedSkills}>
              Add All Skills
            </Button>
          </Alert>
        )}
        
        <Group gap="xs">
          <TextInput
            placeholder="Add a skill (e.g., TypeScript, React, Project Management)"
            value={newSkill}
            onChange={(e) => setNewSkill(e.target.value)}
            onKeyPress={handleKeyPress}
            style={{ flexGrow: 1 }}
          />
          <Button onClick={addSkill} disabled={!newSkill.trim()}>
            Add
          </Button>
        </Group>
        
        {skills.length > 0 ? (
          <Box mt="md">
            {skills.map((skill, index) => (
              <Badge 
                key={index} 
                size="lg" 
                mr="xs" 
                mb="xs"
                variant="outline"
                style={{ cursor: 'pointer' }}
                rightSection={
                  <Box 
                    onClick={() => removeSkill(skill)}
                    sx={{
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      width: 16,
                      height: 16,
                      borderRadius: '50%',
                      marginLeft: 5,
                      marginRight: -5,
                      fontSize: 10,
                      backgroundColor: 'rgba(0, 0, 0, 0.1)',
                      ':hover': { backgroundColor: 'rgba(0, 0, 0, 0.2)' },
                    }}
                  >
                    ✕
                  </Box>
                }
              >
                {skill}
              </Badge>
            ))}
          </Box>
        ) : (
          <Text c="dimmed" size="sm" mt="md">
            No skills added yet. Add your skills to improve job matching.
          </Text>
        )}
      </Stack>
    </Paper>
  );
} 