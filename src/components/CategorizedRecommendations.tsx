import { useMemo } from 'react';
import { 
  Text, 
  Group, 
  Badge,
  ThemeIcon,
  List,
  Accordion,
  Transition,
  useMantineTheme
} from '@mantine/core';
import { 
  IconBriefcase,
  IconBulb,
  IconStars,
  IconCategory,
  IconBook,
  IconArrowUpRight
} from '@tabler/icons-react';

// Categorized Recommendations Component
export const CategorizedRecommendations = ({ recommendations }: { recommendations: string[] }) => {
  const theme = useMantineTheme();
  const isMobile = window.innerWidth < parseInt(theme.breakpoints.sm);
  
  // Group recommendations into categories
  const categorized = useMemo(() => {
    const categories: Record<string, string[]> = {
      'Resume Structure': [],
      'Skills Highlight': [],
      'Experience Details': [],
      'Education & Certifications': [],
      'Other Improvements': []
    };
    
    // Very simple categorization based on keywords
    recommendations.forEach((rec: string) => {
      if (rec.toLowerCase().includes('resume') || rec.toLowerCase().includes('format') || rec.toLowerCase().includes('structure')) {
        categories['Resume Structure'].push(rec);
      } else if (rec.toLowerCase().includes('skill') || rec.toLowerCase().includes('technical')) {
        categories['Skills Highlight'].push(rec);
      } else if (rec.toLowerCase().includes('experience') || rec.toLowerCase().includes('job') || rec.toLowerCase().includes('role')) {
        categories['Experience Details'].push(rec);
      } else if (rec.toLowerCase().includes('education') || rec.toLowerCase().includes('degree') || rec.toLowerCase().includes('certification')) {
        categories['Education & Certifications'].push(rec);
      } else {
        categories['Other Improvements'].push(rec);
      }
    });
    
    // Remove empty categories
    return Object.fromEntries(Object.entries(categories).filter(([_, recs]) => recs.length > 0));
  }, [recommendations]);
  
  const getCategoryIcon = (category: string) => {
    switch(category) {
      case 'Resume Structure': return <IconCategory size={isMobile ? 16 : 20} />;
      case 'Skills Highlight': return <IconStars size={isMobile ? 16 : 20} />;
      case 'Experience Details': return <IconBriefcase size={isMobile ? 16 : 20} />;
      case 'Education & Certifications': return <IconBook size={isMobile ? 16 : 20} />;
      default: return <IconBulb size={isMobile ? 16 : 20} />;
    }
  };
  
  return (
    <Accordion 
      variant="separated" 
      radius="md"
      classNames={{
        item: 'touch-ripple',
        control: 'touch-ripple'
      }}
      styles={{
        item: {
          marginBottom: '8px'
        },
        content: {
          padding: isMobile ? '8px' : '16px'
        }
      }}
    >
      {Object.entries(categorized).map(([category, recs]) => (
        <Transition
          mounted={true}
          transition="fade"
          duration={300}
          timingFunction="ease"
          key={category}
        >
          {(styles) => (
            <Accordion.Item value={category} style={styles}>
              <Accordion.Control icon={
                <ThemeIcon variant="light" size={isMobile ? 26 : 30} radius="xl" color="blue">
                  {getCategoryIcon(category)}
                </ThemeIcon>
              }>
                <Group gap="xs" wrap="nowrap">
                  <Text fw={600} size={isMobile ? 'sm' : 'md'} style={{ wordBreak: 'break-word' }}>{category}</Text>
                  <Badge size="sm">{recs.length}</Badge>
                </Group>
              </Accordion.Control>
              <Accordion.Panel>
                <List spacing={isMobile ? 'xs' : 'sm'}>
                  {recs.map((rec: string, i: number) => (
                    <List.Item 
                      key={i} 
                      icon={
                        <ThemeIcon size={isMobile ? 18 : 22} radius="xl" color="blue">
                          <IconArrowUpRight size={isMobile ? 12 : 14} />
                        </ThemeIcon>
                      }
                    >
                      <Text size="sm" style={{ lineHeight: 1.5 }}>{rec}</Text>
                    </List.Item>
                  ))}
                </List>
              </Accordion.Panel>
            </Accordion.Item>
          )}
        </Transition>
      ))}
    </Accordion>
  );
}; 