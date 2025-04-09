import { useForm } from 'react-hook-form';
import { TextInput, Textarea, Paper, Stack, Text, Grid, Select } from '@mantine/core';

interface UserInfoFormData {
  fullName: string;
  email: string;
  phone: string;
  location: string;
  jobTitle: string;
  yearsOfExperience: string;
  educationLevel: string;
  bio: string;
}

interface UserInformationProps {
  onSave: (data: UserInfoFormData) => void;
}

export function UserInformation({ onSave }: UserInformationProps) {
  const {
    register,
    formState: { errors },
    setValue,
    getValues,
  } = useForm<UserInfoFormData>({
    defaultValues: getDefaultValues(),
  });

  // Load form data from local storage if available
  function getDefaultValues(): UserInfoFormData {
    try {
      const savedData = localStorage.getItem('userInformation');
      if (savedData) {
        return JSON.parse(savedData);
      }
    } catch (error) {
      console.error('Error loading saved user information:', error);
    }

    return {
      fullName: '',
      email: '',
      phone: '',
      location: '',
      jobTitle: '',
      yearsOfExperience: '',
      educationLevel: '',
      bio: '',
    };
  }

  // Save form data when value changes
  const handleChange = (field: keyof UserInfoFormData, value: string) => {
    setValue(field, value);

    const currentValues = getValues();
    localStorage.setItem('userInformation', JSON.stringify({
      ...currentValues,
      [field]: value,
    }));

    onSave({
      ...currentValues,
      [field]: value,
    });
  };

  return (
    <Paper p="md" withBorder>
      <form>
        <Stack gap="md">
          <Text size="lg" fw={500}>Personal Information</Text>

          <Grid>
            <Grid.Col span={6}>
              <TextInput
                label="Full Name"
                placeholder="John Doe"
                {...register('fullName', { required: 'Full name is required' })}
                error={errors.fullName?.message}
                onChange={(e) => handleChange('fullName', e.target.value)}
              />
            </Grid.Col>

            <Grid.Col span={6}>
              <TextInput
                label="Email"
                placeholder="john.doe@example.com"
                type="email"
                {...register('email', {
                  required: 'Email is required',
                  pattern: {
                    value: /^[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,}$/i,
                    message: 'Invalid email address'
                  }
                })}
                error={errors.email?.message}
                onChange={(e) => handleChange('email', e.target.value)}
              />
            </Grid.Col>
          </Grid>

          <Grid>
            <Grid.Col span={6}>
              <TextInput
                label="Phone Number"
                placeholder="(123) 456-7890"
                {...register('phone')}
                onChange={(e) => handleChange('phone', e.target.value)}
              />
            </Grid.Col>

            <Grid.Col span={6}>
              <TextInput
                label="Location"
                placeholder="City, State"
                {...register('location')}
                onChange={(e) => handleChange('location', e.target.value)}
              />
            </Grid.Col>
          </Grid>

          <Grid>
            <Grid.Col span={6}>
              <TextInput
                label="Current/Desired Job Title"
                placeholder="Software Engineer"
                {...register('jobTitle', { required: 'Job title is required' })}
                error={errors.jobTitle?.message}
                onChange={(e) => handleChange('jobTitle', e.target.value)}
              />
            </Grid.Col>

            <Grid.Col span={6}>
              <Select
                label="Years of Experience"
                placeholder="Select years of experience"
                data={[
                  { value: '0-1', label: '0-1 years' },
                  { value: '1-3', label: '1-3 years' },
                  { value: '3-5', label: '3-5 years' },
                  { value: '5-7', label: '5-7 years' },
                  { value: '7-10', label: '7-10 years' },
                  { value: '10+', label: '10+ years' },
                ]}
                value={getValues().yearsOfExperience}
                onChange={(value) => handleChange('yearsOfExperience', value || '')}
              />
            </Grid.Col>
          </Grid>

          <Select
            label="Education Level"
            placeholder="Select your highest education level"
            data={[
              { value: 'high-school', label: 'High School' },
              { value: 'associate', label: 'Associate Degree' },
              { value: 'bachelor', label: 'Bachelor\'s Degree' },
              { value: 'master', label: 'Master\'s Degree' },
              { value: 'phd', label: 'PhD' },
            ]}
            value={getValues().educationLevel}
            onChange={(value) => handleChange('educationLevel', value || '')}
          />

          <Textarea
            label="Professional Summary"
            placeholder="Write a brief professional summary..."
            minRows={4}
            {...register('bio')}
            onChange={(e) => handleChange('bio', e.target.value)}
          />
        </Stack>
      </form>
    </Paper>
  );
}